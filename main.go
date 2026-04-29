package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"database/sql"
	_ "modernc.org/sqlite"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Config struct {
	RTMPURL   string `json:"rtmpUrl"`
	StreamKey string `json:"streamKey"`
}

type Schedule struct {
	ID    string    `json:"id"`
	Video string    `json:"video"`
	Time  time.Time `json:"time"`
}

type HistoryEntry struct {
	Video string    `json:"video"`
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

var (
	uploadsDir      = "./uploads"
	dbPath          = "./streamstar.db"
	distPath        = "./dist"
	db              *sql.DB
	ffmpegProcess   *exec.Cmd
	streamStatus    = "STOPPED"
	currentVideo    string
	streamStartTime time.Time
	isManualStop    bool
	restarting      bool
	logs            []string
	logsMutex       sync.Mutex
	ffmpegMutex     sync.Mutex
	scheduleMutex   sync.Mutex
	historyMutex    sync.Mutex
)

func initDB() {
	var err error
	db, err = sql.Open("sqlite", dbPath)
	if err != nil {
		fmt.Printf("Error opening database: %v\n", err)
		os.Exit(1)
	}

	// Create tables
	queries := []string{
		`CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT)`,
		`CREATE TABLE IF NOT EXISTS schedules (id INTEGER PRIMARY KEY AUTOINCREMENT, video TEXT, time DATETIME)`,
		`CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, video TEXT, start DATETIME, end DATETIME)`,
	}

	for _, q := range queries {
		_, err = db.Exec(q)
		if err != nil {
			fmt.Printf("Error creating table: %v\n", err)
		}
	}

	migrateJSONToDB()
}

func migrateJSONToDB() {
	// 1. Migrate Config
	if _, err := os.Stat("./config.json"); err == nil {
		data, _ := os.ReadFile("./config.json")
		var conf Config
		if err := json.Unmarshal(data, &conf); err == nil {
			db.Exec("INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)", "rtmpUrl", conf.RTMPURL)
			db.Exec("INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)", "streamKey", conf.StreamKey)
			os.Rename("./config.json", "./config.json.bak")
			fmt.Println("Migrated config.json to SQLite")
		}
	}

	// 2. Migrate Schedules
	if _, err := os.Stat("./schedules.json"); err == nil {
		data, _ := os.ReadFile("./schedules.json")
		var oldSchedules []Schedule
		if err := json.Unmarshal(data, &oldSchedules); err == nil {
			for _, s := range oldSchedules {
				db.Exec("INSERT INTO schedules (video, time) VALUES (?, ?)", s.Video, s.Time)
			}
			os.Rename("./schedules.json", "./schedules.json.bak")
			fmt.Println("Migrated schedules.json to SQLite")
		}
	}

	// 3. Migrate History
	if _, err := os.Stat("./history.json"); err == nil {
		data, _ := os.ReadFile("./history.json")
		var oldHistory []HistoryEntry
		if err := json.Unmarshal(data, &oldHistory); err == nil {
			for _, h := range oldHistory {
				db.Exec("INSERT INTO history (video, start, end) VALUES (?, ?, ?)", h.Video, h.Start, h.End)
			}
			os.Rename("./history.json", "./history.json.bak")
			fmt.Println("Migrated history.json to SQLite")
		}
	}
}

func addLog(message string) {
	logsMutex.Lock()
	defer logsMutex.Unlock()
	logMsg := fmt.Sprintf("[%s] %s", time.Now().Format("15:04:05"), message)
	logs = append(logs, logMsg)
	if len(logs) > 100 {
		logs = logs[1:]
	}
	fmt.Println(logMsg)
}

func getConfig() Config {
	var rtmpURL, streamKey string
	db.QueryRow("SELECT value FROM config WHERE key = 'rtmpUrl'").Scan(&rtmpURL)
	db.QueryRow("SELECT value FROM config WHERE key = 'streamKey'").Scan(&streamKey)
	
	if rtmpURL == "" {
		rtmpURL = "rtmp://a.rtmp.youtube.com/live2/"
	}
	return Config{RTMPURL: rtmpURL, StreamKey: streamKey}
}

func saveConfig(config Config) error {
	_, err := db.Exec("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)", "rtmpUrl", config.RTMPURL)
	if err != nil {
		return err
	}
	_, err = db.Exec("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)", "streamKey", config.StreamKey)
	return err
}

func getSchedules() []Schedule {
	scheduleMutex.Lock()
	defer scheduleMutex.Unlock()
	
	rows, err := db.Query("SELECT id, video, time FROM schedules ORDER BY time ASC")
	if err != nil {
		return []Schedule{}
	}
	defer rows.Close()

	var s []Schedule
	for rows.Next() {
		var sch Schedule
		rows.Scan(&sch.ID, &sch.Video, &sch.Time)
		s = append(s, sch)
	}
	return s
}

func saveToHistory(entry HistoryEntry) {
	historyMutex.Lock()
	defer historyMutex.Unlock()

	_, err := db.Exec("INSERT INTO history (video, start, end) VALUES (?, ?, ?)", entry.Video, entry.Start, entry.End)
	if err != nil {
		fmt.Printf("Error saving to history: %v\n", err)
	}
}

func runFFmpeg(video string) {
	config := getConfig()
	videoPath := filepath.Join(uploadsDir, video)

	if _, err := os.Stat(videoPath); os.IsNotExist(err) {
		addLog(fmt.Sprintf("Error: Video %s not found.", video))
		return
	}

	rtmpEndpoint := config.RTMPURL + config.StreamKey
	startTime := time.Now()
	streamStartTime = startTime
	addLog(fmt.Sprintf("[FFMPEG] Starting stream: %s", video))

	// Fix for Go security: use absolute path for ffmpeg if it exists in current dir (Windows only)
	ffmpegPath := "ffmpeg"
	if runtime.GOOS == "windows" {
		if _, err := os.Stat("./ffmpeg.exe"); err == nil {
			absPath, _ := filepath.Abs("./ffmpeg.exe")
			ffmpegPath = absPath
		}
	}

	args := []string{
		"-stream_loop", "-1",
		"-re",
		"-i", videoPath,
		"-c:v", "libx264", 
		"-preset", "ultrafast", // Faster encoding
		"-tune", "zerolatency", 
		"-r", "30", // Force 30 fps
		"-g", "60", // GOP every 2 seconds
		"-keyint_min", "60",
		"-x264-params", "keyint=60:min-keyint=60:scenecut=0",
		"-b:v", "2500k", 
		"-maxrate", "2500k", 
		"-bufsize", "2500k", // Strict buffer
		"-pix_fmt", "yuv420p",
		"-c:a", "aac", 
		"-b:a", "128k", 
		"-ar", "44100",
		"-threads", "4", // Limit threads for stability
		"-f", "flv",
		"-flvflags", "no_duration_filesize",
		"-reconnect", "1",
		"-reconnect_streamed", "1",
		"-reconnect_delay_max", "5",
		rtmpEndpoint,
	}

	ffmpegMutex.Lock()
	ffmpegProcess = exec.Command(ffmpegPath, args...)
	
	stderr, _ := ffmpegProcess.StderrPipe()
	if err := ffmpegProcess.Start(); err != nil {
		addLog(fmt.Sprintf("FFmpeg Process Error: %v", err))
		ffmpegProcess = nil
		streamStatus = "STOPPED"
		ffmpegMutex.Unlock()
		return
	}
	streamStatus = "RUNNING"
	ffmpegMutex.Unlock()

	// Monitoring logs
	go func() {
		buf := make([]byte, 1024)
		for {
			_, err := stderr.Read(buf)
			if err != nil {
				break
			}
		}
	}()

	err := ffmpegProcess.Wait()
	addLog(fmt.Sprintf("FFmpeg stopped: %v", err))

	// Save to history
	saveToHistory(HistoryEntry{
		Video: video,
		Start: startTime,
		End:   time.Now(),
	})

	ffmpegMutex.Lock()
	ffmpegProcess = nil
	if !isManualStop && !restarting {
		ffmpegMutex.Unlock()
		restartStream()
	} else {
		streamStatus = "STOPPED"
		currentVideo = "" // Clear the current video state
		ffmpegMutex.Unlock()
	}
}

func restartStream() {
	if currentVideo == "" || isManualStop {
		return
	}

	restarting = true
	addLog("Restarting stream in 5 seconds...")

	time.AfterFunc(5*time.Second, func() {
		if !isManualStop {
			runFFmpeg(currentVideo)
		}
		restarting = false
	})
}

func startStream(video string) {
	ffmpegMutex.Lock()
	if ffmpegProcess != nil {
		addLog("Stopping existing stream process...")
		isManualStop = true
		ffmpegProcess.Process.Kill()
		ffmpegProcess.Wait()
		ffmpegProcess = nil
		ffmpegMutex.Unlock()
		
		// Global cleanup for Windows
		if runtime.GOOS == "windows" {
			exec.Command("taskkill", "/F", "/IM", "ffmpeg.exe", "/T").Run()
		}
		
		addLog("Waiting 5s for session cleanup...")
		time.Sleep(5 * time.Second)
	} else {
		ffmpegMutex.Unlock()
	}

	currentVideo = video
	isManualStop = false
	go runFFmpeg(video)
}

func stopStream() {
	isManualStop = true
	currentVideo = "" // Clear immediately for UI feedback
	ffmpegMutex.Lock()
	if ffmpegProcess != nil {
		addLog("Stopping stream manually...")
		ffmpegProcess.Process.Signal(os.Interrupt)
		time.AfterFunc(2*time.Second, func() {
			ffmpegMutex.Lock()
			if ffmpegProcess != nil {
				ffmpegProcess.Process.Kill()
			}
			ffmpegMutex.Unlock()
		})
	}
	streamStatus = "STOPPED"
	ffmpegMutex.Unlock()
}

func watchdog() {
	for {
		time.Sleep(10 * time.Second)
		ffmpegMutex.Lock()
		if ffmpegProcess == nil && currentVideo != "" && !restarting && !isManualStop {
			addLog("Watchdog: FFmpeg mati, restart...")
			go runFFmpeg(currentVideo)
		}
		ffmpegMutex.Unlock()
	}
}

func scheduler() {
	for {
		time.Sleep(30 * time.Second)
		now := time.Now()
		
		scheduleMutex.Lock()
		var videoToStart string
		var scheduleID int
		
		err := db.QueryRow("SELECT id, video FROM schedules WHERE time <= ? ORDER BY time ASC LIMIT 1", now).Scan(&scheduleID, &videoToStart)
		if err == nil {
			addLog(fmt.Sprintf("[Scheduler] Triggering scheduled stream for %s", videoToStart))
			// Delete from schedule first
			db.Exec("DELETE FROM schedules WHERE id = ?", scheduleID)
			startStream(videoToStart)
		}
		scheduleMutex.Unlock()
	}
}

func main() {
	initDB()
	
	// Kill any leftover ffmpeg processes on startup
	if runtime.GOOS == "windows" {
		exec.Command("taskkill", "/F", "/IM", "ffmpeg.exe", "/T").Run()
	} else {
		exec.Command("pkill", "-9", "ffmpeg").Run()
	}

	if _, err := os.Stat(uploadsDir); os.IsNotExist(err) {
		os.Mkdir(uploadsDir, 0755)
	}

	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Increase multipart memory for large uploads
	// By setting this high, we avoid temp files for smaller chunks, 
	// but Go's SaveUploadedFile handles large files efficiently anyway.
	r.MaxMultipartMemory = 32 << 20 // 32 MiB

	r.Static("/uploads", uploadsDir)

	// API Routes
	api := r.Group("/api")
	{
		api.GET("/status", func(c *gin.Context) {
			status := "OFFLINE"
			if currentVideo != "" {
				status = "STREAMING"
			}
			
			var startTimeMs int64
			if !streamStartTime.IsZero() {
				startTimeMs = streamStartTime.UnixNano() / int64(time.Millisecond)
			}
			
			health := "GOOD"
			if status == "OFFLINE" {
				health = "N/A"
			}
			
			c.JSON(http.StatusOK, gin.H{
				"status":       status,
				"currentVideo": currentVideo,
				"startTime":    startTimeMs,
				"health":       health,
			})
		})

		api.GET("/videos", func(c *gin.Context) {
			files, err := os.ReadDir(uploadsDir)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			var filenames []string
			for _, f := range files {
				if !f.IsDir() {
					filenames = append(filenames, f.Name())
				}
			}
			if filenames == nil {
				filenames = []string{}
			}
			c.JSON(http.StatusOK, gin.H{"files": filenames})
		})

		api.DELETE("/videos/:filename", func(c *gin.Context) {
			filename := c.Param("filename")
			filePath := filepath.Join(uploadsDir, filename)

			if _, err := os.Stat(filePath); os.IsNotExist(err) {
				c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
				return
			}

			// If this video is currently streaming, we MUST stop it and wait for FFmpeg to release the file lock
			if currentVideo == filename {
				isManualStop = true
				currentVideo = ""
				ffmpegMutex.Lock()
				if ffmpegProcess != nil {
					addLog("Stopping stream to delete file...")
					ffmpegProcess.Process.Kill()
					ffmpegProcess.Wait() // Synchronous wait
					ffmpegProcess = nil
				}
				ffmpegMutex.Unlock()
				time.Sleep(1 * time.Second) // Extra safety for Windows file locks
			}

			// Retry mechanism for Windows file locks
			var err error
			for i := 0; i < 10; i++ {
				err = os.Remove(filePath)
				if err == nil {
					break
				}
				addLog(fmt.Sprintf("Delete attempt %d failed, retrying... (%v)", i+1, err))
				time.Sleep(500 * time.Millisecond)
			}

			if err != nil {
				addLog(fmt.Sprintf("Final delete error: %v", err))
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete file. It might be in use. Please try again in a few seconds."})
				return
			}

			addLog(fmt.Sprintf("Deleted video: %s", filename))
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		api.GET("/logs", func(c *gin.Context) {
			logsMutex.Lock()
			defer logsMutex.Unlock()
			c.JSON(http.StatusOK, gin.H{"logs": logs})
		})

		api.GET("/config", func(c *gin.Context) {
			c.JSON(http.StatusOK, getConfig())
		})

		api.POST("/config", func(c *gin.Context) {
			var config Config
			if err := c.ShouldBindJSON(&config); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			saveConfig(config)
			addLog("Configuration updated")
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		api.GET("/schedules", func(c *gin.Context) {
			c.JSON(http.StatusOK, getSchedules())
		})

		api.POST("/schedules", func(c *gin.Context) {
			var input struct {
				Video string `json:"video"`
				Time  string `json:"time"`
			}
			if err := c.ShouldBindJSON(&input); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			t, err := time.Parse(time.RFC3339, input.Time)
			if err != nil {
				t, err = time.Parse("2006-01-02T15:04:05.000Z", input.Time)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time format"})
					return
				}
			}

			_, err = db.Exec("INSERT INTO schedules (video, time) VALUES (?, ?)", input.Video, t)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			addLog(fmt.Sprintf("Stream scheduled: %s at %s", input.Video, t.Local().String()))
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		api.DELETE("/schedules/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Exec("DELETE FROM schedules WHERE id = ?", id)
			addLog(fmt.Sprintf("Schedule removed: %s", id))
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		api.POST("/upload", func(c *gin.Context) {
			file, err := c.FormFile("file")
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
				return
			}

			dst := filepath.Join(uploadsDir, file.Filename)
			if err := c.SaveUploadedFile(file, dst); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
				return
			}

			addLog(fmt.Sprintf("Uploaded: %s", file.Filename))
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		api.POST("/start", func(c *gin.Context) {
			var input struct {
				Video string `json:"video"`
			}
			if err := c.ShouldBindJSON(&input); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			startStream(input.Video)
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		api.POST("/stop", func(c *gin.Context) {
			stopStream()
			c.JSON(http.StatusOK, gin.H{"success": true})
		})

		api.GET("/history", func(c *gin.Context) {
			rows, err := db.Query("SELECT video, start, end FROM history ORDER BY start DESC LIMIT 50")
			if err != nil {
				c.JSON(http.StatusOK, []HistoryEntry{})
				return
			}
			defer rows.Close()

			var history []HistoryEntry
			for rows.Next() {
				var h HistoryEntry
				rows.Scan(&h.Video, &h.Start, &h.End)
				history = append(history, h)
			}
			c.JSON(http.StatusOK, history)
		})

		api.GET("/sys-stats", func(c *gin.Context) {
			var cpuStr, memStr, diskStr string

			if runtime.GOOS == "windows" {
				// Windows commands (wmic)
				cpuCmd := exec.Command("wmic", "cpu", "get", "loadpercentage")
				cpuOut, _ := cpuCmd.Output()
				cpuStr = string(cpuOut)
				
				memCmd := exec.Command("wmic", "OS", "get", "FreePhysicalMemory,TotalVisibleMemorySize", "/Value")
				memOut, _ := memCmd.Output()
				memStr = string(memOut)
				
				diskCmd := exec.Command("wmic", "logicaldisk", "where", "DeviceID='C:'", "get", "size,freespace", "/Value")
				diskOut, _ := diskCmd.Output()
				diskStr = string(diskOut)
			} else {
				// Linux commands (for VPS)
				// CPU: Using top (first line)
				cpuCmd := exec.Command("sh", "-c", "top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'")
				cpuOut, _ := cpuCmd.Output()
				cpuStr = string(cpuOut)

				// Memory: Using free -m
				memCmd := exec.Command("free", "-m")
				memOut, _ := memCmd.Output()
				memStr = "LINUX_MEM\n" + string(memOut)

				// Disk: Using df -h
				diskCmd := exec.Command("df", "-h", "/", "--output=size,avail")
				diskOut, _ := diskCmd.Output()
				diskStr = "LINUX_DISK\n" + string(diskOut)
			}

			c.JSON(http.StatusOK, gin.H{
				"cpu":    cpuStr,
				"memory": memStr,
				"disk":   diskStr,
				"os":     runtime.GOOS,
			})
		})
	}
	
	// Helper middleware to serve static files if they exist, otherwise pass to next handler
	staticServe := func(staticPath string) gin.HandlerFunc {
		return func(c *gin.Context) {
			path := c.Request.URL.Path
			// Don't intercept API routes
			if strings.HasPrefix(path, "/api") || strings.HasPrefix(path, "/uploads") {
				c.Next()
				return
			}
			
			// Check if file exists in dist
			filePath := filepath.Join(staticPath, path)
			if stat, err := os.Stat(filePath); err == nil && !stat.IsDir() {
				c.File(filePath)
				c.Abort() // Stop routing, we found the file
				return
			}
			
			// Proceed to NoRoute if file not found
			c.Next()
		}
	}

	// Serve Frontend
	if stat, err := os.Stat(distPath); err == nil && stat.IsDir() {
		addLog("Frontend dist folder found. Serving SPA at /")
		
		// Mount the static assets directly at root
		r.Use(staticServe(distPath))

		// SPA Fallback for any other route
		r.NoRoute(func(c *gin.Context) {
			c.File(filepath.Join(distPath, "index.html"))
		})
	} else {
		addLog("Warning: Frontend dist folder not found at " + distPath + ". API only mode.")
	}

	go watchdog()
	go scheduler()

	addLog("Backend listening at http://localhost:3001")
	r.Run(":3001")
}

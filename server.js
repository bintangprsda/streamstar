import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { spawn } from "child_process";
import schedule from "node-schedule";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use("/uploads", express.static(uploadsDir));

// Serve static frontend files from 'dist' folder
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Handle SPA routing: serve index.html for any unknown routes (Middleware version)
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Fallback if dist is missing
  app.get("/", (req, res) => {
    res.send("<h1>StreamStar Server is running!</h1><p>Note: Frontend build (dist folder) not found. Please run 'npm run build' first.</p>");
  });
}

const configPath = path.join(__dirname, "config.json");
const schedulePath = path.join(__dirname, "schedules.json");

const getConfig = () => {
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (e) {
    return { rtmpUrl: "rtmp://a.rtmp.youtube.com/live2/", streamKey: "" };
  }
};

const getSchedules = () => {
  try {
    return JSON.parse(fs.readFileSync(schedulePath, "utf-8"));
  } catch (e) {
    return [];
  }
};

const saveSchedules = (schedules) => {
  fs.writeFileSync(schedulePath, JSON.stringify(schedules, null, 2));
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

let ffmpegProcess = null;
let streamStatus = "STOPPED";
let logs = ["[System] Server started"];
let scheduledJobs = {};
let currentVideo = null;
let streamStartTime = null;
let isManualStop = false;
let restarting = false;

const addLog = (message) => {
  const log = `[${new Date().toLocaleTimeString()}] ${message}`;
  logs.push(log);
  if (logs.length > 100) logs.shift();
  console.log(log);
};

function restartStream() {
  if (!currentVideo || isManualStop) return;

  restarting = true;
  addLog("Restarting stream in 5 seconds...");

  setTimeout(() => {
    if (!isManualStop) {
      runFFmpeg(currentVideo);
    }
    restarting = false;
  }, 5000);
}

function runFFmpeg(video) {
  const config = getConfig();
  const videoPath = path.join(uploadsDir, video);

  if (!fs.existsSync(videoPath)) {
    addLog(`Error: Video ${video} not found.`);
    return;
  }

  const rtmpEndpoint = `${config.rtmpUrl}${config.streamKey}`;
  streamStartTime = Date.now();
  addLog(`[FFMPEG] Starting stream: ${video}`);

  const args = [
    "-stream_loop", "-1",
    "-re",
    "-i", videoPath,
    "-c:v", "libx264", "-preset", "veryfast", "-g", "60", "-keyint_min", "60",
    "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
    "-f", "flv",
    "-reconnect", "1",
    "-reconnect_streamed", "1",
    "-reconnect_delay_max", "5",
    rtmpEndpoint
  ];

  ffmpegProcess = spawn("ffmpeg", args);
  streamStatus = "RUNNING";

  ffmpegProcess.stderr.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg.includes("frame=") || msg.includes("Error") || msg.includes("Output")) {
        addLog(`[FFMPEG] ${msg}`);
    }
  });

  ffmpegProcess.on("close", (code) => {
    addLog(`FFmpeg stopped with code ${code}`);
    ffmpegProcess = null;
    
    if (!isManualStop && !restarting) {
      restartStream();
    } else if (isManualStop) {
      streamStatus = "STOPPED";
    }
  });

  ffmpegProcess.on("error", (err) => {
    addLog(`FFmpeg Process Error: ${err.message}`);
    ffmpegProcess = null;
    streamStatus = "STOPPED";
  });
}

const startStream = (video) => {
  if (ffmpegProcess) {
    addLog(`Stream already running. Stopping previous and starting ${video}...`);
    isManualStop = true;
    ffmpegProcess.kill("SIGTERM");
    setTimeout(() => {
        isManualStop = false;
        currentVideo = video;
        runFFmpeg(video);
    }, 1000);
    return;
  }

  currentVideo = video;
  isManualStop = false;
  runFFmpeg(video);
};

// Watchdog timer to ensure stream is always running
setInterval(() => {
  if (!ffmpegProcess && currentVideo && !restarting && !isManualStop) {
    addLog("Watchdog: FFmpeg mati, restart...");
    restartStream();
  }
}, 10000);

const initSchedules = () => {
  const schedules = getSchedules();
  schedules.forEach((s) => {
    if (new Date(s.time) > new Date()) {
      scheduledJobs[s.id] = schedule.scheduleJob(new Date(s.time), () => {
        addLog(`[Scheduler] Triggering scheduled stream for ${s.video}`);
        startStream(s.video);
      });
    }
  });
};

initSchedules();

app.get("/api/status", (req, res) => {
  res.json({ 
    status: currentVideo ? "STREAMING" : "OFFLINE",
    currentVideo,
    startTime: streamStartTime
  });
});

app.get("/api/videos", (req, res) => {
  const files = fs.readdirSync(uploadsDir);
  res.json({ files });
});

app.delete("/api/videos/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Stop stream if it's the current video being deleted
  if (currentVideo === filename) {
    isManualStop = true;
    if (ffmpegProcess) {
      ffmpegProcess.kill("SIGTERM");
      ffmpegProcess = null;
    }
    currentVideo = null;
    streamStatus = "STOPPED";
    addLog(`Stopping current stream because video ${filename} is being deleted`);
  }

  try {
    fs.unlinkSync(filePath);
    addLog(`Deleted video: ${filename}`);
    res.json({ success: true });
  } catch (err) {
    addLog(`Error deleting video ${filename}: ${err.message}`);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

app.get("/api/logs", (req, res) => {
  res.json({ logs });
});

app.get("/api/config", (req, res) => {
  res.json(getConfig());
});

app.post("/api/config", (req, res) => {
  const newConfig = req.body;
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  addLog("Configuration updated");
  res.json({ success: true });
});

app.get("/api/schedules", (req, res) => {
  res.json(getSchedules());
});

app.post("/api/schedules", (req, res) => {
  const { video, time } = req.body;
  const schedules = getSchedules();
  const id = Date.now().toString();
  const newSchedule = { id, video, time };
  
  schedules.push(newSchedule);
  saveSchedules(schedules);

  scheduledJobs[id] = schedule.scheduleJob(new Date(time), () => {
    startStream(video);
  });

  addLog(`Stream scheduled: ${video} at ${new Date(time).toLocaleString()}`);
  res.json({ success: true, schedule: newSchedule });
});

app.delete("/api/schedules/:id", (req, res) => {
  const { id } = req.params;
  let schedules = getSchedules();
  schedules = schedules.filter((s) => s.id !== id);
  saveSchedules(schedules);

  if (scheduledJobs[id]) {
    scheduledJobs[id].cancel();
    delete scheduledJobs[id];
  }

  addLog(`Schedule removed: ${id}`);
  res.json({ success: true });
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  addLog(`Uploaded: ${req.file.originalname}`);
  res.json({ success: true });
});

app.post("/api/start", (req, res) => {
  const { video } = req.body;
  startStream(video);
  res.json({ success: true });
});

app.post("/api/stop", (req, res) => {
  isManualStop = true;
  if (ffmpegProcess) {
    addLog("Stopping stream manually...");
    ffmpegProcess.kill("SIGINT");
    setTimeout(() => {
        if (ffmpegProcess) ffmpegProcess.kill("SIGTERM");
    }, 2000);
  }
  streamStatus = "STOPPED";
  res.json({ success: true });
});

app.listen(port, () => {
  addLog(`Backend listening at http://localhost:${port}`);
});

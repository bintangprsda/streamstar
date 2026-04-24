import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Square, Upload, RefreshCw, Video, Clock, List, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function useInterval(callback, delay) {
  const savedRef = useRef();
  useEffect(() => { savedRef.current = callback; }, [callback]);
  useEffect(() => {
    if (delay == null) return;
    const id = setInterval(() => savedRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function Sidebar({ tab, setTab }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "videos", label: "Videos", icon: Video },
    { id: "scheduler", label: "Scheduler", icon: Clock },
    { id: "logs", label: "Logs", icon: List },
    { id: "settings", label: "Settings", icon: RefreshCw },
  ];

  return (
    <div className="w-64 bg-slate-900/70 backdrop-blur border-r border-slate-800 p-4">
      <div className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span role="img" aria-label="camera">🎥</span> Live Control
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition ${active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50"}`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatusCard({ status, onStart, onStop, selected }) {
  const isRunning = status === "RUNNING";
  return (
    <div className="bg-slate-900/70 backdrop-blur p-6 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">Stream Status</div>
          <div className={`text-2xl font-bold ${isRunning ? "text-emerald-400" : "text-rose-400"}`}>
            {status}
          </div>
        </div>
        <div className={`h-3 w-3 rounded-full ${isRunning ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onStart()}
          disabled={!selected || isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 transition-colors"
        >
          <Play size={16} /> Start
        </button>
        <button
          onClick={onStop}
          disabled={!isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 transition-colors"
        >
          <Square size={16} /> Stop
        </button>
      </div>
      <div className="mt-3 text-xs text-slate-500">Selected Video: <span className="text-slate-300">{selected || "-"}</span></div>
    </div>
  );
}

function UploadBox({ onUploaded }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setProgress(0);
      onUploaded?.();
    };

    xhr.send(form);
  };

  return (
    <div
      className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/30 transition-all group"
      onClick={() => inputRef.current?.click()}
    >
      <div className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <Upload className="text-slate-400 group-hover:text-emerald-400" />
      </div>
      <div className="text-sm font-medium text-slate-300">Click to upload video</div>
      <div className="text-xs text-slate-500 mt-1">MP4, MOV or WEBM</div>
      {progress > 0 && (
        <div className="mt-4">
          <div className="text-xs text-emerald-400 mb-1">Uploading: {progress}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(e) => handleUpload(e.target.files[0])}
      />
    </div>
  );
}

function VideoPlayer({ video }) {
  if (!video) return null;
  return (
    <div className="bg-slate-900/70 backdrop-blur rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Video size={16} className="text-emerald-400" />
          Preview: <span className="text-slate-300">{video}</span>
        </div>
      </div>
      <video 
        key={video}
        src={`/uploads/${video}`} 
        controls 
        className="w-full aspect-video bg-black"
        poster="/api/placeholder/1280/720"
      />
    </div>
  );
}

function VideoList({ videos, selected, setSelected, onStart }) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/50">
        <Video className="mx-auto text-slate-600 mb-2" size={32} />
        <div className="text-slate-500">No videos uploaded yet</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((v) => (
        <motion.div
          key={v}
          whileHover={{ y: -4 }}
          className={`p-4 rounded-2xl border ${selected === v ? "border-emerald-500 bg-emerald-500/5" : "border-slate-800 bg-slate-900/70"} transition-all`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="truncate font-medium text-sm pr-2" title={v}>{v}</div>
            <button
              onClick={() => setSelected(v)}
              className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${selected === v ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
            >
              {selected === v ? "Selected" : "Select"}
            </button>
          </div>
          <button
            onClick={() => {
              setSelected(v);
              onStart(v);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium transition-colors"
          >
            <Play size={12} /> Start Now
          </button>
        </motion.div>
      ))}
    </div>
  );
}

function Logs() {
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error("Failed to fetch logs", e);
    }
  };

  useInterval(fetchLogs, 3000);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-slate-950 text-emerald-500 font-mono text-xs p-6 rounded-2xl h-[400px] overflow-auto border border-slate-800 shadow-inner">
      <div className="flex items-center gap-2 mb-4 text-slate-500 border-b border-slate-800 pb-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Live System Logs
      </div>
      {logs.map((l, i) => (
        <div key={i} className="mb-1 opacity-90 hover:opacity-100 transition-opacity">
          <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
          {l}
        </div>
      ))}
      <div ref={logsEndRef} />
    </div>
  );
}

function Settings() {
  const [config, setConfig] = useState({ rtmpUrl: "", streamKey: "" });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const save = async () => {
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="text-slate-500">Loading configuration...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-6"
    >
      <div className="bg-slate-900/70 backdrop-blur p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">RTMP URL</label>
          <input
            type="text"
            value={config.rtmpUrl}
            onChange={(e) => setConfig({ ...config, rtmpUrl: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="rtmp://a.rtmp.youtube.com/live2/"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Stream Key</label>
          <input
            type="password"
            value={config.streamKey}
            onChange={(e) => setConfig({ ...config, streamKey: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="paste your stream key here"
          />
        </div>
        <button
          onClick={save}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold transition-all flex items-center justify-center gap-2"
        >
          {saved ? "✓ Configuration Saved" : "Save Settings"}
        </button>
      </div>
      
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-200 text-xs leading-relaxed">
        <strong>Important:</strong> FFmpeg must be installed on your system for streaming to work. The backend will use the provided RTMP URL and Stream Key to push the selected video.
      </div>
    </motion.div>
  );
}

function Scheduler({ videos }) {
  const [schedules, setSchedules] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [time, setTime] = useState("");

  const fetchSchedules = async () => {
    const res = await fetch("/api/schedules");
    const data = await res.json();
    setSchedules(data);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const addSchedule = async () => {
    if (!selectedVideo || !time) return;
    await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video: selectedVideo, time }),
    });
    fetchSchedules();
    setSelectedVideo("");
    setTime("");
  };

  const removeSchedule = async (id) => {
    await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    fetchSchedules();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-slate-900/70 backdrop-blur p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock size={20} className="text-emerald-400" /> Schedule a New Stream
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Select Video</label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors text-slate-200"
            >
              <option value="">-- Choose a video --</option>
              {videos.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Scheduled Time</label>
            <input
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors text-slate-200"
            />
          </div>
        </div>
        <button
          onClick={addSchedule}
          disabled={!selectedVideo || !time}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 font-bold transition-all"
        >
          Add to Scheduler
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <List size={20} className="text-emerald-400" /> Active Schedules
        </h2>
        {schedules.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 text-slate-500">
            No streams scheduled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 flex flex-col justify-between"
              >
                <div>
                  <div className="text-sm font-bold text-slate-200 truncate mb-1" title={s.video}>
                    {s.video}
                  </div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <Clock size={12} /> {new Date(s.time).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => removeSchedule(s.id)}
                  className="mt-4 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors self-end"
                >
                  Cancel
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [status, setStatus] = useState("...");
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setStatus(data.status);
    } catch (e) {
      setStatus("OFFLINE");
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      setVideos(data.files || []);
    } catch (e) {
      console.error("Failed to fetch videos", e);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchVideos();
  }, []);

  useInterval(fetchStatus, 5000);

  const start = async (video = selected) => {
    if (!video) return;
    try {
      await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video }),
      });
      fetchStatus();
    } catch (e) {
      console.error("Failed to start", e);
    }
  };

  const stop = async () => {
    try {
      await fetch("/api/stop", { method: "POST" });
      fetchStatus();
    } catch (e) {
      console.error("Failed to stop", e);
    }
  };

  return (
    <div className="flex h-screen text-slate-100 bg-slate-950 font-sans selection:bg-emerald-500/30">
      <Sidebar tab={tab} setTab={setTab} />

      <main className="flex-1 p-8 space-y-8 overflow-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage your live broadcast streams</p>
          </div>
          <button 
            onClick={() => { fetchStatus(); fetchVideos(); }} 
            className="flex items-center gap-2 text-sm bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={14} className={status === "..." ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <StatusCard status={status} onStart={start} onStop={stop} selected={selected} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  {selected && <VideoPlayer video={selected} />}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Video size={18} className="text-emerald-400" /> Recent Videos
                    </h2>
                    <VideoList videos={videos.slice(0, 4)} selected={selected} setSelected={setSelected} onStart={start} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <List size={18} className="text-emerald-400" /> Recent Logs
                  </h2>
                  <Logs />
                </div>
              </div>
            </motion.div>
          )}

          {tab === "videos" && (
            <motion.div 
              key="videos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <UploadBox onUploaded={fetchVideos} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-xl font-semibold">Video Library</h2>
                  <VideoList videos={videos} selected={selected} setSelected={setSelected} onStart={start} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Preview</h2>
                  {selected ? (
                    <VideoPlayer video={selected} />
                  ) : (
                    <div className="bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500 text-sm">
                      Select a video to preview
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "logs" && (
            <motion.div 
              key="logs"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <Logs />
            </motion.div>
          )}

          {tab === "settings" && (
            <Settings key="settings" />
          )}

          {tab === "scheduler" && (
            <Scheduler videos={videos} key="scheduler" />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

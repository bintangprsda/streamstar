import React, { useState, useEffect, useRef } from "react";
import { Activity } from "lucide-react";
import Sidebar from "./components/Sidebar";
import StatusCard from "./components/StatusCard";
import UploadBox from "./components/UploadBox";
import VideoList from "./components/VideoList";
import LogsPanel from "./components/LogsPanel";
import SettingsPanel from "./components/SettingsPanel";
import SchedulerPanel from "./components/SchedulerPanel";
import HistoryPanel from "./components/HistoryPanel";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [videos, setVideos] = useState([]);
  const [status, setStatus] = useState("OFFLINE");
  const [currentVideo, setCurrentVideo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [config, setConfig] = useState({ rtmpUrl: "", streamKey: "" });
  const [schedules, setSchedules] = useState([]);
  const [serverStatus, setServerStatus] = useState("OFFLINE");
  const [health, setHealth] = useState("N/A");
  const [history, setHistory] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [sysStats, setSysStats] = useState({ cpu: "0", memory: "0/0", disk: "0/0" });

  useEffect(() => {
    fetchVideos();
    fetchStatus();
    fetchConfig();
    fetchSchedules();
    fetchHistory();
    fetchSysStats();

    const statusInterval = setInterval(fetchStatus, 3000);
    const logsInterval = setInterval(fetchLogs, 2000);
    const historyInterval = setInterval(fetchHistory, 10000);
    const sysStatsInterval = setInterval(fetchSysStats, 5000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(logsInterval);
      clearInterval(historyInterval);
      clearInterval(sysStatsInterval);
    };
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      setVideos(data.files || []);
    } catch (e) {
      console.error("Failed to fetch videos", e);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setStatus(data.status);
      setCurrentVideo(data.currentVideo);
      setStartTime(data.startTime);
      setHealth(data.health || "N/A");
      setServerStatus("ONLINE");
    } catch (e) {
      setServerStatus("OFFLINE");
      setStatus("OFFLINE");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {}
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setConfig(data);
    } catch (e) {}
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      const data = await res.json();
      setSchedules(data || []);
    } catch (e) {}
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setHistory(data || []);
    } catch (e) {}
  };

  const parseSysStats = (data) => {
    const isWindows = data.os === "windows";

    // Parse CPU
    let cpu = "0";
    if (isWindows) {
      const cpuMatch = data.cpu.match(/\d+/);
      cpu = cpuMatch ? cpuMatch[0] : "0";
    } else {
      cpu = data.cpu.trim() || "0";
    }

    // Parse Memory
    let memory = "0/0";
    if (isWindows) {
      const freeMemMatch = data.memory.match(/FreePhysicalMemory=(\d+)/);
      const totalMemMatch = data.memory.match(/TotalVisibleMemorySize=(\d+)/);
      if (freeMemMatch && totalMemMatch) {
        const free = parseInt(freeMemMatch[1]);
        const total = parseInt(totalMemMatch[1]);
        const used = (total - free) / 1024 / 1024; // GB
        const totalGB = total / 1024 / 1024;
        memory = `${used.toFixed(1)} GB / ${totalGB.toFixed(0)} GB`;
      }
    } else {
      // Linux free -m parsing
      const lines = data.memory.split("\n");
      const memLine = lines.find(l => l.startsWith("Mem:"));
      if (memLine) {
        const parts = memLine.split(/\s+/);
        const total = parseInt(parts[1]); // MB
        const used = parseInt(parts[2]); // MB
        memory = `${(used / 1024).toFixed(1)} GB / ${(total / 1024).toFixed(0)} GB`;
      }
    }

    // Parse Disk
    let disk = "0/0";
    if (isWindows) {
      const freeDiskMatch = data.disk.match(/FreeSpace=(\d+)/);
      const sizeDiskMatch = data.disk.match(/Size=(\d+)/);
      if (freeDiskMatch && sizeDiskMatch) {
        const free = parseInt(freeDiskMatch[1]);
        const total = parseInt(sizeDiskMatch[1]);
        const used = (total - free) / 1024 / 1024 / 1024; // GB
        const totalGB = total / 1024 / 1024 / 1024;
        disk = `${used.toFixed(1)} GB / ${totalGB.toFixed(0)} GB`;
      }
    } else {
      // Linux df -h parsing
      const lines = data.disk.split("\n");
      if (lines.length >= 3) {
        const parts = lines[2].split(/\s+/);
        const total = parts[0];
        const avail = parts[1];
        disk = `${avail} free / ${total}`;
      }
    }

    return { cpu, memory, disk };
  };

  const fetchSysStats = async () => {
    try {
      const res = await fetch("/api/sys-stats");
      const data = await res.json();
      setSysStats(parseSysStats(data));
    } catch (e) {}
  };

  const startStream = async (video) => {
    try {
      await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video }),
      });
      fetchStatus();
    } catch (e) {}
  };

  const stopStream = async () => {
    try {
      await fetch("/api/stop", { method: "POST" });
      fetchStatus();
    } catch (e) {}
  };

  const deleteVideo = async (filename) => {
    if (!window.confirm(`Hapus video "${filename}" secara permanen?`)) return;
    try {
      await fetch(`/api/videos/${filename}`, { method: "DELETE" });
      fetchVideos();
    } catch (e) {}
  };

  const saveConfig = async () => {
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      alert("Settings saved successfully!");
    } catch (e) {}
  };

  const addSchedule = async (video, time) => {
    try {
      await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video, time }),
      });
      fetchSchedules();
    } catch (e) {}
  };

  const deleteSchedule = async (id) => {
    try {
      await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      fetchSchedules();
    } catch (e) {}
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="w-full max-w-none p-6 sm:p-10 pt-12">
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <header className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">Main Dashboard</h1>
                  <p className="text-slate-500 mt-2 font-medium">Control center for your 24/7 live broadcast engine.</p>
                </div>
                <button 
                  onClick={() => setShowLogs(!showLogs)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all border ${
                    showLogs 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200"
                  }`}
                >
                  <Activity size={18} className={showLogs ? "animate-pulse" : ""} />
                  <span className="text-sm font-bold">FFmpeg Logs</span>
                </button>
              </header>

              <StatusCard 
                status={status} 
                serverStatus={serverStatus} 
                onStop={stopStream}
                startTime={startTime}
                health={health}
                sysStats={sysStats}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 space-y-8">
                  <VideoList
                    videos={videos}
                    currentVideo={currentVideo}
                    onStart={startStream}
                    onStop={stopStream}
                    onDelete={deleteVideo}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Glassmorphism Logs Modal */}
          {showLogs && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-300">
              <div 
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                onClick={() => setShowLogs(false)}
              />
              <div className="relative w-full max-w-4xl h-[70vh] bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                      <Activity className="text-emerald-400" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white">FFmpeg Runtime Logs</h2>
                  </div>
                  <button 
                    onClick={() => setShowLogs(false)}
                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-hidden p-6">
                  <LogsPanel logs={logs} onClear={() => setLogs([])} hideHeader={true} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "videos" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">Media Library</h1>
                  <p className="text-slate-500 mt-2 font-medium">Manage your video assets for streaming.</p>
                </div>
              </header>
              <UploadBox onUploaded={fetchVideos} />
              <VideoList
                videos={videos}
                currentVideo={currentVideo}
                onStart={startStream}
                onStop={stopStream}
                onDelete={deleteVideo}
              />
            </div>
          )}

          {activeTab === "scheduler" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <header>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Stream Scheduler</h1>
                <p className="text-slate-500 mt-2 font-medium">Plan your upcoming broadcasts and automated tasks.</p>
              </header>
              <SchedulerPanel
                videos={videos}
                schedules={schedules}
                onAdd={addSchedule}
                onDelete={deleteSchedule}
              />
            </div>
          )}

          {activeTab === "logs" && (
            <div className="h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-700">
              <LogsPanel logs={logs} onClear={() => setLogs([])} />
            </div>
          )}

          {activeTab === "history" && (
            <div className="h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-700">
              <HistoryPanel history={history} />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <SettingsPanel config={config} setConfig={setConfig} onSave={saveConfig} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

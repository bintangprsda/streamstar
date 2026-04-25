import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import StatusCard from "./components/StatusCard";
import UploadBox from "./components/UploadBox";
import VideoList from "./components/VideoList";
import LogsPanel from "./components/LogsPanel";
import SettingsPanel from "./components/SettingsPanel";
import SchedulerPanel from "./components/SchedulerPanel";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [videos, setVideos] = useState([]);
  const [status, setStatus] = useState("OFFLINE");
  const [currentVideo, setCurrentVideo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({ rtmpUrl: "", streamKey: "" });
  const [schedules, setSchedules] = useState([]);
  const [serverStatus, setServerStatus] = useState("OFFLINE");

  useEffect(() => {
    fetchVideos();
    fetchStatus();
    fetchConfig();
    fetchSchedules();

    const statusInterval = setInterval(fetchStatus, 3000);
    const logsInterval = setInterval(fetchLogs, 2000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(logsInterval);
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
      setSchedules(data.schedules || []);
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
        <div className="max-w-6xl mx-auto p-8 pt-12">
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <header>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Main Dashboard</h1>
                <p className="text-slate-500 mt-2 font-medium">Control center for your 24/7 live broadcast engine.</p>
              </header>

              <StatusCard 
                status={status} 
                serverStatus={serverStatus} 
                onStop={stopStream}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <UploadBox onUploaded={fetchVideos} />
                  <VideoList
                    videos={videos}
                    currentVideo={currentVideo}
                    onStart={startStream}
                    onStop={stopStream}
                    onDelete={deleteVideo}
                  />
                </div>
                <div className="lg:col-span-1 h-[600px]">
                  <LogsPanel logs={logs} onClear={() => setLogs([])} />
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

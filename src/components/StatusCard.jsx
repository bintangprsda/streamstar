import React, { useState, useEffect } from "react";
import { Activity, Power, Signal, Clock } from "lucide-react";

const StatusCard = ({ status, serverStatus, onStop, startTime }) => {
  const isStreaming = status && status !== "OFFLINE" && status !== "ERROR";
  const [uptime, setUptime] = useState("00:00:00");

  useEffect(() => {
    let interval;
    if (isStreaming && startTime) {
      interval = setInterval(() => {
        const diff = Date.now() - startTime;
        const hours = Math.floor(diff / 3600000).toString().padStart(2, "0");
        const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
        const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
        setUptime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else {
      setUptime("00:00:00");
    }
    return () => clearInterval(interval);
  }, [isStreaming, startTime]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <Signal className="text-emerald-400" size={24} />
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            serverStatus === "ONLINE" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          }`}>
            {serverStatus}
          </div>
        </div>
        <div className="text-sm text-slate-400 font-medium">Backend Server</div>
        <div className="text-2xl font-bold text-slate-100 mt-1">Operational</div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg border-l-4 border-l-cyan-500/50">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-cyan-500/10 rounded-xl">
            <Activity className="text-cyan-400" size={24} />
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              isStreaming ? "bg-cyan-500/20 text-cyan-400 animate-pulse" : "bg-slate-800 text-slate-400"
            }`}>
              {isStreaming ? "STREAMING" : "IDLE"}
            </div>
            {isStreaming && (
              <button
                onClick={onStop}
                className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-lg border border-red-500/30 transition-all active:scale-95 flex items-center justify-center shadow-lg"
                title="Force Stop Stream"
              >
                <Power size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="text-sm text-slate-400 font-medium">Current Status</div>
        <div className="text-2xl font-bold text-slate-100 mt-1">{status}</div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <Clock className="text-purple-400" size={24} />
          </div>
          {isStreaming && (
            <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold font-mono">
              LIVE
            </div>
          )}
        </div>
        <div className="text-sm text-slate-400 font-medium">Stream Uptime</div>
        <div className="text-2xl font-bold text-slate-100 mt-1 font-mono tracking-wider">{uptime}</div>
      </div>
    </div>
  );
};

export default StatusCard;

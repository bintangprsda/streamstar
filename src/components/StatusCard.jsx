import React, { useState, useEffect } from "react";
import { Activity, Power, Signal, Clock, Cpu, Database, HardDrive, Wifi, Radio } from "lucide-react";

const StatusCard = ({ status, serverStatus, onStop, startTime, health, sysStats }) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* Active Streams */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl shadow-lg group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Streams</div>
          <div className="p-1.5 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
            <Radio className="text-emerald-400" size={16} />
          </div>
        </div>
        <div className="text-3xl font-black text-white">{isStreaming ? "1" : "0"}</div>
        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-1000 ${isStreaming ? "w-full bg-emerald-500" : "w-0"}`} />
        </div>
      </div>

      {/* CPU Usage */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl shadow-lg group hover:border-blue-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">CPU Usage</div>
          <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
            <Cpu className="text-blue-400" size={16} />
          </div>
        </div>
        <div className="text-3xl font-black text-white">{sysStats?.cpu || 0}%</div>
        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${sysStats?.cpu || 0}%` }} />
        </div>
      </div>

      {/* Memory */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl shadow-lg group hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memory</div>
          <div className="p-1.5 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
            <Database className="text-purple-400" size={16} />
          </div>
        </div>
        <div className="text-xl font-black text-white truncate">{sysStats?.memory || "0/0"}</div>
        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 w-1/3 transition-all duration-1000" />
        </div>
      </div>

      {/* Disk Usage */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl shadow-lg group hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disk Usage</div>
          <div className="p-1.5 bg-amber-500/10 rounded-lg group-hover:scale-110 transition-transform">
            <HardDrive className="text-amber-400" size={16} />
          </div>
        </div>
        <div className="text-lg font-black text-white truncate">{sysStats?.disk || "0/0"}</div>
        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 w-1/4 transition-all duration-1000" />
        </div>
      </div>

      {/* Internet Speed */}
      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl shadow-lg group hover:border-cyan-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Internet Speed</div>
          <div className="p-1.5 bg-cyan-500/10 rounded-lg group-hover:scale-110 transition-transform">
            <Wifi className="text-cyan-400" size={16} />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-bold">↑ UPLOAD</span>
            <span className="text-blue-400 font-black">{isStreaming ? "2.50 Mbps" : "0 Mbps"}</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-bold">↓ DOWNLOAD</span>
            <span className="text-emerald-400 font-black">1.2 Mbps</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;

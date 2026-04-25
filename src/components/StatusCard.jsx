import React from "react";
import { Activity, Power, Signal } from "lucide-react";

const StatusCard = ({ status, serverStatus }) => {
  const isStreaming = status && status !== "OFFLINE" && status !== "ERROR";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
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

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-cyan-500/10 rounded-xl">
            <Activity className="text-cyan-400" size={24} />
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            isStreaming ? "bg-cyan-500/20 text-cyan-400 animate-pulse" : "bg-slate-800 text-slate-400"
          }`}>
            {isStreaming ? "STREAMING" : "IDLE"}
          </div>
        </div>
        <div className="text-sm text-slate-400 font-medium">Current Status</div>
        <div className="text-2xl font-bold text-slate-100 mt-1">{status}</div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <Power className="text-purple-400" size={24} />
          </div>
        </div>
        <div className="text-sm text-slate-400 font-medium">Auto-Restart</div>
        <div className="text-2xl font-bold text-slate-100 mt-1">Enabled</div>
      </div>
    </div>
  );
};

export default StatusCard;

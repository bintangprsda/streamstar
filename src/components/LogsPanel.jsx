import React, { useRef, useEffect } from "react";
import { Terminal, Activity, Trash2 } from "lucide-react";

const LogsPanel = ({ logs, onClear, hideHeader = false }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className={`flex flex-col h-full overflow-hidden ${!hideHeader ? "bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl" : ""}`}>
      {!hideHeader && (
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Activity className="text-emerald-400" size={18} />
            </div>
            <h2 className="font-bold text-slate-100 flex items-center space-x-2">
              <span>FFmpeg Runtime Logs</span>
            </h2>
          </div>
          <button
            onClick={onClear}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
            title="Clear Logs"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed custom-scrollbar ${!hideHeader ? "bg-slate-950/30" : ""}`}>
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-20 grayscale">
            <Terminal size={48} />
            <p className="text-xs">Waiting for stream activity...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex space-x-3 group border-l border-slate-800 pl-3 hover:border-emerald-500/30 transition-colors">
                <span className="text-slate-600 select-none w-14 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                <span className={`${
                  log.includes("Error") ? "text-red-400" :
                  log.includes("Starting") ? "text-emerald-400 font-bold" :
                  log.includes("frame=") ? "text-cyan-400/80" :
                  "text-slate-400"
                }`}>
                  {log}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
      
      {hideHeader && (
        <div className="p-4 border-t border-white/5 flex justify-end bg-black/20">
          <button
            onClick={onClear}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 size={14} />
            <span>Clear Logs</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LogsPanel;

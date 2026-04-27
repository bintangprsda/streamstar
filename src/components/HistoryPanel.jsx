import React from "react";
import { Clock, Video, Calendar } from "lucide-react";

const HistoryPanel = ({ history }) => {
  const formatDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / 3600000).toString().padStart(2, "0");
    const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
    const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-full">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <Clock className="text-purple-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Stream History</h2>
        </div>
        <div className="text-xs text-slate-500 font-medium uppercase tracking-widest">Last 50 sessions</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
            <Clock size={48} className="opacity-20" />
            <p>No stream history yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div
                key={index}
                className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 hover:bg-slate-800/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                      <Video size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200">{entry.video}</div>
                      <div className="text-xs text-slate-500 flex items-center mt-0.5">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(entry.start)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg inline-block mb-1">
                      {formatDuration(entry.start, entry.end)}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">Total Uptime</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700/30">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Start Time</div>
                    <div className="text-xs font-mono text-slate-400">{new Date(entry.start).toLocaleTimeString()}</div>
                  </div>
                  <div className="text-center border-l border-slate-700/30">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">End Time</div>
                    <div className="text-xs font-mono text-slate-400">{new Date(entry.end).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;

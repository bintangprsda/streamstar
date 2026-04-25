import React from "react";
import { Play, Square, Trash2, Video as VideoIcon, Radio } from "lucide-react";

const VideoList = ({ videos, currentVideo, onStart, onStop, onDelete }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <VideoIcon className="text-emerald-400" size={20} />
          <span>Video Library</span>
        </h2>
        <span className="text-[10px] font-bold text-slate-500 px-3 py-1 bg-slate-800 rounded-full uppercase tracking-widest">
          {videos.length} Total Files
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 bg-slate-950/20">
              <th className="px-6 py-4 font-bold">Video Name</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {videos.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-16 text-center text-slate-600">
                  <div className="flex flex-col items-center space-y-3">
                    <VideoIcon size={40} className="opacity-10" />
                    <p className="italic text-sm">No videos found in library</p>
                  </div>
                </td>
              </tr>
            ) : (
              videos.map((video) => {
                const isActive = currentVideo === video;
                return (
                  <tr 
                    key={video} 
                    className={`group transition-all duration-300 ${
                      isActive 
                        ? "bg-emerald-500/10 border-l-4 border-l-emerald-500 shadow-[inset_10px_0_30px_-15px_rgba(16,185,129,0.2)]" 
                        : "hover:bg-slate-800/40 border-l-4 border-l-transparent"
                    }`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          isActive 
                            ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20 scale-110" 
                            : "bg-slate-800 text-slate-500 group-hover:text-slate-300"
                        }`}>
                          {isActive ? <Radio size={20} className="animate-pulse" /> : <VideoIcon size={20} />}
                        </div>
                        <div>
                          <span className={`block font-bold text-sm transition-colors ${isActive ? "text-emerald-400" : "text-slate-300 group-hover:text-white"}`}>
                            {video}
                          </span>
                          {isActive && (
                            <span className="text-[10px] text-emerald-500/70 font-mono flex items-center space-x-1 mt-0.5">
                              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                              <span>BROADCASTING NOW</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {isActive ? (
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">LIVE</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full">
                          <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">READY</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isActive ? (
                          <button
                            onClick={onStop}
                            className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20 shadow-lg shadow-red-500/5"
                            title="Stop Stream"
                          >
                            <Square size={18} fill="currentColor" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onStart(video)}
                            className="p-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                            title="Start Stream"
                          >
                            <Play size={18} fill="currentColor" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(video)}
                          className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                          title="Delete Permanently"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VideoList;

import React from "react";
import { Play, Square, Trash2, Video as VideoIcon } from "lucide-react";

const VideoList = ({ videos, currentVideo, onStart, onStop, onDelete }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <VideoIcon className="text-emerald-400" size={20} />
          <span>Video Library</span>
        </h2>
        <span className="text-xs text-slate-500 font-medium px-3 py-1 bg-slate-800 rounded-full">
          {videos.length} Videos
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-widest border-b border-slate-800">
              <th className="px-6 py-4 font-semibold">Video Name</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {videos.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-slate-500 italic">
                  No videos uploaded yet
                </td>
              </tr>
            ) : (
              videos.map((video) => {
                const isActive = currentVideo === video;
                return (
                  <tr key={video} className={`group transition-colors ${isActive ? "bg-emerald-500/5" : "hover:bg-slate-800/30"}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          <VideoIcon size={18} />
                        </div>
                        <span className={`font-medium ${isActive ? "text-emerald-400" : "text-slate-300"}`}>{video}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isActive ? (
                        <div className="flex items-center space-x-2 text-emerald-400">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          <span className="text-xs font-bold uppercase">Active</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 font-bold uppercase">Ready</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isActive ? (
                          <button
                            onClick={onStop}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                            title="Stop Stream"
                          >
                            <Square size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onStart(video)}
                            className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20"
                            title="Start Stream"
                          >
                            <Play size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(video)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Video"
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

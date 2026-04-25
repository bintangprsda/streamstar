import React, { useState } from "react";
import { Calendar, Plus, Clock, Trash2 } from "lucide-react";

const SchedulerPanel = ({ videos, schedules, onAdd, onDelete }) => {
  const [selectedVideo, setSelectedVideo] = useState("");
  const [time, setTime] = useState("");

  const handleAdd = () => {
    if (!selectedVideo || !time) return;
    onAdd(selectedVideo, time);
    setSelectedVideo("");
    setTime("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center space-x-2">
            <Plus className="text-emerald-400" size={20} />
            <span>New Schedule</span>
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Select Video</label>
              <select
                value={selectedVideo}
                onChange={(e) => setSelectedVideo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500/50 appearance-none"
              >
                <option value="">-- Choose Video --</option>
                {videos.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Execution Time</label>
              <input
                type="datetime-local"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!selectedVideo || !time}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 mt-4"
            >
              <Calendar size={18} />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <Clock className="text-emerald-400" size={20} />
            <h2 className="text-lg font-bold text-slate-100">Planned Broadcasts</h2>
          </div>

          <div className="divide-y divide-slate-800/50">
            {schedules.length === 0 ? (
              <div className="p-12 text-center text-slate-500 italic">No tasks scheduled</div>
            ) : (
              schedules.map((item) => (
                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-800 rounded-2xl">
                      <Calendar className="text-emerald-400" size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200">{item.video}</div>
                      <div className="text-xs text-slate-500 font-mono">{new Date(item.time).toLocaleString()}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerPanel;

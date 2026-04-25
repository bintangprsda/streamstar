import React, { useState } from "react";
import { Calendar, Plus, Clock, Trash2, ChevronRight, Zap } from "lucide-react";

const SchedulerPanel = ({ videos, schedules, onAdd, onDelete }) => {
  const [selectedVideo, setSelectedVideo] = useState("");
  const [time, setTime] = useState("");

  const handleAdd = () => {
    if (!selectedVideo || !time) return;
    onAdd(selectedVideo, time);
    setSelectedVideo("");
    setTime("");
  };

  const formatToLocalDatetime = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const setQuickTime = (minutes) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    setTime(formatToLocalDatetime(now));
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Jam 9 pagi besok
    setTime(formatToLocalDatetime(tomorrow));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl border-t-4 border-t-emerald-500/50">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Calendar className="text-emerald-400" size={20} />
            </div>
            <span>Jadwal Baru</span>
          </h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">1. Pilih Video</label>
              <div className="relative">
                <select
                  value={selectedVideo}
                  onChange={(e) => setSelectedVideo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-slate-200 focus:outline-none focus:border-emerald-500/50 appearance-none transition-all cursor-pointer"
                >
                  <option value="">-- Pilih dari galeri --</option>
                  {videos.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none rotate-90" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">2. Atur Waktu & Tanggal</label>
              <input
                type="datetime-local"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center space-x-1">
                <Zap size={10} className="text-amber-400" />
                <span>Pilih Cepat (WIB)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setQuickTime(30)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  +30 Menit
                </button>
                <button 
                  onClick={() => setQuickTime(60)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  +1 Jam
                </button>
                <button 
                  onClick={setTomorrow}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition-colors col-span-2"
                >
                  Besok Pagi (09:00 WIB)
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!selectedVideo || !time}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:grayscale text-slate-950 font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-lg shadow-emerald-500/20 mt-4 active:scale-95"
            >
              <Plus size={20} />
              <span>Simpan ke Jadwal</span>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Clock className="text-cyan-400" size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-100">Daftar Siaran Terjadwal</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full uppercase">
              {schedules.length} Antrean
            </span>
          </div>

          <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-y-auto custom-scrollbar">
            {schedules.length === 0 ? (
              <div className="p-20 text-center text-slate-600 flex flex-col items-center space-y-4">
                <Calendar size={48} className="opacity-20" />
                <p className="italic text-sm">Belum ada jadwal. Ayo buat rencana siaran Anda!</p>
              </div>
            ) : (
              schedules.map((item) => (
                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 group-hover:border-emerald-500/30 transition-colors">
                      <Calendar className="text-emerald-400" size={22} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{item.video}</div>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono mt-1">
                        <Clock size={12} className="text-slate-600" />
                        <span>{new Date(item.time).toLocaleString("id-ID", {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-3 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                    title="Hapus Jadwal"
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

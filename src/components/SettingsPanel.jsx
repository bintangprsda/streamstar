import React from "react";
import { Settings as SettingsIcon, Save, Key, Globe } from "lucide-react";

const SettingsPanel = ({ config, setConfig, onSave }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <SettingsIcon className="text-emerald-400" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Broadcast Settings</h2>
            <p className="text-xs text-slate-500">Configure your RTMP destination and stream credentials</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2">
              <Globe size={14} />
              <span>RTMP Ingest URL</span>
            </label>
            <input
              type="text"
              value={config.rtmpUrl}
              onChange={(e) => setConfig({ ...config, rtmpUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
              placeholder="rtmp://a.rtmp.youtube.com/live2/"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2">
              <Key size={14} />
              <span>Stream Key</span>
            </label>
            <div className="relative group">
              <input
                type="password"
                value={config.streamKey}
                onChange={(e) => setConfig({ ...config, streamKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
                placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1 italic italic">
              Keep this key private. It allows anyone to stream to your channel.
            </p>
          </div>

          <button
            onClick={onSave}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Save size={20} />
            <span>Update Broadcast Config</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

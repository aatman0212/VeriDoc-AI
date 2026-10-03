import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Sliders, Cpu, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [faceThreshold, setFaceThreshold] = useState(75);
  const [elaSensitivity, setElaSensitivity] = useState(85);
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>System Configuration</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
          Checkpoint Hardware & AI Engine Calibration
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Tune neural network thresholds, optical resolution parameters, and national database synchronization
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Biometric Threshold Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-white uppercase tracking-wider">
                Facial Biometric Match Cutoff Threshold
              </span>
              <p className="text-[11px] text-slate-400">
                Minimum cosine vector similarity required for automated green-channel clearance
              </p>
            </div>
            <span className="font-mono text-cyan-400 font-bold text-sm">{faceThreshold}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            value={faceThreshold}
            onChange={(e) => setFaceThreshold(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>50% (Permissive)</span>
            <span>Recommended: 75%</span>
            <span>95% (Strict Biometric)</span>
          </div>
        </div>

        {/* ELA Sensitivity */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-white uppercase tracking-wider">
                Error Level Analysis (ELA) Splicing Sensitivity
              </span>
              <p className="text-[11px] text-slate-400">
                Neural threshold for flagging photo manipulation and compression gradients
              </p>
            </div>
            <span className="font-mono text-rose-400 font-bold text-sm">{elaSensitivity}%</span>
          </div>
          <input
            type="range"
            min={60}
            max={98}
            value={elaSensitivity}
            onChange={(e) => setElaSensitivity(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* Integration Statuses */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <span className="font-bold text-white uppercase tracking-wider text-xs block">
            National & International Database Links
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">ICAO PKD Public Key Sync:</span>
              <span className="text-emerald-400 font-bold">● CONNECTED</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Interpol SLTD Watchlist API:</span>
              <span className="text-emerald-400 font-bold">● LIVE</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">National Citizen Registry:</span>
              <span className="text-emerald-400 font-bold">● SYNCED (5m ago)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Biometric E-Gate Controller:</span>
              <span className="text-emerald-400 font-bold">● ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Firmware: VERIDOC-OS v2.4.1 (Build 26188)</span>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Settings Saved!' : 'Save Calibration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { FileText, Download, TrendingUp, BarChart3, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DASHBOARD_STATS } from '../mock/cases';

export const ReportsView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Operational Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Immigration & Screening Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Checkpoint throughput metrics, fraudulent document signatures, and AI precision analytics
          </p>
        </div>

        <button
          onClick={() => alert('Generating Daily Border Checkpoint Intelligence Brief (PDF)...')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Daily Dossier</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 uppercase font-mono">Detection Accuracy</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">99.1%</div>
          <p className="text-xs text-slate-500 mt-1">Verified against known ground-truth dataset</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 uppercase font-mono">Avg Inspection Latency</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">1.84 sec</div>
          <p className="text-xs text-slate-500 mt-1">From optical ingest to final composite score</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 uppercase font-mono">False Positive Rate</span>
          <div className="text-3xl font-extrabold text-indigo-400 font-mono mt-1">0.42%</div>
          <p className="text-xs text-slate-500 mt-1">Optimized for high-volume airport throughput</p>
        </div>
      </div>

      {/* Hourly Throughput Bar Chart Simulation */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Today's Screening Volume by Operational Hour</span>
          <span className="text-xs font-mono text-cyan-400">Total: 1,248 Docs</span>
        </h3>

        <div className="space-y-4">
          {DASHBOARD_STATS.hourlyDistribution.map((item) => (
            <div key={item.hour} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">{item.hour} hrs</span>
                <span className="text-slate-400">
                  <strong className="text-cyan-400">{item.screened}</strong> Screened •{' '}
                  <span className="text-rose-400">{item.flagged} Flagged</span>
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full"
                  style={{ width: `${(item.screened / 300) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

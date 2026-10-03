import React from 'react';
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Flag,
  ArrowUpRight,
  ScanLine,
  Search,
  Filter,
  Eye,
  TrendingUp,
  Activity,
  Calendar,
} from 'lucide-react';
import { RECENT_SCREENINGS, DASHBOARD_STATS } from '../mock/cases';
import { NavigationPage } from './Sidebar';

interface DashboardProps {
  onNavigate: (page: NavigationPage) => void;
  onSelectCase: (caseId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectCase }) => {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Live Border Checkpoint Station
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Screening Operations Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time biometric, optical tampering & database verification monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('new-screening')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-950/40 text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <ScanLine className="w-4 h-4" />
            <span>Start New Screening</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Overview (5 Key Metric Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Documents Screened */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Documents Screened</span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {DASHBOARD_STATS.documentsScreened}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>+8.4% today</span>
            </div>
          </div>
        </div>

        {/* Low Risk */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">Low Risk</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
              {DASHBOARD_STATS.lowRisk}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">88.3% auto-cleared</div>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-400">Medium Risk</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              {DASHBOARD_STATS.mediumRisk}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Secondary check</div>
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 transition-all rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-rose-400">High Risk</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-300 font-mono">
              {DASHBOARD_STATS.highRisk}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Elevated threat</div>
          </div>
        </div>

        {/* Flagged Cases */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 transition-all rounded-xl p-4 flex flex-col justify-between shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-rose-300">Flagged Cases</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
              {DASHBOARD_STATS.flaggedCases}
            </div>
            <div className="text-[11px] text-rose-400/80 mt-1">Requires supervisor action</div>
          </div>
        </div>
      </div>

      {/* Security Threat Distribution Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
          <span className="text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Current Checkpoint Risk Distribution (Today)
          </span>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-emerald-400">■ Low: 88.3%</span>
            <span className="text-amber-400">■ Medium: 7.7%</span>
            <span className="text-rose-400">■ High / Flagged: 4.0%</span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full" style={{ width: '88.3%' }} title="Low Risk: 1,102" />
          <div className="bg-amber-500 h-full" style={{ width: '7.7%' }} title="Medium Risk: 96" />
          <div className="bg-rose-500 h-full" style={{ width: '4.0%' }} title="High Risk: 50" />
        </div>
      </div>

      {/* Recent Screening Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Recent Screenings</h3>
            <p className="text-xs text-slate-400">
              Live automated feed from document scanner terminals & biometric e-gates
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <span>View Full History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Case ID</th>
                <th className="py-3.5 px-4 font-semibold">Document</th>
                <th className="py-3.5 px-4 font-semibold">Person</th>
                <th className="py-3.5 px-4 font-semibold">Screening Time</th>
                <th className="py-3.5 px-4 font-semibold">Risk Score</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {RECENT_SCREENINGS.map((row) => {
                const isHigh = row.riskLevel === 'high';
                const isMedium = row.riskLevel === 'medium';
                const isLow = row.riskLevel === 'low';

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectCase(row.id)}
                  >
                    {/* Case ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {row.id}
                    </td>

                    {/* Document */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                        {row.document}
                      </span>
                    </td>

                    {/* Person */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {row.person}
                    </td>

                    {/* Screening Time */}
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {row.time}
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold ${
                            isHigh ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {row.riskScore}/100
                        </span>
                        <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${row.riskScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                          isHigh
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                            : isMedium
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isHigh ? 'bg-rose-400 animate-ping' : isMedium ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                        />
                        {row.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(row.id);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                          row.actionText === 'Review'
                            ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50'
                            : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{row.actionText}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldAlert, AlertTriangle, Eye, Flame, MapPin, Clock, ArrowRight } from 'lucide-react';
import { RECENT_SCREENINGS } from '../mock/cases';

interface AlertsViewProps {
  onSelectCase: (caseId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onSelectCase }) => {
  const highRiskAlerts = RECENT_SCREENINGS.filter((c) => c.riskLevel === 'high' || c.riskLevel === 'medium');

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Active Checkpoint Threat Feed</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Live Flagged Alerts & Anomalies (32 Cases)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time biometric mismatches, photo tampering detections, and travel document expired/counterfeit alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold animate-pulse">
            HIGH THREAT LEVEL: ELEVATED
          </span>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highRiskAlerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onSelectCase(alert.id)}
            className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-400 text-xs">{alert.id}</span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-300 font-semibold text-sm">{alert.person}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    alert.riskLevel === 'high'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  }`}
                >
                  Score: {alert.riskScore}/100
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Document Type:</span>
                  <span className="text-slate-200 font-mono font-semibold">{alert.document}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Screening Time:</span>
                  <span className="text-slate-200 font-mono">{alert.time} IST</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300 font-mono text-[11px]">
                  {alert.riskLevel === 'high'
                    ? '⚠ Alert: Multi-spectral photo manipulation and face mismatch detected. High confidence forgery signature.'
                    : '⚠ Warning: Document approaching validity expiration window with cross-registry string variance.'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-rose-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Action: Manual Review Required</span>
              </span>

              <span className="text-cyan-400 group-hover:text-cyan-300 font-semibold flex items-center gap-1 text-xs">
                <span>Investigate Case</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

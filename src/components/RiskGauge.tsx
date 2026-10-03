import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { RiskLevel } from '../types/screening';

interface RiskGaugeProps {
  score: number; // 0 to 100
  riskLevel: RiskLevel;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, riskLevel, size = 220 }) => {
  // SVG circular arc calculations
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc or full circle
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColorConfig = () => {
    switch (riskLevel) {
      case 'high':
        return {
          stroke: '#f43f5e',
          glow: 'glow-rose',
          text: 'text-rose-400',
          badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
          label: 'HIGH RISK',
          subLabel: 'CRITICAL THREAT SIGNALS',
          icon: ShieldAlert,
        };
      case 'medium':
        return {
          stroke: '#f59e0b',
          glow: 'glow-amber',
          text: 'text-amber-400',
          badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
          label: 'MEDIUM RISK',
          subLabel: 'SECONDARY CHECK REQUIRED',
          icon: AlertTriangle,
        };
      case 'low':
      default:
        return {
          stroke: '#10b981',
          glow: 'glow-emerald',
          text: 'text-emerald-400',
          badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
          label: 'LOW RISK',
          subLabel: 'CLEARED FOR ENTRY',
          icon: ShieldCheck,
        };
    }
  };

  const config = getColorConfig();
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div
        className="absolute w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: config.stroke }}
      />

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Animated Metric Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={config.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
            RISK SCORE
          </span>
          <div className="flex items-baseline justify-center gap-1 my-1">
            <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight font-mono ${config.text}`}>
              {score}
            </span>
            <span className="text-slate-500 text-sm font-semibold">/ 100</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Icon className={`w-4 h-4 ${config.text}`} />
            <span className="text-xs font-semibold text-slate-300">AI Confidence: 94%</span>
          </div>
        </div>
      </div>

      {/* Large Risk Badge */}
      <div className="mt-4 flex flex-col items-center gap-1 text-center">
        <div
          className={`px-5 py-1.5 rounded-full border text-sm font-bold tracking-wider uppercase shadow-md flex items-center gap-2 ${config.badgeBg}`}
        >
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: config.stroke }} />
          <span>{config.label}</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 tracking-wide mt-1">
          {config.subLabel}
        </span>
      </div>
    </div>
  );
};

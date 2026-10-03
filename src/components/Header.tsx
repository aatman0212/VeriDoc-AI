import React, { useState, useEffect } from 'react';
import { Shield, Clock, MapPin, User, Server } from 'lucide-react';
import { apiService } from '../services/api';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  useEffect(() => {
    // Check backend health
    const verifyBackend = async () => {
      const health = await apiService.checkHealth();
      setIsBackendOnline(!!health);
    };
    verifyBackend();
    const healthInterval = setInterval(verifyBackend, 6000);

    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      };
      setCurrentTime(now.toLocaleString('en-IN', options) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(healthInterval);
    };
  }, []);

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 text-slate-100 px-4 sm:px-6 py-3 sticky top-0 z-30 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                VERIDOC AI
              </span>
              <span className="bg-cyan-950 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-800 font-semibold tracking-wider">
                SIH 26188
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              AI-Based Identity & Document Screening System
            </p>
          </div>
        </div>

        {/* Status Indicators & Metadata */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono">
          {/* Checkpoint Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Checkpoint</span>
              <span className="font-medium text-slate-200">Demo Border Checkpoint</span>
            </div>
          </div>

          {/* Officer Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
            <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Officer</span>
              <span className="font-medium text-slate-200">Demo Officer (VD-8842)</span>
            </div>
          </div>

          {/* Live Date & Time */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Live Time</span>
              <span className="font-medium">{currentTime || '14:32:00 IST'}</span>
            </div>
          </div>

          {/* Backend Status Indicator */}
          {isBackendOnline ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[11px] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                <span>PYTHON API: LIVE (PORT 5000)</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/50 border border-amber-500/30 text-amber-300 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-semibold tracking-wider">STANDALONE (MOCK)</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

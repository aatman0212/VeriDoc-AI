import React, { useState } from 'react';
import { Shield, Lock, UserCheck, ShieldAlert, KeyRound, ArrowRight, CheckCircle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [officerId, setOfficerId] = useState('VD-8842');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden">
      {/* High-tech security grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0284c7 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Ambient glowing radial orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner: SIH Tag */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
            BORDER SECURITY & IMMIGRATION INSPECTION PORTAL
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-xs font-mono px-3 py-1 rounded-full font-bold shadow-sm">
            SIH Problem Statement 26188
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md my-auto z-10">
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl relative">
          {/* Glowing border accent */}
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75" />

          {/* System Logo & Branding */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-xl shadow-cyan-500/30 border border-cyan-400/50 mb-4 ring-4 ring-cyan-500/10">
              <Shield className="w-9 h-9 text-white" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white">
              VERIDOC AI
            </h1>
            <p className="text-xs sm:text-sm text-cyan-400 font-medium tracking-wide mt-1">
              AI-Powered Identity & Document Screening
            </p>
            <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Checkpoint AI Gateway — Terminal Mode</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Officer ID / Badge Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="e.g. VD-8842"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Terminal Access Key / Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure credentials"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Remember Checkpoint Station</span>
              </label>
              <span className="text-cyan-400/80 hover:text-cyan-300 font-mono text-[11px] cursor-pointer">
                Demo Auth Mode
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 w-full bg-gradient-to-r from-cyan-600 hover:from-cyan-500 to-blue-600 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Officer...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Screening Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400 mb-2">
              Demonstration Prototype Mode — Single Click Login
            </p>
            <button
              type="button"
              onClick={onLogin}
              className="w-full py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700/80 text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Demo Officer Access (Bypass)</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center text-slate-500 text-xs font-mono py-2 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 border-t border-slate-900">
        <div>Smart India Hackathon 2026 — Team Prototype</div>
        <div>Problem Statement 26188: AI-Based Fake Identity & Document Screening System</div>
      </footer>
    </div>
  );
};

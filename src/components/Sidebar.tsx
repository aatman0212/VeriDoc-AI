import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  History,
  Bell,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  Network,
  Lock,
} from 'lucide-react';

export type NavigationPage = 'dashboard' | 'new-screening' | 'fraud-graph' | 'audit-ledger' | 'history' | 'alerts' | 'reports' | 'settings' | 'testing';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onLogout: () => void;
  flaggedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  flaggedCount = 32,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavigationPage,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'new-screening' as NavigationPage,
      label: 'New Screening',
      icon: ScanLine,
      badge: 'LIVE',
      highlight: true,
    },
    {
      id: 'fraud-graph' as NavigationPage,
      label: 'Fraud Ring Graph',
      icon: Network,
      badge: 'USP',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      highlight: true,
    },
    {
      id: 'audit-ledger' as NavigationPage,
      label: 'Audit Ledger',
      icon: Lock,
      badge: 'SHA-256',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'testing' as NavigationPage,
      label: 'QA & Testing Hub',
      icon: ShieldCheck,
      badge: '8 PHASES',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'history' as NavigationPage,
      label: 'Screening History',
      icon: History,
      badge: '1,248',
    },
    {
      id: 'alerts' as NavigationPage,
      label: 'Alerts',
      icon: Bell,
      badge: flaggedCount.toString(),
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'reports' as NavigationPage,
      label: 'Reports',
      icon: FileText,
      badge: null,
    },
    {
      id: 'settings' as NavigationPage,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 select-none">
      {/* Navigation Links */}
      <div className="flex flex-col gap-6">
        <div>
          <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500 px-3 mb-2 font-semibold">
            Checkpoint Navigation
          </div>
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/40'
                      : item.highlight
                      ? 'text-slate-200 hover:bg-slate-800/80 hover:text-white border border-transparent'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-cyan-400' : item.highlight ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        item.badgeColor ||
                        (isActive
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Officer Sign Out */}
      <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950/60 rounded-lg border border-slate-800/60 text-xs">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="truncate">
            <div className="text-slate-200 font-semibold truncate">Officer K. Raman</div>
            <div className="text-[10px] font-mono text-slate-400">Session ID: #VD-8842</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-800/40 border border-transparent transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Terminal</span>
        </button>
      </div>
    </aside>
  );
};

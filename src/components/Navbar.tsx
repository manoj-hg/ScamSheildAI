import React from 'react';
import { Shield, ShieldAlert, Activity, History, Users, BarChart3, Sparkles, Mic, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  currentTab: 'scanner' | 'history' | 'community' | 'analytics';
  onSelectTab: (tab: 'scanner' | 'history' | 'community' | 'analytics') => void;
  onOpenQuickDemo: () => void;
  onOpenVoiceAgent?: () => void;
  savedScansCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickDemo,
  onOpenVoiceAgent,
  savedScansCount,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080d18]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          id="brand-logo"
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onSelectTab('scanner')}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 transition-all">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                ScamShield <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-semibold tracking-wider">
                v2.6 SEC-ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Fake Offer Letter & Phishing Inspector
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on mobile; mobile uses thumb-friendly MobileBottomNav) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <button
            id="nav-tab-scanner"
            onClick={() => onSelectTab('scanner')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
              currentTab === 'scanner'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Inspector</span>
          </button>

          <button
            id="nav-tab-history"
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
              currentTab === 'history'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>History</span>
            {savedScansCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {savedScansCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-community"
            onClick={() => onSelectTab('community')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
              currentTab === 'community'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Threat Feed</span>
          </button>

          <button
            id="nav-tab-analytics"
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
              currentTab === 'analytics'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Right side CTAs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Demo Presets Button */}
          <button
            id="btn-quick-demo"
            onClick={onOpenQuickDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all shadow-sm min-h-[38px] touch-manipulation"
            title="Load Pre-configured Demo Scams"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Demo Presets</span>
            <span className="sm:hidden font-mono text-[11px]">Demos</span>
          </button>

          {/* Desktop Voice Agent "Protector" Trigger */}
          <button
            id="nav-btn-voice-agent"
            onClick={onOpenVoiceAgent}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] group min-h-[38px] touch-manipulation"
            title="Voice Agent 'Protector' (Wake word: say 'Protector')"
          >
            <div className="relative flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span>Protector AI</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-cyan-900/60 text-cyan-200">
              VOICE
            </span>
          </button>

          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-800 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Threat Engine Active</span>
          </div>

          {/* User Auth Profile / Google Sign In */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-8 h-8 rounded-full border border-cyan-500/40 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-300 font-bold shrink-0">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs text-slate-300 font-medium hidden lg:inline max-w-[110px] truncate">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button
                id="btn-sign-out"
                onClick={signOutUser}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-google-sign-in"
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500/40 transition-all shadow-sm min-h-[38px] touch-manipulation"
              title="Sign in with Google to sync scans across devices"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

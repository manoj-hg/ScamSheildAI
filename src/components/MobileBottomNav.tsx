import React from 'react';
import { ShieldAlert, History, Users, BarChart3, Mic } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'scanner' | 'history' | 'community' | 'analytics';
  onSelectTab: (tab: 'scanner' | 'history' | 'community' | 'analytics') => void;
  onOpenVoiceAgent?: () => void;
  savedScansCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenVoiceAgent,
  savedScansCount,
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#080d18]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] px-2 py-1.5 flex items-center justify-around safe-bottom"
    >
      {/* 1. Inspector */}
      <button
        id="mobile-nav-scanner"
        onClick={() => onSelectTab('scanner')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] touch-manipulation ${
          currentTab === 'scanner'
            ? 'text-cyan-300 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <ShieldAlert className="w-5 h-5 mb-0.5" />
          {currentTab === 'scanner' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          )}
        </div>
        <span className="text-[10px] tracking-tight">Inspector</span>
      </button>

      {/* 2. History */}
      <button
        id="mobile-nav-history"
        onClick={() => onSelectTab('history')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] touch-manipulation ${
          currentTab === 'history'
            ? 'text-cyan-300 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <History className="w-5 h-5 mb-0.5" />
          {savedScansCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-1 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] flex items-center justify-center font-mono">
              {savedScansCount > 99 ? '99+' : savedScansCount}
            </span>
          )}
          {currentTab === 'history' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          )}
        </div>
        <span className="text-[10px] tracking-tight">History</span>
      </button>

      {/* 3. Center Protector Voice Agent Hero Button */}
      {onOpenVoiceAgent && (
        <button
          id="mobile-nav-voice"
          onClick={onOpenVoiceAgent}
          className="flex flex-col items-center justify-center -mt-4 px-2 min-h-[52px] touch-manipulation group"
          title="Open Protector Voice Agent"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-300/50 shadow-[0_0_20px_rgba(6,182,212,0.6)] group-active:scale-95 transition-transform">
            <Mic className="w-5 h-5 text-slate-950 font-bold" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950 animate-ping" />
          </div>
          <span className="text-[9px] font-bold text-cyan-300 tracking-wider font-mono mt-0.5 uppercase">
            Protector
          </span>
        </button>
      )}

      {/* 4. Threat Feed */}
      <button
        id="mobile-nav-community"
        onClick={() => onSelectTab('community')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] touch-manipulation ${
          currentTab === 'community'
            ? 'text-cyan-300 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Users className="w-5 h-5 mb-0.5" />
          {currentTab === 'community' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          )}
        </div>
        <span className="text-[10px] tracking-tight">Feed</span>
      </button>

      {/* 5. Dashboard / Stats */}
      <button
        id="mobile-nav-analytics"
        onClick={() => onSelectTab('analytics')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] touch-manipulation ${
          currentTab === 'analytics'
            ? 'text-cyan-300 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <BarChart3 className="w-5 h-5 mb-0.5" />
          {currentTab === 'analytics' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          )}
        </div>
        <span className="text-[10px] tracking-tight">Stats</span>
      </button>
    </nav>
  );
};

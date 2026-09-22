import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, ArrowRight, CheckCircle2, Search, Mic } from 'lucide-react';

interface HeroProps {
  onAnalyzeClick: () => void;
  onViewScansClick: () => void;
  onOpenVoiceAgent?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyzeClick, onViewScansClick, onOpenVoiceAgent }) => {
  return (
    <div className="relative pt-6 sm:pt-10 pb-6 sm:pb-8 text-center max-w-4xl mx-auto px-3 sm:px-4">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      {/* Security pill badge */}
      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner mb-5 sm:mb-6 text-[11px] sm:text-xs text-slate-300 font-medium max-w-full truncate">
        <span className="flex h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
        <span className="truncate">Multi-Layer Forensic Threat Inspection</span>
        <span className="text-slate-500 hidden sm:inline">|</span>
        <span className="text-cyan-400 font-mono hidden sm:inline">Zero-Trust Architecture</span>
      </div>

      {/* Main hero title */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-3 sm:mb-4">
        Don&apos;t Trust It.{' '}
        <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          Verify It.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
        AI-powered protection against fake job offers, phishing links, payment scams and fraudulent recruiters.
      </p>

      {/* Hero CTA buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3.5 mb-8 sm:mb-10 w-full max-w-sm sm:max-w-none mx-auto">
        <button
          id="hero-cta-analyze"
          onClick={onAnalyzeClick}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-sm shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95 min-h-[46px] touch-manipulation"
        >
          <Search className="w-4 h-4 text-slate-950 shrink-0" />
          <span>Analyze Now</span>
          <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
        </button>

        <button
          id="hero-cta-history"
          onClick={onViewScansClick}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm transition-all hover:border-slate-600 min-h-[46px] touch-manipulation"
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>View Previous Scans</span>
        </button>

        {onOpenVoiceAgent && (
          <button
            id="hero-cta-voice"
            onClick={onOpenVoiceAgent}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-semibold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] group min-h-[46px] touch-manipulation"
          >
            <Mic className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform animate-pulse shrink-0" />
            <span>Wake Agent "Protector"</span>
          </button>
        )}
      </div>

      {/* Key Guarantees banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3.5 pt-4 border-t border-slate-800/60 max-w-3xl mx-auto text-left">
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-slate-200">Weighted Index</div>
            <div className="text-[11px] text-slate-400">Deterministic 0–100 score</div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-slate-200">Domain Intel</div>
            <div className="text-[11px] text-slate-400">Typosquatting & TLD checks</div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-slate-200">Payment Radar</div>
            <div className="text-[11px] text-slate-400">UPI, laptop fees, crypto</div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-slate-200">Explainable Proof</div>
            <div className="text-[11px] text-slate-400">Evidence quotes & red flags</div>
          </div>
        </div>
      </div>
    </div>
  );
};

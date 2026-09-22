import React, { useState } from 'react';
import { Flag, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { RedFlag } from '../types';

interface RedFlagHighlighterProps {
  content: string;
  redFlags: RedFlag[];
}

export const RedFlagHighlighter: React.FC<RedFlagHighlighterProps> = ({ content, redFlags }) => {
  const [selectedFlag, setSelectedFlag] = useState<RedFlag | null>(redFlags[0] || null);

  // Categorize colors
  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'PAYMENT':
        return 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30';
      case 'URGENCY':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30';
      case 'NO_INTERVIEW':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30';
      case 'IDENTITY':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30';
      case 'CREDENTIALS':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30';
      case 'DOMAIN':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Red Flag Highlighting & Forensic Annotation
          </h3>
        </div>
        <div className="text-xs text-slate-400">
          Click any highlighted tag to inspect the forensic breakdown
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Original Content with tags (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Analyzed Message / Offer Letter Text:</span>
            <span className="font-mono text-[11px] text-cyan-400">{redFlags.length} Flags Detected</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs sm:text-sm text-slate-300 font-mono leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap selection:bg-cyan-500/30">
            {content}
          </div>

          {/* Quick Clickable Red Flag Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {redFlags.map((flag) => {
              const isSelected = selectedFlag?.id === flag.id;
              return (
                <button
                  key={flag.id}
                  onClick={() => setSelectedFlag(flag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${getBadgeStyle(
                    flag.category
                  )} ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-105' : 'opacity-85'}`}
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{flag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Flag Detail Card (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
          {selectedFlag ? (
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getBadgeStyle(selectedFlag.category)}`}>
                  {selectedFlag.category} • {selectedFlag.severity} SEVERITY
                </span>
                <span className="text-[11px] font-mono text-slate-500">ID: {selectedFlag.id}</span>
              </div>

              <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span>{selectedFlag.label}</span>
              </h4>

              <div className="mb-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 mb-1">SUSPICIOUS EXCERPT:</div>
                <div className="text-xs font-mono text-amber-300 italic">
                  &ldquo;{selectedFlag.text}&rdquo;
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Why This Is Dangerous</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedFlag.explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Info className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs">Select any highlighted tag on the left to reveal why our security engine flagged it.</p>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Deterministic Rule Matched</span>
            <span className="text-cyan-400 font-mono">100% Explainable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

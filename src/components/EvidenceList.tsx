import React from 'react';
import { FileSearch, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { EvidenceItem } from '../types';

interface EvidenceListProps {
  evidence: EvidenceItem[];
}

export const EvidenceList: React.FC<EvidenceListProps> = ({ evidence }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-950/60 border-red-500/40';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/60 border-orange-500/40';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-950/60 border-yellow-500/40';
      default:
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Forensic Evidence & Deductive Reasoning
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400">
          {evidence.length} Corroborating Evidence Points
        </div>
      </div>

      {evidence.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-slate-950/50 rounded-xl border border-slate-800">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">No malicious evidence vectors identified.</p>
          <p className="text-xs text-slate-500 mt-1">Text aligns with standard non-threatening communication patterns.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {evidence.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Evidence Quote */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getSeverityBadge(item.severity)}`}>
                    {item.severity}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    {item.category}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-mono text-amber-200/90 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 mb-2">
                  &ldquo;{item.quote}&rdquo;
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex text-slate-600">
                <ArrowRight className="w-5 h-5 text-cyan-400/70" />
              </div>

              {/* Deduction */}
              <div className="flex-1 md:max-w-xs lg:max-w-sm">
                <div className="text-[11px] font-mono text-cyan-400 uppercase mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-cyan-400" />
                  <span>Deduction & Threat Vector</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.deduction}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

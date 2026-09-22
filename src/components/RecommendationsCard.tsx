import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, PhoneCall } from 'lucide-react';
import { SafetyRecommendation } from '../types';

interface RecommendationsCardProps {
  recommendations: SafetyRecommendation[];
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendations }) => {
  const getPill = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '🔴 CRITICAL ACTION';
      case 'HIGH':
        return '🔴 HIGH PRIORITY';
      case 'MEDIUM':
        return '🟠 RECOMMENDED';
      default:
        return '🟡 ADVISORY';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            What You Should Do (Protective Action Steps)
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Ranked by Risk Reduction Impact
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {recommendations.map((rec, i) => (
          <div
            key={rec.id || i}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex items-start gap-3"
          >
            <div className="text-xs font-mono font-bold shrink-0 mt-0.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {getPill(rec.severity)}
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {rec.text}
            </p>
          </div>
        ))}
      </div>

      {/* Official Cybercrime Helpline Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-200">Already Transferred Money or Shared Aadhaar/PAN?</div>
            <div className="text-[11px] text-slate-400">Immediate reporting within 2 hours enables banking freeze protocols.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all"
          >
            cybercrime.gov.in
          </a>
          <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            Helpline: 1930
          </span>
        </div>
      </div>
    </div>
  );
};

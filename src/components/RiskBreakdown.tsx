import React from 'react';
import { 
  CreditCard, 
  Globe, 
  UserCheck, 
  Briefcase, 
  Zap, 
  KeyRound, 
  FileText,
  Sliders
} from 'lucide-react';
import { RiskBreakdown as RiskBreakdownType } from '../types';

interface RiskBreakdownProps {
  breakdown: RiskBreakdownType;
}

interface RiskCategoryConfig {
  key: keyof RiskBreakdownType;
  label: string;
  weight: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CATEGORIES: RiskCategoryConfig[] = [
  {
    key: 'payment',
    label: 'Payment Risk',
    weight: 20,
    icon: CreditCard,
    description: 'Advance fees, equipment deposits, UPI & crypto solicitation',
  },
  {
    key: 'domain',
    label: 'URL / Domain Risk',
    weight: 20,
    icon: Globe,
    description: 'Typosquatting, non-HTTPS, suspicious TLDs & blacklists',
  },
  {
    key: 'job',
    label: 'Job / Rental Anomaly',
    weight: 20,
    icon: Briefcase,
    description: 'No-interview guarantee, unrealistic salary, absentee landlord',
  },
  {
    key: 'identity',
    label: 'Identity Mismatch Risk',
    weight: 15,
    icon: UserCheck,
    description: 'Corporate brand vs public webmail (@gmail) vs domain mismatch',
  },
  {
    key: 'social_engineering',
    label: 'Social Engineering',
    weight: 10,
    icon: Zap,
    description: 'Artificial deadlines, 30-min pressure, legal threat coercion',
  },
  {
    key: 'credential',
    label: 'Credential / Data Risk',
    weight: 10,
    icon: KeyRound,
    description: 'Harvesting passwords, OTP codes, Aadhaar or PAN card scans',
  },
  {
    key: 'document',
    label: 'Document Forensics',
    weight: 5,
    icon: FileText,
    description: 'Inconsistent letterhead, layout defects, contact discrepancy',
  },
];

export const RiskBreakdown: React.FC<RiskBreakdownProps> = ({ breakdown }) => {
  const getBarColor = (score: number) => {
    if (score >= 70) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    if (score >= 40) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    if (score >= 20) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getBadgeColor = (score: number) => {
    if (score >= 70) return 'text-red-400 bg-red-950/60 border-red-500/30';
    if (score >= 40) return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
    if (score >= 20) return 'text-yellow-400 bg-yellow-950/60 border-yellow-500/30';
    return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Deterministic Risk Breakdown
          </h3>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Normalized 0–100 Scale (Weighted Sum = 100%)
        </div>
      </div>

      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const score = breakdown[cat.key] || 0;
          const weightedPts = ((score * cat.weight) / 100).toFixed(1);
          const Icon = cat.icon;

          return (
            <div key={cat.key} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800/80 flex items-center justify-center text-cyan-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {cat.label}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Weight: {cat.weight}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 hidden sm:block">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-slate-400">
                      +{weightedPts} pts
                    </span>
                  </div>
                  <div className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${getBadgeColor(score)}`}>
                    {score} / 100
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getBarColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

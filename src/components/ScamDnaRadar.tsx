import React from 'react';
import { Dna, Fingerprint, Layers, ShieldCheck, AlertOctagon } from 'lucide-react';
import { ScamDnaScore } from '../types';

interface ScamDnaRadarProps {
  scamDna: ScamDnaScore;
}

const SCAM_TAXONOMY = [
  { name: 'Equipment Scam', desc: 'Pay for remote laptop / home office processing' },
  { name: 'Recruitment Fee Scam', desc: 'Mandatory registration / training / verification fee' },
  { name: 'Rental Deposit Scam', desc: 'Pre-inspection token / courier keys deposit' },
  { name: 'Fake HR Impersonation', desc: 'Unauthorized brand usage with consumer webmail' },
  { name: 'Credential Phishing', desc: 'Harvesting logins, OTP tokens, or personal identity' },
  { name: 'Social Engineering', desc: 'Manufactured artificial panic & coercive timeframes' },
];

export const ScamDnaRadar: React.FC<ScamDnaRadarProps> = ({ scamDna }) => {
  const dnaTraits = [
    { label: 'Payment Request', score: scamDna.paymentRisk },
    { label: 'Urgent Pressure', score: scamDna.urgencyRisk },
    { label: 'Domain Reputation', score: scamDna.domainRisk },
    { label: 'Identity Mismatch', score: scamDna.identityRisk },
    { label: 'Job Anomaly', score: scamDna.jobAnomalyRisk },
    { label: 'Credential Request', score: scamDna.credentialRisk },
  ];

  const getSeverityBadge = (score: number) => {
    if (score >= 70) return { label: 'CRITICAL', color: 'text-red-400 bg-red-950/60 border-red-500/40' };
    if (score >= 40) return { label: 'HIGH', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' };
    if (score >= 20) return { label: 'MEDIUM', color: 'text-yellow-400 bg-yellow-950/60 border-yellow-500/40' };
    return { label: 'LOW', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' };
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Dna className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Scam DNA & Threat Fingerprint
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Pattern Vector Match</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* DNA Multi-Axis Bars (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {dnaTraits.map((trait) => {
            const badge = getSeverityBadge(trait.score);
            return (
              <div key={trait.label} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">{trait.label}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-slate-400 text-[11px] w-8 text-right">{trait.score}%</span>
                  </div>
                </div>

                {/* Cyberpunk segmented meter */}
                <div className="grid grid-cols-10 gap-1 h-2">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const blockThreshold = (i + 1) * 10;
                    const isFilled = trait.score >= blockThreshold;
                    const fillColor =
                      trait.score >= 70
                        ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'
                        : trait.score >= 40
                        ? 'bg-amber-500'
                        : 'bg-cyan-500';

                    return (
                      <div
                        key={i}
                        className={`rounded-sm transition-all duration-500 ${
                          isFilled ? fillColor : 'bg-slate-800/70'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Closest Scam Classifications (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Closest Scam Clusters
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {SCAM_TAXONOMY.map((cluster) => {
                const isMatched = (scamDna.topCategories || []).some(
                  (c) => c.toLowerCase().includes(cluster.name.toLowerCase().split(' ')[0])
                );

                return (
                  <div
                    key={cluster.name}
                    className={`p-2 rounded-lg border text-xs transition-all ${
                      isMatched
                        ? 'border-red-500/40 bg-red-950/30 text-red-200'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-0.5">
                      <span>{cluster.name}</span>
                      {isMatched ? (
                        <span className="text-[10px] font-mono px-1 rounded bg-red-500/20 text-red-300">
                          Active Signal
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">Dormant</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{cluster.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Fingerprinted against 20,000+ verified fraud samples</span>
          </div>
        </div>
      </div>
    </div>
  );
};

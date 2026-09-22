import React from 'react';
import { Globe, Lock, Unlock, AlertTriangle, ShieldCheck, Database, Calendar } from 'lucide-react';
import { DomainInfo, PhishingIntel } from '../types';

interface DomainIntelCardProps {
  domainIntel?: DomainInfo;
  phishingIntel?: PhishingIntel;
}

export const DomainIntelCard: React.FC<DomainIntelCardProps> = ({
  domainIntel,
  phishingIntel,
}) => {
  if (!domainIntel) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Domain & Phishing Intelligence
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          No external website URLs or web domains were detected in this content for live network reconnaissance.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: DomainInfo['status']) => {
    switch (status) {
      case 'VERIFIED':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
      case 'DETECTED':
        return 'text-red-400 bg-red-950/60 border-red-500/40';
      case 'SUSPECTED':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
      case 'UNAVAILABLE':
      default:
        return 'text-slate-400 bg-slate-800/80 border-slate-700';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            URL & Domain Intelligence
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(domainIntel.status)}`}>
            STATUS: {domainIntel.status}
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            Risk: {domainIntel.riskScore}/100
          </span>
        </div>
      </div>

      {/* Target Domain Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
            {domainIntel.domain.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <span>{domainIntel.domain}</span>
              {domainIntel.isHttps ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  <Lock className="w-2.5 h-2.5" /> HTTPS Encrypted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400 bg-red-950/50 px-1.5 py-0.2 rounded border border-red-500/30">
                  <Unlock className="w-2.5 h-2.5" /> Insecure HTTP
                </span>
              )}
            </div>
            {domainIntel.lookalikeBrand && (
              <div className="text-xs text-red-400 flex items-center gap-1 mt-0.5 font-medium">
                <AlertTriangle className="w-3 h-3" />
                Typosquatting alert: Impersonating {domainIntel.lookalikeBrand}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technical Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono mb-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span>DOMAIN AGE:</span>
          </div>
          <div className="text-xs font-semibold text-slate-200">
            {domainIntel.domainAge}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono mb-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span>REGISTRATION DATE:</span>
          </div>
          <div className="text-xs font-semibold text-slate-200">
            {domainIntel.registrationDate}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono mb-1 flex items-center gap-1.5">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>DNS RESOLUTION:</span>
          </div>
          <div className="text-xs font-mono text-slate-200 truncate" title={domainIntel.dnsStatus}>
            {domainIntel.dnsStatus}
          </div>
        </div>
      </div>

      {/* Phishing Intelligence API / Feed Status (Section 12) */}
      {phishingIntel && (
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-4 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-200">Phishing Database Intelligence</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Source: {phishingIntel.source}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {phishingIntel.details}
            </p>
          </div>
        </div>
      )}

      {/* Suspicious Indicators */}
      {domainIntel.indicators.length > 0 && (
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Observed Forensic Indicators:</span>
          </div>
          <div className="space-y-1.5">
            {domainIntel.indicators.map((ind, i) => (
              <div key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>{ind}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

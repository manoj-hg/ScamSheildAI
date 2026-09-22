import React from 'react';
import { UserCheck, AlertOctagon, CheckCircle2, HelpCircle, Mail, Building, Link } from 'lucide-react';
import { CompanyVerification } from '../types';

interface IdentityVerifyCardProps {
  verification?: CompanyVerification;
}

export const IdentityVerifyCard: React.FC<IdentityVerifyCardProps> = ({ verification }) => {
  if (!verification) {
    return null;
  }

  const getStatusBadge = () => {
    switch (verification.status) {
      case 'VERIFIED':
        return {
          label: 'IDENTITY VERIFIED',
          style: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
          icon: CheckCircle2,
        };
      case 'MISMATCH':
        return {
          label: 'IDENTITY MISMATCH DETECTED',
          style: 'text-red-400 bg-red-950/60 border-red-500/40',
          icon: AlertOctagon,
        };
      case 'SUSPECTED':
        return {
          label: 'SUSPICIOUS CONTACT CHANNELS',
          style: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
          icon: AlertOctagon,
        };
      case 'UNAVAILABLE':
      default:
        return {
          label: 'UNVERIFIED INDEPENDENT ENTITY',
          style: 'text-slate-400 bg-slate-800 border-slate-700',
          icon: HelpCircle,
        };
    }
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Company & Recruiter Identity Verification
          </h3>
        </div>
        <div className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border flex items-center gap-1.5 ${status.style}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{status.label}</span>
        </div>
      </div>

      {/* Cross-Check Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono mb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span>CLAIMED COMPANY:</span>
          </div>
          <div className="text-xs font-bold text-white truncate" title={verification.claimedCompany}>
            {verification.claimedCompany || 'None specified'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono mb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span>OFFICIAL ENTERPRISE DOMAIN:</span>
          </div>
          <div className="text-xs font-mono font-semibold text-emerald-400 truncate">
            {verification.officialDomain}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono mb-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>RECRUITER EMAIL DOMAIN:</span>
          </div>
          <div className="text-xs font-mono font-semibold text-slate-200 truncate">
            {verification.recruiterEmailDomain}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono mb-1 flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-purple-400" />
            <span>OFFER LINK DOMAIN:</span>
          </div>
          <div className="text-xs font-mono font-semibold text-slate-200 truncate">
            {verification.offerUrlDomain}
          </div>
        </div>
      </div>

      {/* Forensic Findings Narrative */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
          <span>Forensic Observation:</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {verification.details || 'Company identity could not be independently verified.'}
        </p>
      </div>
    </div>
  );
};

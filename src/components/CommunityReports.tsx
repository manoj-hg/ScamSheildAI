import React, { useState } from 'react';
import { Users, ShieldAlert, Flag, Plus, Search, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { CommunityReport } from '../types';
import { submitCommunityReport } from '../services/api';

interface CommunityReportsProps {
  reports: CommunityReport[];
  onReportSubmitted: (newReport: CommunityReport) => void;
}

export const CommunityReports: React.FC<CommunityReportsProps> = ({
  reports,
  onReportSubmitted,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [target, setTarget] = useState('');
  const [targetType, setTargetType] = useState('DOMAIN');
  const [scamType, setScamType] = useState('Equipment Purchase Scam');
  const [evidenceSnippet, setEvidenceSnippet] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredReports = reports.filter((r) =>
    r.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.scamType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.evidenceSnippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) return;
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await submitCommunityReport({
        target,
        targetType,
        scamType,
        threatLevel: 'HIGH',
        evidenceSnippet: evidenceSnippet || 'User reported suspicious scam activity',
      });
      onReportSubmitted(res);
      setStatusMessage('Report submitted successfully to the global community blacklist.');
      setTarget('');
      setEvidenceSnippet('');
      setTimeout(() => {
        setShowSubmitModal(false);
        setStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Feed Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Community Threat Intelligence Feed
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time crowdsourced reports of fraudulent recruitment domains, fake HR recruiters, and rental scams.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Report a Scam</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by domain, email handle, phone number, or scam pattern..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400 font-sans"
        />
      </div>

      {/* Reports Table / Cards */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-all backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-semibold uppercase">
                  {report.targetType}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                  report.threatLevel === 'HIGH' ? 'text-red-400 bg-red-950/40 border-red-500/30' : 'text-amber-400 bg-amber-950/40 border-amber-500/30'
                }`}>
                  {report.threatLevel} THREAT
                </span>
                <span className="text-xs text-slate-400 font-medium">• {report.scamType}</span>
                {report.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Confirmed
                  </span>
                )}
              </div>

              <div className="text-sm sm:text-base font-mono font-bold text-white mb-1 break-all">
                {report.target}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {report.evidenceSnippet}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 md:text-right">
              <div>
                <div className="text-xs font-mono font-bold text-slate-200">
                  {report.reportCount} Reports
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {new Date(report.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Report Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Report Malicious Recruiter or URL
                </h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {statusMessage && (
              <div className="p-3 mb-4 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs">
                {statusMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target (Domain, Recruiter Email, Phone or UPI ID)
                </label>
                <input
                  type="text"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. tcs-careers-fake.xyz or recruiter@gmail.com"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-100 placeholder-slate-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Type</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-base sm:text-xs text-slate-200 outline-none"
                  >
                    <option value="DOMAIN">Website / Domain</option>
                    <option value="EMAIL">Recruiter Email</option>
                    <option value="PHONE">Phone / WhatsApp</option>
                    <option value="RENTAL">Rental Listing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Scam Type</label>
                  <select
                    value={scamType}
                    onChange={(e) => setScamType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-base sm:text-xs text-slate-200 outline-none"
                  >
                    <option value="Equipment Purchase Scam">Equipment Scam</option>
                    <option value="Recruitment Fee Scam">Recruitment Fee</option>
                    <option value="Rental Deposit Scam">Rental Deposit</option>
                    <option value="Credential Phishing">Credential Phishing</option>
                    <option value="Fake HR Impersonation">HR Impersonation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Evidence Snippet / Details
                </label>
                <textarea
                  rows={3}
                  value={evidenceSnippet}
                  onChange={(e) => setEvidenceSnippet(e.target.value)}
                  placeholder="Describe what occurred (e.g. demanded ₹3,000 for laptop delivery or sent fake appointment letter)..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-base sm:text-xs text-slate-100 placeholder-slate-500 outline-none resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium min-h-[42px] touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50 min-h-[42px] touch-manipulation"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to Community Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

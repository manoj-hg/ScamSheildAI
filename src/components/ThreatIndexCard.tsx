import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Share2, 
  MessageSquare, 
  CheckCircle,
  FileCheck,
  Download,
  FileDown,
  Loader2
} from 'lucide-react';
import { ScanResult } from '../types';
import { downloadScanReportPdf } from '../utils/pdfGenerator';

interface ThreatIndexCardProps {
  scanResult: ScanResult;
  onOpenAssistant: () => void;
  onOpenShareReport: () => void;
}

export const ThreatIndexCard: React.FC<ThreatIndexCardProps> = ({
  scanResult,
  onOpenAssistant,
  onOpenShareReport,
}) => {
  const { threat_score, risk_level, scam_types = [], red_flags = [], timestamp, scan_id } = scanResult;
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await downloadScanReportPdf(scanResult);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getRiskColors = () => {
    switch (risk_level) {
      case 'HIGH':
        return {
          text: 'text-red-400',
          bg: 'bg-red-950/40',
          border: 'border-red-500/50',
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.25)]',
          stroke: '#ef4444',
          description: 'CRITICAL RISK — Multiple high-confidence fraud vectors detected. Do not transfer funds or share credentials.',
        };
      case 'SUSPICIOUS':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-950/40',
          border: 'border-amber-500/50',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
          stroke: '#f59e0b',
          description: 'ELEVATED SUSPICION — Contains abnormal recruitment/rental patterns and unverified identity markers.',
        };
      case 'CAUTION':
        return {
          text: 'text-yellow-400',
          bg: 'bg-yellow-950/40',
          border: 'border-yellow-500/50',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          glow: 'shadow-[0_0_25px_rgba(234,179,8,0.2)]',
          stroke: '#eab308',
          description: 'PROCEED WITH CAUTION — Unconfirmed contact information or non-standard application flow observed.',
        };
      case 'LOW':
      default:
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-500/50',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
          stroke: '#10b981',
          description: 'MINIMAL RISK DETECTED — Aligns with standard corporate communications. No active scam patterns detected.',
        };
    }
  };

  const colors = getRiskColors();

  // Circular gauge calculation (circumference: 2 * Math.PI * r = 2 * Math.PI * 45 = ~282.74)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (threat_score / 100) * circumference;

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} ${colors.glow} p-4 sm:p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden transition-all`}>
      {/* Background ambient corner flare */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${risk_level === 'HIGH' ? 'bg-red-500' : risk_level === 'LOW' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

      {/* Top Header metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 sm:pb-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            INCIDENT REPORT ID:
          </span>
          <span className="text-xs font-mono font-semibold text-slate-200">
            {scan_id}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400 flex-wrap">
          <span>{new Date(timestamp).toLocaleString()}</span>
          <span>•</span>
          <span className="font-mono text-cyan-400 font-semibold">{scanResult.scan_type}</span>
          <span>•</span>
          <span className="font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">
            {scanResult.trained_model || 'ScamShield-LoRA-Production-v2.6'}
          </span>
        </div>
      </div>

      {/* Core Score & Verdict Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
        {/* Score Dial (4 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center mb-3">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-800/80"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress Bar */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={colors.stroke}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${colors.text}`}>
                {threat_score}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                / 100
              </span>
            </div>
          </div>

          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            DETERMINISTIC SCAM THREAT INDEX
          </span>
          <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider border ${colors.badge}`}>
            {risk_level} RISK
          </div>
        </div>

        {/* Verdict & Summary (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
              {scam_types.map((type: string) => (
                <span
                  key={type}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/90 text-slate-200 border border-slate-700/80 font-mono"
                >
                  {type}
                </span>
              ))}
            </div>

            <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 leading-tight">
              {risk_level === 'HIGH' && 'Critical Scam Threat Confirmed'}
              {risk_level === 'SUSPICIOUS' && 'Suspicious Offer with Elevated Risk'}
              {risk_level === 'CAUTION' && 'Caution Advised: Unverified Attributes'}
              {risk_level === 'LOW' && 'Verified Corporate Offer Standards'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              {colors.description}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 pt-4 border-t border-slate-800/60">
            <button
              id="btn-download-pdf-report"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold text-xs shadow-md transition-all min-h-[42px] touch-manipulation disabled:opacity-75 disabled:cursor-not-allowed"
              title="Download formal cyber forensic PDF documentation"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 text-slate-950 animate-spin shrink-0" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>PDF Report Downloaded!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>Download Report as PDF</span>
                </>
              )}
            </button>

            <button
              id="btn-open-assistant"
              onClick={onOpenAssistant}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold transition-all shadow-sm min-h-[42px] touch-manipulation"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Ask AI Security Assistant</span>
            </button>

            <button
              id="btn-open-report"
              onClick={onOpenShareReport}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all min-h-[42px] touch-manipulation"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Share / Blacklist</span>
            </button>
          </div>
        </div>
      </div>

      {/* WHY WE FLAGGED THIS (Section 37) */}
      {red_flags.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Why We Flagged This</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {red_flags.slice(0, 4).map((flag) => (
              <div
                key={flag.id}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <span className="shrink-0 mt-0.5">
                  {flag.severity === 'CRITICAL' ? '🔴' : flag.severity === 'HIGH' ? '🔴' : flag.severity === 'MEDIUM' ? '🟠' : '🟡'}
                </span>
                <div>
                  <div className="font-semibold text-slate-200">{flag.label}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{flag.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

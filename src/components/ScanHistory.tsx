import React, { useState } from 'react';
import { History, Search, Trash2, ArrowRight, ShieldAlert, Filter, Calendar } from 'lucide-react';
import { ScanResult, RiskLevel } from '../types';

interface ScanHistoryProps {
  scans: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onDeleteScan: (id: string) => Promise<void>;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  scans,
  onSelectScan,
  onDeleteScan,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredScans = scans.filter((scan) => {
    const matchesFilter = filterLevel === 'ALL' || scan.risk_level === filterLevel;
    const matchesSearch =
      scan.scan_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scan.extracted_entities.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scan.url || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.scam_types.join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'HIGH':
        return 'text-red-400 bg-red-950/40 border-red-500/30';
      case 'SUSPICIOUS':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 'CAUTION':
        return 'text-yellow-400 bg-yellow-950/40 border-yellow-500/30';
      case 'LOW':
      default:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Audit Logs & Scan History
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search and reopen previous threat scans, review forensic telemetry, or purge records.
          </p>
        </div>
      </div>

      {/* Controls: Search + Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, company name, URL, or scam type..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'HIGH', 'SUSPICIOUS', 'CAUTION', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                filterLevel === lvl
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {filteredScans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-medium">No previous scans found</p>
          <p className="text-xs text-slate-500 mt-1">
            Run a security analysis using the Inspector to log forensic investigations here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan) => (
            <div
              key={scan.scan_id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-all backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex-1 cursor-pointer" onClick={() => onSelectScan(scan)}>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                    {scan.input_type}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${getRiskBadge(scan.risk_level)}`}>
                    {scan.risk_level} RISK
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-semibold">
                    Score: {scan.threat_score}/100
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {new Date(scan.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {scan.extracted_entities.company_name
                    ? `${scan.extracted_entities.company_name} — ${scan.extracted_entities.job_title || 'Offer Letter'}`
                    : scan.url || `Scan Record #${scan.scan_id}`}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {scan.scam_types.map((st) => (
                    <span key={st} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {st}
                    </span>
                  ))}
                  {scan.red_flags.length > 0 && (
                    <span className="text-[10px] font-mono text-red-400 ml-1">
                      {scan.red_flags.length} Red Flags
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-0 border-slate-800/60">
                <button
                  onClick={() => onSelectScan(scan)}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all min-h-[40px] touch-manipulation"
                >
                  <span>Reopen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteScan(scan.scan_id);
                  }}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation"
                  title="Purge record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

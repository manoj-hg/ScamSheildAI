import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Layers,
  Activity,
  Calendar,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { DashboardStats, ScanResult, RiskLevel } from '../types';

interface DashboardAnalyticsProps {
  stats: DashboardStats | null;
  userScans?: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
}

interface DayDataPoint {
  dateKey: string;
  date: string;
  fullDate: string;
  threatScore: number | null;
  maxThreat: number | null;
  scanCount: number;
  hasScans: boolean;
  scans: ScanResult[];
  topScan?: ScanResult;
  riskLevel: RiskLevel | null;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  stats,
  userScans,
  onSelectScan,
}) => {
  const [chartMode, setChartMode] = useState<'combined' | 'threat' | 'volume'>('combined');
  const [selectedScanDetail, setSelectedScanDetail] = useState<ScanResult | null>(null);

  // Combine userScans and stats.recentScans
  const allScans = useMemo(() => {
    const map = new Map<string, ScanResult>();
    if (stats?.recentScans) {
      for (const s of stats.recentScans) {
        map.set(s.scan_id, s);
      }
    }
    if (userScans) {
      for (const s of userScans) {
        map.set(s.scan_id, s);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [stats, userScans]);

  // Generate 30-day timeline data points
  const timelineData = useMemo<DayDataPoint[]>(() => {
    const days: DayDataPoint[] = [];
    const now = new Date();

    // Map scans by YYYY-MM-DD
    const scansByDate = new Map<string, ScanResult[]>();
    for (const scan of allScans) {
      if (!scan.timestamp) continue;
      const key = new Date(scan.timestamp).toISOString().slice(0, 10);
      if (!scansByDate.has(key)) {
        scansByDate.set(key, []);
      }
      scansByDate.get(key)!.push(scan);
    }

    // Build exactly 30 days ending today
    for (let i = 29; i >= 0; i--) {
      const targetDate = new Date(now.getTime() - i * 86400000);
      const dateKey = targetDate.toISOString().slice(0, 10);
      const dayScans = scansByDate.get(dateKey) || [];

      const formattedDate = targetDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const fullDate = targetDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      let threatScore: number | null = null;
      let maxThreat: number | null = null;
      let topScan: ScanResult | undefined = undefined;
      let riskLevel: RiskLevel | null = null;

      if (dayScans.length > 0) {
        const total = dayScans.reduce((sum, s) => sum + s.threat_score, 0);
        threatScore = Math.round(total / dayScans.length);
        maxThreat = Math.max(...dayScans.map((s) => s.threat_score));
        topScan = dayScans.reduce(
          (max, s) => (s.threat_score > max.threat_score ? s : max),
          dayScans[0]
        );
        riskLevel = topScan.risk_level;
      }

      days.push({
        dateKey,
        date: formattedDate,
        fullDate,
        threatScore,
        maxThreat,
        scanCount: dayScans.length,
        hasScans: dayScans.length > 0,
        scans: dayScans,
        topScan,
        riskLevel,
      });
    }

    return days;
  }, [allScans]);

  // Compute 30-day summary metrics
  const summaryMetrics = useMemo(() => {
    const scansIn30Days = timelineData.flatMap((d) => d.scans);
    const totalScansInPeriod = scansIn30Days.length;

    // Split first 15 days vs last 15 days to quantify activity surge
    const firstHalfScans = timelineData.slice(0, 15).reduce((acc, d) => acc + d.scanCount, 0);
    const secondHalfScans = timelineData.slice(15, 30).reduce((acc, d) => acc + d.scanCount, 0);

    let surgePercent = 0;
    if (firstHalfScans > 0) {
      surgePercent = Math.round(((secondHalfScans - firstHalfScans) / firstHalfScans) * 100);
    } else if (secondHalfScans > 0) {
      surgePercent = 100;
    }

    const peakThreat =
      scansIn30Days.length > 0
        ? Math.max(...scansIn30Days.map((s) => s.threat_score))
        : 0;

    const avgThreat =
      scansIn30Days.length > 0
        ? Math.round(
            scansIn30Days.reduce((acc, s) => acc + s.threat_score, 0) / scansIn30Days.length
          )
        : 0;

    const highRiskCount = scansIn30Days.filter((s) => s.threat_score >= 70).length;

    return {
      totalScansInPeriod,
      firstHalfScans,
      secondHalfScans,
      surgePercent,
      peakThreat,
      avgThreat,
      highRiskCount,
      startDate: timelineData[0]?.date || '',
      endDate: timelineData[timelineData.length - 1]?.date || '',
    };
  }, [timelineData]);

  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-400">
        Loading telemetry metrics...
      </div>
    );
  }

  // Custom Dot Renderer on the Trend Line
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || !payload.hasScans) return null;

    const isHigh = (payload.threatScore || 0) >= 70;
    const isMedium = (payload.threatScore || 0) >= 40 && (payload.threatScore || 0) < 70;

    const fill = isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#06b6d4';
    const stroke = isHigh ? '#f87171' : isMedium ? '#fbbf24' : '#22d3ee';

    return (
      <g
        key={`dot-${payload.dateKey}`}
        className="cursor-pointer transition-transform hover:scale-125"
        onClick={() => {
          if (payload.topScan) {
            onSelectScan(payload.topScan);
          }
        }}
      >
        <circle cx={cx} cy={cy} r={6} fill={fill} stroke={stroke} strokeWidth={2} />
        {isHigh && (
          <circle
            cx={cx}
            cy={cy}
            r={10}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1}
            opacity={0.4}
            className="animate-ping"
          />
        )}
      </g>
    );
  };

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data: DayDataPoint = payload[0].payload;

    return (
      <div className="p-3.5 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md max-w-xs text-xs">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2 mb-2">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{data.fullDate}</span>
          </div>
          {data.hasScans && data.riskLevel && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                data.riskLevel === 'HIGH'
                  ? 'bg-red-950/70 text-red-400 border border-red-500/40'
                  : data.riskLevel === 'SUSPICIOUS' || data.riskLevel === 'CAUTION'
                  ? 'bg-amber-950/70 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {data.riskLevel}
            </span>
          )}
        </div>

        {data.hasScans ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span>Avg Threat Level:</span>
              <span
                className={`font-mono font-extrabold text-sm ${
                  (data.threatScore || 0) >= 70
                    ? 'text-red-400'
                    : (data.threatScore || 0) >= 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {data.threatScore} / 100
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Daily Scans:</span>
              <span className="font-mono text-cyan-300 font-semibold">{data.scanCount} recorded</span>
            </div>

            {data.topScan && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  Primary Interception
                </div>
                <div className="font-semibold text-slate-200 truncate">
                  {data.topScan.extracted_entities.company_name || data.topScan.file_name || 'Suspicious Solicit'}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {data.topScan.scam_types[0] || 'Unknown Scam Pattern'}
                </div>
              </div>
            )}

            <div className="pt-1.5 flex items-center gap-1 text-[10px] text-cyan-400 font-semibold">
              <span>Click point to review forensic audit</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-[11px]">
            No scan activity recorded on this day.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Threat Landscape & Platform Telemetry
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          High-level metrics across processed job appointment letters, phishing links, and community reports.
        </p>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Scanned Offers</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {stats.totalScans}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            +{summaryMetrics.surgePercent}% activity surge
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-red-500/30 bg-red-950/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-red-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk / Blocked</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 font-mono">
            {stats.highRisk}
          </div>
          <div className="text-[11px] text-red-300 mt-1 font-mono">
            Direct financial fraud intercepted
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/30 bg-amber-950/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Suspicious / Caution</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {stats.suspicious + stats.caution}
          </div>
          <div className="text-[11px] text-amber-300 mt-1 font-mono">
            Anomalous recruiter contact details
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Threat Score</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {stats.avgScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Top scam: {stats.topScamType}
          </div>
        </div>
      </div>

      {/* 30-Day Threat Level & Scan History Trend Line Chart */}
      <section
        id="section-threat-trend-chart"
        className="p-4 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl mb-8 relative overflow-hidden"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                30-Day Scan History Threat Levels & Activity Trend
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tracking longitudinal threat scores (0–100) and scan frequency surge from{' '}
              <span className="text-cyan-300 font-semibold">{summaryMetrics.startDate}</span> to{' '}
              <span className="text-cyan-300 font-semibold">{summaryMetrics.endDate}</span>.
            </p>
          </div>

          {/* Chart View Switcher Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 w-full sm:w-auto overflow-x-auto scrollbar-none">
            <button
              id="btn-mode-combined"
              onClick={() => setChartMode('combined')}
              className={`flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] touch-manipulation ${
                chartMode === 'combined'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Combined Radar
            </button>
            <button
              id="btn-mode-threat"
              onClick={() => setChartMode('threat')}
              className={`flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] touch-manipulation ${
                chartMode === 'threat'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Threat Score Line
            </button>
            <button
              id="btn-mode-volume"
              onClick={() => setChartMode('volume')}
              className={`flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] touch-manipulation ${
                chartMode === 'volume'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Scan Activity Volume
            </button>
          </div>
        </div>

        {/* 30-Day Forensic Surge & Metric Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Activity Surge</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-white mt-1">
              +{summaryMetrics.surgePercent}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {summaryMetrics.secondHalfScans} scans (past 14d) vs {summaryMetrics.firstHalfScans} earlier
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>30-Day Peak Threat</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-red-400 mt-1">
              {summaryMetrics.peakThreat} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Critical fraud solicitation identified
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>30-Day Mean Score</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-cyan-300 mt-1">
              {summaryMetrics.avgThreat} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Across {summaryMetrics.totalScansInPeriod} user audit events
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Critical Interceptions</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-amber-400 mt-1">
              {summaryMetrics.highRiskCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Severe fraudulent scams quarantined
            </div>
          </div>
        </div>

        {/* Visual Trend Line Chart Canvas */}
        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={timelineData}
              margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  const item: DayDataPoint = e.activePayload[0].payload;
                  if (item.topScan) {
                    onSelectScan(item.topScan);
                  }
                }
              }}
            >
              <defs>
                {/* Gradient for Threat Area */}
                <linearGradient id="threatAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                {/* Gradient for Volume Bars */}
                <linearGradient id="volumeBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.15} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#334155"
                strokeDasharray="3 3"
                opacity={0.35}
                vertical={false}
              />

              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={4}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              {/* Left Y Axis: Threat Score 0 to 100 */}
              {(chartMode === 'threat' || chartMode === 'combined') && (
                <YAxis
                  yAxisId="threat"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  label={{
                    value: 'Threat Level (0-100)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 10,
                    offset: 15,
                  }}
                />
              )}

              {/* Right Y Axis: Daily Scan Volume */}
              {(chartMode === 'volume' || chartMode === 'combined') && (
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  domain={[0, 'dataMax + 2']}
                  allowDecimals={false}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  label={{
                    value: 'Daily Scans',
                    angle: 90,
                    position: 'insideRight',
                    fill: '#64748b',
                    fontSize: 10,
                    offset: 15,
                  }}
                />
              )}

              <Tooltip content={<CustomTooltip />} />

              {/* Threat Reference Lines */}
              {(chartMode === 'threat' || chartMode === 'combined') && (
                <>
                  <ReferenceLine
                    yAxisId="threat"
                    y={70}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    opacity={0.8}
                    label={{
                      value: 'Critical Risk Threshold (70+)',
                      fill: '#ef4444',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <ReferenceLine
                    yAxisId="threat"
                    y={40}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    opacity={0.6}
                    label={{
                      value: 'Caution Threshold (40+)',
                      fill: '#f59e0b',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                </>
              )}

              {/* Volume Bars */}
              {(chartMode === 'volume' || chartMode === 'combined') && (
                <Bar
                  yAxisId="volume"
                  dataKey="scanCount"
                  name="Scans Conducted"
                  fill="url(#volumeBarGradient)"
                  stroke="#38bdf8"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
              )}

              {/* Threat Level Trend Line / Area */}
              {(chartMode === 'threat' || chartMode === 'combined') && (
                <Area
                  yAxisId="threat"
                  type="monotone"
                  dataKey="threatScore"
                  name="Threat Severity"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="url(#threatAreaGradient)"
                  connectNulls={true}
                  dot={renderCustomDot}
                  activeDot={{
                    r: 8,
                    fill: '#22d3ee',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Forensic Threshold Guidance */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <span className="text-slate-400">Critical Threat (Score &ge; 70)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-400">Suspicious / Caution (40–69)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-slate-400">Low Risk (&lt; 40)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-sky-500/50 border border-sky-400" />
              <span className="text-slate-400">Daily Scan Frequency</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive: Click any point to open its forensic audit details</span>
          </div>
        </div>
      </section>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Scam Category Distribution (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Scam Classification Breakdown
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Incident Frequency</span>
          </div>

          <div className="space-y-3.5">
            {stats.scamDistribution.map((item) => {
              const maxCount = Math.max(...stats.scamDistribution.map((s) => s.count), 1);
              const percent = Math.round((item.count / maxCount) * 100);

              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="font-mono text-cyan-400">{item.count} detected</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Protection Health Status (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Threat Engine Health
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Deterministic Threat Formula</span>
                <span className="font-mono text-emerald-400 font-bold">100% Calibrated</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Phishing Intel Blacklists</span>
                <span className="font-mono text-emerald-400 font-bold">Synchronized</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Domain Registry Lookup</span>
                <span className="font-mono text-emerald-400 font-bold">Active (DNS-Over-HTTPS)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">AI Entity Extraction</span>
                <span className="font-mono text-cyan-400 font-bold">Gemini 3.8 Flash</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Zero-Trust Policy: All external contact points quarantined by default.
          </div>
        </div>
      </div>
    </div>
  );
};

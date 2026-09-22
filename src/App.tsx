import React, { useState, useEffect, useRef } from 'react';
import { 
  analyzeText, 
  analyzeUrl, 
  analyzeDocument, 
  analyzeImage, 
  getAllScans, 
  deleteScan, 
  getCommunityReports, 
  getDashboardStats 
} from './services/api';
import { ScanResult, ScanType, CommunityReport, DashboardStats } from './types';
import { DEMO_PRESETS, DemoPreset } from './data/demoPresets';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Scanner } from './components/Scanner';
import { ThreatIndexCard } from './components/ThreatIndexCard';
import { RiskBreakdown } from './components/RiskBreakdown';
import { ScamDnaRadar } from './components/ScamDnaRadar';
import { RedFlagHighlighter } from './components/RedFlagHighlighter';
import { EvidenceList } from './components/EvidenceList';
import { DomainIntelCard } from './components/DomainIntelCard';
import { IdentityVerifyCard } from './components/IdentityVerifyCard';
import { RecommendationsCard } from './components/RecommendationsCard';
import { VerificationChecklist } from './components/VerificationChecklist';
import { HumanizedAndVisualForensicsCard } from './components/HumanizedAndVisualForensicsCard';
import { ScanHistory } from './components/ScanHistory';
import { CommunityReports } from './components/CommunityReports';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { AiSecurityAssistant } from './components/AiSecurityAssistant';
import { ProtectorVoiceAgent } from './components/ProtectorVoiceAgent';
import { ShareReportModal } from './components/ShareReportModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MessageSquare, ArrowUp } from 'lucide-react';
import { useAuth } from './context/AuthContext.tsx';

export default function App() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'scanner' | 'history' | 'community' | 'analytics'>('scanner');
  const [activeScanResult, setActiveScanResult] = useState<ScanResult | null>(null);
  const [savedScans, setSavedScans] = useState<ScanResult[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<DemoPreset | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isVoiceAgentOpen, setIsVoiceAgentOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Initial data loading and re-fetch on auth state changes
  useEffect(() => {
    refreshData();
  }, [user]);

  const refreshData = async () => {
    try {
      const [scans, reports, stats] = await Promise.all([
        getAllScans().catch(() => []),
        getCommunityReports().catch(() => []),
        getDashboardStats().catch(() => null),
      ]);
      setSavedScans(scans);
      setCommunityReports(reports);
      setDashboardStats(stats);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const handleScanCompleted = (result: ScanResult) => {
    setActiveScanResult(result);
    setSavedScans((prev) => [result, ...prev.filter((s) => s.scan_id !== result.scan_id)]);
    refreshData();
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleAnalyzeText = async (text: string, scanType: ScanType) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeText(text, scanType);
      handleScanCompleted(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeUrl = async (url: string, scanType: ScanType) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeUrl(url, scanType);
      handleScanCompleted(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeDocument = async (
    fileData: string,
    fileName: string,
    mimeType: string,
    scanType: ScanType
  ) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeDocument(fileData, fileName, mimeType, scanType);
      handleScanCompleted(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeImage = async (
    imageData: string,
    fileName: string,
    mimeType: string,
    scanType: ScanType
  ) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(imageData, fileName, mimeType, scanType);
      handleScanCompleted(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistoricalScan = (scan: ScanResult) => {
    setActiveScanResult(scan);
    setCurrentTab('scanner');
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleDeleteHistoricalScan = async (id: string) => {
    await deleteScan(id);
    setSavedScans((prev) => prev.filter((s) => s.scan_id !== id));
    if (activeScanResult?.scan_id === id) {
      setActiveScanResult(null);
    }
    refreshData();
  };

  const handleReportSubmitted = (newReport: CommunityReport) => {
    setCommunityReports((prev) => [newReport, ...prev]);
    refreshData();
  };

  const handleOpenQuickDemo = () => {
    setSelectedPreset(DEMO_PRESETS[0]);
    setCurrentTab('scanner');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 font-sans antialiased">
      {/* Cybersecurity subtle grid overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenQuickDemo={handleOpenQuickDemo}
          onOpenVoiceAgent={() => setIsVoiceAgentOpen(true)}
          savedScansCount={savedScans.length}
        />

        {/* Tab 1: Primary Scanner / Inspector View */}
        {currentTab === 'scanner' && (
          <main className="flex-1 pb-16">
            <Hero
              onAnalyzeClick={() => {
                const scannerEl = document.getElementById('scanner-container');
                scannerEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewScansClick={() => setCurrentTab('history')}
              onOpenVoiceAgent={() => setIsVoiceAgentOpen(true)}
            />

            <Scanner
              onAnalyzeText={handleAnalyzeText}
              onAnalyzeUrl={handleAnalyzeUrl}
              onAnalyzeDocument={handleAnalyzeDocument}
              onAnalyzeImage={handleAnalyzeImage}
              isAnalyzing={isAnalyzing}
              selectedPreset={selectedPreset}
              onClearPreset={() => setSelectedPreset(null)}
            />

            {/* Results Inspection Section */}
            {activeScanResult && (
              <section ref={resultsRef} className="max-w-5xl mx-auto px-4 space-y-6 pt-4">
                {/* 1. Scam Threat Index & Verdict */}
                <ThreatIndexCard
                  scanResult={activeScanResult}
                  onOpenAssistant={() => setIsAssistantOpen(true)}
                  onOpenShareReport={() => setIsShareModalOpen(true)}
                />

                {/* 1.5 Next-Gen MVP: AI-Humanized Evasion & ResNet-50 Visual Document Forensics */}
                <HumanizedAndVisualForensicsCard
                  humanized={activeScanResult.humanized_evasion}
                  visualForensics={activeScanResult.visual_forensics}
                  originalContent={activeScanResult.original_content}
                />

                {/* 2. Side-by-Side: Risk Breakdown & Scam DNA Radar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RiskBreakdown breakdown={activeScanResult.risk_breakdown} />
                  <ScamDnaRadar scamDna={activeScanResult.scam_dna} />
                </div>

                {/* 3. Red Flag Annotations on original content */}
                <RedFlagHighlighter
                  content={activeScanResult.original_content}
                  redFlags={activeScanResult.red_flags}
                />

                {/* 4. Structured Forensic Evidence */}
                <EvidenceList evidence={activeScanResult.evidence} />

                {/* 5. Domain Intel & Identity Verification */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DomainIntelCard
                    domainIntel={activeScanResult.domain_intel}
                    phishingIntel={activeScanResult.phishing_intel}
                  />
                  <IdentityVerifyCard
                    verification={activeScanResult.company_verification}
                  />
                </div>

                {/* 6. What You Should Do */}
                <RecommendationsCard
                  recommendations={activeScanResult.recommendations}
                />

                {/* 7. Interactive Verification Checklist */}
                <VerificationChecklist
                  key={activeScanResult.scan_id}
                  initialItems={activeScanResult.verification_checklist}
                />
              </section>
            )}
          </main>
        )}

        {/* Tab 2: Scan History */}
        {currentTab === 'history' && (
          <main className="flex-1">
            <ScanHistory
              scans={savedScans}
              onSelectScan={handleSelectHistoricalScan}
              onDeleteScan={handleDeleteHistoricalScan}
            />
          </main>
        )}

        {/* Tab 3: Community Threat Feed */}
        {currentTab === 'community' && (
          <main className="flex-1">
            <CommunityReports
              reports={communityReports}
              onReportSubmitted={handleReportSubmitted}
            />
          </main>
        )}

        {/* Tab 4: Platform Telemetry Dashboard */}
        {currentTab === 'analytics' && (
          <main className="flex-1">
            <DashboardAnalytics
              stats={dashboardStats}
              userScans={savedScans}
              onSelectScan={handleSelectHistoricalScan}
            />
          </main>
        )}

        {/* Floating AI Security Assistant Trigger */}
        <button
          id="btn-floating-assistant"
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]"
          title="Open AI Security Assistant"
        >
          <MessageSquare className="w-4 h-4 text-slate-950 shrink-0" />
          <span className="hidden xs:inline sm:inline">Ask AI</span>
          <span className="hidden sm:inline">Advisor</span>
        </button>

        {/* Voice Agent "Protector" (Wake-word enabled: responds to "Protector") */}
        <ProtectorVoiceAgent
          activeScanResult={activeScanResult}
          onOpenQuickDemo={handleOpenQuickDemo}
          onNavigateTab={setCurrentTab}
          isGloballyOpen={isVoiceAgentOpen}
          onCloseGlobal={() => setIsVoiceAgentOpen(false)}
        />

        {/* Mobile Persistent Bottom Navigation Bar */}
        <MobileBottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenVoiceAgent={() => setIsVoiceAgentOpen(true)}
          savedScansCount={savedScans.length}
        />

        {/* Modals */}
        <AiSecurityAssistant
          scanResult={activeScanResult}
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
        />

        {activeScanResult && (
          <ShareReportModal
            scanResult={activeScanResult}
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />
        )}

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">ScamShield AI Platform</span>
              <span>•</span>
              <span>Explainable Cyber Threat Intelligence</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="hover:text-cyan-400">
                National Cyber Crime Portal (1930)
              </a>
              <span>•</span>
              <span>Zero-Trust Verification</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

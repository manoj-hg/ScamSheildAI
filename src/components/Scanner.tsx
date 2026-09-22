import React, { useState, useRef, useEffect } from 'react';
import { 
  Briefcase, 
  Home, 
  FileText, 
  Link2, 
  FileUp, 
  Image as ImageIcon, 
  ShieldAlert, 
  Sparkles, 
  Loader2, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { ScanType, InputType } from '../types';
import { DEMO_PRESETS, DemoPreset } from '../data/demoPresets';

interface ScannerProps {
  onAnalyzeText: (text: string, scanType: ScanType) => Promise<void>;
  onAnalyzeUrl: (url: string, scanType: ScanType) => Promise<void>;
  onAnalyzeDocument: (fileData: string, fileName: string, mimeType: string, scanType: ScanType) => Promise<void>;
  onAnalyzeImage: (imageData: string, fileName: string, mimeType: string, scanType: ScanType) => Promise<void>;
  isAnalyzing: boolean;
  selectedPreset: DemoPreset | null;
  onClearPreset: () => void;
}

const ANALYSIS_STAGES = [
  "Extracting content & metadata...",
  "Analyzing language & semantics...",
  "Checking recruitment scam patterns...",
  "Analyzing URL & domain reputation...",
  "Verifying enterprise identity...",
  "Calculating deterministic threat score..."
];

export const Scanner: React.FC<ScannerProps> = ({
  onAnalyzeText,
  onAnalyzeUrl,
  onAnalyzeDocument,
  onAnalyzeImage,
  isAnalyzing,
  selectedPreset,
  onClearPreset,
}) => {
  const [scanType, setScanType] = useState<ScanType>('JOB_OFFER');
  const [inputMode, setInputMode] = useState<InputType>('TEXT');
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    base64: string;
    mimeType: string;
  } | null>(null);
  const [loadingStageIdx, setLoadingStageIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preset if selected from external modal or quick buttons
  useEffect(() => {
    if (selectedPreset) {
      setScanType(selectedPreset.scanType);
      setInputMode(selectedPreset.inputType);
      if (selectedPreset.payload.text) {
        setTextContent(selectedPreset.payload.text);
      }
      if (selectedPreset.payload.url) {
        setUrlContent(selectedPreset.payload.url);
      }
      setSelectedFile(null);
    }
  }, [selectedPreset]);

  // Loading animation stages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setLoadingStageIdx(0);
      interval = setInterval(() => {
        setLoadingStageIdx((prev) => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage("File exceeds 20MB limit. Please upload a smaller file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedFile({
        name: file.name,
        size: file.size,
        base64,
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png'),
      });
      if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
        setInputMode('PDF');
      } else {
        setInputMode('IMAGE');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleAnalyze = async () => {
    setErrorMessage(null);
    try {
      if (inputMode === 'TEXT') {
        if (!textContent.trim()) {
          setErrorMessage("Please enter or paste the text content to analyze.");
          return;
        }
        await onAnalyzeText(textContent, scanType);
      } else if (inputMode === 'URL') {
        if (!urlContent.trim()) {
          setErrorMessage("Please provide a valid URL to analyze.");
          return;
        }
        await onAnalyzeUrl(urlContent, scanType);
      } else if (inputMode === 'PDF') {
        if (!selectedFile) {
          setErrorMessage("Please upload a PDF offer letter or agreement.");
          return;
        }
        await onAnalyzeDocument(selectedFile.base64, selectedFile.name, selectedFile.mimeType, scanType);
      } else if (inputMode === 'IMAGE') {
        if (!selectedFile) {
          setErrorMessage("Please upload an image screenshot to inspect.");
          return;
        }
        await onAnalyzeImage(selectedFile.base64, selectedFile.name, selectedFile.mimeType, scanType);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Analysis request failed");
    }
  };

  return (
    <div id="scanner-container" className="max-w-4xl mx-auto px-3 sm:px-4 mb-14">
      {/* Quick Demo Presets Strip (Horizontal scroll on mobile, responsive grid on tablet/desktop) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Quick Demo Scenarios (One-Click Test)
          </span>
          {selectedPreset && (
            <button
              onClick={onClearPreset}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-800/60"
            >
              <X className="w-3 h-3" /> Clear preset
            </button>
          )}
        </div>
        <div className="flex overflow-x-auto gap-2 pb-2 -mx-1 px-1 snap-x sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
          {DEMO_PRESETS.map((preset) => {
            const isSelected = selectedPreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setScanType(preset.scanType);
                  setInputMode(preset.inputType);
                  if (preset.payload.text) setTextContent(preset.payload.text);
                  if (preset.payload.url) setUrlContent(preset.payload.url);
                  setSelectedFile(null);
                }}
                className={`shrink-0 w-[240px] sm:w-auto snap-start p-2.5 rounded-xl border text-left transition-all relative touch-manipulation min-h-[64px] ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${preset.badgeColor}`}>
                    {preset.badge}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {preset.inputType}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-200 line-clamp-1">
                  {preset.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scanner Card */}
      <div className="relative rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Top Scan Type Tabs: [ Job Offer ] [ Rental Scam ] */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/60 p-1.5 sm:p-2 gap-1.5 sm:gap-2">
          <button
            id="tab-job-offer"
            onClick={() => setScanType('JOB_OFFER')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all touch-manipulation min-h-[44px] ${
              scanType === 'JOB_OFFER'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">Job Offer / Recruiter</span>
          </button>

          <button
            id="tab-rental-scam"
            onClick={() => setScanType('RENTAL_SCAM')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all touch-manipulation min-h-[44px] ${
              scanType === 'RENTAL_SCAM'
                ? 'bg-slate-800 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Home className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">Rental / Deposit Fraud</span>
          </button>
        </div>

        {/* Sub-tabs: Input Modes [ Paste Text ] [ URL ] [ Upload PDF ] [ Upload Image ] */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/40 px-3 sm:px-4 pt-2 sm:pt-3 gap-1 sm:gap-2 overflow-x-auto">
          <button
            id="mode-text"
            onClick={() => setInputMode('TEXT')}
            className={`flex items-center gap-1.5 sm:gap-2 pb-2.5 sm:pb-3 px-2 sm:px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all touch-manipulation min-h-[40px] ${
              inputMode === 'TEXT'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Paste Text</span>
          </button>

          <button
            id="mode-url"
            onClick={() => setInputMode('URL')}
            className={`flex items-center gap-1.5 sm:gap-2 pb-2.5 sm:pb-3 px-2 sm:px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all touch-manipulation min-h-[40px] ${
              inputMode === 'URL'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 shrink-0" />
            <span>Website / URL</span>
          </button>

          <button
            id="mode-pdf"
            onClick={() => setInputMode('PDF')}
            className={`flex items-center gap-1.5 sm:gap-2 pb-2.5 sm:pb-3 px-2 sm:px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all touch-manipulation min-h-[40px] ${
              inputMode === 'PDF'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileUp className="w-3.5 h-3.5 shrink-0" />
            <span>Upload PDF</span>
          </button>

          <button
            id="mode-image"
            onClick={() => setInputMode('IMAGE')}
            className={`flex items-center gap-1.5 sm:gap-2 pb-2.5 sm:pb-3 px-2 sm:px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all touch-manipulation min-h-[40px] ${
              inputMode === 'IMAGE'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Screenshot OCR</span>
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-4 sm:p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Mode 1: Textarea */}
          {inputMode === 'TEXT' && (
            <div className="relative">
              <textarea
                id="input-text-content"
                rows={7}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder={
                  scanType === 'JOB_OFFER'
                    ? "Paste the job offer, recruiter message, email, WhatsApp text, Telegram chat or appointment letter here..."
                    : "Paste the rental listing description, landlord message, WhatsApp chat, or security deposit instructions here..."
                }
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 p-3.5 sm:p-4 text-base sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all font-sans leading-relaxed resize-y"
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 mt-2 gap-1 px-1">
                <span>Supports WhatsApp, email bodies, Telegram transcripts, and recruiter SMS</span>
                <span className="font-mono">{textContent.length} characters</span>
              </div>
            </div>
          )}

          {/* Mode 2: URL Input */}
          {inputMode === 'URL' && (
            <div className="py-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Enter Suspicious Domain or Application URL
              </label>
              <div className="relative">
                <input
                  id="input-url-content"
                  type="text"
                  value={urlContent}
                  onChange={(e) => setUrlContent(e.target.value)}
                  placeholder="https://example-careers-apply.xyz/login"
                  className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 py-3 sm:py-3.5 px-3.5 sm:px-4 text-base sm:text-sm text-slate-100 placeholder-slate-500 outline-none font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Our engine inspects HTTPS certificates, DNS records, domain age, typosquatting patterns, and known phishing blacklists.
              </p>
            </div>
          )}

          {/* Mode 3 & 4: PDF & Image Upload Dropzone */}
          {(inputMode === 'PDF' || inputMode === 'IMAGE') && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={inputMode === 'PDF' ? '.pdf,application/pdf' : 'image/*'}
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-400/70 bg-slate-950/40 hover:bg-slate-950/70 rounded-xl p-5 sm:p-8 text-center cursor-pointer transition-all group touch-manipulation"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-cyan-400 group-hover:scale-110 transition-transform">
                  {inputMode === 'PDF' ? <FileUp className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                </div>
                <div className="text-sm font-medium text-slate-200 mb-1">
                  {selectedFile ? (
                    <span className="text-cyan-400 font-semibold break-all">{selectedFile.name}</span>
                  ) : (
                    <span>Tap or drag & drop your {inputMode === 'PDF' ? 'PDF offer letter' : 'screenshot'}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {inputMode === 'PDF'
                    ? 'Upload PDF appointment letters, contracts, or agreements (up to 20MB)'
                    : 'Upload screenshot of WhatsApp, email, Telegram, or social media job ad (Gemini Vision OCR)'}
                </p>
                {selectedFile && (
                  <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300">
                    <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400">Ready for Forensic OCR</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scanner Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="leading-tight">AI NLP + Heuristics + Domain Registry + Phishing Intelligence</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {(inputMode === 'PDF' || inputMode === 'IMAGE') && (
                <button
                  id="btn-upload-file"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-none px-4 py-3 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-all min-h-[48px] sm:min-h-[42px] touch-manipulation"
                >
                  Choose File
                </button>
              )}

              <button
                id="btn-analyze-execute"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer active:scale-95 min-h-[48px] sm:min-h-[42px] touch-manipulation"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950 shrink-0" />
                    <span>Analyzing Offer...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>Run Security Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading overlay with the 6 actual analysis phases (Section 5) */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-[#080d18]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-cyan-400 animate-spin" />
              <ShieldAlert className="w-7 h-7 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="text-base font-semibold text-white mb-2">
              Investigating Security Signals
            </div>
            
            {/* Current stage title */}
            <div className="text-xs font-mono text-cyan-400 mb-6 h-5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>{ANALYSIS_STAGES[loadingStageIdx]}</span>
            </div>

            {/* Stages progress bar indicators */}
            <div className="w-full max-w-sm space-y-2">
              {ANALYSIS_STAGES.map((stage, idx) => {
                const isPassed = idx < loadingStageIdx;
                const isCurrent = idx === loadingStageIdx;
                return (
                  <div key={stage} className="flex items-center gap-2.5 text-[11px]">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                        isPassed
                          ? 'bg-cyan-500 text-slate-950'
                          : isCurrent
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 animate-pulse'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className={isPassed ? 'text-slate-300 line-through opacity-70' : isCurrent ? 'text-cyan-300 font-medium' : 'text-slate-500'}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

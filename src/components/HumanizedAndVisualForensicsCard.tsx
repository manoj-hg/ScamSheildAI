import React, { useState } from 'react';
import {
  Sparkles,
  Eye,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  Cpu,
  Layers,
  Fingerprint,
  Sliders,
  ArrowRight,
  Info,
  Check,
  Zap,
  Activity,
  Maximize2,
  Lock,
} from 'lucide-react';
import { HumanizedEvasionAnalysis, ResNetVisualForensics } from '../types';

interface HumanizedAndVisualForensicsCardProps {
  humanized?: HumanizedEvasionAnalysis;
  visualForensics?: ResNetVisualForensics;
  originalContent: string;
}

export const HumanizedAndVisualForensicsCard: React.FC<HumanizedAndVisualForensicsCardProps> = ({
  humanized,
  visualForensics,
  originalContent,
}) => {
  const [activeTab, setActiveTab] = useState<'humanized' | 'resnet50'>('humanized');
  const [showDehumanizedView, setShowDehumanizedView] = useState<boolean>(true);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);

  if (!humanized && !visualForensics) {
    return null;
  }

  return (
    <div
      id="card-humanized-visual-forensics"
      className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl relative overflow-hidden"
    >
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/90 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Multi-Model Evasion & Deep Vision Forensics
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  NEXT-GEN MVP
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Overcoming LLM-humanized text evasion and document template forgery through multi-layer residual inspection.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 self-start sm:self-auto">
          <button
            id="tab-btn-humanized"
            onClick={() => setActiveTab('humanized')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'humanized'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Humanized Evasion</span>
            {humanized?.isAiHumanized && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse ml-0.5" />
            )}
          </button>

          <button
            id="tab-btn-resnet50"
            onClick={() => setActiveTab('resnet50')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'resnet50'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ResNet-50 Vision (50L)</span>
            {(visualForensics?.visualTamperScore || 0) >= 60 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI-HUMANIZED EVASION ANALYSIS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'humanized' && humanized && (
        <div className="space-y-6">
          {/* Top Banner: Verdict & Camouflage Score */}
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              humanized.camouflageLevel === 'CRITICAL' || humanized.camouflageLevel === 'HIGH'
                ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                : humanized.camouflageLevel === 'MODERATE'
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                : 'bg-slate-950/50 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`p-2.5 rounded-lg mt-0.5 ${
                  humanized.isAiHumanized
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {humanized.isAiHumanized ? (
                  <Sparkles className="w-5 h-5 text-purple-300" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {humanized.isAiHumanized
                      ? 'AI-Humanized Tone Camouflage Detected'
                      : 'Standard Organic Syntax Profile'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                      humanized.camouflageLevel === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : humanized.camouflageLevel === 'HIGH'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {humanized.camouflageLevel} EVASION RISK
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  {humanized.evasionExplanation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-5">
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
                  Evasion Score
                </div>
                <div
                  className={`text-2xl font-mono font-extrabold ${
                    humanized.evasionScore >= 70
                      ? 'text-purple-400'
                      : humanized.evasionScore >= 40
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {humanized.evasionScore}
                  <span className="text-xs text-slate-500 font-normal">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Stylometric Gauges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>Sentiment Asymmetry</span>
                <span className="text-purple-400 font-mono font-bold">
                  {humanized.stylometrics.sentimentAsymmetry}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all duration-500"
                  style={{ width: `${humanized.stylometrics.sentimentAsymmetry}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                Discrepancy between warm polite phrasing vs coercive payment demand.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>Empathy Camouflage</span>
                <span className="text-indigo-400 font-mono font-bold">
                  {humanized.stylometrics.empathyIndex}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${humanized.stylometrics.empathyIndex}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                Frequency of conversational sweeteners and psychological reassurance lures.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>Fluff-to-Signal Ratio</span>
                <span className="text-amber-400 font-mono font-bold">
                  {humanized.fluffToSignalRatio}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
                  style={{ width: `${humanized.fluffToSignalRatio}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                Proportion of words dedicated to narrative pleasantries masking terms.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>Lexical Burstiness</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {humanized.stylometrics.burstinessScore}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${humanized.stylometrics.burstinessScore}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                Syntactic distribution variance across clause & sentence structures.
              </p>
            </div>
          </div>

          {/* Interactive De-Humanizer: Masked Surface vs Naked Contract */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  The De-Humanization Intent Extractor
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btn-toggle-dehumanized"
                  onClick={() => setShowDehumanizedView(!showDehumanizedView)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{showDehumanizedView ? 'Switch to Split Comparison' : 'Focus De-Humanized Intent'}</span>
                </button>
              </div>
            </div>

            {showDehumanizedView ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-500/30">
                  <div className="text-[11px] font-mono uppercase font-bold text-red-400 flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Unmasked Operational Payload (Naked Contract)</span>
                  </div>
                  <p className="text-xs font-mono text-slate-200 leading-relaxed bg-black/40 p-2.5 rounded border border-red-500/20">
                    {humanized.coreIntentExtracted}
                  </p>
                  <div className="text-[11px] text-slate-400 mt-2">
                    <span className="font-semibold text-rose-300">Why this matters:</span> Scammers use prompts like <em className="text-slate-300">"make this offer sound genuine and empathetic"</em>. ScamShield's de-humanization pipeline filters out superficial pleasantries to isolate the concrete legal, financial, and operational demands.
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase font-bold text-purple-400 mb-1">
                    Surface Tone (Conversational Camouflage)
                  </div>
                  <div className="text-xs text-slate-300 max-h-36 overflow-y-auto pr-1 leading-relaxed italic border-l-2 border-purple-500/50 pl-2">
                    "{originalContent.slice(0, 300)}..."
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30">
                  <div className="text-[10px] font-mono uppercase font-bold text-red-400 mb-1">
                    De-Humanized Core Intent (Naked Contract)
                  </div>
                  <div className="text-xs font-mono text-red-200 leading-relaxed border-l-2 border-red-500 pl-2">
                    {humanized.coreIntentExtracted}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Identified Evasion Tactics */}
          <div>
            <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-2">
              Identified Evasion Vectors & Psychological Levers
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {humanized.detectedTactics.map((tactic, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex items-start gap-2 text-xs text-slate-300"
                >
                  <span className="p-1 rounded bg-purple-500/10 text-purple-400 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>{tactic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RESNET-50 DEEP DOCUMENT VISION FORENSICS (50 LAYERS)               */}
      {/* ========================================================================= */}
      {activeTab === 'resnet50' && visualForensics && (
        <div className="space-y-6">
          {/* Top Banner: ResNet-50 Verdict & Architecture Overview */}
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              visualForensics.visualTamperScore >= 60
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                : 'bg-slate-950/50 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`p-2.5 rounded-lg mt-0.5 ${
                  visualForensics.visualTamperScore >= 60
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {visualForensics.modelName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                      visualForensics.visualTamperScore >= 70
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : visualForensics.visualTamperScore >= 40
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {visualForensics.visualTamperScore >= 60 ? 'HIGH TAMPER ANOMALY' : 'AUTHENTIC INTEGRITY'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  {visualForensics.forensicSummary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-5">
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
                  Visual Tamper Index
                </div>
                <div
                  className={`text-2xl font-mono font-extrabold ${
                    visualForensics.visualTamperScore >= 70
                      ? 'text-red-400'
                      : visualForensics.visualTamperScore >= 40
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {visualForensics.visualTamperScore}
                  <span className="text-xs text-slate-500 font-normal">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Sensor Cards: Seal Authenticity, Typography, Logo DCT, Signature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. Seal & Rubber Stamp Authenticity */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  <span>Corporate Stamp / Seal Authenticity</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    visualForensics.sealAuthenticity.status === 'COUNTERFEIT_DETECTED'
                      ? 'bg-red-950 text-red-400 border border-red-500/40'
                      : visualForensics.sealAuthenticity.status === 'SUSPECTED_FORGERY'
                      ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {visualForensics.sealAuthenticity.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {visualForensics.sealAuthenticity.details}
              </p>
            </div>

            {/* 2. Micro-Typography & Kerning */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <FileSearch className="w-4 h-4 text-indigo-400" />
                  <span>Micro-Typography Consistency</span>
                </div>
                <span className="font-mono text-xs text-indigo-300 font-bold">
                  {visualForensics.typographyConsistency.score} Anomaly / 100
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {visualForensics.typographyConsistency.details}
              </p>
            </div>

            {/* 3. Logo Compression Block Mismatch */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                  <span>8x8 DCT Compression Grid Artifacts</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    visualForensics.logoArtifacts.compressionBlockMismatch
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {visualForensics.logoArtifacts.compressionBlockMismatch ? 'MISMATCH DETECTED' : 'UNIFORM QUANT'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {visualForensics.logoArtifacts.details}
              </p>
            </div>

            {/* 4. Signature Cryptography & Eraser Halo */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>Digital Signature & Halo Edge Inspection</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    visualForensics.signatureAuthenticity.haloEdgeArtifactDetected
                      ? 'bg-red-950 text-red-400 border border-red-500/40'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {visualForensics.signatureAuthenticity.haloEdgeArtifactDetected ? 'HALO SPLICING' : 'AUTHENTIC'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {visualForensics.signatureAuthenticity.details}
              </p>
            </div>
          </div>

          {/* ResNet-50 4-Stage Residual Layer Activation Inspector */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  ResNet-50 50-Layer Feature Activation Hierarchy
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Click layer stage to inspect residual gradient activations
              </span>
            </div>

            {/* Stage Selector Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {visualForensics.layerActivations.map((layer, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedLayerIndex(idx)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedLayerIndex === idx
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">
                      STAGE {idx + 1}
                    </span>
                    {layer.anomalyDetected ? (
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  <div className="text-xs font-semibold truncate mt-1 text-slate-200">
                    {layer.layerName.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {layer.confidence}% Confidence
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Layer Forensic Drilldown */}
            {visualForensics.layerActivations[selectedLayerIndex] && (
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800/90 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                  <div className="font-bold text-cyan-300">
                    {visualForensics.layerActivations[selectedLayerIndex].stage}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      Layer Target: {visualForensics.layerActivations[selectedLayerIndex].layerName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        visualForensics.layerActivations[selectedLayerIndex].anomalyDetected
                          ? 'bg-red-950 text-red-300 border border-red-500/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {visualForensics.layerActivations[selectedLayerIndex].anomalyDetected
                        ? 'ANOMALY CONFIRMED'
                        : 'NOMINAL PASS'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-semibold font-mono text-[11px] whitespace-nowrap">
                      Feature Focus:
                    </span>
                    <span className="text-slate-200">
                      {visualForensics.layerActivations[selectedLayerIndex].featureFocus}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-semibold font-mono text-[11px] whitespace-nowrap">
                      Observation:
                    </span>
                    <span className="text-slate-300 leading-relaxed">
                      {visualForensics.layerActivations[selectedLayerIndex].description}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Guidance */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multi-Model Ensemble combines Natural Language Intent Extraction with 50-Layer Residual CNN Inspection.</span>
        </div>
        <div>
          <span>Model Engine: Gemini 2.5 Flash + ResNet-50 v2 Backbone</span>
        </div>
      </div>
    </div>
  );
};

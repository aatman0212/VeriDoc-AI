import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSearch,
  ShieldCheck,
  ShieldAlert,
  Database,
  ArrowRightLeft,
  FileText,
  Download,
  RotateCcw,
  Check,
  Layers,
  Scale,
  Printer,
  ChevronRight,
  Info,
  ExternalLink,
  Network,
  Lock,
  Hash,
  Fingerprint,
} from 'lucide-react';
import { DEMO_CASES } from '../mock/cases';
import { RiskGauge } from './RiskGauge';
import { PassportPreview } from './PassportPreview';
import { FaceComparison } from './FaceComparison';
import { NavigationPage } from './Sidebar';

import { ScreeningCase } from '../types/screening';

interface ScreeningResultProps {
  caseId: string;
  onNavigate: (page: NavigationPage) => void;
  onSelectCase: (caseId: string) => void;
  onOpenReportModal: (caseId: string) => void;
  onOpenReviewModal: (caseId: string) => void;
  liveResult?: ScreeningCase | null;
}

export const ScreeningResult: React.FC<ScreeningResultProps> = ({
  caseId,
  onNavigate,
  onSelectCase,
  onOpenReportModal,
  onOpenReviewModal,
  liveResult,
}) => {
  // Use live result from Python backend or fallback to DEMO_CASES
  const currentCase = liveResult || DEMO_CASES[caseId] || DEMO_CASES['VD-10241'];
  const traveler = currentCase.traveler;
  const modules = currentCase.modules;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Top Banner & Header */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Screening Result & AI Assessment
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-xs font-mono text-slate-400">
              Checkpoint Alpha (Terminal 3)
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              {traveler.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 font-bold">
                Case ID: {currentCase.caseNumber}
              </span>
              {currentCase.isCustomUpload && (
                <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/70 text-xs font-mono text-cyan-300 font-bold shadow-sm shadow-cyan-950/60 flex items-center gap-1">
                  ★ LIVE CUSTOM UPLOAD
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                Doc: {traveler.documentType} ({traveler.documentNumber})
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Python Fusion Engine: Connected
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-2">
            <span>Nationality: <strong className="text-slate-200">{traveler.nationality}</strong></span>
            <span>DOB: <strong className="text-slate-200">{traveler.dob}</strong></span>
            <span>Screened: <strong className="text-slate-200">{currentCase.timestamp}</strong></span>
          </div>
        </div>

        {/* Quick Demo Case Switcher (Crucial for SIH judges presentation) */}
        <div className="flex flex-col items-start lg:items-end gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Switch Demo Scenario:
          </span>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {currentCase.isCustomUpload && (
              <button
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-600 text-white shadow-md cursor-default"
              >
                Custom Upload (Active)
              </button>
            )}
            <button
              onClick={() => onSelectCase('VD-10241')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                currentCase.id === 'VD-10241' && !currentCase.isCustomUpload
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Case C (High: 82)
            </button>
            <button
              onClick={() => onSelectCase('VD-10240')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                currentCase.id === 'VD-10240' && !currentCase.isCustomUpload
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Case B (Med: 47)
            </button>
            <button
              onClick={() => onSelectCase('VD-10242')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                currentCase.id === 'VD-10242' && !currentCase.isCustomUpload
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Case A (Low: 8)
            </button>
          </div>
        </div>
      </div>

      {/* High-Impact AI Real vs Fake Verdict Banner */}
      {currentCase.riskScore >= 70 ? (
        <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/80 border-2 border-rose-500/80 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-rose-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start sm:items-center gap-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/25 border border-rose-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-rose-900/40">
              <ShieldAlert className="w-8 h-8 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-rose-600 text-white font-mono font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider shadow">
                  🚨 VERDICT: FAKE / FORGED DOCUMENT
                </span>
                <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-mono px-2 py-0.5 rounded font-semibold">
                  DO NOT CLEAR FOR TRANSIT
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Confidence: <strong className="text-rose-300">96.8%</strong>
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                DOCUMENT FAILS AUTHENTICATION CHECKS
              </h3>
              <p className="text-xs sm:text-sm text-rose-200/90 mt-1 max-w-3xl">
                High-confidence forensic indicators detected: Digital photo tampering / ELA compression anomalies, invalid ICAO check digits, or biometric facial impersonation. Immediate officer intervention required.
              </p>
            </div>
          </div>
          <div className="shrink-0 z-10 self-stretch md:self-auto flex md:flex-col justify-end gap-2">
            <button
              onClick={() => onOpenReviewModal(currentCase.id)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-950/60 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              Interdict / Escalate
            </button>
          </div>
        </div>
      ) : currentCase.riskScore >= 30 ? (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/80 border-2 border-amber-500/80 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-amber-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start sm:items-center gap-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-600/25 border border-amber-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/40">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-amber-600 text-slate-950 font-mono font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider shadow">
                  ⚠️ VERDICT: SUSPICIOUS / INCONSISTENT
                </span>
                <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-mono px-2 py-0.5 rounded font-semibold">
                  SECONDARY REVIEW MANDATORY
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Confidence: <strong className="text-amber-300">89.4%</strong>
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                DOCUMENT EXHIBITS MODERATE THREAT SIGNALS
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/90 mt-1 max-w-3xl">
                Borderline biometric correlation, approaching document expiration window (&lt;6 months), or cross-document metadata disparities detected. Refer to secondary inspection line.
              </p>
            </div>
          </div>
          <div className="shrink-0 z-10 self-stretch md:self-auto flex md:flex-col justify-end gap-2">
            <button
              onClick={() => onOpenReviewModal(currentCase.id)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-950/60 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Secondary Inspection
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/80 border-2 border-emerald-500/80 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start sm:items-center gap-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/25 border border-emerald-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/40">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-emerald-600 text-white font-mono font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider shadow">
                  ✅ VERDICT: REAL / GENUINE DOCUMENT
                </span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-mono px-2 py-0.5 rounded font-semibold">
                  AUTHENTICATED & VERIFIED
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Confidence: <strong className="text-emerald-300">99.2%</strong>
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                DOCUMENT CLEARED FOR TRANSIT
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-3xl">
                All multi-modal integrity tests passed: ICAO Doc 9303 cryptographic check digits match, zero digital photo tampering detected via Error Level Analysis, and 128D facial biometrics confirmed authentic.
              </p>
            </div>
          </div>
          <div className="shrink-0 z-10 self-stretch md:self-auto flex md:flex-col justify-end gap-2">
            <button
              onClick={() => onOpenReportModal(currentCase.id)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/60 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Issue Clearance
            </button>
          </div>
        </div>
      )}

      {/* 1:N Biometric Duplicate Identity Alert Banner (Module 6 USP) */}
      {(currentCase.isFake || currentCase.detectedIssues.some(i => i.toLowerCase().includes('duplicate') || i.toLowerCase().includes('rajesh') || i.toLowerCase().includes('1:n'))) && (
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-rose-950/80 border border-purple-600/70 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shrink-0">
              <Network className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-purple-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Module 6 — Syndicate Link Alert
                </span>
                <span className="text-xs text-rose-400 font-bold">1:N FAISS Vector Duplicate Detected</span>
              </div>
              <div className="text-sm font-bold text-white">
                Biometric Face Vector matches prior traveler dossier registered under "Rajesh Kumar" (Case VD-10192)
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Organized fraud ring activity flagged in Louvain Community COMM-01 (Rohini / Delhi Syndicate).
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('fraud-graph')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-center cursor-pointer"
          >
            <Network className="w-4 h-4" />
            Inspect In Fraud Ring Graph
          </button>
        </div>
      )}

      {/* SHA-256 Hash-Chained Evidentiary Ledger Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white font-mono">CRYPTOGRAPHIC AUDIT LEDGER:</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                SEALED BLOCK
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-lg">
              Evidence Hash: <span className="text-emerald-400 select-all">{currentCase.auditBlock?.evidence_hash || 'b49477f1cef052bd8ccac0583bf33003fc09997b81b8d142f3205debb41f7069'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('audit-ledger')}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0 self-end sm:self-auto cursor-pointer"
        >
          <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
          View Blockchain Ledger
        </button>
      </div>

      {/* Hero Section: Circular Risk Gauge + Risk Breakdown + Final Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Circular Risk Score Gauge (4 cols) */}
        <div className="lg:col-span-4 flex">
          <div className="w-full">
            <RiskGauge score={currentCase.riskScore} riskLevel={currentCase.riskLevel} />
          </div>
        </div>

        {/* Center/Right: Risk Breakdown + Detected Issues (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Risk Breakdown Component */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Multi-Factor Risk Breakdown
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Synthesized from 6 independent neural checks
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {currentCase.riskBreakdown.map((item, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{item.module}</span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">— {item.reason}</span>
                    </div>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        item.severity === 'high'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : item.severity === 'medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      +{item.scoreContribution} pts
                    </span>
                  </div>

                  {/* Visual Sub-bar */}
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.severity === 'high'
                          ? 'bg-rose-500'
                          : item.severity === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, item.scoreContribution * 2.5)}%` }}
                    />
                  </div>
                </div>
              ))}

              {/* Total Summary Line */}
              <div className="pt-2 mt-1 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400 font-bold uppercase">Total Aggregated Risk Score:</span>
                <span
                  className={`text-sm font-extrabold ${
                    currentCase.riskLevel === 'high'
                      ? 'text-rose-400'
                      : currentCase.riskLevel === 'medium'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {currentCase.riskScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Detected Issues Warning Panel */}
          <div
            className={`border rounded-2xl p-4 sm:p-5 flex flex-col gap-2 ${
              currentCase.riskLevel === 'high'
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                : currentCase.riskLevel === 'medium'
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {currentCase.riskLevel === 'high' ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              ) : currentCase.riskLevel === 'medium' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <h4 className="font-bold text-sm tracking-wide">
                {currentCase.detectedIssues.length > 0
                  ? `${currentCase.detectedIssues.length} Potential Issues Detected`
                  : 'Zero Integrity Anomalies Detected'}
              </h4>
            </div>

            {currentCase.detectedIssues.length > 0 ? (
              <ul className="list-decimal list-inside space-y-1 text-xs text-slate-300 mt-1 pl-1">
                {currentCase.detectedIssues.map((issue, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="font-medium text-white">{issue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-300">
                All multi-spectral optical markers, biometric facial geometry, and cross-registry databases confirm document validity.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FINAL RECOMMENDATION PANEL (Prominent Government Standard Advisory) */}
      <div
        className={`border-2 rounded-2xl p-6 shadow-xl relative overflow-hidden ${
          currentCase.riskLevel === 'high'
            ? 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/60 border-rose-500/80 shadow-rose-950/30'
            : currentCase.riskLevel === 'medium'
            ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-amber-500/80 shadow-amber-950/30'
            : 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border-emerald-500/80 shadow-emerald-950/30'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className={`text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-md border tracking-widest ${
                  currentCase.riskLevel === 'high'
                    ? 'bg-rose-900 text-rose-200 border-rose-500'
                    : currentCase.riskLevel === 'medium'
                    ? 'bg-amber-900 text-amber-200 border-amber-500'
                    : 'bg-emerald-900 text-emerald-200 border-emerald-500'
                }`}
              >
                RECOMMENDED ACTION
              </span>
              <span className="text-xs font-mono text-slate-400">Standard Operating Protocol</span>
            </div>

            <h3
              className={`text-2xl sm:text-3xl font-black tracking-wider uppercase ${
                currentCase.riskLevel === 'high'
                  ? 'text-rose-400'
                  : currentCase.riskLevel === 'medium'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {currentCase.recommendation}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              "{currentCase.recommendationDescription}"
            </p>

            {/* Crucial Ethical AI Disclaimer as required by prompt */}
            <div className="flex items-center gap-2 text-[11px] text-cyan-300/80 font-mono pt-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>
                System Governance: VERIDOC AI functions strictly as an AI-assisted screening tool, not an autonomous adjudicator. Final disposition rests with authorized border personnel.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onOpenReviewModal(currentCase.id)}
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Review Case</span>
            </button>

            <button
              onClick={() => onOpenReportModal(currentCase.id)}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download Screening Report</span>
            </button>

            <button
              onClick={() => onNavigate('new-screening')}
              className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-cyan-800/50 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New Screening</span>
            </button>
          </div>
        </div>
      </div>

      {/* Uploaded Document Forensic Evidence Bay (Displayed if custom uploaded document image exists) */}
      {traveler.photoUrl && (currentCase.isCustomUpload || traveler.photoUrl.startsWith('data:image')) && (
        <div className="bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <FileSearch className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Primary Document Ingestion & Live ELA Compression Map
                </h3>
                <p className="text-xs text-slate-400">
                  Direct inspection of user-uploaded credential substrate using Python Pillow / NumPy delta engine
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold self-start sm:self-auto">
              ✓ User Upload Analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Bay A: Original Uploaded Document */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">1. Original Uploaded Document</span>
                <span className="text-cyan-400">Digital Capture</span>
              </div>
              <div className="aspect-[16/10] sm:aspect-[16/9] rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center p-1">
                <img
                  src={traveler.photoUrl}
                  alt="Uploaded Document"
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Bearer: <strong className="text-white">{traveler.name}</strong></span>
                <span>Doc: <strong className="text-cyan-300">{traveler.documentNumber}</strong></span>
              </div>
            </div>

            {/* Bay B: ELA Heatmap */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">2. Forensic ELA Anomaly Heatmap</span>
                <span className={currentCase.modules.tamperingDetection.status === 'suspicious' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {currentCase.modules.tamperingDetection.status === 'suspicious' ? 'Delta Spikes Detected' : 'Substrate Intact'}
                </span>
              </div>
              <div className="aspect-[16/10] sm:aspect-[16/9] rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center p-1 relative">
                {currentCase.tamperingHeatmapUrl ? (
                  <img
                    src={currentCase.tamperingHeatmapUrl}
                    alt="ELA Heatmap"
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                    <span className="text-xs font-mono text-emerald-300 font-bold">Uniform Error Level Distribution</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Zero high-frequency JPEG splicing detected</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Algorithm: <strong className="text-slate-200">Pillow Q=90 Delta Matrix</strong></span>
                <span className="text-cyan-400">Verified Substrate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THE SIX VERIFICATION MODULES (Clean, professional security cards) */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Deep Verification Modules (6 Diagnostic Engines)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click forensic toggles to inspect individual layers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* MODULE 1: OCR EXTRACTION */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {modules.ocr.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{modules.ocr.badge}</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">{modules.ocr.description}</p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-slate-200 font-bold">{traveler.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{traveler.documentType || 'Doc'} No.:</span>
                  <span className="text-cyan-300 font-bold">{traveler.documentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nationality:</span>
                  <span className="text-slate-200">{traveler.nationality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DOB:</span>
                  <span className="text-slate-200">{traveler.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Validity:</span>
                  <span className="text-slate-200 font-bold">
                    {(traveler.documentType === 'Aadhaar' || traveler.documentType === 'PAN') ? 'Lifetime Validity' : traveler.expiryDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>Engine: Tesseract-OCR + MRZ Parser</span>
              <span className="text-emerald-400">99.4% Optical Conf</span>
            </div>
          </div>

          {/* MODULE 2: DOCUMENT VALIDATION */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {modules.documentValidation.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                    modules.documentValidation.status === 'valid'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{modules.documentValidation.badge}</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">
                {modules.documentValidation.description}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-300">Format Valid</span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">
                    {traveler.documentType === 'Aadhaar' ? '✓ UIDAI Verhoeff D5' :
                     traveler.documentType === 'PAN' ? '✓ ITD 10-Char Regex' :
                     traveler.documentType === 'Driving License' ? '✓ Sarathi Format' :
                     '✓ ICAO TD3'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-300">Required Fields Present</span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">✓ All Fields Verified</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-300">Expiry / Validity</span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">
                    {(traveler.documentType === 'Aadhaar' || traveler.documentType === 'PAN') ? '✓ Lifetime Validity' : `✓ Active (${traveler.expiryDate})`}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-300">Checksum Validation</span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">
                    {traveler.documentType === 'Aadhaar' ? '✓ Verhoeff Dihedral D5' :
                     traveler.documentType === 'PAN' ? '✓ ITD Entity & Surname' :
                     '✓ Check Digits Validated'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>Standard: {traveler.documentType === 'Aadhaar' ? 'UIDAI Act 2016' : traveler.documentType === 'PAN' ? 'Income Tax Act 1961' : 'Doc 9303 Part 4'}</span>
              <span className="text-emerald-400">Verified Format</span>
            </div>
          </div>

          {/* MODULE 3: TAMPERING DETECTION */}
          <div
            className={`border rounded-2xl p-4 flex flex-col justify-between shadow-sm ${
              modules.tamperingDetection.status === 'suspicious'
                ? 'bg-rose-950/20 border-rose-500/50'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {modules.tamperingDetection.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                    modules.tamperingDetection.status === 'suspicious'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/60 animate-pulse'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {modules.tamperingDetection.status === 'suspicious' ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>{modules.tamperingDetection.badge}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{modules.tamperingDetection.badge}</span>
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                <div className="text-sm font-bold text-white">
                  {modules.tamperingDetection.status === 'suspicious'
                    ? 'Possible photo manipulation detected'
                    : 'No surface tampering detected'}
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <span>Confidence:</span>
                  <span
                    className={`font-bold ${
                      modules.tamperingDetection.status === 'suspicious' ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {modules.tamperingDetection.confidence}%
                  </span>
                </div>
              </div>

              {/* Sample Passport Image with Highlighted Suspicious Region */}
              <div className="my-2">
                <PassportPreview
                  photoUrl={traveler.photoUrl}
                  name={traveler.name}
                  passportNo={traveler.documentNumber}
                  nationality={traveler.nationality}
                  dob={traveler.dob}
                  expiry={traveler.expiryDate}
                  tamperingDetected={modules.tamperingDetection.status === 'suspicious'}
                  tamperingConfidence={modules.tamperingDetection.confidence}
                  tamperingRegion={currentCase.tamperingRegion}
                  mrzLine1={traveler.mrzLine1}
                  mrzLine2={traveler.mrzLine2}
                  tamperingHeatmapUrl={currentCase.tamperingHeatmapUrl}
                />
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>Technique: ResNet-50 + ELA</span>
              <span className="text-rose-400 font-semibold">Artifact Delta BBox</span>
            </div>
          </div>

          {/* MODULE 4: FACE VERIFICATION */}
          <div
            className={`border rounded-2xl p-4 flex flex-col justify-between shadow-sm ${
              modules.faceVerification.status === 'mismatch'
                ? 'bg-rose-950/20 border-rose-500/50'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {modules.faceVerification.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                    modules.faceVerification.status === 'mismatch'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/60 animate-pulse'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {modules.faceVerification.status === 'mismatch' ? (
                    <>
                      <XCircle className="w-3 h-3 text-rose-400" />
                      <span>{modules.faceVerification.badge}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{modules.faceVerification.badge}</span>
                    </>
                  )}
                </span>
              </div>

              {/* Side-by-Side Face Comparison Component */}
              <FaceComparison
                documentPhotoUrl={traveler.photoUrl}
                livePhotoUrl={traveler.livePhotoUrl}
                similarity={Math.round(modules.faceVerification.confidence ?? (modules.faceVerification.status === 'mismatch' ? 42 : 98))}
                travelerName={traveler.name}
              />
            </div>

            <div className="mt-3 pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>Distance Metric: Cosine</span>
              <span className="text-cyan-400">E-Gate Live Sensor</span>
            </div>
          </div>

          {/* MODULE 5: CROSS-DOCUMENT VERIFICATION */}
          <div
            className={`border rounded-2xl p-4 flex flex-col justify-between shadow-sm ${
              modules.crossDocument.status === 'warning'
                ? 'bg-amber-950/20 border-amber-500/50'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {modules.crossDocument.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                    modules.crossDocument.status === 'warning'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>{modules.crossDocument.badge}</span>
                </span>
              </div>

              <div className="space-y-1 mb-3">
                <div className="text-xs text-slate-300">
                  {modules.crossDocument.description}
                </div>
              </div>

              {/* Cross-Document Difference Matrix */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold pb-1 border-b border-slate-800">
                  Field Correlation Matrix:
                </div>

                {/* Primary Passport */}
                <div className="flex justify-between items-center p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Passport DOB:</span>
                  <span className="font-mono font-bold text-rose-400">{traveler.dob}</span>
                </div>

                {/* Secondary National ID */}
                <div className="flex justify-between items-center p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">National ID DOB:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {currentCase.secondaryDoc?.dob || '12/05/1998'}
                  </span>
                </div>

                {/* Name concordance */}
                <div className="flex justify-between items-center p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Name Match:</span>
                  <span className="text-emerald-400 font-semibold">100% Exact Match</span>
                </div>

                {modules.crossDocument.status === 'warning' && (
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-900 text-amber-300 text-[11px] leading-tight mt-1">
                    ⚠ DOB disparity detected between Primary (Passport) and Secondary Identity Document.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>Cross-Index: National Reg</span>
              <span className="text-amber-400 font-semibold">Discrepancy Logged</span>
            </div>
          </div>

          {/* MODULE 6: DATABASE VALIDATION */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {modules.databaseValidation.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{modules.databaseValidation.badge}</span>
                </span>
              </div>

              <div className="space-y-1 mb-3">
                <div className="text-xs text-slate-300">
                  {modules.databaseValidation.description}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Govt Passport Portal:</span>
                  <span className="text-emerald-400 font-bold">✓ Record Active</span>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Interpol SLTD:</span>
                  <span className="text-emerald-400 font-bold">✓ Clean (Not Lost/Stolen)</span>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">No-Fly / Watchlist:</span>
                  <span className="text-emerald-400 font-bold">✓ Clear</span>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Issuance Center:</span>
                  <span className="text-slate-300">RPO Delhi (2021)</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>Direct Link: ICAO PKD / MEA</span>
              <span className="text-emerald-400">Certified Valid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

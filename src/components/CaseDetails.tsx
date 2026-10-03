import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Printer,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  User,
  FileText,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  Check,
} from 'lucide-react';
import { DEMO_CASES } from '../mock/cases';
import { ScreeningCase } from '../types/screening';
import { PassportPreview } from './PassportPreview';
import { FaceComparison } from './FaceComparison';
import { RiskGauge } from './RiskGauge';

interface CaseDetailsProps {
  caseId: string;
  onBack: () => void;
  onOpenReportModal: (caseId: string) => void;
  liveResult?: ScreeningCase | null;
}

export const CaseDetails: React.FC<CaseDetailsProps> = ({
  caseId,
  onBack,
  onOpenReportModal,
  liveResult,
}) => {
  const currentCase = liveResult || DEMO_CASES[caseId] || DEMO_CASES['VD-10241'];
  const traveler = currentCase.traveler;
  const modules = currentCase.modules;

  const [officerDecision, setOfficerDecision] = useState<string>('pending');
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [savedDecision, setSavedDecision] = useState<string | null>(null);

  const handleSaveDecision = () => {
    setSavedDecision(officerDecision);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400">
                CASE DOSSIER // {currentCase.caseNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  currentCase.riskLevel === 'high'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : currentCase.riskLevel === 'medium'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {currentCase.riskLevel} RISK ({currentCase.riskScore}/100)
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              {traveler.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenReportModal(currentCase.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Official Report</span>
          </button>
        </div>
      </div>

      {/* Case Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Screening Station</span>
          <span className="text-slate-200 font-semibold">{currentCase.checkpoint}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Timestamp</span>
          <span className="text-slate-200 font-semibold">{currentCase.timestamp}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Screening Officer</span>
          <span className="text-slate-200 font-semibold">{currentCase.officerId}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">AI Inspection Status</span>
          <span className="text-emerald-400 font-bold font-mono">✓ 6 Modules Completed</span>
        </div>
      </div>

      {/* Main 2-Column Split: Document Forensics & Biometrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Preview & OCR Data (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Document Preview with ELA / Heatmap Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Primary Travel Document Preview & Forensic Analysis</span>
              <span className="text-[10px] font-mono text-cyan-400">ICAO TD3 Spec</span>
            </h3>

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

          {/* Extracted OCR Information Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Extracted OCR Data & MRZ Decryption</span>
              <span className="text-emerald-400 font-mono text-[11px]">✓ 99.4% Optical Confidence</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Full Name</span>
                <span className="text-white font-bold">{traveler.name}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Passport Number</span>
                <span className="text-cyan-400 font-bold">{traveler.documentNumber}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Nationality</span>
                <span className="text-slate-200">{traveler.nationality}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                <span className="text-slate-200">{traveler.dob}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Date of Expiry</span>
                <span className="text-slate-200">{traveler.expiryDate}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Issuing Authority</span>
                <span className="text-slate-200">Govt. of India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Biometrics, Risk Breakdown & Officer Decision (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Biometric Face Verification */}
          <FaceComparison
            documentPhotoUrl={traveler.photoUrl}
            livePhotoUrl={traveler.livePhotoUrl}
            similarity={modules.faceVerification.confidence || 42}
            travelerName={traveler.name}
          />

          {/* Validation & Detected Issues */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Risk Evaluation & Flagged Inconsistencies</span>
              <span
                className={`font-mono font-bold text-xs ${
                  currentCase.riskLevel === 'high' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                Score: {currentCase.riskScore}/100
              </span>
            </h3>

            <div className="space-y-2 text-xs">
              {(currentCase.detectedIssues || []).map((issue: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-950/30 border border-rose-900 text-rose-200 text-xs"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{issue}</span>
                </div>
              ))}
              {currentCase.detectedIssues.length === 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No security issues or identity tampering detected.</span>
                </div>
              )}
            </div>

            {/* Final System Recommendation Summary */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                System Recommendation:
              </span>
              <span
                className={`font-bold uppercase tracking-wider ${
                  currentCase.riskLevel === 'high'
                    ? 'text-rose-400'
                    : currentCase.riskLevel === 'medium'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {currentCase.recommendation}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                {currentCase.recommendationDescription}
              </p>
            </div>
          </div>

          {/* Officer Decision & Disposition Panel */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Border Officer Disposition</span>
              <span className="text-[10px] font-mono text-cyan-400">Officer: VD-8842</span>
            </h3>

            {savedDecision ? (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Decision Recorded: {savedDecision.toUpperCase()}</span>
                </div>
                {officerNotes && (
                  <p className="text-slate-300 text-[11px] italic bg-slate-900 p-2 rounded">
                    "{officerNotes}"
                  </p>
                )}
                <div className="text-[10px] font-mono text-slate-500">
                  Logged in national border audit ledger with cryptographic signature.
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Record Final Officer Action:</label>
                  <select
                    value={officerDecision}
                    onChange={(e) => setOfficerDecision(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="pending">-- Select Officer Disposition --</option>
                    <option value="Dispatch to Secondary Inspection">
                      Dispatch to Secondary Inspection (Mandatory)
                    </option>
                    <option value="Detain for Document Forensics">
                      Detain for Document Forensics (Photo Tampering Investigation)
                    </option>
                    <option value="Clear for Entry (Override with Note)">
                      Clear for Entry (Manual Supervisor Override)
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Officer Notes / Justification:</label>
                  <textarea
                    rows={2}
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="Enter inspection observations or secondary booth routing..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={handleSaveDecision}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Commit Officer Disposition
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

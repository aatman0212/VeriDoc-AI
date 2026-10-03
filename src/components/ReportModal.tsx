import React from 'react';
import { X, Printer, Download, Shield, Award, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { DEMO_CASES } from '../mock/cases';

interface ReportModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ caseId, isOpen, onClose }) => {
  if (!isOpen) return null;

  const currentCase = DEMO_CASES[caseId] || DEMO_CASES['VD-10241'];
  const traveler = currentCase.traveler;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Top Action Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm text-white tracking-wide">
              Official Border Security Screening Report (PDF Preview)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-slate-950 font-sans text-xs" id="printable-report">
          {/* Official Document Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500 flex items-center justify-center font-bold text-cyan-400 text-base">
                VD
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-wider uppercase text-white">
                  VERIDOC AI — SCREENING DISPOSITION REPORT
                </h1>
                <p className="text-[11px] text-slate-400">
                  SMART INDIA HACKATHON 2026 // PROBLEM STATEMENT 26188
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Autonomous Identity Verification & Document Forensic Subsystem
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-[11px]">
              <div className="text-cyan-400 font-bold">CASE NO: {currentCase.caseNumber}</div>
              <div className="text-slate-400">Date: {currentCase.timestamp}</div>
              <div className="text-slate-500">Security Ref: #IND-SEC-26188</div>
            </div>
          </div>

          {/* Traveler & Document Summary Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Subject Name</span>
              <span className="text-white font-bold text-sm">{traveler.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Document Type & No</span>
              <span className="text-cyan-300 font-bold">{traveler.documentType}: {traveler.documentNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Nationality & DOB</span>
              <span className="text-slate-200">{traveler.nationality} / {traveler.dob}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Checkpoint Station</span>
              <span className="text-slate-200">{currentCase.checkpoint}</span>
            </div>
          </div>

          {/* Risk Assessment Box */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                Aggregate Risk Evaluation
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400">Composite Score:</span>
                <span
                  className={`font-bold text-sm ${
                    currentCase.riskLevel === 'high' ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {currentCase.riskScore} / 100
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    currentCase.riskLevel === 'high'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {currentCase.riskLevel} Risk
                </span>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                Mandatory Operational Protocol:
              </span>
              <span className="font-bold text-white uppercase text-sm block">
                {currentCase.recommendation}
              </span>
              <p className="text-slate-400 text-xs mt-1">
                {currentCase.recommendationDescription}
              </p>
            </div>
          </div>

          {/* Forensic Module Findings Checklist */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-300 text-xs font-mono">
              Diagnostic Module Findings (Summary)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">1. OCR & MRZ Checksum:</span>
                <span className="text-emerald-400 font-bold">COMPLETED (99.4%)</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">2. ICAO 9303 Validation:</span>
                <span className="text-emerald-400 font-bold">VALID (14/14 Fields)</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">3. Tampering (ELA/Noise):</span>
                <span
                  className={
                    currentCase.modules.tamperingDetection.status === 'suspicious'
                      ? 'text-rose-400 font-bold'
                      : 'text-emerald-400 font-bold'
                  }
                >
                  {currentCase.modules.tamperingDetection.status === 'suspicious'
                    ? '87% SPLICING ANOMALY'
                    : 'AUTHENTIC'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">4. Biometric Face Match:</span>
                <span
                  className={
                    currentCase.modules.faceVerification.status === 'mismatch'
                      ? 'text-rose-400 font-bold'
                      : 'text-emerald-400 font-bold'
                  }
                >
                  {currentCase.modules.faceVerification.confidence}% MATCH (Cosine)
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">5. Cross-Doc Concordance:</span>
                <span
                  className={
                    currentCase.modules.crossDocument.status === 'warning'
                      ? 'text-amber-400 font-bold'
                      : 'text-emerald-400 font-bold'
                  }
                >
                  {currentCase.modules.crossDocument.status === 'warning'
                    ? 'DOB INCONSISTENT'
                    : 'CONCORDANT'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">6. National Watchlist / DB:</span>
                <span className="text-emerald-400 font-bold">RECORD FOUND / CLEAR</span>
              </div>
            </div>
          </div>

          {/* Officer Verification & Sign-off Section */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 font-mono text-[11px] text-slate-400">
            <div>
              <div className="text-slate-500 mb-1">SCREENING OFFICER:</div>
              <div className="text-white font-bold">{currentCase.officerId}</div>
              <div className="text-[10px] text-slate-500 mt-1">Digital Badge ID: #VD-8842-ALPHA</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 mb-1">SUPERVISORY SIGN-OFF:</div>
              <div className="text-cyan-400 font-bold">SEC_CHECKPOINT_DISPOSITION_VERIFIED</div>
              <div className="text-[10px] text-slate-500 mt-1">Audit Hash: e4a899c7b8...312</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Close Report
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

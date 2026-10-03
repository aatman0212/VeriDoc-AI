import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, UserCheck, AlertTriangle, Send } from 'lucide-react';
import { DEMO_CASES } from '../mock/cases';

interface ReviewModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommitted?: (disposition: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  caseId,
  isOpen,
  onClose,
  onCommitted,
}) => {
  if (!isOpen) return null;

  const currentCase = DEMO_CASES[caseId] || DEMO_CASES['VD-10241'];
  const [selectedAction, setSelectedAction] = useState('secondary');
  const [officerNotes, setOfficerNotes] = useState(
    'Possible physical portrait tampering detected via Error Level Analysis. Inter-pupillary facial distance delta indicates identity substitution risk. Routing traveler to Secondary Booth B for physical UV microscope inspection.'
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onCommitted?.(selectedAction);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span className="font-bold text-sm text-white tracking-wide">
              Officer Manual Adjudication & Disposition
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">CASE NUMBER</span>
              <span className="text-cyan-400 font-bold">{currentCase.caseNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">SUBJECT NAME</span>
              <span className="text-white font-bold">{currentCase.traveler.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">AI RISK SCORE</span>
              <span className="text-rose-400 font-bold">{currentCase.riskScore}/100</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Protocol Action / Disposition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedAction('secondary')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedAction === 'secondary'
                    ? 'bg-rose-950/60 border-rose-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-rose-300">Secondary Check</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Physical interview & biometric re-capture
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('forensics')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedAction === 'forensics'
                    ? 'bg-rose-950/60 border-rose-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-amber-300">Lab Forensics</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Retain document for micro-spectrometry
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('cleared')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedAction === 'cleared'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-emerald-300">Override & Clear</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Supervisor verified genuine match
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Officer Inspection Notes (Mandatory for Audit Trail)
            </label>
            <textarea
              rows={3}
              required
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="Record forensic observation..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {isSuccess ? (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl flex items-center justify-center gap-2 text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>Officer Disposition Committed to National Registry!</span>
            </div>
          ) : (
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Commit Protocol Order</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

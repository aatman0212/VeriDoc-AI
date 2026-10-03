import React from 'react';
import { UserX, UserCheck, AlertTriangle, ScanFace, ArrowLeftRight } from 'lucide-react';

interface FaceComparisonProps {
  documentPhotoUrl: string;
  livePhotoUrl: string;
  similarity: number; // e.g. 42
  travelerName: string;
}

export const FaceComparison: React.FC<FaceComparisonProps> = ({
  documentPhotoUrl,
  livePhotoUrl,
  similarity,
  travelerName,
}) => {
  const isMatch = similarity >= 75;
  const isBorderline = similarity >= 65 && similarity < 75;

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col gap-4">
      {/* Top status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanFace className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Biometric Facial Match Engine
          </span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold ${
            isMatch
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
              : isBorderline
              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
              : 'bg-rose-950/80 text-rose-400 border border-rose-500/40 animate-pulse'
          }`}
        >
          {isMatch ? (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>Identity Confirmed</span>
            </>
          ) : (
            <>
              <UserX className="w-3.5 h-3.5" />
              <span>Possible Identity Mismatch</span>
            </>
          )}
        </div>
      </div>

      {/* Side-by-Side Photos */}
      <div className="grid grid-cols-2 gap-3 items-center relative">
        {/* Document Photo */}
        <div className="flex flex-col gap-1.5">
          <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-950">
            <img
              src={documentPhotoUrl}
              alt="Document Face"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-slate-900/90 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 backdrop-blur">
              Document Face
            </div>
            {/* Facial mesh overlay simulation */}
            <div className="absolute inset-0 border border-cyan-500/30 rounded-lg pointer-events-none" />
          </div>
          <div className="text-[11px] text-slate-400 text-center font-mono">Extracted via OCR/Chip</div>
        </div>

        {/* Center Comparison Indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-400 shadow-md">
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        {/* Live Presented Photo */}
        <div className="flex flex-col gap-1.5">
          <div
            className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-slate-950 ${
              isMatch ? 'border-emerald-600/60' : 'border-rose-600/80'
            }`}
          >
            <img
              src={livePhotoUrl}
              alt="Presented Face"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-slate-900/90 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 backdrop-blur">
              Presented Face
            </div>
            <div className="absolute bottom-2 right-2 bg-slate-950/90 text-emerald-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">
              Live Cam (3D)
            </div>
          </div>
          <div className="text-[11px] text-slate-400 text-center font-mono">Live Checkpoint Capture</div>
        </div>
      </div>

      {/* Similarity Gauge Bar */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400 font-medium">Biometric Cosine Similarity</span>
          <span
            className={`font-mono text-sm font-bold ${
              isMatch ? 'text-emerald-400' : isBorderline ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {similarity}%
          </span>
        </div>

        {/* Progress Bar with Threshold Marker */}
        <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${
              isMatch
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                : isBorderline
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-rose-600 to-rose-400'
            }`}
            style={{ width: `${similarity}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-1 text-[10px] font-mono text-slate-500">
          <span>0%</span>
          <span className="text-cyan-400/80">Threshold: 75% Match</span>
          <span>100%</span>
        </div>

        {!isMatch && (
          <div className="mt-2.5 flex items-start gap-2 text-xs text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-900/50">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              Similarity score ({similarity}%) is strictly below the mandatory 75% security threshold. Physical inspection of traveler's facial structure required.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

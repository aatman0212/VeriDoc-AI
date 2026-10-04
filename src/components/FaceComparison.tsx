import React from 'react';
import { UserX, UserCheck, AlertTriangle, ScanFace, ArrowLeftRight, HelpCircle } from 'lucide-react';

interface FaceComparisonProps {
  documentPhotoUrl?: string | null;
  livePhotoUrl: string;
  similarity: number; // e.g. 42
  travelerName: string;
  noFaceInDocument?: boolean;
}

export const FaceComparison: React.FC<FaceComparisonProps> = ({
  documentPhotoUrl,
  livePhotoUrl,
  similarity,
  travelerName,
  noFaceInDocument = false,
}) => {
  const isMissingPhoto = noFaceInDocument || !documentPhotoUrl;
  const isMatch = !isMissingPhoto && similarity >= 75;
  const isBorderline = !isMissingPhoto && similarity >= 65 && similarity < 75;

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col gap-4">
      {/* Top status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanFace className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Biometric Facial Match Engine (YuNet + SFace)
          </span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold ${
            isMissingPhoto
              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/50'
              : isMatch
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
              : isBorderline
              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
              : 'bg-rose-950/80 text-rose-400 border border-rose-500/40 animate-pulse'
          }`}
        >
          {isMissingPhoto ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>No Photo on Document</span>
            </>
          ) : isMatch ? (
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
          {isMissingPhoto ? (
            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-amber-500/50 bg-amber-950/20 p-3 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-300">No Photo Detected</span>
              <span className="text-[10px] text-amber-200/80 mt-1 leading-snug">
                Back side uploaded (address & QR). In India, Aadhaar photo is on the FRONT side.
              </span>
              <div className="absolute top-2 left-2 bg-amber-950/90 text-amber-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-amber-700/60">
                Front Side Needed
              </div>
            </div>
          ) : (
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
          )}
          <div className="text-[11px] text-slate-400 text-center font-mono">
            {isMissingPhoto ? 'Zero Faces Found on Document' : 'Extracted via YuNet Neural Crop'}
          </div>
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
              isMissingPhoto
                ? 'border-amber-600/60'
                : isMatch
                ? 'border-emerald-600/60'
                : 'border-rose-600/80'
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
          <span className="text-xs text-slate-400 font-medium">Biometric Neural Cosine Similarity</span>
          <span
            className={`font-mono text-sm font-bold ${
              isMissingPhoto
                ? 'text-amber-400'
                : isMatch
                ? 'text-emerald-400'
                : isBorderline
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {isMissingPhoto ? 'N/A (No Doc Face)' : `${similarity}%`}
          </span>
        </div>

        {/* Progress Bar with Threshold Marker */}
        <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${
              isMissingPhoto
                ? 'bg-amber-600'
                : isMatch
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                : isBorderline
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-rose-600 to-rose-400'
            }`}
            style={{ width: `${isMissingPhoto ? 0 : similarity}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-1 text-[10px] font-mono text-slate-500">
          <span>0%</span>
          <span className="text-cyan-400/80">Threshold: 75% Match (SFace 128D)</span>
          <span>100%</span>
        </div>

        {isMissingPhoto ? (
          <div className="mt-2.5 flex items-start gap-2 text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-900/60">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-200">Missing Document Photograph</span>
              <span>
                Zero human faces were detected on the uploaded document. The image appears to be the BACK side (address &amp; QR code) of an Aadhaar card. In India, official portrait photos are strictly printed on the <strong>FRONT side</strong>. Please upload the front side containing your photograph.
              </span>
            </div>
          </div>
        ) : !isMatch ? (
          <div className="mt-2.5 flex items-start gap-2 text-xs text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-900/50">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              Similarity score ({similarity}%) is strictly below the mandatory 75% security threshold. SFace deep feature vectors indicate an impersonation attempt or different person. Physical inspection required.
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

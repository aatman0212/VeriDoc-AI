import React, { useState } from 'react';
import { ShieldAlert, Eye, Flame, ZoomIn, CheckCircle2 } from 'lucide-react';

interface PassportPreviewProps {
  photoUrl: string;
  name: string;
  passportNo: string;
  nationality: string;
  dob: string;
  expiry: string;
  tamperingDetected?: boolean;
  tamperingConfidence?: number;
  tamperingRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
    description: string;
  };
  mrzLine1?: string;
  mrzLine2?: string;
  tamperingHeatmapUrl?: string;
}

export const PassportPreview: React.FC<PassportPreviewProps> = ({
  photoUrl,
  name,
  passportNo,
  nationality,
  dob,
  expiry,
  tamperingDetected = false,
  tamperingConfidence = 87,
  tamperingRegion,
  mrzLine1,
  mrzLine2,
  tamperingHeatmapUrl,
}) => {
  const [viewMode, setViewMode] = useState<'normal' | 'forensic' | 'infrared'>('forensic');

  const nameParts = (name || '').trim().split(/\s+/).filter(Boolean);
  const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : (nameParts[0] || 'TRAVELER').toUpperCase();
  const givenNames = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ').toUpperCase() : (nameParts[0] || '').toUpperCase();
  const countryCode = (nationality || 'IND').toUpperCase().slice(0, 3).padEnd(3, '<');

  const displayMrz1 = mrzLine1 || `P<${countryCode}${surname}<<${givenNames.replace(/\s+/g, '<')}`.padEnd(44, '<').slice(0, 44);
  const cleanDob = (dob || '010195').replace(/[^0-9]/g, '').slice(-6).padEnd(6, '0');
  const cleanExp = (expiry || '010132').replace(/[^0-9]/g, '').slice(-6).padEnd(6, '0');
  const displayMrz2 = mrzLine2 || `${(passportNo || 'P1000001').padEnd(9, '<')}8${countryCode}${cleanDob}5M${cleanExp}3<<<<<<<<<<<<<<04`.slice(0, 44);

  return (
    <div className="flex flex-col gap-3">
      {/* View Mode Toggle Controls */}
      <div className="flex items-center justify-between text-xs bg-slate-900/80 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Forensic Inspection View:</span>
          <div className="flex bg-slate-950 p-1 rounded-md border border-slate-800">
            <button
              onClick={() => setViewMode('normal')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'normal'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Normal View
            </button>
            <button
              onClick={() => setViewMode('forensic')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'forensic'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3 h-3 text-rose-400" />
              ELA Heatmap & Splicing
            </button>
            <button
              onClick={() => setViewMode('infrared')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'infrared'
                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              UV / Hologram Band
            </button>
          </div>
        </div>

        {tamperingDetected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-mono text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Splicing Conf: {tamperingConfidence}%</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Substrate Authentic</span>
          </div>
        )}
      </div>

      {/* Realistic ICAO Document Surface */}
      <div
        className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
          viewMode === 'forensic'
            ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-rose-500/50 shadow-lg shadow-rose-950/30'
            : viewMode === 'infrared'
            ? 'bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 border-indigo-500/40'
            : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-slate-700'
        } p-4 sm:p-5 text-slate-200 select-none`}
      >
        {/* Subtle Security Guilloche Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #38bdf8 2%, transparent 0%), radial-gradient(circle at 75px 75px, #818cf8 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}
        />

        {/* Passport Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center font-serif text-amber-300 text-xs font-bold shadow-inner">
              IND
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
                REPUBLIC OF INDIA / RÉPUBLIQUE D'INDE
              </div>
              <div className="text-sm font-bold tracking-wider text-slate-100 uppercase">
                PASSPORT / PASSEPORT
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Type / Code</div>
            <div className="text-xs font-mono font-bold text-cyan-400">P / IND</div>
          </div>
        </div>

        {/* Passport Body Layout */}
        <div className="grid grid-cols-12 gap-4 items-start">
          {/* Photo Column with Tampering Bounding Box */}
          <div className="col-span-4 relative group">
            <div
              className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                viewMode === 'forensic' && tamperingDetected
                  ? 'border-rose-500 shadow-lg shadow-rose-600/30'
                  : 'border-slate-600'
              }`}
            >
              <img
                src={photoUrl}
                alt={name}
                className={`w-full h-full object-cover transition-all ${
                  viewMode === 'infrared' ? 'hue-rotate-180 contrast-125 brightness-90' : ''
                }`}
              />

              {/* Forensic Heatmap / ELA Overlay */}
              {viewMode === 'forensic' && tamperingDetected && (
                <div className="absolute inset-0 pointer-events-none">
                  {tamperingHeatmapUrl ? (
                    <img
                      src={tamperingHeatmapUrl}
                      alt="ELA Heatmap"
                      className="w-full h-full object-cover mix-blend-screen opacity-90"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/40 via-transparent to-amber-500/30 mix-blend-color-dodge animate-pulse" />
                  )}
                  
                  {/* Splicing contour line box */}
                  <div className="absolute inset-1 border-2 border-dashed border-rose-400 rounded bg-rose-500/10 flex flex-col justify-between p-1.5">
                    <div className="flex justify-between items-center">
                      <span className="bg-rose-600 text-white text-[9px] font-mono px-1 py-0.5 rounded font-bold uppercase shadow">
                        ⚠ Tampered Region
                      </span>
                      <span className="bg-slate-900/90 text-rose-400 text-[9px] font-mono px-1 py-0.5 rounded">
                        {tamperingConfidence}% Conf
                      </span>
                    </div>
                    <div className="text-[8px] font-mono text-rose-200 bg-slate-950/80 p-1 rounded backdrop-blur">
                      Noise delta detected across portrait border
                    </div>
                  </div>
                </div>
              )}

              {/* UV hologram watermark effect */}
              {viewMode === 'infrared' && (
                <div className="absolute inset-0 bg-indigo-500/20 mix-blend-screen pointer-events-none flex items-center justify-center">
                  <div className="w-16 h-16 border border-cyan-400/50 rounded-full rotate-45 flex items-center justify-center text-[9px] text-cyan-300 font-mono">
                    SECURE UV
                  </div>
                </div>
              )}
            </div>

            <div className="mt-1.5 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Photo ID: {passportNo}
              </span>
            </div>
          </div>

          {/* Extracted Fields Column */}
          <div className="col-span-8 grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Surname / Nom
              </span>
              <span className="font-bold text-slate-100 tracking-wide">{surname}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Given Names / Prénoms
              </span>
              <span className="font-bold text-slate-100 tracking-wide">{givenNames || surname}</span>
            </div>

            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Nationality / Nationalité
              </span>
              <span className="font-semibold text-slate-200">{nationality.toUpperCase()}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Passport No. / No du Passeport
              </span>
              <span className="font-mono font-bold text-cyan-300 tracking-wider">{passportNo}</span>
            </div>

            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Date of Birth / Date de Naiss.
              </span>
              <span className="font-mono font-semibold text-slate-200">{dob}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Sex / Sexe
              </span>
              <span className="font-mono font-semibold text-slate-200">M</span>
            </div>

            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Place of Birth / Lieu de Naiss.
              </span>
              <span className="font-semibold text-slate-200">{nationality === 'IND' ? 'DELHI, IND' : `${nationality}, INTL`}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Date of Expiry / Date d'expiration
              </span>
              <span className="font-mono font-semibold text-slate-200">{expiry}</span>
            </div>
          </div>
        </div>

        {/* Machine Readable Zone (MRZ) */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 font-mono text-[10px] sm:text-[11px] leading-tight text-cyan-400/90 tracking-widest bg-slate-950/60 p-2 rounded border border-slate-800">
          <div className="truncate">{displayMrz1}</div>
          <div className="truncate">{displayMrz2}</div>
        </div>
      </div>
    </div>
  );
};

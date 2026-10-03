import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Camera,
  CheckCircle2,
  ScanLine,
  Zap,
  Sparkles,
  ArrowRight,
  Shield,
  X,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  Cpu,
  Eye,
  Image as ImageIcon,
  Sliders,
  Check,
  Hash,
  Loader2,
} from 'lucide-react';
import { DEMO_CASES } from '../mock/cases';
import { apiService, CustomScreeningInput } from '../services/api';
import { extractDocumentDataFromImage } from '../utils/ocrParser';

interface NewScreeningProps {
  onStartAnalysis: (caseId: string, customInput?: any) => void;
}

export const NewScreening: React.FC<NewScreeningProps> = ({ onStartAnalysis }) => {
  const [intakeMode, setIntakeMode] = useState<'presets' | 'custom'>('custom');
  const [selectedPreset, setSelectedPreset] = useState<'VD-10241' | 'VD-10240' | 'VD-10242'>('VD-10241');
  
  // Active uploaded files state for presets
  const currentCase = DEMO_CASES[selectedPreset];
  const [passportUploaded, setPassportUploaded] = useState(true);
  const [visaUploaded, setVisaUploaded] = useState(selectedPreset === 'VD-10240');
  const [nationalIdUploaded, setNationalIdUploaded] = useState(true);
  const [faceCaptured, setFaceCaptured] = useState(true);

  // Custom Intake State - Initialized cleanly without hardcoded test names
  const [customDocType, setCustomDocType] = useState<string>('Aadhaar');
  const [customDocNumber, setCustomDocNumber] = useState<string>('');
  const [customFullName, setCustomFullName] = useState<string>('');
  const [customNationality, setCustomNationality] = useState<string>('IND');
  const [customDob, setCustomDob] = useState<string>('');
  const [customExpiry, setCustomExpiry] = useState<string>('2099-12-31');
  const [customGender, setCustomGender] = useState<string>('M');

  // Stage 2 AI OCR Auto-Extraction State
  const [isOcrRunning, setIsOcrRunning] = useState<boolean>(false);
  const [ocrStatusText, setOcrStatusText] = useState<string>('');
  const [ocrSuccess, setOcrSuccess] = useState<boolean>(false);
  const [ocrExtractedSummary, setOcrExtractedSummary] = useState<string>('');
  const [ocrCandidates, setOcrCandidates] = useState<string[]>([]);
  const [ocrRawText, setOcrRawText] = useState<string>('');
  const [showRawOcr, setShowRawOcr] = useState<boolean>(false);

  // Images & Stage 1 Preprocessing
  const [customDocImage, setCustomDocImage] = useState<string | null>(null);
  const [customDocImageName, setCustomDocImageName] = useState<string>('');
  const [preprocessedDocImage, setPreprocessedDocImage] = useState<string | null>(null);
  const [showPreprocessed, setShowPreprocessed] = useState<boolean>(false);
  const [isPreprocessing, setIsPreprocessing] = useState<boolean>(false);
  const [customFaceImage, setCustomFaceImage] = useState<string | null>(null);
  const [customFaceImageName, setCustomFaceImageName] = useState<string>('');

  // Threat & Tampering Simulation Toggles
  const [simulateTampering, setSimulateTampering] = useState<boolean>(false);
  const [simulateFaceMismatch, setSimulateFaceMismatch] = useState<boolean>(false);
  
  // Secondary Doc Concordance
  const [enableSecondaryDoc, setEnableSecondaryDoc] = useState<boolean>(false);
  const [secondaryName, setSecondaryName] = useState<string>('');
  const [secondaryDob, setSecondaryDob] = useState<string>('1998-05-12');

  // MRZ Lines
  const [mrzLine1, setMrzLine1] = useState<string>('');
  const [mrzLine2, setMrzLine2] = useState<string>('');
  const [isGeneratingMRZ, setIsGeneratingMRZ] = useState<boolean>(false);

  // File Input Refs
  const docFileRef = useRef<HTMLInputElement>(null);
  const faceFileRef = useRef<HTMLInputElement>(null);

  // Verhoeff Algorithm for Aadhaar (Module 2)
  const dTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];
  const pTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];

  const checkVerhoeff = (numStr: string): { valid: boolean; reason: string } => {
    const clean = numStr.replace(/[^0-9]/g, '');
    if (clean.length !== 12) {
      return { valid: false, reason: `Requires 12 digits (currently ${clean.length})` };
    }
    let c = 0;
    const rev = clean.split('').reverse().map(Number);
    for (let i = 0; i < rev.length; i++) {
      c = dTable[c][pTable[i % 8][rev[i]]];
    }
    return c === 0 
      ? { valid: true, reason: 'Valid Verhoeff D5 Checksum (UIDAI Specification)' }
      : { valid: false, reason: 'Verhoeff Checksum Mismatch (Mathematical Check Digit Invalid)' };
  };

  const checkPAN = (panStr: string, name: string): { valid: boolean; reason: string } => {
    const clean = panStr.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(clean)) {
      return { valid: false, reason: 'Must be 5 uppercase letters, 4 digits, 1 letter (e.g. ABCDE1234F)' };
    }
    const entityTypes: Record<string, string> = {
      P: 'Individual',
      C: 'Company',
      H: 'HUF',
      F: 'Firm/LLP',
      A: 'AOP',
      T: 'Trust'
    };
    const entity = entityTypes[clean[3]] || 'Unknown';
    if (name.trim()) {
      const parts = name.trim().split(/\s+/);
      const surname = parts[parts.length - 1].toUpperCase();
      if (clean[4] !== surname[0]) {
        return { valid: false, reason: `5th char (${clean[4]}) does not match surname initial '${surname[0]}'` };
      }
    }
    return { valid: true, reason: `Valid PAN Format (${entity})` };
  };

  const checkDL = (dlStr: string): { valid: boolean; reason: string } => {
    const clean = dlStr.trim().toUpperCase().replace(/[\s-]/g, '');
    if (/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(clean)) {
      return { valid: true, reason: `Valid Sarathi DL Format (State: ${clean.substring(0, 2)})` };
    }
    if (clean.length >= 15 && /^[A-Z]{2}/.test(clean)) {
      return { valid: true, reason: `Sarathi State Code: ${clean.substring(0, 2)} (Length OK)` };
    }
    return { valid: false, reason: 'Standard: 2-letter state + 2-digit RTO + 4-digit year + 7 digits' };
  };

  const handleSelectPreset = (presetId: 'VD-10241' | 'VD-10240' | 'VD-10242') => {
    setSelectedPreset(presetId);
    setPassportUploaded(true);
    setVisaUploaded(presetId === 'VD-10240');
    setNationalIdUploaded(true);
    setFaceCaptured(true);
  };

  const handleStartPresetScreening = () => {
    onStartAnalysis(selectedPreset);
  };

  const handleSwitchToCustomUpload = () => {
    setIntakeMode('custom');
    setTimeout(() => {
      docFileRef.current?.click();
    }, 100);
  };

  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomDocImageName(file.name);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const b64 = event.target?.result as string;
        setCustomDocImage(b64);

        // 1. Stage 1: OpenCV Preprocessing in parallel
        setIsPreprocessing(true);
        try {
          const preproc = await apiService.preprocessDocument(b64);
          if (preproc && preproc.processed_b64) {
            setPreprocessedDocImage(`data:image/jpeg;base64,${preproc.processed_b64}`);
          }
        } catch {
          // graceful fallback
        } finally {
          setIsPreprocessing(false);
        }

        // 2. Stage 2: Intelligent AI OCR Auto-Extraction
        setIsOcrRunning(true);
        setOcrSuccess(false);
        setOcrStatusText('Neural OCR extracting text, document number, and name...');
        try {
          const ocrData = await extractDocumentDataFromImage(file, (_pct, status) => {
            setOcrStatusText(status);
          });

          if (ocrData) {
            const detectedItems: string[] = [];

            if (ocrData.documentType) {
              setCustomDocType(ocrData.documentType);
              detectedItems.push(`Type: ${ocrData.documentType}`);
              if (ocrData.documentType === 'Aadhaar' || ocrData.documentType === 'PAN') {
                setCustomExpiry('2099-12-31');
              }
            }

            if (ocrData.documentNumber) {
              setCustomDocNumber(ocrData.documentNumber);
              detectedItems.push(`Number: ${ocrData.documentNumber}`);
            }

            if (ocrData.candidateNames && ocrData.candidateNames.length > 0) {
              setOcrCandidates(ocrData.candidateNames);
            } else if (ocrData.fullName) {
              setOcrCandidates([ocrData.fullName]);
            } else {
              setOcrCandidates([]);
            }

            if (ocrData.rawText) {
              setOcrRawText(ocrData.rawText);
            }

            if (ocrData.fullName) {
              setCustomFullName(ocrData.fullName);
              detectedItems.push(`Name: ${ocrData.fullName}`);
            } else {
              // Fallback to clean file name only if it resembles a real person name (and not a document label)
              const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim();
              const isDocFile = /\b(aadhaar|adhar|pan|passport|license|licence|visa|card|front|back|copy|download|temp|screen|shot|screenshot|photo|image|scan|doc|file|upload|attachment|my)\b/i.test(cleanFileName);
              if (cleanFileName.length > 2 && !isDocFile && !/^(img|dsc|sample|test|\d+)/i.test(cleanFileName)) {
                const titleName = cleanFileName.replace(/\b\w/g, (c) => c.toUpperCase());
                setCustomFullName(titleName);
                detectedItems.push(`Name: ${titleName}`);
              }
            }

            if (ocrData.dob) {
              setCustomDob(ocrData.dob);
              detectedItems.push(`DOB: ${ocrData.dob}`);
            }

            if (ocrData.expiryDate) {
              setCustomExpiry(ocrData.expiryDate);
              detectedItems.push(`Expiry: ${ocrData.expiryDate}`);
            } else if (ocrData.documentType === 'Passport') {
              const defaultExp = '2034-08-20';
              setCustomExpiry(defaultExp);
              detectedItems.push(`Expiry: ${defaultExp}`);
            }

            if (ocrData.gender) {
              setCustomGender(ocrData.gender);
            }

            if (detectedItems.length > 0) {
              setOcrSuccess(true);
              setOcrExtractedSummary(detectedItems.join(' • '));
            }
          }
        } catch (err) {
          console.warn('OCR auto-extract error:', err);
        } finally {
          setIsOcrRunning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFaceImageName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomFaceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadDoctoredSample = () => {
    setCustomDocType('Passport');
    setCustomFullName('Rahul Sharma');
    setCustomDocNumber('P1234567');
    setCustomNationality('IND');
    setCustomDob('2001-05-12');
    setCustomExpiry('2031-05-12');
    setCustomDocImage('https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&h=420&fit=crop');
    setCustomDocImageName('doctored_passport_scan.jpg');
    setCustomFaceImage('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=380&fit=crop&crop=face');
    setCustomFaceImageName('checkpoint_cam_live.jpg');
    setSimulateTampering(true);
    setSimulateFaceMismatch(true);
    setEnableSecondaryDoc(true);
    setSecondaryName('Rahul Sharma');
    setSecondaryDob('1998-05-12'); // Mismatched DOB -> FAKE
  };

  const handleLoadGenuineSample = () => {
    setCustomDocType('Passport');
    setCustomFullName('Priya Nair');
    setCustomDocNumber('P8892104');
    setCustomNationality('IND');
    setCustomDob('1995-02-14');
    setCustomExpiry('2034-08-20');
    setCustomDocImage('https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&h=420&fit=crop');
    setCustomDocImageName('genuine_passport_scan.jpg');
    setCustomFaceImage('https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&h=380&fit=crop&crop=face');
    setCustomFaceImageName('checkpoint_cam_live.jpg');
    setSimulateTampering(false);
    setSimulateFaceMismatch(false);
    setEnableSecondaryDoc(false);
  };

  const handleLoadExpiredSample = () => {
    setCustomDocType('Passport');
    setCustomFullName('John Smith');
    setCustomDocNumber('P2000001');
    setCustomNationality('USA');
    setCustomDob('1980-01-01');
    setCustomExpiry('2023-01-01'); // Expired!
    setSimulateTampering(false);
    setSimulateFaceMismatch(false);
    setEnableSecondaryDoc(false);
  };

  const handleAutoGenerateMRZ = async () => {
    setIsGeneratingMRZ(true);
    const mrz = await apiService.generateMRZ({
      fullName: customFullName,
      nationality: customNationality,
      documentNumber: customDocNumber,
      dob: customDob,
      expiry: customExpiry,
      sex: customGender,
    });
    if (mrz) {
      setMrzLine1(mrz.line1);
      setMrzLine2(mrz.line2);
    }
    setIsGeneratingMRZ(false);
  };

  const handleCorruptMRZ = () => {
    if (mrzLine2.length > 5) {
      const corrupt = mrzLine2.slice(0, 4) + '9' + mrzLine2.slice(5);
      setMrzLine2(corrupt);
    }
  };

  const handleStartCustomScreening = () => {
    const isIndianLifetime = customDocType === 'Aadhaar' || customDocType === 'PAN';
    const finalName = customFullName.trim() || (customDocImageName ? customDocImageName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Verified Traveler');
    const finalDocNum = customDocNumber.trim().toUpperCase() || (
      customDocType === 'Aadhaar' ? '234567890128' :
      customDocType === 'PAN' ? 'ABCDE1234F' :
      customDocType === 'Driving License' ? 'DL0420110012345' :
      'P' + Math.floor(1000000 + Math.random() * 9000000)
    );
    const finalExpiry = isIndianLifetime
      ? '2099-12-31'
      : (customExpiry && customExpiry !== '2099-12-31' ? customExpiry : '2034-08-20');
    
    // Generate valid dynamic MRZ matching the traveler credentials with ICAO 9303 7-3-1 check digits
    const countryCode = (customNationality || 'IND').toUpperCase().slice(0, 3).padEnd(3, '<');
    const nameParts = finalName.split(/\s+/).filter(Boolean);
    const sur = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : (nameParts[0] || 'TRAVELER').toUpperCase();
    const giv = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ').toUpperCase() : '';
    const generatedLine1 = `P<${countryCode}${sur}<<${giv.replace(/\s+/g, '<')}`.padEnd(44, '<').slice(0, 44);

    const calcIcaoCheck = (data: string): number => {
      const weights = [7, 3, 1];
      let total = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data[i].toUpperCase();
        let val = 0;
        if (char >= '0' && char <= '9') val = parseInt(char, 10);
        else if (char >= 'A' && char <= 'Z') val = char.charCodeAt(0) - 65 + 10;
        total += val * weights[i % 3];
      }
      return total % 10;
    };

    const toYYMMDD = (dateStr: string, fallback: string): string => {
      if (!dateStr) return fallback;
      const clean = dateStr.replace(/[\s/.]/g, '-');
      const parts = clean.split('-');
      let y = '', m = '', d = '';
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          y = parts[0]; m = parts[1]; d = parts[2];
        } else if (parts[2].length === 4) {
          d = parts[0]; m = parts[1]; y = parts[2];
        }
      }
      if (y && m && d) {
        return `${y.slice(-2)}${m.padStart(2, '0')}${d.padStart(2, '0')}`;
      }
      const digits = dateStr.replace(/[^0-9]/g, '');
      return digits.length >= 6 ? digits.slice(-6) : fallback;
    };

    const cleanDob = toYYMMDD(customDob, '980512');
    const cleanExp = toYYMMDD(finalExpiry, '340820');

    const doc9 = finalDocNum.padEnd(9, '<').slice(0, 9);
    const docCd = calcIcaoCheck(doc9);
    const dobCd = calcIcaoCheck(cleanDob);
    const expCd = calcIcaoCheck(cleanExp);
    const optionalData = '<<<<<<<<<<<<<<';
    const compData = `${doc9}${docCd}${cleanDob}${dobCd}${cleanExp}${expCd}${optionalData}`;
    const compCd = calcIcaoCheck(compData);

    const generatedLine2 = `${doc9}${docCd}${countryCode}${cleanDob}${dobCd}${customGender || 'M'}${cleanExp}${expCd}${optionalData}${compCd}`.padEnd(44, '<').slice(0, 44);

    const input: CustomScreeningInput = {
      documentType: customDocType,
      documentNumber: finalDocNum,
      fullName: finalName,
      nationality: customNationality || 'IND',
      dob: customDob || '1995-01-01',
      expiryDate: finalExpiry,
      gender: customGender,
      imageBase64: customDocImage || undefined,
      faceImageBase64: customFaceImage || undefined,
      simulateTampered: simulateTampering,
      simulateFaceMismatch: simulateFaceMismatch,
      secondaryDoc: enableSecondaryDoc ? {
        fullName: secondaryName.trim() || finalName,
        dob: secondaryDob || customDob,
        type: 'National ID',
        docNumber: 'NID-992011'
      } : undefined,
      mrzLine1: mrzLine1 && mrzLine1.length === 44 ? mrzLine1 : generatedLine1,
      mrzLine2: mrzLine2 && mrzLine2.length === 44 ? mrzLine2 : generatedLine2,
    };
    onStartAnalysis('VD-CUSTOM', input);
  };

  const isExpired = (customDocType === 'Aadhaar' || customDocType === 'PAN') 
    ? false 
    : Boolean(customExpiry && new Date(customExpiry) < new Date());

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <ScanLine className="w-3.5 h-3.5" />
            <span>Operational Screening Pipeline</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Traveler Screening & Document Intake
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Stage 1: Ingest primary travel documents and passenger facial biometrics for AI real vs. fake inspection
          </p>
        </div>

        {/* Master Intake Mode Switcher */}
        <div className="flex bg-slate-900 border border-slate-700/80 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setIntakeMode('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              intakeMode === 'custom'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-cyan-300" />
            <span>Upload Custom Input</span>
            <span className="bg-cyan-400/20 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded font-bold border border-cyan-400/40">
              LIVE
            </span>
          </button>

          <button
            onClick={() => setIntakeMode('presets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              intakeMode === 'presets'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Demo Presets</span>
          </button>
        </div>
      </div>

      {intakeMode === 'presets' ? (
        <>
          {/* Preset Details Summary Strip */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Selected Subject:</span>
              <span className="font-bold text-white font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {currentCase.traveler.name} ({currentCase.traveler.nationality})
              </span>
              <span className="text-slate-400 hidden sm:inline">Doc No:</span>
              <span className="font-mono text-cyan-400 hidden sm:inline">{currentCase.traveler.documentNumber}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Simulated Scenario:</span>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${
                  selectedPreset === 'VD-10241'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : selectedPreset === 'VD-10240'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {selectedPreset === 'VD-10241'
                  ? 'Photo Tampering + Biometric Mismatch (Rahul Sharma Demo)'
                  : selectedPreset === 'VD-10240'
                  ? 'Visa Imminent Expiry + Name Variance (Amit Patel Demo)'
                  : 'Clean Traveler (100% Genuine - Priya Nair Demo)'}
              </span>
            </div>
          </div>

          {/* Explicit User Guidance Banner */}
          <div className="bg-amber-950/40 border border-amber-500/50 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center gap-2.5 text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Notice:</span> You are inspecting <strong>pre-configured mock demo personas</strong> for judge evaluation ({currentCase.traveler.name}).
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  To analyze your actual document image and let AI extract your real data via OCR, use the <strong>Upload Custom Input</strong> tab.
                </p>
              </div>
            </div>
            <button
              onClick={handleSwitchToCustomUpload}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs shrink-0 cursor-pointer flex items-center gap-2 shadow-md"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Your Document (Live AI)
            </button>
          </div>

          {/* Upload Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Passport Upload */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Passport</h3>
                      <p className="text-[11px] text-slate-400">Primary ID Document</p>
                    </div>
                  </div>
                  {passportUploaded && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div
                  onClick={handleSwitchToCustomUpload}
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[170px] ${
                    passportUploaded
                      ? 'border-cyan-500/40 bg-cyan-950/10 hover:border-cyan-400'
                      : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
                  }`}
                  title="Click to upload your own document instead of demo preset"
                >
                  {passportUploaded ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="w-16 h-20 rounded bg-slate-800 border border-slate-700 overflow-hidden relative shadow">
                        <img
                          src={currentCase.traveler.photoUrl}
                          alt="Passport"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-cyan-500/10" />
                      </div>
                      <div className="text-xs font-mono text-cyan-300 font-semibold truncate max-w-full">
                        {currentCase.traveler.documentNumber}_PASSPORT.JPG
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono underline">Click to upload custom file &rarr;</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      <div className="text-xs font-medium text-slate-300">Upload Passport Image</div>
                      <div className="text-[10px] text-slate-500">Drag & drop or browse</div>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                        ICAO TD3 Standard
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>OCR Pipeline</span>
                <span className="font-mono text-cyan-400">ICAO 9303</span>
              </div>
            </div>

            {/* Card 2: Visa Upload */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Entry Visa</h3>
                      <p className="text-[11px] text-slate-400">Secondary Entry Permit</p>
                    </div>
                  </div>
                  {visaUploaded && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div
                  onClick={() => setVisaUploaded(!visaUploaded)}
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[170px] ${
                    visaUploaded
                      ? 'border-indigo-500/40 bg-indigo-950/10'
                      : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
                  }`}
                >
                  {visaUploaded ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="w-20 h-14 rounded bg-slate-800 border border-slate-700 p-1 flex flex-col justify-center text-left text-[9px] font-mono shadow">
                        <div className="text-cyan-400 font-bold">VISA MRV-A</div>
                        <div className="text-slate-400">VAL: 30 DAYS</div>
                        <div className="text-amber-400 text-[8px]">EXP: 15/09/2026</div>
                      </div>
                      <div className="text-xs font-mono text-indigo-300 font-semibold">
                        VISA_PERMIT_SCAN.JPG
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">✓ V-Type Match</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      <div className="text-xs font-medium text-slate-300">Upload Entry Visa</div>
                      <div className="text-[10px] text-slate-500">Optional secondary doc</div>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                        MRV-A Format
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Validation Layer</span>
                <span className="font-mono text-indigo-400">Entry Authority</span>
              </div>
            </div>

            {/* Card 3: National ID Upload */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">National ID</h3>
                      <p className="text-[11px] text-slate-400">Secondary Cross-Verify</p>
                    </div>
                  </div>
                  {nationalIdUploaded && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div
                  onClick={handleSwitchToCustomUpload}
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[170px] ${
                    nationalIdUploaded
                      ? 'border-blue-500/40 bg-blue-950/10 hover:border-blue-400'
                      : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
                  }`}
                  title="Click to upload your own National ID/Aadhaar instead of demo preset"
                >
                  {nationalIdUploaded ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="w-20 h-14 rounded bg-slate-800 border border-slate-700 p-1 flex flex-col justify-center text-left text-[9px] font-mono shadow">
                        <div className="text-amber-400 font-bold">AADHAAR / ID</div>
                        <div className="text-slate-400">UID: ****-****-4921</div>
                        <div className="text-slate-300 text-[8px]">{currentCase.secondaryDoc?.dob || '12/05/1998'}</div>
                      </div>
                      <div className="text-xs font-mono text-blue-300 font-semibold">
                        NATIONAL_ID_SCAN.JPG
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono underline">Click to upload custom file &rarr;</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      <div className="text-xs font-medium text-slate-300">Upload National ID</div>
                      <div className="text-[10px] text-slate-500">Drag & drop or browse</div>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                        Aadhaar / Citizen ID
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Cross-Check Base</span>
                <span className="font-mono text-blue-400">DOB & Name</span>
              </div>
            </div>

            {/* Card 4: Live Face Capture */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Live Face</h3>
                      <p className="text-[11px] text-slate-400">Biometric Verification</p>
                    </div>
                  </div>
                  {faceCaptured && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div
                  onClick={() => setFaceCaptured(!faceCaptured)}
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[170px] ${
                    faceCaptured
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
                  }`}
                >
                  {faceCaptured ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500/60 overflow-hidden relative shadow">
                        <img
                          src={currentCase.traveler.livePhotoUrl}
                          alt="Live Face"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 border border-cyan-400/40 rounded-full" />
                      </div>
                      <div className="text-xs font-mono text-emerald-300 font-semibold">
                        PORTAL_CAM_LIVE.RAW
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">✓ 3D Liveness Confirmed</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      <div className="text-xs font-medium text-slate-300">Capture / Upload Face</div>
                      <div className="text-[10px] text-slate-500">Webcam snap or portrait</div>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                        Biometric E-Gate Sync
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Biometric Standard</span>
                <span className="font-mono text-emerald-400">128D FaceNet</span>
              </div>
            </div>
          </div>

          {/* Action Footer: Preset Screening Button */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-wide">
                  Ready to Dispatch Preset to VeriDoc AI Screening Engine
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated OCR, ICAO validation, tampering heatmaps, facial similarity, and national database check
                </p>
              </div>
            </div>

            <button
              onClick={handleStartPresetScreening}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-cyan-950/50 text-sm tracking-wide flex items-center justify-center gap-3 transition-all cursor-pointer ring-2 ring-cyan-400/20"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Start AI Screening</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        /* CUSTOM INTAKE & LIVE AI TESTING VIEW */
        <div className="flex flex-col gap-6">
          {/* Quick Preloader & Instruction Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Live Document & Biometric Upload Bay
                </h4>
                <p className="text-xs text-slate-400">
                  Upload actual document files or adjust traveler parameters to test whether VeriDoc AI classifies credentials as <strong className="text-emerald-400">Real</strong> or <strong className="text-rose-400">Fake</strong>.
                </p>
              </div>
            </div>

            {/* Quick Sample Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Load Sample:</span>
              <button
                type="button"
                onClick={handleLoadDoctoredSample}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/70 border border-rose-600/40 text-rose-300 hover:bg-rose-900/80 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                🚨 Doctored (Fake)
              </button>
              <button
                type="button"
                onClick={handleLoadGenuineSample}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/80 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                ✅ Clean (Real)
              </button>
              <button
                type="button"
                onClick={handleLoadExpiredSample}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 border border-amber-600/40 text-amber-300 hover:bg-amber-900/80 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                ⚠️ Expired
              </button>
            </div>
          </div>

          {/* Dual File Upload Bay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bay 1: Primary Document Image Upload */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between group hover:border-cyan-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">1. Document Image (Passport/ID)</h3>
                      <p className="text-[11px] text-slate-400">Target for Error Level Analysis (ELA)</p>
                    </div>
                  </div>
                  {customDocImage && (
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      IMAGE LOADED
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={docFileRef}
                  accept="image/*"
                  onChange={handleDocFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => docFileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[200px] ${
                    customDocImage
                      ? 'border-cyan-500/50 bg-cyan-950/10'
                      : 'border-slate-700 bg-slate-950/70 hover:border-cyan-400/60 hover:bg-slate-900'
                  }`}
                >
                  {customDocImage ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="max-w-[260px] max-h-[150px] rounded-lg overflow-hidden border border-cyan-500/40 shadow-lg relative group">
                        <img
                          src={showPreprocessed && preprocessedDocImage ? preprocessedDocImage : customDocImage}
                          alt="Document Preview"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <span className="text-xs text-cyan-300 font-mono font-bold">Click to Replace</span>
                        </div>
                      </div>

                      {preprocessedDocImage && (
                        <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-[10px] font-mono mt-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setShowPreprocessed(false)}
                            className={`px-2 py-0.5 rounded transition-colors ${!showPreprocessed ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                          >
                            Raw Input
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPreprocessed(true)}
                            className={`px-2 py-0.5 rounded transition-colors ${showPreprocessed ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                          >
                            OpenCV Stage 1 (CLAHE)
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col items-center">
                        <span className="text-xs font-mono text-cyan-300 font-bold truncate max-w-[220px]">
                          {customDocImageName || 'custom_document.jpg'}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {isPreprocessing ? '⚙ Running OpenCV fastNlMeans + CLAHE...' : '✓ OpenCV Stage 1 Preprocessing Complete'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-slate-200">
                        Click or Drag & Drop Document Image
                      </span>
                      <span className="text-xs text-slate-400 max-w-[240px]">
                        Supports JPG, PNG, WEBP (Passport, Driver License, National ID)
                      </span>
                      <span className="bg-slate-900 text-cyan-400 text-[10px] font-mono px-2.5 py-1 rounded border border-slate-800 mt-1">
                        Select from your device
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Inspection Layer:</span>
                <span className="text-cyan-400">Pillow/NumPy 90% Quality Delta</span>
              </div>
            </div>

            {/* Bay 2: Live Passenger Face Biometric */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">2. Live Passenger Face / Selfie</h3>
                      <p className="text-[11px] text-slate-400">Biometric 128D Cosine Similarity</p>
                    </div>
                  </div>
                  {customFaceImage && (
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      FACE LOADED
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={faceFileRef}
                  accept="image/*"
                  onChange={handleFaceFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => faceFileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[200px] ${
                    customFaceImage
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : 'border-slate-700 bg-slate-950/70 hover:border-emerald-400/60 hover:bg-slate-900'
                  }`}
                >
                  {customFaceImage ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500/60 shadow-lg relative group">
                        <img
                          src={customFaceImage}
                          alt="Passenger Portrait"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <span className="text-[10px] text-emerald-300 font-mono font-bold">Replace</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-mono text-emerald-300 font-bold truncate max-w-[220px]">
                          {customFaceImageName || 'passenger_face.jpg'}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          ✓ 128D FaceNet Vector Ready (75% Match Threshold)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-slate-200">
                        Upload Passenger Selfie or Snapshot
                      </span>
                      <span className="text-xs text-slate-400 max-w-[240px]">
                        Used to verify whether the person presenting the document is the authentic owner
                      </span>
                      <span className="bg-slate-900 text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded border border-slate-800 mt-1">
                        Upload Portrait Image
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Biometric Engine:</span>
                <span className="text-emerald-400">128D Embedding Distance</span>
              </div>
            </div>
          </div>

          {/* Live AI OCR Progress Banner */}
          {isOcrRunning && (
            <div className="bg-cyan-950/40 border border-cyan-500/50 rounded-2xl p-4 flex items-center gap-3 animate-pulse shadow-lg shadow-cyan-950/30">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                    Stage 2 Neural OCR Active — Tesseract Engine
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">Scanning Document...</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 font-mono">
                  {ocrStatusText || 'Scanning optical characters, extracting document number, full legal name, and validity horizon...'}
                </p>
              </div>
            </div>
          )}

          {/* OCR Auto-Extraction Success Banner */}
          {ocrSuccess && !isOcrRunning && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-4 flex flex-col gap-3 shadow-lg shadow-emerald-950/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                        Neural OCR Auto-Extraction Successful
                      </span>
                      <span className="text-[10px] bg-emerald-900/80 text-emerald-200 border border-emerald-700 px-2 py-0.5 rounded font-mono font-bold">
                        Auto-Populated
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 font-mono font-semibold">
                      {ocrExtractedSummary}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Credentials have been automatically mapped below. You can verify or edit any field before running AI screening.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {ocrRawText && (
                    <button
                      type="button"
                      onClick={() => setShowRawOcr(!showRawOcr)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 cursor-pointer flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Inspect the exact lines of text detected by Tesseract"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showRawOcr ? 'Hide Raw OCR' : 'View OCR Text'}</span>
                    </button>
                  )}
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/90 px-2.5 py-1.5 rounded-lg border border-emerald-800 font-bold">
                    ✓ Ready to Screen
                  </span>
                </div>
              </div>

              {/* Multiple Candidate Names Selector */}
              {ocrCandidates && ocrCandidates.length > 1 && (
                <div className="pt-2.5 border-t border-emerald-900/60 flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400 text-[11px] font-semibold">
                    Detected Candidate Names:
                  </span>
                  {ocrCandidates.map((cand, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomFullName(cand)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        customFullName.toLowerCase() === cand.toLowerCase()
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm shadow-cyan-950/50'
                          : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-cyan-500 hover:text-white'
                      }`}
                    >
                      <span>{cand}</span>
                      {customFullName.toLowerCase() === cand.toLowerCase() && (
                        <Check className="w-3 h-3 text-cyan-200" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Raw OCR Text Dropdown */}
              {showRawOcr && ocrRawText && (
                <div className="mt-1 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap select-all shadow-inner">
                  <div className="flex items-center justify-between text-cyan-400 font-bold mb-1.5 pb-1 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                    <span>Raw Tesseract OCR Scanned Output</span>
                    <span className="text-slate-500 font-normal">Click any text or copy</span>
                  </div>
                  {ocrRawText}
                </div>
              )}
            </div>
          )}

          {/* Traveler Credentials Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Traveler & Document Credentials (Editable Inputs)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1.5 uppercase font-semibold">
                  Document Type:
                </label>
                <select
                  value={customDocType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setCustomDocType(newType);
                    if (newType === 'Aadhaar') {
                      setCustomExpiry('2099-12-31');
                      if (!customDocNumber || customDocNumber.startsWith('P') || customDocNumber.startsWith('DL')) {
                        setCustomDocNumber('234567890128');
                      }
                    } else if (newType === 'PAN') {
                      setCustomExpiry('2099-12-31');
                      if (!customDocNumber || customDocNumber.startsWith('P') || customDocNumber.startsWith('2345')) {
                        setCustomDocNumber('ABCDE1234F');
                      }
                    } else if (newType === 'Passport') {
                      if (customExpiry === '2099-12-31') {
                        setCustomExpiry('2034-08-20');
                      }
                      if (!customDocNumber || customDocNumber.startsWith('2345') || customDocNumber.startsWith('ABC') || customDocNumber.startsWith('DL')) {
                        setCustomDocNumber('P' + Math.floor(1000000 + Math.random() * 9000000));
                      }
                    } else if (newType === 'Driving License') {
                      if (customExpiry === '2099-12-31') {
                        setCustomExpiry('2038-06-15');
                      }
                      if (!customDocNumber || customDocNumber.startsWith('P') || customDocNumber.startsWith('2345')) {
                        setCustomDocNumber('DL0420110012345');
                      }
                    } else if (newType === 'Visa') {
                      if (customExpiry === '2099-12-31') {
                        setCustomExpiry('2028-12-31');
                      }
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Passport">Passport (ICAO TD3)</option>
                  <option value="Aadhaar">Aadhaar (12-Digit UIDAI Verhoeff)</option>
                  <option value="PAN">PAN Card (Income Tax Dept)</option>
                  <option value="Driving License">Driving License (Sarathi Vahan)</option>
                  <option value="Visa">Entry Visa (MRV-A)</option>
                  <option value="National ID">Other National ID</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-400 uppercase font-semibold">
                    Document Number:
                  </label>
                  {customDocType === 'Aadhaar' && (
                    <span className="text-[10px] text-cyan-400 font-bold">Verhoeff D5</span>
                  )}
                  {customDocType === 'PAN' && (
                    <span className="text-[10px] text-cyan-400 font-bold">ITD Format</span>
                  )}
                  {customDocType === 'Driving License' && (
                    <span className="text-[10px] text-cyan-400 font-bold">Sarathi</span>
                  )}
                </div>
                <input
                  type="text"
                  value={customDocNumber}
                  onChange={(e) => setCustomDocNumber(e.target.value.toUpperCase())}
                  placeholder={
                    customDocType === 'Aadhaar' ? '12 digits (e.g. 234567890128)' :
                    customDocType === 'PAN' ? '10 chars (e.g. ABCDE1234F)' :
                    customDocType === 'Driving License' ? 'e.g. DL0420110012345' :
                    'e.g. P1234567'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 uppercase"
                />

                {/* Real-Time Algorithmic Validation Feedback */}
                {customDocType === 'Aadhaar' && customDocNumber && (
                  <div className={`mt-1.5 text-[11px] font-mono flex items-center gap-1 ${
                    checkVerhoeff(customDocNumber).valid ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {checkVerhoeff(customDocNumber).valid ? '✓' : '✕'} {checkVerhoeff(customDocNumber).reason}
                  </div>
                )}
                {customDocType === 'PAN' && customDocNumber && (
                  <div className={`mt-1.5 text-[11px] font-mono flex items-center gap-1 ${
                    checkPAN(customDocNumber, customFullName).valid ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {checkPAN(customDocNumber, customFullName).valid ? '✓' : '✕'} {checkPAN(customDocNumber, customFullName).reason}
                  </div>
                )}
                {customDocType === 'Driving License' && customDocNumber && (
                  <div className={`mt-1.5 text-[11px] font-mono flex items-center gap-1 ${
                    checkDL(customDocNumber).valid ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {checkDL(customDocNumber).valid ? '✓' : '✕'} {checkDL(customDocNumber).reason}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 uppercase font-semibold">
                  Full Legal Name:
                </label>
                <input
                  type="text"
                  value={customFullName}
                  onChange={(e) => setCustomFullName(e.target.value)}
                  placeholder="e.g. Enter full name or name on document"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 uppercase font-semibold">
                  Nationality (ISO-3):
                </label>
                <input
                  type="text"
                  value={customNationality}
                  onChange={(e) => setCustomNationality(e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="e.g. IND, USA, GBR"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 font-bold focus:outline-none focus:border-cyan-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 uppercase font-semibold">
                  Date of Birth (DOB):
                </label>
                <input
                  type="date"
                  value={customDob}
                  onChange={(e) => setCustomDob(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {customDocType === 'Aadhaar' || customDocType === 'PAN' ? (
                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-semibold">
                    Document Expiry:
                  </label>
                  <div className="w-full bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-emerald-300 font-mono font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Lifetime Validity
                    </span>
                    <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700 font-mono">
                      {customDocType === 'Aadhaar' ? 'UIDAI Statutory' : 'ITD Sec 139A'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Indian {customDocType} cards do not expire by law.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-400 uppercase font-semibold">
                      Expiration Date:
                    </label>
                    {isExpired && (
                      <span className="text-[10px] text-rose-400 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800">
                        EXPIRED!
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                    className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 focus:outline-none ${
                      isExpired
                        ? 'border-rose-500 text-rose-300 font-bold'
                        : 'border-slate-700 text-slate-200 focus:border-cyan-500'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Forensic Simulation & MRZ Testing Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: ICAO Doc 9303 MRZ Engine */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    ICAO Doc 9303 MRZ Checksum Testing
                  </h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleAutoGenerateMRZ}
                    disabled={isGeneratingMRZ}
                    className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono hover:bg-cyan-900 transition-colors cursor-pointer"
                  >
                    {isGeneratingMRZ ? 'Computing...' : '⚡ Re-Generate Valid MRZ'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCorruptMRZ}
                    className="px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-mono hover:bg-rose-900 transition-colors cursor-pointer"
                  >
                    💥 Corrupt 1 Digit
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Line 1 (44 chars):</span>
                  <input
                    type="text"
                    value={mrzLine1}
                    onChange={(e) => setMrzLine1(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-cyan-400 font-bold text-[11px] tracking-widest mt-1 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Line 2 (44 chars):</span>
                  <input
                    type="text"
                    value={mrzLine2}
                    onChange={(e) => setMrzLine2(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-cyan-400 font-bold text-[11px] tracking-widest mt-1 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 Tip: The 7-3-1 weighting algorithm recalculates check digits over passport number, DOB, and expiry. Any optical character manipulation will be caught!
                </p>
              </div>
            </div>

            {/* Box 2: Cross-Doc Concordance & Threat Simulation */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Threat Simulation & Concordance Overrides
                  </h4>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Photo Tampering Toggle */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={simulateTampering}
                        onChange={(e) => setSimulateTampering(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Simulate ELA Photo Splicing (+35 pts)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Simulates compression delta & doctored bounding box
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      simulateTampering ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-slate-500'
                    }`}>
                      {simulateTampering ? 'ACTIVE' : 'OFF'}
                    </span>
                  </label>

                  {/* Face Impersonation Toggle */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={simulateFaceMismatch}
                        onChange={(e) => setSimulateFaceMismatch(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Simulate Biometric Face Mismatch (+70 pts)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Simulates impersonation (cosine match &lt; 50%)
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      simulateFaceMismatch ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-slate-500'
                    }`}>
                      {simulateFaceMismatch ? 'ACTIVE' : 'OFF'}
                    </span>
                  </label>

                  {/* Cross-Document Checkbox */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={enableSecondaryDoc}
                        onChange={(e) => setEnableSecondaryDoc(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Cross-Validate with Secondary ID
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Checks for DOB or Name disparity across documents
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      enableSecondaryDoc ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'text-slate-500'
                    }`}>
                      {enableSecondaryDoc ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </label>

                  {enableSecondaryDoc && (
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500">Secondary ID Name:</label>
                        <input
                          type="text"
                          value={secondaryName}
                          onChange={(e) => setSecondaryName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Secondary ID DOB:</label>
                        <input
                          type="text"
                          value={secondaryDob}
                          onChange={(e) => setSecondaryDob(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-[11px]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Master Start Button for Custom Screening */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-wide">
                  Ready to Determine Real vs. Fake with AI
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sends credentials to Python Backend (Port 5000) for ELA, ICAO check digit, and biometric scoring
                </p>
              </div>
            </div>

            <button
              onClick={handleStartCustomScreening}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-cyan-950/50 text-sm tracking-wide flex items-center justify-center gap-3 transition-all cursor-pointer ring-2 ring-cyan-400/20"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Analyze & Determine Real vs Fake</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

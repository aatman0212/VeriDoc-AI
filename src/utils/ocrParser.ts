import { createWorker } from 'tesseract.js';

export interface ExtractedDocumentData {
  documentType?: 'Aadhaar' | 'PAN' | 'Passport' | 'Driving License' | 'Visa' | 'National ID';
  documentNumber?: string;
  fullName?: string;
  candidateNames?: string[];
  dob?: string;
  expiryDate?: string;
  gender?: 'M' | 'F' | 'Other';
  rawText: string;
  confidence: number;
}

const MONTHS_MAP: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
};

function normalizeDateString(raw: string): string {
  if (!raw) return '';
  const clean = raw.trim().replace(/[\s/.]+/g, '-').replace(/^[-]+|[-]+$/g, '');
  const parts = clean.split('-');
  if (parts.length === 3) {
    let day = parts[0].padStart(2, '0');
    let monthPart = parts[1].toUpperCase();
    let year = parts[2];

    // If format was YYYY-MM-DD
    if (parts[0].length === 4) {
      year = parts[0];
      monthPart = parts[1].toUpperCase();
      day = parts[2].padStart(2, '0');
    }

    let month = MONTHS_MAP[monthPart.slice(0, 3)] || monthPart.padStart(2, '0');
    if (year.length === 2) {
      const yy = parseInt(year, 10);
      year = (yy <= 50 ? '20' : '19') + year;
    }
    if (parseInt(month, 10) > 12) {
      const tmp = day; day = month; month = tmp;
    }
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return '';
}

// Complete dictionary of Indian government institutional headers, titles, and non-name terms
// Complete dictionary of Indian government institutional headers, titles, and non-name terms
const INSTITUTIONAL_STOPWORDS = new Set([
  // Government & Authority
  'GOVERNMENT', 'GOVT', 'INDIA', 'BHARAT', 'SARKAR', 'UNIQUE', 'IDENTIFICATION',
  'AUTHORITY', 'UIDAI', 'AADHAAR', 'ADHAR', 'MERI', 'PEHCHAN', 'PEHCHAAN', 'MERA',
  'AAM', 'AADMI', 'ADHIKAR', 'ENROLMENT', 'ENROLLMENT', 'VID', 'HELP', 'LINE',
  'INCOME', 'TAX', 'DEPARTMENT', 'DEPT', 'PERMANENT', 'ACCOUNT', 'NUMBER', 'CARD',
  'MINISTRY', 'COMMUNICATIONS', 'ELECTRONICS', 'INFORMATION', 'TECHNOLOGY',
  'EXTERNAL', 'AFFAIRS', 'SEVA', 'KENDRA', 'OFFICE', 'REGIONAL', 'COMMISSION',

  // Field Labels (CRITICAL: Never allow field labels to be extracted as names!)
  'NAME', 'NAMES', 'GIVEN', 'SURNAME', 'PRENOM', 'PRENOMS', 'NOM', 'NOMS',
  'HOLDER', 'BEARER', 'SIGNATURE', 'PHOTO', 'PHOTOGRAPH', 'DIGITAL', 'SIGNED',
  'FATHER', 'FATHERS', 'HUSBAND', 'HUSBANDS', 'MOTHER', 'MOTHERS', 'WIFE', 'WIFES',
  'GUARDIAN', 'SON', 'DAUGHTER', 'CARE', 'RELATIVE', 'RELATION',
  'DOB', 'DATE', 'BIRTH', 'YEAR', 'YOB', 'SEX', 'GENDER', 'MALE', 'FEMALE', 'TRANSGENDER',
  'PURUSH', 'MAHILA', 'NATIONALITY', 'NATIONALITE', 'CITIZEN', 'CITIZENSHIP', 'INDIAN',
  'COUNTRY', 'CODE', 'TYPE', 'PLACE', 'LIEU', 'NAISSANCE', 'DELIVRANCE',
  'ISSUE', 'EXPIRY', 'EXPIRATION', 'EXPIRE', 'VALID', 'VALIDITY', 'UNTIL', 'UPTO', 'LIFETIME',
  'PASSPORT', 'REPUBLIC', 'NATIONAL', 'IDENTITY', 'LICENCE', 'LICENSE', 'TRANSPORT',
  'DRIVING', 'AUTHORISED', 'VEHICLE', 'ISSUED', 'AUTHORITY', 'JANMA', 'TARIKH', 'TITHI',
  'DOWNLOAD', 'GENERATION', 'COMMISSIONER', 'STATE', 'UNION', 'DISTRICT', 'DIST', 'PIN',
  'PINCODE', 'ADDRESS', 'VILLAGE', 'TALUK', 'TEHSIL', 'CITY', 'ROAD', 'STREET', 'LANE', 'NAGAR',

  // Watermarks, sample words, site names
  'SAMPLE', 'SPECIMEN', 'TEST', 'DEMO', 'WATERMARK', 'COPY', 'DUPLICATE',
  'IMMIHELP', 'COM', 'WWW', 'HTTP', 'HTTPS', 'SCAN', 'DOC', 'DOCUMENT', 'IMAGE'
]);

// Words indicative of postal addresses (must never be selected as a person's name)
const ADDRESS_KEYWORDS = new Set([
  'ROAD', 'STREET', 'NAGAR', 'MARG', 'LANE', 'COLONY', 'ENCLAVE', 'VIHAR',
  'APARTMENT', 'APT', 'SECTOR', 'PLOT', 'HOUSE', 'FLOOR', 'BLDG', 'BUILDING',
  'BEHIND', 'NEAR', 'OPP', 'OPPOSITE', 'VILLAGE', 'POST', 'PO', 'DIST', 'DISTRICT',
  'DELHI', 'MUMBAI', 'BANGALORE', 'BENGALURU', 'HYDERABAD', 'CHENNAI', 'KOLKATA',
  'PUNE', 'AHMEDABAD', 'JAIPUR', 'SURAT', 'LUCKNOW', 'KANPUR', 'NAGPUR', 'INDORE',
  'THANE', 'BHOPAL', 'VISAKHAPATNAM', 'PATNA', 'VADODARA', 'GHAZIABAD', 'LUDHIANA',
  'AGRA', 'NASHIK', 'FARIDABAD', 'MEERUT', 'RAJKOT', 'VARANASI', 'SRINAGAR', 'AURANGABAD',
  'DHANBAD', 'AMRITSAR', 'NAVI', 'ALLAHABAD', 'RANCHI', 'HOWRAH', 'COIMBATORE', 'JABALPUR',
  'GWALIOR', 'VIJAYAWADA', 'JODHPUR', 'MADURAI', 'RAIPUR', 'KOTA', 'GUWAHATI', 'CHANDIGARH',
  'SOLAPUR', 'HUBBALLI', 'DHARWAD', 'BAREILLY', 'MORADABAD', 'MYSORE', 'GURGAON', 'GURUGRAM',
  'ALIGARH', 'JALANDHAR', 'TIRUCHIRAPPALLI', 'BHUBANESWAR', 'SALEM', 'WARANGAL', 'MIRA',
  'BHAYANDAR', 'THIRUVANANTHAPURAM', 'BHIWANDI', 'SAHARANPUR', 'GORAKHPUR', 'GUNTUR', 'BIKANER',
  'AMRAVATI', 'NOIDA', 'JAMSHEDPUR', 'BHILAI', 'CUTTACK', 'FIROZABAD', 'KOCHI', 'NELLORE',
  'BHAVNAGAR', 'DEHRADUN', 'DURGAPUR', 'ASANSOL', 'ROURKELA', 'NANDED', 'KOLHAPUR', 'AJMER',
  'AKOLA', 'GULBARGA', 'JAMNAGAR', 'UJJAIN', 'LONAVALA', 'PANVEL', 'VASAI', 'VIRAR',
  'PINCODE', 'PIN', 'CODE', 'TALUK', 'TEHSIL', 'THANA', 'BLOCK', 'GRAM', 'PANCHAYAT',
  'STATE', 'PRADESH', 'KERALA', 'KARNATAKA', 'MAHARASHTRA', 'GUJARAT', 'RAJASTHAN',
  'PUNJAB', 'HARYANA', 'BIHAR', 'BENGAL', 'ODISHA', 'ASSAM', 'TELANGANA', 'ANDHRA',
  'TAMIL', 'NADU', 'UTTARAKHAND', 'JHARKHAND', 'CHHATTISGARH', 'GOA'
]);

/**
 * Preprocesses image using HTML5 Canvas:
 * - Upscales low-res crops to minimum 1200px width
 * - Applies grayscale + S-curve adaptive contrast to maximize OCR sharpness
 */
async function preprocessImageForOCR(imageSource: string | File): Promise<string | File> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return imageSource;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width < 1200) {
          const ratio = 1200 / width;
          width = 1200;
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageSource);

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const d = imgData.data;

        // Grayscale conversion with contrast stretch
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          // S-curve contrast boost
          let boosted = (gray - 128) * 1.3 + 128;
          boosted = Math.max(0, Math.min(255, boosted));
          d[i] = boosted;
          d[i + 1] = boosted;
          d[i + 2] = boosted;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        resolve(imageSource);
      }
    };
    img.onerror = () => resolve(imageSource);

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource);
    }
  });
}

function cleanCandidate(raw: string): string {
  if (!raw) return '';
  // Strip non-Latin scripts (Devanagari \u0900-\u097F, Bengali, Gujarati, Tamil, Telugu, etc.)
  let s = raw.replace(/[\u0900-\u0D7F]/g, '');
  // Strip edge OCR artifacts (| / \ : ~ - _ 1. etc.)
  s = s.replace(/^[\s|/\\:~._\d-]+/, '').replace(/[\s|/\\:~._\d-]+$/, '');
  // Keep only letters, spaces, and standard name characters (. and ')
  s = s.replace(/[^A-Za-z\s.']/g, ' ');
  // Normalize spaces
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function isAddressLine(text: string): boolean {
  const words = text.toUpperCase().split(/\s+/);
  let addressCount = 0;
  for (const w of words) {
    if (ADDRESS_KEYWORDS.has(w)) addressCount++;
  }
  return addressCount >= 1;
}

function hasVowel(word: string): boolean {
  return /[aeiouyAEIOUY]/.test(word);
}

function isProbableName(raw: string): boolean {
  if (!raw || raw.length < 3 || raw.length > 45) return false;
  if (/[0-9]/.test(raw)) return false;
  if (/(?:\.com|\.in|\.org|http|www)/i.test(raw)) return false;
  if (isAddressLine(raw)) return false;
  if (raw.includes('<')) return false;

  // Split on whitespace
  const rawWords = raw.trim().split(/\s+/).filter(Boolean);
  if (rawWords.length < 1 || rawWords.length > 5) return false;

  // Rule 1: Every word MUST begin with a capital letter (or be ALL CAPS).
  // Printed names on ID cards are NEVER lowercase like 'wef' or 'fe roeramae'
  for (const w of rawWords) {
    if (!/^[A-Z]/.test(w)) return false;
    // Reject internal camelCase noise like 'eC' or 'rO'
    if (/^[A-Z][a-z]+[A-Z]/.test(w)) return false;
  }

  // Rule 2: Clean punctuation from words
  const cleanWords = rawWords.map(w => w.replace(/[^A-Za-z]/g, '')).filter(Boolean);
  if (cleanWords.length < 1 || cleanWords.length > 5) return false;

  // Rule 3: Short words (<= 2 chars) check.
  // Reject multiple short noise fragments like 'Dai La A' or 'Ec A'
  const shortWords = cleanWords.filter(w => w.length <= 2);
  if (shortWords.length > 1) return false;
  if (cleanWords.length === 1 && cleanWords[0].length < 3) return false;

  // Rule 4: Stopwords and vowel structure
  for (const w of cleanWords) {
    const upper = w.toUpperCase();
    if (INSTITUTIONAL_STOPWORDS.has(upper)) return false;
    // Real names >= 3 chars MUST contain at least one vowel
    if (upper.length >= 3 && !hasVowel(upper)) return false;
    // Reject repeating consonants like 'Ff', 'Tt', 'Zz'
    if (/^([bcdfghjklmnpqrstvwxyz])\1+$/i.test(w)) return false;
  }

  return true;
}

function toTitleCase(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Intelligent Client-Side OCR Parser for Indian & International ID documents.
 * Employs multi-anchor entity extraction tailored for Aadhaar, PAN, DL, and Passports.
 */
export async function extractDocumentDataFromImage(
  imageSource: string | File,
  onProgress?: (progress: number, status: string) => void
): Promise<ExtractedDocumentData> {
  let worker = null;
  try {
    if (onProgress) onProgress(10, 'Enhancing document contrast & clarity...');
    const preprocessedSource = await preprocessImageForOCR(imageSource);

    if (onProgress) onProgress(25, 'Initializing neural OCR engine (WASM)...');
    worker = await createWorker('eng');

    if (onProgress) onProgress(45, 'Scanning optical characters & text regions...');
    const ret = await worker.recognize(preprocessedSource);
    const text = ret.data.text || '';
    const confidence = ret.data.confidence || 90;

    if (onProgress) onProgress(75, 'Parsing identity entities & Aadhaar anchors...');

    const extracted: ExtractedDocumentData = {
      rawText: text,
      confidence: Math.round(confidence),
      candidateNames: [],
    };

    const upperText = text.toUpperCase();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // 1. Detect Document Type
    if (
      upperText.includes('AADHAAR') ||
      upperText.includes('MERA AADHAAR') ||
      upperText.includes('UNIQUE IDENTIFICATION') ||
      upperText.includes('UIDAI') ||
      /\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b/.test(text)
    ) {
      extracted.documentType = 'Aadhaar';
    } else if (
      upperText.includes('INCOME TAX') ||
      upperText.includes('PERMANENT ACCOUNT NUMBER') ||
      upperText.includes('PAN CARD') ||
      /\b[A-Z]{5}[0-9]{4}[A-Z]\b/.test(upperText)
    ) {
      extracted.documentType = 'PAN';
    } else if (
      upperText.includes('DRIVING LICENCE') ||
      upperText.includes('UNION OF INDIA DRIVING') ||
      upperText.includes('TRANSPORT DEPARTMENT') ||
      /\b[A-Z]{2}[0-9]{2}[0-9]{11}\b/.test(upperText)
    ) {
      extracted.documentType = 'Driving License';
    } else if (
      upperText.includes('PASSPORT') ||
      upperText.includes('REPUBLIC OF INDIA') ||
      upperText.includes('P<IND') ||
      upperText.includes('TYPE P')
    ) {
      extracted.documentType = 'Passport';
    }

    // 2. Extract Document Number
    if (extracted.documentType === 'Aadhaar' || !extracted.documentNumber) {
      // 12-digit Aadhaar pattern (xxxx xxxx xxxx or xxxxxxxxxxxx)
      const aadhaarMatch = text.match(/\b([2-9]\d{3}\s?\d{4}\s?\d{4})\b/);
      if (aadhaarMatch) {
        extracted.documentNumber = aadhaarMatch[1].replace(/\s+/g, '');
        extracted.documentType = 'Aadhaar';
      }
    }

    if (extracted.documentType === 'PAN' || !extracted.documentNumber) {
      const panMatch = upperText.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
      if (panMatch) {
        extracted.documentNumber = panMatch[1];
        extracted.documentType = 'PAN';
      }
    }

    if (extracted.documentType === 'Passport' || !extracted.documentNumber) {
      const passMatch = upperText.match(/\b([A-PR-WY][0-9]{7,8})\b/);
      if (passMatch) {
        extracted.documentNumber = passMatch[1];
        extracted.documentType = 'Passport';
      }
    }

    if (extracted.documentType === 'Driving License' || !extracted.documentNumber) {
      const dlMatch = upperText.replace(/[\s-]/g, '').match(/\b([A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7})\b/);
      if (dlMatch) {
        extracted.documentNumber = dlMatch[1];
        extracted.documentType = 'Driving License';
      }
    }

    // 3. Extract Date of Birth (DOB)
    // Strategy 3a: Explicit DOB labels with flexible spacer (supports Hindi/French bilingual labels & colons/slashes/dots)
    const dobLabelPatterns = [
      /(?:DOB|Date\s*of\s*Birth|D\.O\.B|Date\s*de\s*naissance|जन्म\s*तिथि|जन्म\s*तारीख|जन्म|तारीख|Janma\s*Tithi)[^\d\n]{0,35}([0-3]?[0-9][\s/.-](?:[0-1]?[0-9]|[A-Za-z]{3,9})[\s/.-][12][09][0-9]{2})/i,
      /(?:DOB|Date\s*of\s*Birth|D\.O\.B|Date\s*de\s*naissance|जन्म\s*तिथि|जन्म\s*तारीख|जन्म|तारीख|Janma\s*Tithi)[^\d\n]{0,35}([12][09][0-9]{2}[\s/.-][0-1]?[0-9][\s/.-][0-3]?[0-9])/i,
    ];

    for (const pat of dobLabelPatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        const norm = normalizeDateString(match[1]);
        if (norm) {
          extracted.dob = norm;
          break;
        }
      }
    }

    // Strategy 3b: Year of Birth (YOB) for older Aadhaar cards
    if (!extracted.dob) {
      const yobMatch = text.match(/(?:Year\s*of\s*Birth|YOB|जन्म\s*वर्ष|Janma\s*Varsh)[^\d\n]{0,30}([12][09][0-9]{2})/i);
      if (yobMatch && yobMatch[1]) {
        extracted.dob = `${yobMatch[1]}-01-01`;
      }
    }

    // Strategy 3c: Passport MRZ Line 2 (chars 13-18: YYMMDD)
    if (!extracted.dob) {
      const strippedUpper = upperText.replace(/[\s]/g, '');
      const mrz2DobRegex = /[A-Z0-9<]{9}[0-9O][A-Z<]{3}([0-9O]{6})[0-9O][MF<XNHE1]/;
      const mrz2DobMatch = strippedUpper.match(mrz2DobRegex);
      if (mrz2DobMatch) {
        const rawDob = mrz2DobMatch[1].replace(/O/g, '0');
        const yy = parseInt(rawDob.slice(0, 2), 10);
        const mm = rawDob.slice(2, 4);
        const dd = rawDob.slice(4, 6);
        const currentYearShort = parseInt(new Date().getFullYear().toString().slice(-2), 10);
        const dobYear = (yy > currentYearShort ? '19' : '20') + rawDob.slice(0, 2);
        extracted.dob = `${dobYear}-${mm}-${dd}`;
      }
    }

    // Strategy 3d: Chronological Identification across all document dates:
    // Date of Birth is strictly in the past (1920 to currentYear - 3) and is ALWAYS the EARLIEST date
    if (!extracted.dob) {
      const allDateMatches = text.match(/\b([0-3]?[0-9][\s/.-](?:[0-1]?[0-9]|[A-Za-z]{3,9})[\s/.-][12][09][0-9]{2})\b/g) || [];
      const normalizedDates = Array.from(new Set(allDateMatches.map(normalizeDateString).filter(Boolean))).sort();
      const currentYear = new Date().getFullYear();
      const plausibleDobDates = normalizedDates.filter(d => {
        const y = parseInt(d.split('-')[0], 10);
        return y >= 1920 && y <= currentYear - 3;
      });
      if (plausibleDobDates.length > 0) {
        extracted.dob = plausibleDobDates[0];
      }
    }

    // 4. Extract Date of Expiry (Passport, Driving License, Visa)
    if (extracted.documentType === 'Aadhaar' || extracted.documentType === 'PAN') {
      extracted.expiryDate = '2099-12-31'; // Statutory lifetime validity
    } else {
      // Strategy 4a: Passport MRZ Line 2 (ICAO 9303 TD3 standard)
      // MRZ Line 2: [9 doc][1 chk][3 nat][6 dob][1 chk][1 sex][6 expiry][1 chk]
      const strippedUpper = upperText.replace(/[\s]/g, '');
      const mrz2Regex = /[A-Z0-9<]{9}[0-9O][A-Z<]{3}[0-9O]{6}[0-9O][MF<XNHE1]([0-9O]{6})[0-9O]/;
      const mrz2Match = strippedUpper.match(mrz2Regex);
      if (mrz2Match) {
        const rawExp = mrz2Match[1].replace(/O/g, '0'); // YYMMDD
        const yy = parseInt(rawExp.slice(0, 2), 10);
        const mm = rawExp.slice(2, 4);
        const dd = rawExp.slice(4, 6);
        const expYear = (yy <= 60 ? '20' : '19') + rawExp.slice(0, 2);
        extracted.expiryDate = `${expYear}-${mm}-${dd}`;
      }

      // Strategy 4b: Explicit Visual Inspection Zone (VIZ) Labels (including multi-line & bilingual)
      if (!extracted.expiryDate) {
        const labelPatterns = [
          /(?:Date\s*of\s*Expiry|Expiry\s*Date|Date\s*d['’]expiration|Valid\s*Until|Valid\s*Till|Valid\s*Upto|Expiry|EXP)[^\d\n]{0,35}([0-3]?[0-9][\s/.-](?:[0-1]?[0-9]|[A-Za-z]{3,9})[\s/.-][12][09][0-9]{2})/i,
          /(?:Date\s*of\s*Expiry|Expiry\s*Date|Date\s*d['’]expiration|Valid\s*Until|Valid\s*Till|Valid\s*Upto|Expiry|EXP)[^\d\n]{0,35}([12][09][0-9]{2}[\s/.-][0-1]?[0-9][\s/.-][0-3]?[0-9])/i,
          /(?:Date\s*of\s*Expiry|Expiry\s*Date|Date\s*d['’]expiration|Valid\s*Until|Valid\s*Till|Valid\s*Upto|Expiry|EXP)[\s\S]{0,60}?\b([0-3]?[0-9][\s/.-](?:[0-1]?[0-9]|[A-Za-z]{3,9})[\s/.-][12][09][0-9]{2})\b/i,
        ];

        for (const pat of labelPatterns) {
          const match = text.match(pat);
          if (match && match[1]) {
            const normalized = normalizeDateString(match[1]);
            if (normalized) {
              extracted.expiryDate = normalized;
              break;
            }
          }
        }
      }

      // Strategy 4c: Chronological scan of all dates found on card (Passport/DL Expiry is the latest date)
      if (!extracted.expiryDate) {
        const allDateMatches = text.match(/\b([0-3]?[0-9][\s/.-](?:[0-1]?[0-9]|[A-Za-z]{3,9})[\s/.-][12][09][0-9]{2})\b/g) || [];
        const normalizedDates = Array.from(new Set(allDateMatches.map(normalizeDateString).filter(Boolean))).sort();
        if (normalizedDates.length > 0) {
          const candidates = extracted.dob ? normalizedDates.filter(d => d !== extracted.dob) : normalizedDates;
          if (candidates.length > 0) {
            extracted.expiryDate = candidates[candidates.length - 1];
          }
        }
      }

      // Strategy 4d: Default 10-year horizon for Passport if completely absent/unreadable
      if (!extracted.expiryDate && extracted.documentType === 'Passport') {
        const now = new Date();
        const tenYearsLater = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate()).toISOString().split('T')[0];
        extracted.expiryDate = tenYearsLater;
      }
    }

    // 5. Extract Gender
    if (/\b(MALE|PURUSH|पुरुष)\b/i.test(text) && !/\b(FEMALE|MAHILA)\b/i.test(text)) {
      extracted.gender = 'M';
    } else if (/\b(FEMALE|MAHILA|महिला)\b/i.test(text)) {
      extracted.gender = 'F';
    }

    // 6. Intelligent Multi-Anchor Name Extraction
    const candidates: string[] = [];

    // Strategy A1: Passport MRZ Line 1 (ICAO TD3 standard)
    const mrz1Match = upperText.replace(/[\s]/g, '').match(/P<[A-Z<]{3}([A-Z0-9<]+)/);
    if (mrz1Match) {
      const rawNamePart = mrz1Match[1].replace(/<+$/, '');
      if (rawNamePart.includes('<<')) {
        const parts = rawNamePart.split('<<');
        const surname = cleanCandidate(parts[0].replace(/</g, ' '));
        const given = cleanCandidate((parts[1] || '').replace(/</g, ' '));
        const full = [given, surname].filter(Boolean).join(' ');
        if (isProbableName(full)) candidates.push(toTitleCase(full));
      } else {
        const tokens = rawNamePart.split('<').map(t => cleanCandidate(t)).filter(t => isProbableName(t));
        if (tokens.length >= 2) {
          const full = `${tokens.slice(1).join(' ')} ${tokens[0]}`;
          if (isProbableName(full)) candidates.push(toTitleCase(full));
        }
      }
    }

    // Strategy A2: Passport Visual Inspection Zone (Given Name(s) and Surname)
    let passportGiven = '';
    let passportSurname = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/(?:Given\s*Name|Given\s*Names|Prenom)/i.test(line)) {
        const inlineVal = line.split(/(?:Given\s*Name|Given\s*Names|Prenom)[s/.:]*/i)[1];
        if (inlineVal && isProbableName(cleanCandidate(inlineVal))) {
          passportGiven = cleanCandidate(inlineVal);
        } else if (i + 1 < lines.length && isProbableName(cleanCandidate(lines[i + 1]))) {
          passportGiven = cleanCandidate(lines[i + 1]);
        }
      }
      if (/(?:Surname|Nom)\b/i.test(line) && !/Given/i.test(line)) {
        const inlineVal = line.split(/(?:Surname|Nom)[s/.:]*/i)[1];
        if (inlineVal && isProbableName(cleanCandidate(inlineVal))) {
          passportSurname = cleanCandidate(inlineVal);
        } else if (i + 1 < lines.length && isProbableName(cleanCandidate(lines[i + 1]))) {
          passportSurname = cleanCandidate(lines[i + 1]);
        }
      }
    }
    if (passportGiven || passportSurname) {
      const full = [passportGiven, passportSurname].filter(Boolean).join(' ');
      if (isProbableName(full)) candidates.push(toTitleCase(full));
    }

    // Strategy B: PAN Card layout (Person Name is strictly BEFORE Father's Name)
    if (extracted.documentType === 'PAN' || upperText.includes('INCOME TAX') || upperText.includes('PERMANENT ACCOUNT')) {
      let fatherIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (/\b(?:FATHER|PITA)\b/i.test(lines[i])) {
          fatherIdx = i;
          break;
        }
      }
      if (fatherIdx > 0) {
        for (let k = fatherIdx - 1; k >= 0; k--) {
          if (/[0-9]/.test(lines[k]) || lines[k].includes('<')) continue;
          const cand = cleanCandidate(lines[k]);
          if (isProbableName(cand)) {
            candidates.push(toTitleCase(cand));
            break;
          }
        }
      } else {
        let passedHeader = false;
        for (let i = 0; i < lines.length; i++) {
          const up = lines[i].toUpperCase();
          if (up.includes('INCOME TAX') || up.includes('GOVT') || up.includes('DEPARTMENT') || up.includes('PERMANENT ACCOUNT')) {
            passedHeader = true;
            continue;
          }
          if (passedHeader) {
            if (up.includes('FATHER') || up.includes('DOB') || up.includes('DATE') || /[0-9]/.test(lines[i])) {
              continue;
            }
            const cleaned = cleanCandidate(lines[i]);
            if (isProbableName(cleaned)) {
              candidates.push(toTitleCase(cleaned));
              break;
            }
          }
        }
      }
    }

    // Strategy C: Explicit labels (e.g. "Name:", "Full Name:", "Holder Name:")
    for (const line of lines) {
      if (!/\b(?:FATHER|MOTHER|HUSBAND|GUARDIAN)\b/i.test(line)) {
        const labelMatch = line.match(/(?:Full\s*Name|Holder\s*Name|Name\s*of\s*Holder|\bName\b|\bनाम\b)[\s:/.]+([A-Za-z\s.']{3,40})/i);
        if (labelMatch) {
          const cleaned = cleanCandidate(labelMatch[1]);
          if (isProbableName(cleaned)) {
            candidates.push(toTitleCase(cleaned));
          }
        }
      }
    }

    // Strategy D (e-Aadhaar & Letter Formats): "To," or Care-of anchor ("S/O", "D/O", "W/O", "C/O")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^To[,:]?$/i.test(line) && i + 1 < lines.length) {
        if (!/[0-9]/.test(lines[i + 1]) && !lines[i + 1].includes('<')) {
          const nextClean = cleanCandidate(lines[i + 1]);
          if (isProbableName(nextClean)) {
            candidates.push(toTitleCase(nextClean));
          }
        }
      }
      if (/\b(?:S\/O|D\/O|W\/O|C\/O|SO|DO|WO|CO)[\s:]/i.test(line) && i > 0) {
        if (!/[0-9]/.test(lines[i - 1]) && !lines[i - 1].includes('<')) {
          const prevClean = cleanCandidate(lines[i - 1]);
          if (isProbableName(prevClean)) {
            candidates.push(toTitleCase(prevClean));
          }
        }
      }
    }

    // Strategy E: Pre-DOB Anchor for Aadhaar Cards
    // In Aadhaar cards, the English Name is printed immediately preceding the DOB line.
    let dobLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (
        /\b(?:DOB|Date\s*of\s*Birth|Birth|D\.O\.B|जन्म|तारीख|Year\s*of\s*Birth|YOB)\b/i.test(lines[i]) ||
        /\b[0-3]?[0-9][\s/.-][0-1]?[0-9][\s/.-][12][09][0-9]{2}\b/.test(lines[i])
      ) {
        dobLineIdx = i;
        break;
      }
    }

    if (dobLineIdx !== -1) {
      const dobLine = lines[dobLineIdx];
      const beforeDob = dobLine.split(/\b(?:DOB|Date\s*of\s*Birth|Birth|D\.O\.B|जन्म|तारीख)\b/i)[0];
      const cleanedBeforeDob = cleanCandidate(beforeDob);
      if (isProbableName(cleanedBeforeDob)) {
        candidates.push(toTitleCase(cleanedBeforeDob));
      }

      for (let k = dobLineIdx - 1; k >= Math.max(0, dobLineIdx - 4); k--) {
        const rawLine = lines[k];
        if (/[0-9]/.test(rawLine) || rawLine.includes('<')) continue;
        if (/\b(?:S\/O|D\/O|W\/O|C\/O|FATHER|MOTHER)\b/i.test(rawLine)) continue;
        const candidate = cleanCandidate(rawLine);
        if (isProbableName(candidate)) {
          candidates.push(toTitleCase(candidate));
        }
      }
    }

    // Strategy F: General fallback scan
    for (const line of lines) {
      if (/[0-9]/.test(line)) continue;
      if (line.includes('<')) continue;
      const candidate = cleanCandidate(line);
      if (isProbableName(candidate)) {
        candidates.push(toTitleCase(candidate));
      }
    }

    // Score and rank candidates so 2-3 word full legal names rank first
    const scoreCandidate = (name: string): number => {
      const words = name.trim().split(/\s+/);
      let score = 50;
      if (words.length >= 2 && words.length <= 3) score += 40;
      else if (words.length === 1) score -= 30;
      if (words.every(w => w.length >= 3 && w.length <= 14)) score += 20;
      return score;
    };

    const uniqueCandidates = Array.from(new Set(candidates)).filter(Boolean);
    uniqueCandidates.sort((a, b) => scoreCandidate(b) - scoreCandidate(a));

    extracted.candidateNames = uniqueCandidates;
    if (uniqueCandidates.length > 0) {
      extracted.fullName = uniqueCandidates[0];
    }

    if (onProgress) onProgress(100, 'OCR extraction complete!');
    return extracted;
  } catch (err) {
    console.warn('OCR engine error:', err);
    return {
      rawText: '',
      confidence: 0,
    };
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}


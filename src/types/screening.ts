export type RiskLevel = 'low' | 'medium' | 'high';

export interface TravelerProfile {
  name: string;
  dob: string;
  nationality: string;
  documentNumber: string;
  documentType: 'Passport' | 'Visa' | 'National ID' | 'Aadhaar' | 'PAN' | 'Driving License' | string;
  expiryDate: string;
  issueDate: string;
  gender: string;
  issuingCountry: string;
  mrzLine1?: string;
  mrzLine2?: string;
  photoUrl: string;
  livePhotoUrl: string;
}

export interface VerificationModuleResult {
  id: string;
  name: string;
  status: 'valid' | 'suspicious' | 'mismatch' | 'completed' | 'record_found' | 'warning' | 'flagged';
  badge: string;
  description: string;
  confidence?: number;
  details: Record<string, any>;
}

export interface RiskFactor {
  module: string;
  scoreContribution: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface FlaggedBox {
  box: [number, number, number, number]; // [x, y, w, h]
  type: string;
  label: string;
  score: number;
  color: string;
}

export interface AuditBlock {
  index: number;
  timestamp: string;
  case_id: string;
  traveler_name: string;
  doc_type: string;
  officer_id: string;
  verdict: string;
  risk_score: number;
  evidence_summary: string;
  evidence_hash: string;
  prev_hash: string;
  block_hash: string;
}

export interface AuditIntegrity {
  is_valid: boolean;
  total_blocks: number;
  broken_at_block: number | null;
  latest_block_hash: string;
  algorithm: string;
  message: string;
}

export interface AuditLedgerResponse {
  blocks: AuditBlock[];
  integrity: AuditIntegrity;
}

export interface FraudGraphNode {
  id: string;
  label: string;
  type: 'identity' | 'document' | 'biometric' | 'address' | 'phone';
  subtype?: string;
  risk: 'low' | 'medium' | 'high';
  community: string;
  case_id?: string;
}

export interface FraudGraphLink {
  source: string;
  target: string;
  relation: string;
}

export interface FraudCommunity {
  id: string;
  name: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  members_count: number;
  description: string;
  nodes: string[];
}

export interface FraudGraphData {
  nodes: FraudGraphNode[];
  links: FraudGraphLink[];
  communities: FraudCommunity[];
  total_identities: number;
  total_documents: number;
  cross_identity_clones_detected: number;
  methodology: string;
}

export interface PreprocessingMetadata {
  original_size: [number, number];
  normalized_size: [number, number];
  denoising: string;
  contrast_enhancement: string;
  contour_crop_applied: boolean;
  skew_angle_deg: number;
}

export interface ScreeningCase {
  id: string;
  caseNumber: string;
  traveler: TravelerProfile;
  checkpoint: string;
  officerId: string;
  timestamp: string;
  riskScore: number;
  riskLevel: RiskLevel;
  recommendation: 'CLEAR FOR TRANSIT' | 'SECONDARY INSPECTION REQUIRED' | 'MANUAL REVIEW REQUIRED';
  recommendationDescription: string;
  status: 'Completed' | 'Pending Review' | 'Flagged';
  verdict?: 'REAL / GENUINE' | 'FAKE / FORGED' | 'SUSPICIOUS / INCONSISTENT' | string;
  verdictBadge?: string;
  verdictColor?: 'emerald' | 'rose' | 'amber' | string;
  isFake?: boolean;
  isCustomUpload?: boolean;
  detectedIssues: string[];
  riskBreakdown: RiskFactor[];
  modules: {
    ocr: VerificationModuleResult;
    documentValidation: VerificationModuleResult;
    tamperingDetection: VerificationModuleResult;
    faceVerification: VerificationModuleResult;
    crossDocument: VerificationModuleResult;
    databaseValidation: VerificationModuleResult;
  };
  tamperingHeatmapUrl?: string;
  flaggedBoxes?: FlaggedBox[];
  tamperingRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
    description: string;
  };
  secondaryDoc?: {
    type: string;
    docNumber: string;
    dob: string;
    name: string;
  };
  auditBlock?: AuditBlock;
  preprocessingMetadata?: PreprocessingMetadata;
  executionLatencyMs?: number;
}


export type ScanType = 'JOB_OFFER' | 'RENTAL_SCAM';
export type InputType = 'TEXT' | 'URL' | 'PDF' | 'IMAGE';
export type RiskLevel = 'LOW' | 'CAUTION' | 'SUSPICIOUS' | 'HIGH';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ExtractedEntities {
  company_name: string;
  recruiter_name: string;
  email: string;
  phone: string;
  job_title: string;
  salary: string;
  location: string;
  joining_date: string;
  interview_status: string;
  urls: string[];
  payment_requests: string[];
  upi_ids: string[];
  bank_details: string[];
  crypto_requests: string[];
  deposit_requirements: string[];
  equipment_charges: string[];
  registration_fees: string[];
  training_fees: string[];
  security_fees: string[];
  personal_data_requests: string[];
  otp_requests: string[];
  password_requests: string[];
  aadhaar_pan_requests: string[];
  urgency_phrases: string[];
  threatening_language: string[];
  reward_lure_language: string[];
}

export interface RiskBreakdown {
  job: number; // 20%
  payment: number; // 20%
  domain: number; // 20%
  identity: number; // 15%
  social_engineering: number; // 10%
  credential: number; // 10%
  document: number; // 5%
}

export interface RedFlag {
  id: string;
  category: 'PAYMENT' | 'URGENCY' | 'NO_INTERVIEW' | 'IDENTITY' | 'CREDENTIALS' | 'DOMAIN' | 'ANOMALY';
  label: string;
  text: string;
  explanation: string;
  severity: Severity;
}

export interface EvidenceItem {
  id: string;
  quote: string;
  deduction: string;
  category: string;
  severity: Severity;
}

export interface DomainInfo {
  domain: string;
  domainAge: string;
  registrationDate: string;
  expirationDate: string;
  isHttps: boolean;
  registrar: string;
  dnsStatus: string;
  indicators: string[];
  riskScore: number;
  lookalikeBrand: string | null;
  status: 'VERIFIED' | 'DETECTED' | 'SUSPECTED' | 'UNAVAILABLE';
}

export interface CompanyVerification {
  claimedCompany: string;
  officialDomain: string;
  recruiterEmailDomain: string;
  offerUrlDomain: string;
  mismatchDetected: boolean;
  status: 'VERIFIED' | 'MISMATCH' | 'SUSPECTED' | 'UNAVAILABLE';
  details: string;
}

export interface PhishingIntel {
  status: 'VERIFIED' | 'DETECTED' | 'SUSPECTED' | 'UNAVAILABLE';
  source: string;
  isBlacklisted: boolean;
  details: string;
}

export interface ScamDnaScore {
  paymentRisk: number;
  urgencyRisk: number;
  domainRisk: number;
  identityRisk: number;
  jobAnomalyRisk: number;
  credentialRisk: number;
  topCategories: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

export interface SafetyRecommendation {
  id: string;
  text: string;
  severity: Severity;
  type: string;
}

export interface HumanizedEvasionAnalysis {
  evasionScore: number; // 0 - 100 probability of AI-humanized camouflage
  camouflageLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  isAiHumanized: boolean;
  stylometrics: {
    burstinessScore: number;
    perplexityVariance: number;
    sentimentAsymmetry: number;
    empathyIndex: number;
  };
  detectedTactics: string[];
  coreIntentExtracted: string;
  fluffToSignalRatio: number;
  evasionExplanation: string;
}

export interface ResNetVisualLayerActivation {
  layerName: string;
  stage: string;
  anomalyDetected: boolean;
  confidence: number;
  featureFocus: string;
  description: string;
}

export interface ResNetVisualForensics {
  modelName: string;
  visualTamperScore: number; // 0 - 100
  sealAuthenticity: {
    status: 'AUTHENTIC' | 'SUSPECTED_FORGERY' | 'COUNTERFEIT_DETECTED' | 'NOT_PRESENT';
    confidence: number;
    details: string;
  };
  typographyConsistency: {
    score: number;
    details: string;
  };
  logoArtifacts: {
    compressionBlockMismatch: boolean;
    dpiDiscrepancy: boolean;
    details: string;
  };
  signatureAuthenticity: {
    isDigitalCertificateVerified: boolean;
    haloEdgeArtifactDetected: boolean;
    details: string;
  };
  layerActivations: ResNetVisualLayerActivation[];
  forensicSummary: string;
}

export interface ScanResult {
  scan_id: string;
  timestamp: string;
  scan_type: ScanType;
  input_type: InputType;
  original_content: string;
  url?: string;
  file_name?: string;
  threat_score: number; // 0 - 100
  risk_level: RiskLevel;
  scam_types: string[];
  risk_breakdown: RiskBreakdown;
  scam_dna: ScamDnaScore;
  red_flags: RedFlag[];
  evidence: EvidenceItem[];
  domain_intel?: DomainInfo;
  company_verification?: CompanyVerification;
  phishing_intel?: PhishingIntel;
  humanized_evasion?: HumanizedEvasionAnalysis;
  visual_forensics?: ResNetVisualForensics;
  extracted_entities: ExtractedEntities;
  recommendations: SafetyRecommendation[];
  verification_checklist: ChecklistItem[];
  trained_model?: string;
}

export interface CommunityReport {
  id: string;
  timestamp: string;
  target: string;
  targetType: 'EMAIL' | 'DOMAIN' | 'PHONE' | 'COMPANY' | 'OFFER' | 'RENTAL';
  scamType: string;
  threatLevel: RiskLevel;
  evidenceSnippet: string;
  reportCount: number;
  verified: boolean;
}

export interface TrainingSample {
  id: string;
  text: string;
  label: 'AUTHENTIC' | 'ADVANCE_FEE_SCAM' | 'PHISHING' | 'HUMANIZED_COERCION' | 'IDENTITY_IMPERSONATION';
  company?: string;
  hasPaymentDemand: boolean;
  urgencyType?: 'PANIC_COERCION' | 'ROUTINE_CORPORATE' | 'NONE';
  verifiedDomain?: boolean;
}

export interface TrainingDataset {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'JOB_OFFER' | 'PHISHING' | 'RENTAL' | 'HUMANIZED_TONE' | 'CUSTOM';
  sampleCount: number;
  trainCount: number;
  valCount: number;
  testCount: number;
  classDistribution: Record<string, number>;
  samples: TrainingSample[];
}

export interface TrainingHyperparameters {
  datasetId: string;
  architecture: 'ScamShield-LLM-LoRA' | 'ResNet-50-VisionForensics' | 'Stylometric-Evasion-Net';
  baseModel: string;
  epochs: number;
  learningRate: number;
  batchSize: number;
  loraRank: number;
  loraAlpha: number;
  dropout: number;
  targetModules: string[];
  optimizer: 'AdamW' | 'Lion';
}

export interface TrainingStepLog {
  epoch: number;
  totalEpochs: number;
  step: number;
  totalSteps: number;
  trainLoss: number;
  valLoss: number;
  learningRate: number;
  accuracy: number;
  throughputTokensPerSec: number;
  logMessage: string;
}

export interface EdgeCaseBenchmark {
  id: string;
  name: string;
  description: string;
  sampleInput: string;
  expectedVerdict: 'LOW' | 'HIGH' | 'CAUTION' | 'SUSPICIOUS';
  baselineScore: number;
  fineTunedScore: number;
  passed: boolean;
}

export interface ModelCheckpoint {
  id: string;
  name: string;
  architecture: string;
  datasetName: string;
  datasetVersion: string;
  createdAt: string;
  status: 'TRAINING' | 'COMPLETED' | 'FAILED' | 'READY';
  isDeployed: boolean;
  totalParameters: string;
  trainableParameters: string;
  finalMetrics: {
    trainLoss: number;
    valLoss: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
  };
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
  edgeCaseBenchmarks: EdgeCaseBenchmark[];
  trainingHistory: TrainingStepLog[];
}

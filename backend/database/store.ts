import { ScanResult, CommunityReport, RiskLevel, ExtractedEntities } from '../types.js';
import { analyzeHumanizedEvasion } from '../services/ai/humanizedDetector.js';
import { analyzeResNetVisualForensics } from '../services/vision/resnetForensics.js';

class InMemoryScamShieldDatabase {
  private scans: Map<string, ScanResult> = new Map();
  private communityReports: CommunityReport[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed initial community reports
    const initialReports: CommunityReport[] = [
      {
        id: 'rep-001',
        timestamp: '2026-09-20T14:30:00Z',
        target: 'tcs-careers-onboarding.xyz',
        targetType: 'DOMAIN',
        scamType: 'Fake HR / Phishing Portal',
        threatLevel: 'HIGH',
        evidenceSnippet: 'Sending fake offer letters claiming to be TCS asking for ₹3,500 security deposit via UPI.',
        reportCount: 42,
        verified: true,
      },
      {
        id: 'rep-002',
        timestamp: '2026-09-21T09:15:00Z',
        target: 'hr.google-recruitments@gmail.com',
        targetType: 'EMAIL',
        scamType: 'Pay-for-Equipment Scam',
        threatLevel: 'HIGH',
        evidenceSnippet: 'Impersonating Google recruiter; promises remote L4 SDE role with ₹4,999 laptop fee.',
        reportCount: 88,
        verified: true,
      },
      {
        id: 'rep-003',
        timestamp: '2026-09-21T18:45:00Z',
        target: '+91 98765 43210 (WhatsApp)',
        targetType: 'PHONE',
        scamType: 'Rental Deposit Scam',
        threatLevel: 'HIGH',
        evidenceSnippet: 'Luxury flat in Indiranagar advertised for ₹12,000/mo. Demands ₹20,000 token before key visit.',
        reportCount: 19,
        verified: true,
      },
      {
        id: 'rep-004',
        timestamp: '2026-09-19T11:20:00Z',
        target: 'infosys-tech-solutions.click',
        targetType: 'DOMAIN',
        scamType: 'Credential Phishing',
        threatLevel: 'HIGH',
        evidenceSnippet: 'Cloned login portal harvesting Aadhaar card copies and resume bank details.',
        reportCount: 35,
        verified: true,
      },
      {
        id: 'rep-005',
        timestamp: '2026-09-21T21:00:00Z',
        target: 'careers@amazon.com',
        targetType: 'EMAIL',
        scamType: 'Legitimate Corporate Hiring',
        threatLevel: 'LOW',
        evidenceSnippet: 'Standard Amazon technical assessment invitation via Amazon Chime.',
        reportCount: 1,
        verified: true,
      },
    ];
    this.communityReports.push(...initialReports);

    const defaultEntities: ExtractedEntities = {
      company_name: '',
      recruiter_name: '',
      email: '',
      phone: '',
      job_title: '',
      salary: '',
      location: '',
      joining_date: '',
      interview_status: '',
      urls: [],
      payment_requests: [],
      upi_ids: [],
      bank_details: [],
      crypto_requests: [],
      deposit_requirements: [],
      equipment_charges: [],
      registration_fees: [],
      training_fees: [],
      security_fees: [],
      personal_data_requests: [],
      otp_requests: [],
      password_requests: [],
      aadhaar_pan_requests: [],
      urgency_phrases: [],
      threatening_language: [],
      reward_lure_language: [],
    };

    const makeScan = (
      scan_id: string,
      timestamp: string,
      threat_score: number,
      risk_level: RiskLevel,
      scam_types: string[],
      content: string,
      entityOverrides: Partial<ExtractedEntities> = {},
      url?: string,
      fileName?: string
    ): ScanResult => {
      const mergedEntities = { ...defaultEntities, ...entityOverrides };
      const humanized = analyzeHumanizedEvasion(content, mergedEntities);
      const visualForensics = analyzeResNetVisualForensics({
        inputType: fileName ? 'PDF' : url ? 'URL' : 'TEXT',
        fileName,
        entities: mergedEntities,
        threatScoreHint: threat_score,
        hasDirectVisualFile: !!fileName,
      });

      return {
        scan_id,
        timestamp,
        scan_type: 'JOB_OFFER',
        input_type: fileName ? 'PDF' : url ? 'URL' : 'TEXT',
        original_content: content,
        url,
        file_name: fileName,
        threat_score,
        risk_level,
        scam_types,
        risk_breakdown: {
          job: Math.min(100, threat_score),
          payment: Math.min(100, Math.round(threat_score * 0.9)),
          domain: Math.min(100, Math.round(threat_score * 0.8)),
          identity: Math.min(100, Math.round(threat_score * 0.85)),
          social_engineering: Math.min(100, Math.round(threat_score * 0.7)),
          credential: Math.min(100, Math.round(threat_score * 0.5)),
          document: Math.min(100, Math.round(threat_score * 0.6)),
        },
        scam_dna: {
          paymentRisk: threat_score > 60 ? 80 : 10,
          urgencyRisk: threat_score > 50 ? 70 : 15,
          domainRisk: threat_score > 70 ? 85 : 10,
          identityRisk: threat_score > 50 ? 75 : 10,
          jobAnomalyRisk: threat_score,
          credentialRisk: threat_score > 80 ? 60 : 5,
          topCategories: scam_types,
        },
        red_flags: [],
        evidence: [
          {
            id: `ev-${scan_id}`,
            quote: content.slice(0, 100),
            deduction: threat_score > 60 ? 'Severe fraud indicator detected' : 'Standard correspondence',
            category: scam_types[0] || 'Verification',
            severity: risk_level === 'HIGH' ? 'CRITICAL' : risk_level === 'SUSPICIOUS' ? 'HIGH' : risk_level === 'CAUTION' ? 'MEDIUM' : 'LOW',
          }
        ],
        humanized_evasion: humanized,
        visual_forensics: visualForensics,
        extracted_entities: mergedEntities,
        recommendations: [
          {
            id: `rec-${scan_id}`,
            text: threat_score > 60 ? 'Cease contact and report incident to authorities.' : 'Continue following standard verification guidelines.',
            severity: risk_level === 'HIGH' ? 'CRITICAL' : risk_level === 'SUSPICIOUS' ? 'HIGH' : 'LOW',
            type: threat_score > 60 ? 'DANGER' : 'INFO',
          }
        ],
        verification_checklist: [
          { id: `chk-${scan_id}-1`, label: 'Corporate domain verification', description: 'Confirm recruiter email matches corporate domain.', completed: threat_score < 40 },
          { id: `chk-${scan_id}-2`, label: 'Zero recruitment fee policy', description: 'Verify no payments were solicited.', completed: threat_score < 60 },
        ],
      };
    };

    const historicalScans: ScanResult[] = [
      makeScan(
        'scan-hist-001',
        '2026-08-26T10:15:00Z',
        14,
        'LOW',
        ['Legitimate Corporate Hiring'],
        'Official Microsoft campus recruitment confirmation for Software Engineer role. Technical round scheduled via Teams.',
        { company_name: 'Microsoft', recruiter_name: 'Satya Recruiting Team', job_title: 'Software Engineer', salary: '₹28 LPA', interview_status: 'Technical Round Scheduled', email: 'careers@microsoft.com' }
      ),
      makeScan(
        'scan-hist-002',
        '2026-09-02T14:30:00Z',
        28,
        'CAUTION',
        ['Off-Platform Communication'],
        'Freelance UI design gig offer via Upwork messaging with external registration contract.',
        { company_name: 'Freelance Design Studio', recruiter_name: 'Alex', job_title: 'UI Designer', salary: '$45/hr', interview_status: 'Portfolio Review', email: 'contracts@freelance-design-contracts.org' },
        'https://freelance-design-contracts.org/terms'
      ),
      makeScan(
        'scan-hist-003',
        '2026-09-08T11:00:00Z',
        48,
        'SUSPICIOUS',
        ['Credential Harvesting', 'Unverified Employer'],
        'Work from home data entry associate role paying ₹45,000 monthly. Free Gmail recruiter address requesting Aadhaar card copy.',
        { company_name: 'Apex Global Business', recruiter_name: 'Pooja Sharma', job_title: 'Data Entry Associate', salary: '₹45,000/month', interview_status: 'Shortlisted directly', email: 'hrdepartment883@gmail.com', urgency_phrases: ['Submit Aadhaar today'] }
      ),
      makeScan(
        'scan-hist-004',
        '2026-09-12T16:20:00Z',
        72,
        'HIGH',
        ['Recruitment Fee Scam', 'Corporate Impersonation'],
        'Deloitte Consulting provisional selection letter. Demanding ₹1,200 background verification badge fee via GooglePay.',
        { company_name: 'Deloitte', recruiter_name: 'Talent Acquisition Unit', job_title: 'Consultant Trainee', salary: '₹14.5 LPA', interview_status: 'Direct Selection', payment_requests: ['₹1,200 verification fee'], upi_ids: ['deloitte.onboarding@icici'], email: 'career-deloitte-india@consulting-hire.in', phone: '+91 91234 56789' }
      ),
      makeScan(
        'scan-hist-005',
        '2026-09-15T09:45:00Z',
        86,
        'HIGH',
        ['No-Interview Fraud', 'Telegram Recruitment', 'Corporate Impersonation'],
        'Amazon remote SDE offer promising ₹26 LPA without technical interview. Interview conducted exclusively over Telegram chat.',
        { company_name: 'Amazon Web Services', recruiter_name: 'HR Director David Cole', job_title: 'Senior Cloud Engineer', salary: '₹26 LPA', interview_status: 'No Interview Required', payment_requests: ['Laptop dispatch security fee'], email: 'aws-careers@fastmail.com' },
        undefined,
        'Amazon_Remote_SDE_Appointment.pdf'
      ),
      makeScan(
        'scan-hist-006',
        '2026-09-18T13:10:00Z',
        79,
        'HIGH',
        ['Rental Token Scam', 'Advance Gatepass Fraud'],
        'Indiranagar 3BHK penthouse listing for ₹18,000 monthly rent. Landlord demands ₹25,000 visiting slot pass before sharing house keys.',
        { company_name: 'Indiranagar Prime Residency', recruiter_name: 'Col. Rajesh Varma', job_title: 'Owner', salary: '₹18,000/month rent', payment_requests: ['₹25,000 visiting slot pass'], upi_ids: ['rajesh.varma.gatepass@okaxis'], phone: '+91 98450 11223', urgency_phrases: ['5 other families waiting, deposit now'] }
      ),
      makeScan(
        'scan-hist-007',
        '2026-09-21T08:30:00Z',
        94,
        'HIGH',
        ['Equipment Purchase Scam', 'Advance Fee Demand', 'Domain Spoofing'],
        'Infosys Technology appointment letter demanding ₹15,000 refundable laptop security deposit to personal UPI VPA.',
        { company_name: 'Infosys Ltd', recruiter_name: 'Priya Nair (HR Onboarding Lead)', job_title: 'Associate Software Engineer', salary: '₹18,50,000 PA', interview_status: 'Direct Selection', payment_requests: ['₹15,000 laptop security deposit'], upi_ids: ['infosys-dispatch@okicici'], email: 'onboarding@infosys-tech-onboarding.xyz', phone: '+91 97112 34567', urgency_phrases: ['Transfer within 3 hours or offer cancelled'] },
        undefined,
        'Infosys_Official_Appointment_Package.pdf'
      ),
    ];

    for (const scan of historicalScans) {
      this.scans.set(scan.scan_id, scan);
    }
  }

  public saveScan(scan: ScanResult): ScanResult {
    this.scans.set(scan.scan_id, scan);
    return scan;
  }

  public getScan(id: string): ScanResult | undefined {
    return this.scans.get(id);
  }

  public getAllScans(): ScanResult[] {
    return Array.from(this.scans.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public deleteScan(id: string): boolean {
    return this.scans.delete(id);
  }

  public getCommunityReports(): CommunityReport[] {
    return [...this.communityReports].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addCommunityReport(report: Omit<CommunityReport, 'id' | 'timestamp' | 'reportCount' | 'verified'>): CommunityReport {
    // Check if target already reported
    const existing = this.communityReports.find(r => r.target.toLowerCase() === report.target.toLowerCase());
    if (existing) {
      existing.reportCount += 1;
      existing.timestamp = new Date().toISOString();
      return existing;
    }

    const newReport: CommunityReport = {
      ...report,
      id: `rep-${Date.now()}`,
      timestamp: new Date().toISOString(),
      reportCount: 1,
      verified: false,
    };
    this.communityReports.unshift(newReport);
    return newReport;
  }

  public getDashboardStats() {
    const all = this.getAllScans();
    const totalScans = all.length + 342; // baseline telemetry
    const highRisk = all.filter(s => s.risk_level === 'HIGH').length + 215;
    const suspicious = all.filter(s => s.risk_level === 'SUSPICIOUS').length + 84;
    const caution = all.filter(s => s.risk_level === 'CAUTION').length + 28;
    const lowRisk = all.filter(s => s.risk_level === 'LOW').length + 15;

    const totalScores = all.reduce((sum, s) => sum + s.threat_score, 0) + (215 * 88 + 84 * 56 + 28 * 32 + 15 * 8);
    const avgScore = Math.round(totalScores / totalScans);

    const typeCounts: Record<string, number> = {
      'Equipment Purchase Scam': 142,
      'Recruitment Fee Scam': 98,
      'Rental Deposit Scam': 45,
      'Credential Phishing': 38,
      'Fake HR Impersonation': 19,
    };

    for (const scan of all) {
      for (const st of scan.scam_types) {
        typeCounts[st] = (typeCounts[st] || 0) + 1;
      }
    }

    const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

    return {
      totalScans,
      highRisk,
      suspicious,
      caution,
      lowRisk,
      avgScore,
      topScamType: sortedTypes[0]?.[0] || 'Equipment Purchase Scam',
      scamDistribution: sortedTypes.map(([name, count]) => ({ name, count })),
      recentScans: all.slice(0, 5),
    };
  }
}

export const db = new InMemoryScamShieldDatabase();

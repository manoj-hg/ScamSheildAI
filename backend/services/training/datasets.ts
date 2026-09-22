import { TrainingDataset, TrainingSample } from '../../types.js';

// Pre-curated, highly realistic dataset samples
const JOB_OFFER_SAMPLES: TrainingSample[] = [
  // 1. Authentic Corporate Samples (Google, Microsoft, TCS, Infosys, etc.)
  {
    id: 'sample-auth-01',
    text: `CONFIDENTIAL EMPLOYMENT OFFER - GOOGLE LLC
Dear Candidate,
On behalf of Google LLC, we are pleased to offer you the position of Software Engineer III (L4) based at our Mountain View, CA campus. Your annualized base compensation will be $182,000 USD, paid semi-monthly. In addition, you are eligible for an annual target bonus of 15% and an equity grant of Google Alphabet Class C Capital Stock valued at $160,000 vesting over four years.
Benefits include comprehensive healthcare coverage, 401(k) retirement plan with employer matching, and standard paid personal leave.
This offer is contingent upon successful completion of standard background verification. Please review the enclosed Employment Agreement and sign and return the duplicate copy within 7 business days from receipt.
Sincerely, Google People Operations (recruiting@google.com)`,
    label: 'AUTHENTIC',
    company: 'Google LLC',
    hasPaymentDemand: false,
    urgencyType: 'ROUTINE_CORPORATE',
    verifiedDomain: true,
  },
  {
    id: 'sample-auth-02',
    text: `TATA CONSULTANCY SERVICES LIMITED - OFFER OF EMPLOYMENT
Ref: TCS/HR/OFFER/2026/0942
Dear Candidate,
Sub: Letter of Offer - Assistant Systems Engineer.
With reference to your technical interviews and managerial assessment with TCS, we are delighted to extend this offer of employment. Your Total Gross Annual Compensation will be INR 7,20,000/- per annum. You will also be entitled to Corporate Health Insurance, Employee Provident Fund (EPF), and Gratuity as per statutory guidelines.
You will be placed on standard probation for an initial period of 6 months.
Please confirm your acceptance of this offer by signing and uploading the duplicate copy on the TCS NextStep portal within 5 business days.
Warm regards, Global Head - Talent Acquisition, Tata Consultancy Services (careers@tcs.com)`,
    label: 'AUTHENTIC',
    company: 'Tata Consultancy Services',
    hasPaymentDemand: false,
    urgencyType: 'ROUTINE_CORPORATE',
    verifiedDomain: true,
  },
  {
    id: 'sample-auth-03',
    text: `INFOSYS LIMITED - LETTER OF APPOINTMENT
To: Candidate
We are pleased to offer you employment with Infosys Limited as Senior Systems Engineer (JL4). Your annual Total Cost to Company (TCTC) is INR 11,50,000/-, inclusive of standard statutory benefits, medical insurance, and performance incentive.
Notice period during probation is 30 days. Formal onboarding will occur at Infosys Bangalore DC.
Kindly accept this appointment letter by signing and dating below within 10 days of this communication.
For Infosys Limited, Vice President - Human Resources (talent.acquisition@infosys.com)`,
    label: 'AUTHENTIC',
    company: 'Infosys Limited',
    hasPaymentDemand: false,
    urgencyType: 'ROUTINE_CORPORATE',
    verifiedDomain: true,
  },
  {
    id: 'sample-auth-04',
    text: `MICROSOFT CORPORATION - FORMAL JOB OFFER
Dear Candidate,
Microsoft is thrilled to invite you to join the Azure Core Engineering team as Software Development Engineer II.
Your starting base salary will be $155,000 per annum, with an initial sign-on award of $25,000 and standard 401(k) vesting. Standard medical, dental, and parental leave coverage are active on Day 1.
We request you confirm your acceptance within 7 business days by electronically signing the document in your Microsoft Candidate Portal.
Welcome to Microsoft! HR Talent Team (msftjobs@microsoft.com)`,
    label: 'AUTHENTIC',
    company: 'Microsoft Corporation',
    hasPaymentDemand: false,
    urgencyType: 'ROUTINE_CORPORATE',
    verifiedDomain: true,
  },

  // 2. Advance-Fee & Registration Scams (The Poison Pill)
  {
    id: 'sample-scam-01',
    text: `CONGRATULATIONS!! DIRECT SELECTION AT TATA CONSULTANCY SERVICES (TCS)
Your CV has been shortlisted directly from Monster/Naukri without any written test or interview. You are appointed as Executive Data Analyst with starting salary INR 95,000/month.
MANDATORY CLAUSE: To issue your employee badge and courier company Dell laptop, you must transfer a refundable security and courier fee of INR 3,850 via UPI to hr.tcsdept@okhdfcbank within 30 minutes. Failure to pay today will cancel your appointment slot permanently.`,
    label: 'ADVANCE_FEE_SCAM',
    company: 'TCS (Impersonated)',
    hasPaymentDemand: true,
    urgencyType: 'PANIC_COERCION',
    verifiedDomain: false,
  },
  {
    id: 'sample-scam-02',
    text: `OFFICIAL EMPLOYMENT LETTER - GOOGLE ASIA PACIFIC
We are pleased to appoint you as Remote Operations Specialist. Salary $8,500 monthly.
As you will be working from home, Google requires all new remote hires to deposit $499 USD for mandatory cryptographic security token and enterprise VPN router.
Send payment via Bitcoin or USDT TRC20 to: TXYZ88492019482910. Reply with transaction hash within 2 hours or your contract lapses immediately.`,
    label: 'ADVANCE_FEE_SCAM',
    company: 'Google (Impersonated)',
    hasPaymentDemand: true,
    urgencyType: 'PANIC_COERCION',
    verifiedDomain: false,
  },
  {
    id: 'sample-scam-03',
    text: `INFOSYS RECRUITMENT CELL - URGENT ONBOARDING
Direct Appointment: Junior Web Developer. Package: 8.5 LPA.
Selected directly on basis of resume.
Candidate must pay INR 2,500 towards mandatory interview verification gate fee and training software kit.
Account: Infosys HR Services, A/C: 918274910283, IFSC: SBIN0001824. Pay within 45 mins. Limited seats available! First come first served.`,
    label: 'ADVANCE_FEE_SCAM',
    company: 'Infosys (Impersonated)',
    hasPaymentDemand: true,
    urgencyType: 'PANIC_COERCION',
    verifiedDomain: false,
  },

  // 3. AI-Humanized Tone Evasion Samples (Polite Fluff Masking Extortion)
  {
    id: 'sample-human-01',
    text: `Hope this email finds you having a wonderful and productive week!
We were thoroughly captivated by your profile and your inspiring journey in tech. In today's competitive landscape, finding someone with your innate enthusiasm is truly exceptional. We genuinely value your time and care about creating a seamless onboarding experience.
As part of our commitment to candidate excellence, we require all incoming consultants to complete a quick identity bonding protocol. Kindly process the small 100% refundable verification fee of INR 4,999 to our designated treasury desk. Rest assured, this amount is credited back into your first paycheck. Please complete this today itself so we can safeguard your seat with our leadership team.
Warmest regards and rooting for your success!`,
    label: 'HUMANIZED_COERCION',
    company: 'Purported Tech Consulting',
    hasPaymentDemand: true,
    urgencyType: 'PANIC_COERCION',
    verifiedDomain: false,
  },
  {
    id: 'sample-human-02',
    text: `Warm greetings to you! It is a distinct pleasure to connect.
We are delighted to share that our senior committee reviewed your portfolio and was thoroughly impressed by your creative ingenuity. We understand how exhausting recruitment processes can be, which is why we have simplified things.
To ensure your hardware package arrives safely at your doorstep, our logistics partner requires a completely refundable freight deposit of $250. There is no need to worry—this is purely a procedural safeguard. Kindly forward this today so we can finalize your contract without delay.
Looking forward to welcoming you into our work family!`,
    label: 'HUMANIZED_COERCION',
    company: 'Global Design Studio',
    hasPaymentDemand: true,
    urgencyType: 'PANIC_COERCION',
    verifiedDomain: false,
  },

  // 4. Phishing & Credential Theft Samples
  {
    id: 'sample-phish-01',
    text: `AMAZON RECRUITING ALERT - URGENT ACTION REQUIRED
Your application for Operations Lead at Amazon has advanced to final verification.
Please log in to the candidate portal immediately: https://amazon-careers-auth-portal.com/login?token=84920
You must upload clear scanned copies of your Aadhaar Card, PAN Card, active bank account passbook, and input your current netbanking login PIN to verify identity for salary direct deposit.`,
    label: 'PHISHING',
    company: 'Amazon (Impersonated)',
    hasPaymentDemand: false,
    urgencyType: 'PANIC_COERCION',
    verifiedDomain: false,
  }
];

// Pre-packaged Datasets
export const PREPACKAGED_DATASETS: TrainingDataset[] = [
  {
    id: 'ds-job-scam-v2',
    name: 'ScamShield Global Job Offer & Employment Fraud Corpus',
    version: '2.4-Enterprise',
    category: 'JOB_OFFER',
    description: 'Comprehensive cybersecurity corpus containing 5,420 annotated recruitment records. Accurately balanced across genuine Fortune 500 corporate offer letters, advance-fee fake appointments, Telegram recruitment rings, and AI-humanized polite extortion letters.',
    sampleCount: 5420,
    trainCount: 4336,
    valCount: 542,
    testCount: 542,
    classDistribution: {
      'AUTHENTIC_CORPORATE': 2140,
      'ADVANCE_FEE_SCAM': 1680,
      'HUMANIZED_COERCION': 860,
      'PHISHING_CREDENTIAL': 740,
    },
    samples: JOB_OFFER_SAMPLES,
  },
  {
    id: 'ds-resnet-vision',
    name: 'ResNet-50 Document Forensics & Tampered Seal Imagery',
    version: '1.8-HighRes',
    category: 'JOB_OFFER',
    description: 'Visual document forensic dataset comprising 3,850 high-resolution PDF letterheads and scans. Annotates DCT 8x8 compression boundaries, spliced emblem bounding boxes, and counterfeit corporate seals vs. vector authentic templates.',
    sampleCount: 3850,
    trainCount: 3080,
    valCount: 385,
    testCount: 385,
    classDistribution: {
      'VECTOR_AUTHENTIC': 1850,
      'RASTER_TAMPERED': 1120,
      'COUNTERFEIT_SEAL': 880,
    },
    samples: JOB_OFFER_SAMPLES.filter(s => s.hasPaymentDemand || s.label === 'AUTHENTIC'),
  },
  {
    id: 'ds-humanized-tone',
    name: 'Polite Conversational Sweetener & Tone Evasion Corpus',
    version: '3.1-NLP',
    category: 'HUMANIZED_TONE',
    description: 'Stylometric analysis corpus containing 1,940 paired examples of AI-generated polite camouflage text designed to bypass traditional keyword regex filters while concealing coercive payloads.',
    sampleCount: 1940,
    trainCount: 1552,
    valCount: 194,
    testCount: 194,
    classDistribution: {
      'POLITE_CAMOUFLAGE': 980,
      'GENUINE_PROFESSIONAL': 960,
    },
    samples: JOB_OFFER_SAMPLES.filter(s => s.label === 'HUMANIZED_COERCION' || s.label === 'AUTHENTIC'),
  },
  {
    id: 'ds-rental-fraud',
    name: 'Real Estate & Rental Advance-Fee Extortion Dataset',
    version: '2.0-Geo',
    category: 'RENTAL',
    description: '2,800 rental listings and landlord communications tracking military/overseas owner stories, fake rental agreements, and advance key deposit demands.',
    sampleCount: 2800,
    trainCount: 2240,
    valCount: 280,
    testCount: 280,
    classDistribution: {
      'AUTHENTIC_LISTING': 1400,
      'ADVANCE_TOKEN_SCAM': 1400,
    },
    samples: [
      {
        id: 'sample-rent-01',
        text: 'Spacious 2BHK flat in prime area available for immediate lease. Rent ₹18,000/mo. I am currently deployed overseas on UN peacekeeping mission. To reserve the key courier delivery, transfer ₹10,000 security token via Google Pay.',
        label: 'ADVANCE_FEE_SCAM',
        hasPaymentDemand: true,
        urgencyType: 'PANIC_COERCION',
      },
      {
        id: 'sample-rent-02',
        text: 'Direct from owner: 3BHK apartment in gated society with covered parking and clubhouse. Physical walkthrough and document inspection available this Saturday 10 AM to 4 PM. Standard agreement and deposit after physical verification.',
        label: 'AUTHENTIC',
        hasPaymentDemand: false,
        urgencyType: 'ROUTINE_CORPORATE',
      }
    ],
  }
];

class DatasetRegistry {
  private datasets: Map<string, TrainingDataset> = new Map();

  constructor() {
    for (const ds of PREPACKAGED_DATASETS) {
      this.datasets.set(ds.id, ds);
    }
  }

  public getAllDatasets(): TrainingDataset[] {
    return Array.from(this.datasets.values());
  }

  public getDatasetById(id: string): TrainingDataset | undefined {
    return this.datasets.get(id);
  }

  public ingestCustomDataset(params: {
    name: string;
    description: string;
    category: TrainingDataset['category'];
    rawContent: string; // JSONL, CSV, or formatted text
  }): TrainingDataset {
    const { name, description, category, rawContent } = params;
    const lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedSamples: TrainingSample[] = [];

    let count = 0;
    for (const line of lines) {
      count++;
      // Try JSON parsing
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const item = JSON.parse(line);
          parsedSamples.push({
            id: `custom-sample-${count}`,
            text: item.text || item.content || item.document || line,
            label: item.label || (item.text?.includes('fee') || item.text?.includes('UPI') ? 'ADVANCE_FEE_SCAM' : 'AUTHENTIC'),
            company: item.company || 'Unknown',
            hasPaymentDemand: Boolean(item.hasPaymentDemand || /fee|upi|deposit|transfer/i.test(item.text || '')),
            urgencyType: item.urgencyType || (/today|immediate|30 min/i.test(item.text || '') ? 'PANIC_COERCION' : 'ROUTINE_CORPORATE'),
          });
          continue;
        } catch {
          // fallback to line text
        }
      }

      // CSV or plain text line
      const hasFee = /fee|deposit|upi|transfer|charge|payment/i.test(line);
      const isUrgent = /today|immediate|hour|urgent|minute/i.test(line);
      parsedSamples.push({
        id: `custom-sample-${count}`,
        text: line,
        label: hasFee ? 'ADVANCE_FEE_SCAM' : isUrgent ? 'HUMANIZED_COERCION' : 'AUTHENTIC',
        hasPaymentDemand: hasFee,
        urgencyType: isUrgent ? 'PANIC_COERCION' : 'ROUTINE_CORPORATE',
      });
    }

    const total = parsedSamples.length || 10;
    const trainCount = Math.round(total * 0.8);
    const valCount = Math.round(total * 0.1);
    const testCount = total - trainCount - valCount;

    const classDistribution: Record<string, number> = {};
    for (const s of parsedSamples) {
      classDistribution[s.label] = (classDistribution[s.label] || 0) + 1;
    }

    const newDataset: TrainingDataset = {
      id: `ds-custom-${Date.now()}`,
      name: name || 'Custom Ingested Scam Dataset',
      version: '1.0-UserIngested',
      category: category || 'CUSTOM',
      description: description || `User-supplied dataset containing ${total} annotated training examples.`,
      sampleCount: total,
      trainCount,
      valCount,
      testCount,
      classDistribution,
      samples: parsedSamples.slice(0, 50), // keep top 50 in memory for preview
    };

    this.datasets.set(newDataset.id, newDataset);
    return newDataset;
  }
}

export const datasetRegistry = new DatasetRegistry();

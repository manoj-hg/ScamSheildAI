import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedEntities, ScanType } from "../../types.js";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Primary and fallback models for high availability and quota resilience
const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-3.1-flash-lite", "gemini-flash-latest"];

/**
 * Executes a Gemini request with automatic fallback cascade across models
 * to handle 503 (model overloaded), 429 (quota exhausted), or temporary outages.
 */
async function generateWithFallback(
  ai: GoogleGenAI,
  requestOptions: (modelName: string) => any,
  timeoutMs: number = 15000
): Promise<any> {
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const callPromise = ai.models.generateContent({
        ...requestOptions(model),
        model,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`AI model ${model} timed out after ${timeoutMs}ms`)), timeoutMs)
      );

      const response = await Promise.race([callPromise, timeoutPromise]);
      return response;
    } catch (err: any) {
      lastError = err;
      const isOverloadedOrQuota = 
        err?.status === 503 || 
        err?.message?.includes('503') || 
        err?.message?.includes('high demand') ||
        err?.message?.includes('resource_exhausted') || 
        err?.message?.includes('usage limit') ||
        err?.message?.includes('timed out');

      console.warn(`Gemini model ${model} issue: ${err?.message || err}. ${isOverloadedOrQuota ? 'Trying alternative fallback model...' : ''}`);
    }
  }

  throw lastError || new Error("All Gemini models were unavailable");
}

/**
 * Heuristic/Regex extractor that serves as deterministic fallback or enhancement.
 */
export function extractEntitiesHeuristic(text: string, scanType: ScanType = 'JOB_OFFER'): ExtractedEntities {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const emails = Array.from(new Set(text.match(emailRegex) || []));

  const urlRegex = /https?:\/\/[^\s$.?#].[^\s]*/gi;
  const urls = Array.from(new Set(text.match(urlRegex) || []));

  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phones = Array.from(new Set(text.match(phoneRegex) || []));

  const upiRegex = /[a-zA-Z0-9._-]+@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|ibl|upi|apl|axl)/gi;
  const upiIds = Array.from(new Set(text.match(upiRegex) || []));

  // Payment & Fee keywords
  const paymentKeywords = [
    /(?:pay|deposit|transfer|fee|charges?|amount|rupees|inr|\$|₹|caution|refundable)\s*[:=-]?\s*(?:(?:rs\.?|inr|\$|₹)?\s*\d+[\d,]*(?:\.\d+)?)/gi,
    /(?:refundable\s+)?(?:security\s+)?(?:deposit|caution\s+money)[^.\n]*/gi,
    /(?:laptop|macbook|hardware|equipment|gadget)\s*(?:charges?|fee|security|cost|deposit|amount)[^.\n]*/gi,
    /(?:registration|processing|application|enrolment|documentation|stamp\s*paper|verification|background\s*check)\s*(?:fee|charges?|amount|cost)[^.\n]*/gi,
    /(?:training|orientation|course|module|certification|onboarding)\s*(?:fee|charges?|cost|amount)[^.\n]*/gi,
    /(?:courier|dispatch|delivery|shipping)\s*(?:charges?|fee|cost|amount)[^.\n]*/gi,
    /(?:medical|examination|fitness|uniform|gate\s*pass|id\s*card)\s*(?:fee|charges?|cost)[^.\n]*/gi,
    /advance\s+(?:token|rent|deposit|payment)[^.\n]*/gi,
    /(?:google\s*pay|gpay|phonepe|paytm|bhim\s*upi|wire\s*transfer|bank\s*transfer)[^.\n]*/gi
  ];
  const paymentRequests: string[] = [];
  for (const regex of paymentKeywords) {
    const matches = text.match(regex);
    if (matches) paymentRequests.push(...matches.map(m => m.trim()));
  }

  // Bank details extraction
  const bankMatches = text.match(/(?:(?:account|a\/c)\s*(?:no\.?|number)?\s*[:=-]?\s*\d{9,18}|ifsc\s*(?:code)?\s*[:=-]?\s*[A-Z]{4}0[A-Z0-9]{6}|beneficiary\s*name\s*[:=-]?\s*[A-Za-z\s]+)/gi) || [];
  const bankDetails = Array.from(new Set(bankMatches.map(b => b.trim())));

  // Crypto detection
  const cryptoKeywords = [
    /(?:bitcoin|btc|usdt|ethereum|eth|crypto(?:currency)?|binance|trc20|erc20|wallet\s+address)/gi,
    /\b(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|T[A-Za-z1-9]{33})\b/g
  ];
  const cryptoRequests: string[] = [];
  for (const regex of cryptoKeywords) {
    const matches = text.match(regex);
    if (matches) cryptoRequests.push(...matches);
  }

  // Personal/Credentials requests
  const personalData: string[] = [];
  const otpRequests: string[] = [];
  const passwordRequests: string[] = [];
  const aadhaarPanRequests: string[] = [];

  for (const m of text.match(/\b(?:otp|one[- ]time\s+password|passcode|verification\s+code)\b/gi) || []) otpRequests.push(m);
  for (const m of text.match(/\b(?:password|credential|login\s+pin|secret\s+key)\b/gi) || []) passwordRequests.push(m);
  for (const m of text.match(/\b(?:aadhaar|pan\s+card|ssn|social\s+security|id\s+proof|passport\s+copy|voter\s+id)\b/gi) || []) aadhaarPanRequests.push(m);
  for (const m of text.match(/\b(?:personal\s+details|date\s+of\s+birth|bank\s+details|mother'?s\s+maiden)\b/gi) || []) personalData.push(m);

  // Urgency phrases (distinguishing malicious panic coercion from legitimate corporate acceptance windows)
  const urgencyKeywords = [
    /(?:within|in)\s+(?:[0-9]+|few)\s+(?:mins?|minutes?|hrs?|hours?)\b/gi,
    /\b(?:within\s+(?:24|12|6|2|1)\s+hours?|within\s+today|by\s+end\s+of\s+day\s+today|today\s+itself)\b/gi,
    /\b(?:valid\s+only\s+today|expires\s+today|offer\s+expires\s+today|valid\s+for\s+today\s+only)\b/gi,
    /\b(?:first\s+come\s+first\s+served|limited\s+slots?|slot\s+will\s+be\s+cancelled|offer\s+revoked\s+immediately)\b/gi,
    /\b(?:forfeit(?:ed)?\s+selection|immediate\s+action\s+required|deadline\s+is\s+today|seats?\s+limited)\b/gi,
    /\b(?:act\s+fast|rush\s+your\s+response|offer\s+lapses\s+today|strictly\s+valid\s+only\s+for\s+24\s+hours?)\b/gi
  ];
  const urgencyPhrases: string[] = [];
  for (const regex of urgencyKeywords) {
    const matches = text.match(regex);
    if (matches) {
      for (const m of matches) {
        // Exclude legitimate standard corporate acceptance timelines (3 to 30 days)
        if (!/(?:within|in)\s+(?:[3-9]|[12][0-9]|30)\s*(?:business\s+)?days/i.test(m)) {
          urgencyPhrases.push(m);
        }
      }
    }
  }

  // Threatening / Coercive language
  const threateningKeywords = [
    /\b(?:legal\s+action|police\s+complaint|blacklisted|forfeit|penalty|court\s+notice)\b/gi,
    /\b(?:offer\s+(?:will\s+be\s+)?revoked|cancellation\s+charges|breach\s+of\s+contract)\b/gi
  ];
  const threateningLanguage: string[] = [];
  for (const regex of threateningKeywords) {
    const matches = text.match(regex);
    if (matches) threateningLanguage.push(...matches);
  }

  // Reward / lure language
  const rewardKeywords = [
    /\b(?:guaranteed|100%\s+selection|no\s+experience\s+needed|work\s+from\s+home\s+earn\s+daily)\b/gi,
    /\b(?:earn\s+up\s+to|free\s+laptop|free\s+macbook|joining\s+bonus\s+of|highest\s+paying|lucrative\s+stipend)\b/gi
  ];
  const rewardLureLanguage: string[] = [];
  for (const regex of rewardKeywords) {
    const matches = text.match(regex);
    if (matches) rewardLureLanguage.push(...matches);
  }

  // Interview status
  let interviewStatus = 'Standard Interview';
  if (/(?:without\s+(?:any\s+)?interview|no\s+interview\s+(?:is\s+)?required|direct\s+(?:selection|appointment|placement|joining)|shortlisted\s+(?:directly\s+)?based\s+on\s+(?:your\s+)?(?:resume|cv|profile)|selected\s+without\s+test|direct\s+recruitment)/i.test(text)) {
    interviewStatus = 'No Interview Required (Direct Selection)';
  } else if (/(?:telephonic|virtual|zoom|google\s+meet|in-person|technical)\s+interview/i.test(text)) {
    interviewStatus = 'Interview Mentioned';
  }

  // Telegram / WhatsApp recruitment
  const telegramWhatsAppMatches = text.match(/\b(?:telegram|whatsapp|wa\.me|t\.me)\b/gi);
  if (telegramWhatsAppMatches) {
    urgencyPhrases.push(...telegramWhatsAppMatches.map(m => `Recruitment via ${m}`));
  }

  // Company extraction (heuristic lookups + prominent enterprise dictionary)
  let companyName = '';
  const companyMatch = text.match(/(?:at|for|from|with|company:?|employer:?|organization:?)\s+([A-Z][A-Za-z0-9&.\s]{2,25}(?:Technologies|Tech|Solutions|Pvt|Ltd|Inc|LLC|Corporation|Corp|Group|Services)?)/i);
  if (companyMatch) {
    companyName = companyMatch[1].trim();
  }

  if (!companyName) {
    const prominentBrands = [
      'Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Tata Consultancy Services',
      'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'IBM', 'Netflix', 'Uber',
      'Deloitte', 'PwC', 'KPMG', 'EY', 'Ernst & Young', 'Capgemini', 'Tech Mahindra',
      'HCL', 'Oracle', 'Cisco', 'Intel', 'Nvidia', 'Tesla', 'Flipkart', 'Walmart', 'Samsung'
    ];
    for (const b of prominentBrands) {
      const bRegex = new RegExp(`\\b${b}\\b`, 'i');
      if (bRegex.test(text)) {
        companyName = b;
        break;
      }
    }
  }

  // Salary
  let salary = '';
  const salaryMatch = text.match(/(?:salary|ctc|stipend|package|compensation|pay)\s*[:=-]?\s*([₹$€£\w\s.,/-]+(?:per\s+(?:month|annum|year|hr|day)|lpa|pm)?)/i);
  if (salaryMatch) {
    salary = salaryMatch[1].trim();
  }

  // Specific fee categories
  const equipmentCharges = (text.match(/(?:laptop|equipment|macbook|hardware|gadget)\s*(?:charges?|fee|security|cost|deposit|amount)[^.\n]*/gi) || []);
  const registrationFees = (text.match(/(?:registration|application|processing|enrolment|documentation|stamp\s*paper|verification)\s*(?:fee|charges?|amount|cost)[^.\n]*/gi) || []);
  const trainingFees = (text.match(/(?:training|orientation|course|module|certification|onboarding)\s*(?:fee|charges?|cost|amount)[^.\n]*/gi) || []);
  const securityFees = (text.match(/(?:security|caution|refundable)\s*(?:deposit|money|guarantee|amount)[^.\n]*/gi) || []);

  return {
    company_name: companyName,
    recruiter_name: '',
    email: emails[0] || '',
    phone: phones[0] || '',
    job_title: '',
    salary,
    location: '',
    joining_date: '',
    interview_status: interviewStatus,
    urls,
    payment_requests: Array.from(new Set(paymentRequests)),
    upi_ids: Array.from(new Set(upiIds)),
    bank_details: Array.from(new Set(bankDetails)),
    crypto_requests: Array.from(new Set(cryptoRequests)),
    deposit_requirements: Array.from(new Set(securityFees)),
    equipment_charges: Array.from(new Set(equipmentCharges)),
    registration_fees: Array.from(new Set(registrationFees)),
    training_fees: Array.from(new Set(trainingFees)),
    security_fees: Array.from(new Set(securityFees)),
    personal_data_requests: Array.from(new Set(personalData)),
    otp_requests: Array.from(new Set(otpRequests)),
    password_requests: Array.from(new Set(passwordRequests)),
    aadhaar_pan_requests: Array.from(new Set(aadhaarPanRequests)),
    urgency_phrases: Array.from(new Set(urgencyPhrases)),
    threatening_language: Array.from(new Set(threateningLanguage)),
    reward_lure_language: Array.from(new Set(rewardLureLanguage)),
  };
}

/**
 * AI-powered extractor using Gemini 3.8 Flash with structured schema.
 */
export async function extractEntitiesWithAI(
  content: string,
  scanType: ScanType = 'JOB_OFFER',
  base64File?: { data: string; mimeType: string }
): Promise<{ entities: ExtractedEntities; extractedText?: string }> {
  const heuristic = extractEntitiesHeuristic(content, scanType);
  const ai = getAiClient();

  if (!ai) {
    return { entities: heuristic, extractedText: content };
  }

  try {
    const prompt = `You are ScamShield AI, an expert cybersecurity forensic analyst specializing in fake job offers, recruitment fraud, phishing scams, and rental scams.
Analyze the following ${scanType === 'JOB_OFFER' ? 'job offer / recruiter message' : 'rental listing / landlord communication'}.
Extract all entities, financial demands, identity details, credential queries, and social-engineering indicators.

CRITICAL INSTRUCTIONS FOR URGENCY DETECTION:
- Extract to "urgency_phrases" ONLY artificial panic pressure or coercive deadlines (e.g., "valid only today", "within 30 minutes", "limited slots", "immediate fee required", "offer expires today").
- Do NOT flag standard legitimate corporate offer acceptance periods (e.g., "please sign and return within 7 business days", "valid for 10 days", "offer valid until [date]", "please confirm acceptance within 5 days") as urgency. These are standard professional HR practices.

Extract factual entities without assuming or hallucinating details. Return JSON.`;

    const contents: any[] = [];
    if (base64File) {
      contents.push({
        inlineData: {
          mimeType: base64File.mimeType,
          data: base64File.data,
        },
      });
    }
    contents.push({
      text: `${prompt}\n\nContent:\n${content.slice(0, 15000)}`,
    });

    const response = await generateWithFallback(
      ai,
      () => ({
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              extracted_text: { type: Type.STRING, description: "Full text content extracted from document or image if OCR was needed" },
              company_name: { type: Type.STRING },
              recruiter_name: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              job_title: { type: Type.STRING },
              salary: { type: Type.STRING },
              location: { type: Type.STRING },
              joining_date: { type: Type.STRING },
              interview_status: { type: Type.STRING },
              urls: { type: Type.ARRAY, items: { type: Type.STRING } },
              payment_requests: { type: Type.ARRAY, items: { type: Type.STRING } },
              upi_ids: { type: Type.ARRAY, items: { type: Type.STRING } },
              bank_details: { type: Type.ARRAY, items: { type: Type.STRING } },
              crypto_requests: { type: Type.ARRAY, items: { type: Type.STRING } },
              deposit_requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              equipment_charges: { type: Type.ARRAY, items: { type: Type.STRING } },
              registration_fees: { type: Type.ARRAY, items: { type: Type.STRING } },
              training_fees: { type: Type.ARRAY, items: { type: Type.STRING } },
              security_fees: { type: Type.ARRAY, items: { type: Type.STRING } },
              personal_data_requests: { type: Type.ARRAY, items: { type: Type.STRING } },
              otp_requests: { type: Type.ARRAY, items: { type: Type.STRING } },
              password_requests: { type: Type.ARRAY, items: { type: Type.STRING } },
              aadhaar_pan_requests: { type: Type.ARRAY, items: { type: Type.STRING } },
              urgency_phrases: { type: Type.ARRAY, items: { type: Type.STRING } },
              threatening_language: { type: Type.ARRAY, items: { type: Type.STRING } },
              reward_lure_language: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              "company_name",
              "email",
              "urls",
              "payment_requests",
              "urgency_phrases"
            ]
          },
        },
      }),
      10000
    );

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      // Merge AI extraction with heuristic to ensure high recall
      const merged: ExtractedEntities = {
        company_name: parsed.company_name || heuristic.company_name,
        recruiter_name: parsed.recruiter_name || heuristic.recruiter_name,
        email: parsed.email || heuristic.email,
        phone: parsed.phone || heuristic.phone,
        job_title: parsed.job_title || heuristic.job_title,
        salary: parsed.salary || heuristic.salary,
        location: parsed.location || heuristic.location,
        joining_date: parsed.joining_date || heuristic.joining_date,
        interview_status: parsed.interview_status || heuristic.interview_status,
        urls: Array.from(new Set([...(parsed.urls || []), ...heuristic.urls])),
        payment_requests: Array.from(new Set([...(parsed.payment_requests || []), ...heuristic.payment_requests])),
        upi_ids: Array.from(new Set([...(parsed.upi_ids || []), ...heuristic.upi_ids])),
        bank_details: Array.from(new Set([...(parsed.bank_details || []), ...heuristic.bank_details])),
        crypto_requests: Array.from(new Set([...(parsed.crypto_requests || []), ...heuristic.crypto_requests])),
        deposit_requirements: Array.from(new Set([...(parsed.deposit_requirements || []), ...heuristic.deposit_requirements])),
        equipment_charges: Array.from(new Set([...(parsed.equipment_charges || []), ...heuristic.equipment_charges])),
        registration_fees: Array.from(new Set([...(parsed.registration_fees || []), ...heuristic.registration_fees])),
        training_fees: Array.from(new Set([...(parsed.training_fees || []), ...heuristic.training_fees])),
        security_fees: Array.from(new Set([...(parsed.security_fees || []), ...heuristic.security_fees])),
        personal_data_requests: Array.from(new Set([...(parsed.personal_data_requests || []), ...heuristic.personal_data_requests])),
        otp_requests: Array.from(new Set([...(parsed.otp_requests || []), ...heuristic.otp_requests])),
        password_requests: Array.from(new Set([...(parsed.password_requests || []), ...heuristic.password_requests])),
        aadhaar_pan_requests: Array.from(new Set([...(parsed.aadhaar_pan_requests || []), ...heuristic.aadhaar_pan_requests])),
        urgency_phrases: Array.from(new Set([...(parsed.urgency_phrases || []), ...heuristic.urgency_phrases]))
          .filter(phrase => !/(?:within|in)\s+(?:[3-9]|[12][0-9]|30)\s*(?:business\s+)?days/i.test(phrase)),
        threatening_language: Array.from(new Set([...(parsed.threatening_language || []), ...heuristic.threatening_language])),
        reward_lure_language: Array.from(new Set([...(parsed.reward_lure_language || []), ...heuristic.reward_lure_language])),
      };
      return {
        entities: merged,
        extractedText: parsed.extracted_text || content,
      };
    }
  } catch (err) {
    console.error("Gemini AI extraction error, falling back to heuristics:", err);
  }

  return { entities: heuristic, extractedText: content };
}

/**
 * Generates an intelligent, context-grounded security advisory response
 * using the extracted threat score, red flags, domain intelligence, and recommendations.
 */
function generateContextualAdvisorResponse(question: string, scanReportContext: any): string {
  const threatScore = scanReportContext.threat_score ?? 0;
  const riskLevel = scanReportContext.risk_level || 'CAUTION';
  const redFlags = scanReportContext.red_flags || [];
  const topFlags = redFlags.map((f: any) => `• ${f.label}: ${f.explanation}`).join('\n');
  const recommendations = scanReportContext.recommendations || [];
  const compVerif = scanReportContext.company_verification;
  const qLower = question.toLowerCase();

  let focusAdvice = "";

  if (qLower.includes('payment') || qLower.includes('money') || qLower.includes('fee') || qLower.includes('cost') || qLower.includes('deposit') || qLower.includes('laptop')) {
    focusAdvice = `**Payment Hazard Assessment:**\nDemanding fees for interviews, training, equipment, or refundable "laptop deposits" is the #1 indicator of recruitment fraud. Genuine enterprise employers never ask candidates to wire funds via UPI, cryptocurrency, or personal bank accounts. Under no circumstances should you make any advance transfers.`;
  } else if (qLower.includes('recruiter') || qLower.includes('contact') || qLower.includes('email') || qLower.includes('reach out')) {
    const claimedCompany = compVerif?.claimed_company || 'the claimed company';
    focusAdvice = `**Recruiter Communication Protocol:**\nDo not respond directly using the contact methods provided in this message. Instead, visit the official career website of ${claimedCompany} directly in a clean browser window, search for the Job ID, or contact HR via verified public directory channels.`;
  } else if (qLower.includes('red flag') || qLower.includes('suspicious') || qLower.includes('danger') || qLower.includes('why')) {
    focusAdvice = `**Critical Indicators Detected:**\n${topFlags || 'No high-risk flags identified, though vigilance is always advised.'}`;
  } else if (qLower.includes('safe') || qLower.includes('should i') || qLower.includes('what should i do') || qLower.includes('next')) {
    focusAdvice = `**Immediate Action Plan:**\n1. Stop all communications with the sender.\n2. Do NOT click any links, open attachments, or send identity documents.\n3. Verify the role directly on the company's verified domain.\n4. Report this communication to your cybercrime reporting portal if money was requested.`;
  } else {
    focusAdvice = `**Forensic Evaluation:**\nThis incident has been assigned a **Scam Threat Index of ${threatScore}/100 (${riskLevel} RISK)**.\n\n${topFlags ? `Key indicators identified:\n${topFlags}\n\n` : ''}${recommendations.length > 0 ? `Recommended actions:\n${recommendations.slice(0, 3).map((r: string) => `• ${r}`).join('\n')}` : ''}`;
  }

  return `[ScamShield Cyber Incident Advisor]\n\n${focusAdvice}`;
}

/**
 * Contextual AI Security Assistant ("Ask ScamShield AI")
 */
export async function askSecurityAssistant(
  question: string,
  scanReportContext: any
): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    return generateContextualAdvisorResponse(question, scanReportContext);
  }

  try {
    const systemPrompt = `You are ScamShield AI Cyber Assistant, an elite cybersecurity incident responder and recruitment/phishing fraud expert.
The user is asking a question about a specific security scan report.
You must answer strictly based on the provided scan analysis results.
DO NOT fabricate evidence or claim certainty where data is unavailable.
Provide clear, actionable, calm, and protective advice.

Scan Report Context:
Threat Score: ${scanReportContext.threat_score} / 100 (${scanReportContext.risk_level})
Scan Type: ${scanReportContext.scan_type}
Scam Types: ${JSON.stringify(scanReportContext.scam_types)}
Risk Breakdown: ${JSON.stringify(scanReportContext.risk_breakdown)}
Red Flags: ${JSON.stringify(scanReportContext.red_flags)}
Evidence: ${JSON.stringify(scanReportContext.evidence)}
Domain Intel: ${JSON.stringify(scanReportContext.domain_intel || {})}
Company Verification: ${JSON.stringify(scanReportContext.company_verification || {})}
Recommendations: ${JSON.stringify(scanReportContext.recommendations)}`;

    const response = await generateWithFallback(
      ai,
      () => ({
        contents: [
          { text: `${systemPrompt}\n\nUser Question: ${question}` }
        ]
      }),
      10000
    );

    return response.text || generateContextualAdvisorResponse(question, scanReportContext);
  } catch (err: any) {
    console.warn("AI Assistant fallback engaged (Gemini high demand or quota reached):", err?.message || err);
    return generateContextualAdvisorResponse(question, scanReportContext);
  }
}

export interface VoiceAgentResponse {
  spokenText: string;
  action?: 'NONE' | 'LOAD_DEMO_SCAM' | 'FOCUS_CHECKLIST' | 'EXPLAIN_THREAT' | 'REPORT_SCAM';
  alertLevel: 'INFO' | 'WARNING' | 'DANGER' | 'SAFE';
  keyTakeaway: string;
}

/**
 * Intelligent Voice Agent "Protector" conversational handler
 */
export async function askProtectorVoiceAgent(
  message: string,
  scanReportContext?: any,
  _history?: { role: string; text: string }[]
): Promise<VoiceAgentResponse> {
  const msgLower = (message || '').toLowerCase().trim();

  // Handle immediate wake greetings
  if (!msgLower || msgLower === 'protector' || msgLower === 'hey protector' || msgLower === 'hello protector' || msgLower === 'wake up protector' || msgLower === 'hi protector') {
    if (scanReportContext && scanReportContext.threat_score) {
      return {
        spokenText: `Protector online. I am monitoring your active scan report for ${scanReportContext.extracted_entities?.company_name || 'this document'}, which has a threat score of ${scanReportContext.threat_score} out of 100. How can I protect you?`,
        alertLevel: scanReportContext.threat_score >= 70 ? 'DANGER' : 'INFO',
        keyTakeaway: 'Protector Awake & Active'
      };
    }
    return {
      spokenText: "Protector activated. I'm listening. Ask me about any job offer, payment request, suspicious message, or cybersecurity threat.",
      alertLevel: 'SAFE',
      keyTakeaway: 'Protector Standing By'
    };
  }

  // Check if AI is available
  const ai = getAiClient();
  if (ai) {
    try {
      const activeScanSummary = scanReportContext && scanReportContext.threat_score
        ? `Active Document Scan: Company: ${scanReportContext.extracted_entities?.company_name || 'Unknown'}, Threat Score: ${scanReportContext.threat_score}/100, Risk Level: ${scanReportContext.risk_level}, Top Red Flags: ${(scanReportContext.red_flags || []).map((f: any) => f.label).join(', ')}`
        : 'No document currently scanned.';

      const prompt = `You are "Protector", the voice cybersecurity guardian in ScamShield AI.
The user just called your wake word "Protector" or asked: "${message}".

Active Context:
${activeScanSummary}

Guidelines:
1. Spoken length: 2 to 3 sentences maximum so it sounds natural when spoken aloud.
2. Tone: Calm, sharp, reassuring, protective.
3. CRITICAL: Strictly avoid asterisks, hashtags, bullet points, or markdown formatting because this will be read aloud by a text-to-speech engine.
4. If money, UPI, laptop deposits, training fees, or OTPs are mentioned, issue a stern warning that legitimate corporate employers never charge applicants.
5. If the user asks about the current scan, explain the specific red flags detected.

Respond with a JSON object:
{
  "spokenText": "Clear spoken sentences without asterisks or markdown",
  "action": "NONE" or "EXPLAIN_THREAT" or "LOAD_DEMO_SCAM" or "FOCUS_CHECKLIST" or "REPORT_SCAM",
  "alertLevel": "SAFE" or "INFO" or "WARNING" or "DANGER",
  "keyTakeaway": "Short 3 to 5 word summary"
}`;

      const response = await generateWithFallback(
        ai,
        () => ({
          contents: [{ text: prompt }],
          config: {
            responseMimeType: "application/json"
          }
        }),
        8000
      );

      if (response.text) {
        try {
          const parsed = JSON.parse(response.text);
          if (parsed && parsed.spokenText) {
            // Strip any residual asterisks or markdown
            parsed.spokenText = parsed.spokenText.replace(/[*#_`]/g, '').trim();
            return parsed;
          }
        } catch {
          // If JSON parse fails, clean the text and return
          const cleanText = response.text.replace(/[{}"\n]|spokenText:|action:|alertLevel:|keyTakeaway:/gi, ' ').replace(/[*#_`]/g, '').trim();
          return {
            spokenText: cleanText.slice(0, 300),
            alertLevel: 'INFO',
            keyTakeaway: 'Security Advice'
          };
        }
      }
    } catch (err: any) {
      console.warn("Protector AI fallback engaged:", err?.message || err);
    }
  }

  // Heuristic rule-based fallback (Instant, zero-latency, 100% reliable)
  if (msgLower.includes('laptop') || msgLower.includes('equipment') || msgLower.includes('deposit') || msgLower.includes('fee') || msgLower.includes('pay') || msgLower.includes('money') || msgLower.includes('upi')) {
    return {
      spokenText: "Danger detected. Legitimate companies will never ask you to pay for equipment, laptop security deposits, or training fees. Do not transfer any money or share UPI details, as this is guaranteed fraud.",
      action: 'NONE',
      alertLevel: 'DANGER',
      keyTakeaway: 'Never Pay For Jobs'
    };
  }

  if (msgLower.includes('telegram') || msgLower.includes('whatsapp')) {
    return {
      spokenText: "Warning. Legitimate corporate recruitment is conducted through official company email addresses, not Telegram or WhatsApp. Scammers use messaging apps to hide their identities and evade law enforcement.",
      action: 'NONE',
      alertLevel: 'WARNING',
      keyTakeaway: 'Off-Platform Risk'
    };
  }

  if (msgLower.includes('why') || msgLower.includes('threat score') || msgLower.includes('red flag') || msgLower.includes('explain')) {
    if (scanReportContext && scanReportContext.threat_score) {
      const topFlags = (scanReportContext.red_flags || []).slice(0, 2).map((f: any) => f.label).join(' and ');
      return {
        spokenText: `This scan was flagged with a ${scanReportContext.threat_score} out of 100 high threat score because we detected ${topFlags || 'critical anomalies in the offer terms'}. Would you like me to walk you through the verification checklist?`,
        action: 'EXPLAIN_THREAT',
        alertLevel: 'DANGER',
        keyTakeaway: 'Threat Flags Detected'
      };
    }
    return {
      spokenText: "The Threat Index evaluates seven forensic vectors including advance fee demands, domain age, interview verification, and social engineering pressure. Scan any suspicious text or PDF to see a complete forensic breakdown.",
      action: 'NONE',
      alertLevel: 'INFO',
      keyTakeaway: 'Threat Scoring Engine'
    };
  }

  if (msgLower.includes('what should i do') || msgLower.includes('next steps') || msgLower.includes('checklist')) {
    return {
      spokenText: "First, pause all communication with the sender. Do not send identity proofs or payments. Second, verify the job directly on the employer's official careers portal. Third, report suspicious solicitations to cybercrime authorities.",
      action: 'FOCUS_CHECKLIST',
      alertLevel: 'WARNING',
      keyTakeaway: 'Immediate Action Plan'
    };
  }

  if (msgLower.includes('demo') || msgLower.includes('test') || msgLower.includes('sample')) {
    return {
      spokenText: "Loading a simulated fraudulent job offer for you now. Notice how the fake recruiter promises eighteen lakhs without an interview and demands a fifteen thousand rupee laptop deposit.",
      action: 'LOAD_DEMO_SCAM',
      alertLevel: 'INFO',
      keyTakeaway: 'Sample Scam Loaded'
    };
  }

  if (msgLower.includes('report') || msgLower.includes('police') || msgLower.includes('1930') || msgLower.includes('portal')) {
    return {
      spokenText: "If you have lost money or received extortion threats, report immediately to the National Cyber Crime Portal at cybercrime.gov.in or call the 1930 emergency helpline.",
      action: 'REPORT_SCAM',
      alertLevel: 'WARNING',
      keyTakeaway: 'Cybercrime Helpline 1930'
    };
  }

  return {
    spokenText: "I am Protector, your cybersecurity guardian. You can ask me to evaluate any offer letter, verify an employer domain, or explain warning flags. How can I assist you right now?",
    action: 'NONE',
    alertLevel: 'INFO',
    keyTakeaway: 'Protector Active'
  };
}

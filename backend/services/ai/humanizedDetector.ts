import { HumanizedEvasionAnalysis, ExtractedEntities } from '../../types.js';

/**
 * Humanized AI-Evasion Analysis Engine
 * Detects when scammers use conversational sweeteners, AI prompt engineering,
 * or polite humanized language to mask fraudulent coercive payloads.
 */
export function analyzeHumanizedEvasion(
  content: string,
  entities: ExtractedEntities
): HumanizedEvasionAnalysis {
  const text = content.toLowerCase();
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);

  // 1. Measure Sentence Burstiness (Sentence length variation)
  // Highly uniform sentence lengths often indicate template/AI generated text
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avgLen = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const variance = lengths.length > 1
    ? lengths.reduce((acc, len) => acc + Math.pow(len - avgLen, 2), 0) / lengths.length
    : 10;
  const stdDev = Math.sqrt(variance);
  // Low stdDev (< 4) means mechanical uniformity; moderate (4-12) is typical AI rephrase
  const burstinessScore = Math.min(100, Math.max(10, Math.round((stdDev / (avgLen || 1)) * 100)));

  // 2. Identify Polite Conversational Camouflage & Empathy Markers
  const politeSweeteners = [
    'hope this email finds you well',
    'warmest regards',
    'we are thoroughly impressed',
    'pleasure to connect',
    'great potential',
    'standout candidate',
    'understand the job market',
    'we care about your career',
    'glad to offer you',
    'exceptional profile',
    'truly outstanding',
    'friendly reminder',
    'kindly note',
    'rest assured',
    'completely refundable',
    'safeguard your interest',
    '100% refundable',
    'no need to worry',
    'we value your trust'
  ];

  let sweetenerMatches = 0;
  for (const phrase of politeSweeteners) {
    if (text.includes(phrase)) sweetenerMatches++;
  }

  const empathyIndex = Math.min(100, sweetenerMatches * 22 + (text.includes('refundable') ? 25 : 0));

  // 3. Detect Underlying Coercive Vectors (The Poison Pill)
  const hasFee = entities.payment_requests.length > 0 ||
    entities.upi_ids.length > 0 ||
    entities.deposit_requirements.length > 0 ||
    entities.equipment_charges.length > 0 ||
    entities.registration_fees.length > 0 ||
    entities.crypto_requests.length > 0 ||
    text.includes('refundable deposit') ||
    text.includes('processing fee') ||
    text.includes('security deposit') ||
    text.includes('laptop charge');

  const hasUrgency = entities.urgency_phrases.length > 0 ||
    text.includes('within 24 hours') ||
    text.includes('immediate joining') ||
    text.includes('offer will be revoked') ||
    text.includes('lapse') ||
    text.includes('today itself');

  const hasCredentialsOrOtp = entities.otp_requests.length > 0 ||
    entities.password_requests.length > 0 ||
    entities.aadhaar_pan_requests.length > 0;

  const hasNoInterview = entities.interview_status?.toLowerCase().includes('direct') ||
    text.includes('without interview') ||
    text.includes('direct selection') ||
    text.includes('resume shortlist only');

  // 4. Sentiment Asymmetry (High Politeness + Extortion Demand)
  // If the email uses very polite language but demands money/credentials, sentiment asymmetry is extreme
  let sentimentAsymmetry = 15;
  if (hasFee && sweetenerMatches > 0) {
    sentimentAsymmetry = Math.min(98, 45 + sweetenerMatches * 14 + (hasUrgency ? 20 : 0));
  } else if (hasFee) {
    sentimentAsymmetry = 70;
  } else if (hasUrgency && sweetenerMatches > 0) {
    sentimentAsymmetry = 55;
  }

  // 5. Perplexity Variance (AI Rephrasing Signature)
  // Typical prompt injection: "rewrite this offer to sound genuine, reassuring, and corporate"
  const corporateJargon = [
    'streamlined onboarding',
    'talent acquisition specialist',
    'esteemed organization',
    'career aspirations',
    'mutual growth',
    'premier multinational',
    'seamless transition'
  ];
  let jargonCount = 0;
  for (const phrase of corporateJargon) {
    if (text.includes(phrase)) jargonCount++;
  }
  const perplexityVariance = Math.min(95, 30 + jargonCount * 18 + sweetenerMatches * 10);

  // 6. Detected Evasion Tactics
  const detectedTactics: string[] = [];
  if (sweetenerMatches >= 2 && hasFee) {
    detectedTactics.push('Empathy Priming & Rapport Camouflage (Disarming critical thinking with pleasantries)');
  }
  if (text.includes('refundable') && hasFee) {
    detectedTactics.push('Euphemistic Fee Packaging (Labeling advance payment as "refundable asset allocation")');
  }
  if (sweetenerMatches >= 1 && hasUrgency) {
    detectedTactics.push('Cognitive Dissonance Urgency (Warm greeting juxtaposed against immediate forfeiture ultimatum)');
  }
  if (hasNoInterview && sweetenerMatches >= 1) {
    detectedTactics.push('Pseudo-Meritocratic Flattery (Praising qualifications to bypass lack of technical assessment)');
  }
  if (jargonCount >= 2) {
    detectedTactics.push('LLM Synthetic Corporate Tone (Polished vocabulary concealing unverified sender domain)');
  }
  if (detectedTactics.length === 0) {
    if (hasFee) detectedTactics.push('Direct Advance-Fee Solicitation');
    else detectedTactics.push('Standard Procedural Correspondence');
  }

  // 7. Fluff-to-Signal Ratio
  // Calculate how much text is conversational padding vs actionable business contract
  const totalWords = content.split(/\s+/).length;
  let signalWordCount = 0;
  if (entities.company_name) signalWordCount += 4;
  if (entities.salary) signalWordCount += 4;
  if (entities.job_title) signalWordCount += 4;
  signalWordCount += entities.payment_requests.length * 8;
  signalWordCount += entities.upi_ids.length * 6;
  signalWordCount += entities.urls.length * 4;

  const estimatedFluffWords = Math.max(0, totalWords - signalWordCount);
  const fluffToSignalRatio = totalWords > 0
    ? Math.min(92, Math.max(15, Math.round((estimatedFluffWords / totalWords) * 100)))
    : 50;

  // 8. Core Intent Extraction ("De-Humanized Naked Contract")
  // Strip out the pleasantries and state the unvarnished transactional contract
  const coreParts: string[] = [];
  if (entities.company_name) {
    coreParts.push(`Purported Entity: ${entities.company_name}`);
  }
  if (entities.job_title) {
    coreParts.push(`Offered Role: ${entities.job_title} (${entities.salary || 'Unspecified Compensation'})`);
  }
  if (hasNoInterview) {
    coreParts.push(`Assessment: Zero technical interview / Direct selection via resume`);
  }
  if (entities.payment_requests.length > 0 || entities.upi_ids.length > 0 || text.includes('fee') || text.includes('deposit')) {
    const feeStr = entities.payment_requests[0] || entities.deposit_requirements[0] || 'Mandatory Advance Fee';
    const upiStr = entities.upi_ids.length > 0 ? ` to VPA ${entities.upi_ids.join(', ')}` : '';
    coreParts.push(`CORE TRANSACTIONAL DEMAND: Remit ${feeStr}${upiStr}`);
  }
  if (hasUrgency) {
    coreParts.push(`DEADLINE COERCION: ${entities.urgency_phrases[0] || 'Immediate 24-hr payment or forfeiture'}`);
  }
  if (hasCredentialsOrOtp) {
    coreParts.push(`DATA HARVEST: Demanding personal identification tokens / OTP`);
  }
  if (coreParts.length === 0) {
    coreParts.push('General informational inquiry without identified coercive extraction vectors.');
  }

  const coreIntentExtracted = coreParts.join(' | ');

  // 9. Overall Evasion Score
  let evasionScore = 15;
  if (hasFee && sweetenerMatches > 0) {
    evasionScore = Math.min(96, 50 + sweetenerMatches * 12 + (hasUrgency ? 15 : 0));
  } else if (hasFee) {
    evasionScore = 65;
  } else if (sweetenerMatches >= 3) {
    evasionScore = 48;
  } else if (hasNoInterview) {
    evasionScore = 40;
  }

  const camouflageLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' =
    evasionScore >= 80 ? 'CRITICAL' :
    evasionScore >= 60 ? 'HIGH' :
    evasionScore >= 35 ? 'MODERATE' : 'LOW';

  const isAiHumanized = evasionScore >= 55 || (sweetenerMatches >= 2 && hasFee);

  let evasionExplanation = '';
  if (isAiHumanized) {
    evasionExplanation = `The sender utilized ${sweetenerMatches} polite conversational empathy cues and corporate reassurance formulas to disguise an underlying ${hasFee ? 'advance-fee extortion' : 'unverified solicitation'}. By packaging coercive demands in warm tone, heuristic spam filters and candidate defenses are intentionally bypassed.`;
  } else {
    evasionExplanation = `Text structure exhibits standard direct communication syntax without anomalous sentiment asymmetry or synthetic conversational fluff.`;
  }

  return {
    evasionScore,
    camouflageLevel,
    isAiHumanized,
    stylometrics: {
      burstinessScore,
      perplexityVariance,
      sentimentAsymmetry,
      empathyIndex,
    },
    detectedTactics,
    coreIntentExtracted,
    fluffToSignalRatio,
    evasionExplanation,
  };
}

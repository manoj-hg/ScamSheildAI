import { jsPDF } from 'jspdf';
import { ScanResult } from '../types';

/**
 * Generates and downloads a formal, comprehensive forensic PDF report for a ScanResult.
 */
export async function downloadScanReportPdf(scanResult: ScanResult): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin;
      drawPageBorder();
    }
  };

  const drawPageBorder = () => {
    // Subtle top accent line
    doc.setFillColor(6, 182, 212); // cyan-500
    doc.rect(margin, 8, contentWidth, 1.2, 'F');
  };

  // Initial page accent
  drawPageBorder();

  // ==========================================
  // 1. FORMAL HEADER
  // ==========================================
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SCAMSHIELD AI - CYBER FORENSIC INCIDENT REPORT', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    'Deterministic Fraud Verification & Explainable Scam Threat Telemetry',
    margin + 6,
    y + 15
  );

  // Reference Metadata Box on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 182, 212); // cyan-400
  doc.text(`INCIDENT ID: ${scanResult.scan_id}`, pageWidth - margin - 6, y + 8, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    `DATE: ${new Date(scanResult.timestamp).toLocaleString('en-US', { hour12: true })}`,
    pageWidth - margin - 6,
    y + 14,
    { align: 'right' }
  );
  doc.text(
    `AUDIT MODEL: ${scanResult.trained_model || 'ScamShield-LoRA-Production-v2.6'}`,
    pageWidth - margin - 6,
    y + 20,
    { align: 'right' }
  );

  y += 32;

  // ==========================================
  // 2. EXECUTIVE VERDICT & THREAT SCORE BANNER
  // ==========================================
  const score = scanResult.threat_score;
  const risk = scanResult.risk_level;

  let riskColor = [5, 150, 105]; // Emerald
  let riskBg = [236, 253, 245];
  let verdictTitle = 'VERIFIED LOW RISK - STANDARD CORPORATE PATTERN';

  if (risk === 'HIGH') {
    riskColor = [220, 38, 38]; // Red
    riskBg = [254, 242, 242];
    verdictTitle = 'CRITICAL RISK - SEVERE FRAUD VECTOR CONFIRMED';
  } else if (risk === 'SUSPICIOUS') {
    riskColor = [217, 119, 6]; // Amber
    riskBg = [255, 251, 235];
    verdictTitle = 'ELEVATED SUSPICION - ANOMALOUS RECRUITMENT OBSERVED';
  } else if (risk === 'CAUTION') {
    riskColor = [202, 138, 4]; // Yellow
    riskBg = [254, 252, 232];
    verdictTitle = 'CAUTION ADVISED - UNVERIFIED ATTRIBUTES DETECTED';
  }

  // Verdict Container Box
  doc.setFillColor(riskBg[0], riskBg[1], riskBg[2]);
  doc.setDrawColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 34, 2.5, 2.5, 'FD');

  // Threat Index Badge / Dial representation
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(margin + 5, y + 5, 34, 24, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`${score}`, margin + 22, y + 16, { align: 'center' });
  doc.setFontSize(7);
  doc.text('SCORE / 100', margin + 22, y + 22, { align: 'center' });

  // Verdict Text
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(verdictTitle, margin + 44, y + 11);

  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const scanTypeLabel = scanResult.scan_type === 'RENTAL_SCAM' ? 'Rental Property Fraud Audit' : 'Job Appointment & Recruitment Fraud Audit';
  const targetLabel = scanResult.file_name ? `Document: ${scanResult.file_name}` : scanResult.url ? `URL: ${scanResult.url}` : 'Text / Message Content Scan';
  doc.text(`Investigation Scope: ${scanTypeLabel}  |  Input Format: ${scanResult.input_type}  |  ${targetLabel}`, margin + 44, y + 17);

  const scamTypesSummary = scanResult.scam_types && scanResult.scam_types.length > 0
    ? `Identified Vectors: ${scanResult.scam_types.join(' • ')}`
    : 'Identified Vectors: No dominant malicious vectors detected';
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(scamTypesSummary, margin + 44, y + 23);

  y += 40;

  // ==========================================
  // 3. TARGET PARTICULARS & EXTRACTED ENTITIES
  // ==========================================
  ensureSpace(45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. FORENSIC ENTITY EXTRACTIONS', margin, y);
  y += 3;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 34, 1.5, 1.5, 'FD');

  const entities = scanResult.extracted_entities || ({} as any);
  const col1X = margin + 5;
  const col2X = margin + 65;
  const col3X = margin + 125;

  doc.setFontSize(7.5);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CLAIMED ENTITY / COMPANY', col1X, y + 7);
  doc.text('SENDER / RECRUITER CONTACT', col2X, y + 7);
  doc.text('OFFICIAL ROLE / POSITION', col3X, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(entities.company_name || 'Not Specified / Hidden', col1X, y + 12);
  doc.text(entities.email || entities.phone || 'Anonymous / Not Provided', col2X, y + 12);
  doc.text(entities.job_title || 'N/A', col3X, y + 12);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('STATED COMPENSATION', col1X, y + 20);
  doc.text('FINANCIAL / PAYMENT DEMANDS', col2X, y + 20);
  doc.text('URGENCY PHRASES / TIMELINE', col3X, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(entities.salary || 'Not Disclosed', col1X, y + 25);
  
  const paymentDemands = entities.payment_requests?.length 
    ? entities.payment_requests.join(', ') 
    : 'None explicitly stated';
  const truncatedPayments = paymentDemands.length > 32 ? paymentDemands.substring(0, 30) + '...' : paymentDemands;
  doc.setTextColor(entities.payment_requests?.length ? 220 : 15, entities.payment_requests?.length ? 38 : 23, entities.payment_requests?.length ? 38 : 42);
  doc.text(truncatedPayments, col2X, y + 25);

  doc.setTextColor(15, 23, 42);
  const urgencyText = entities.urgency_phrases?.length ? entities.urgency_phrases[0] : 'None observed';
  const truncatedUrgency = urgencyText.length > 32 ? urgencyText.substring(0, 30) + '...' : urgencyText;
  doc.text(truncatedUrgency, col3X, y + 25);

  y += 42;

  // ==========================================
  // 4. WHY WE FLAGGED THIS - RED FLAGS & ANOMALIES
  // ==========================================
  const redFlags = scanResult.red_flags || [];
  if (redFlags.length > 0) {
    ensureSpace(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`2. DETECTED RISK INDICATORS (${redFlags.length} FLAGGED)`, margin, y);
    y += 4;

    for (let i = 0; i < Math.min(redFlags.length, 6); i++) {
      const flag = redFlags[i];
      ensureSpace(14);

      let flagColor = [220, 38, 38];
      let flagBg = [254, 242, 242];
      if (flag.severity === 'MEDIUM') {
        flagColor = [217, 119, 6];
        flagBg = [255, 251, 235];
      } else if (flag.severity === 'LOW') {
        flagColor = [71, 85, 105];
        flagBg = [248, 250, 252];
      }

      doc.setFillColor(flagBg[0], flagBg[1], flagBg[2]);
      doc.setDrawColor(flagColor[0], flagColor[1], flagColor[2]);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, contentWidth, 11.5, 1, 1, 'FD');

      // Severity tag
      doc.setFillColor(flagColor[0], flagColor[1], flagColor[2]);
      doc.roundedRect(margin + 2.5, y + 2.5, 18, 6.5, 0.8, 0.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text(flag.severity || 'FLAG', margin + 11.5, y + 6.8, { align: 'center' });

      // Label & Explanation
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(flag.label, margin + 24, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(71, 85, 105);
      const explanation = flag.explanation.length > 105 ? flag.explanation.substring(0, 102) + '...' : flag.explanation;
      doc.text(explanation, margin + 24, y + 9.5);

      y += 13.5;
    }
    y += 2;
  }

  // ==========================================
  // 5. DOMAIN INTELLIGENCE & IDENTITY VERIFICATION
  // ==========================================
  ensureSpace(42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. DOMAIN & CORPORATE IDENTITY TELEMETRY', margin, y);
  y += 4;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 30, 1.5, 1.5, 'FD');

  const domainIntel = scanResult.domain_intel;
  const companyVerif = scanResult.company_verification;
  const phishingIntel = scanResult.phishing_intel;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('DOMAIN WHOIS AGE', margin + 5, y + 7);
  doc.text('IDENTITY MATCH STATUS', margin + 65, y + 7);
  doc.text('PHISHING INTELLIGENCE', margin + 125, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(domainIntel ? `${domainIntel.domain} (${domainIntel.domainAge})` : 'No Domain Reference in Payload', margin + 5, y + 12);
  
  const mismatchText = companyVerif?.mismatchDetected 
    ? 'MISMATCH: Recruiter domain differs from official entity'
    : companyVerif?.status === 'VERIFIED' 
    ? 'VERIFIED: Official corporate domain verified' 
    : 'UNVERIFIED: Freemail or generic hosting provider';
  doc.text(mismatchText, margin + 65, y + 12);

  const phishingText = phishingIntel?.isBlacklisted
    ? 'CRITICAL: Listed on Global Fraud Blacklists'
    : 'CLEAN: No active blacklists triggered';
  doc.setTextColor(phishingIntel?.isBlacklisted ? 220 : 15, phishingIntel?.isBlacklisted ? 38 : 23, phishingIntel?.isBlacklisted ? 38 : 42);
  doc.text(phishingText, margin + 125, y + 12);

  // Indicators / Lookalikes
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('REGISTRAR & DNS', margin + 5, y + 20);
  doc.text('TYPOSQUATTING / LOOKALIKE', margin + 65, y + 20);
  doc.text('HTTPS SECURITY', margin + 125, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(domainIntel?.registrar || 'Standard DNS', margin + 5, y + 25);
  doc.text(domainIntel?.lookalikeBrand ? `Suspicious Lookalike of: ${domainIntel.lookalikeBrand}` : 'No TypoSquatting detected', margin + 65, y + 25);
  doc.text(domainIntel?.isHttps ? 'HTTPS Valid' : 'Insecure / Plain HTTP', margin + 125, y + 25);

  y += 36;

  // ==========================================
  // 6. ACTIONABLE SAFETY RECOMMENDATIONS
  // ==========================================
  const recommendations = scanResult.recommendations || [];
  if (recommendations.length > 0) {
    ensureSpace(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('4. MANDATORY DEFENSIVE COUNTERMEASURES', margin, y);
    y += 4;

    for (let i = 0; i < Math.min(recommendations.length, 4); i++) {
      const rec = recommendations[i];
      ensureSpace(9);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(6, 182, 212);
      doc.text(`${i + 1}.`, margin + 3, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      const recText = rec.text.length > 115 ? rec.text.substring(0, 112) + '...' : rec.text;
      doc.text(recText, margin + 9, y + 5.5);

      y += 9.5;
    }
    y += 2;
  }

  // ==========================================
  // 7. FORMAL LEGAL CERTIFICATION & FOOTER
  // ==========================================
  ensureSpace(28);
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('LEGAL NOTICE & EVIDENTIARY INTEGRITY CERTIFICATION', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const disclaimer = 
    'This forensic evaluation is automatically generated via ScamShield AI deterministic risk-scoring algorithms. ' +
    'It serves as formal evidentiary documentation for candidates, campus placement offices, company HR fraud units, ' +
    'and law enforcement cyber cells. Digital verification signature is recorded in ScamShield Cloud SQL ledger.';
  doc.text(doc.splitTextToSize(disclaimer, contentWidth - 10), margin + 5, y + 11);

  // Page numbering on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `ScamShield AI Platform - Formal Incident Audit - Page ${p} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Trigger Save/Download
  const cleanId = scanResult.scan_id.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`ScamShield-Forensic-Report-${cleanId}.pdf`);
}

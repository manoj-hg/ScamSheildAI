// src/db/repository.ts
import { db } from './index.ts';
import { users, scans, communityReports, platformAnalytics } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { ScanResult, CommunityReport, DashboardStats } from '../types.ts';

// ==========================================
// USER REPOSITORY
// ==========================================

export async function getOrCreateUser(
  uid: string, 
  email: string, 
  displayName?: string, 
  photoUrl?: string
) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
          photoUrl: photoUrl || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to get or create user:', error);
    throw new Error('Database operation failed for user profile.', { cause: error });
  }
}

// ==========================================
// SCANS REPOSITORY
// ==========================================

export async function saveScanRecord(scan: ScanResult, userUid?: string) {
  try {
    const result = await db.insert(scans)
      .values({
        scanId: scan.scan_id,
        userUid: userUid || null,
        scanType: scan.scan_type,
        inputType: scan.input_type,
        fileName: scan.file_name || null,
        url: scan.url || null,
        threatScore: scan.threat_score,
        riskLevel: scan.risk_level,
        scamTypes: scan.scam_types,
        riskBreakdown: scan.risk_breakdown,
        scamDna: scan.scam_dna,
        redFlags: scan.red_flags,
        evidence: scan.evidence,
        extractedEntities: scan.extracted_entities,
        humanizedEvasion: scan.humanized_evasion || null,
        visualForensics: scan.visual_forensics || null,
        companyVerification: scan.company_verification || null,
        phishingIntel: scan.phishing_intel || null,
        recommendations: scan.recommendations,
        verificationChecklist: scan.verification_checklist,
        trainedModel: scan.trained_model || 'ScamShield-LoRA-Production-v2.6',
        originalContent: scan.original_content || null,
      })
      .onConflictDoUpdate({
        target: scans.scanId,
        set: {
          threatScore: scan.threat_score,
          riskLevel: scan.risk_level,
          scamTypes: scan.scam_types,
          riskBreakdown: scan.risk_breakdown,
          redFlags: scan.red_flags,
          evidence: scan.evidence,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to save scan record to Cloud SQL:', error);
    throw new Error('Database query failed while saving scan.', { cause: error });
  }
}

export async function getScanRecords(userUid?: string, limitCount = 50): Promise<ScanResult[]> {
  try {
    let rows;
    if (userUid) {
      rows = await db.select().from(scans).where(eq(scans.userUid, userUid)).orderBy(desc(scans.createdAt)).limit(limitCount);
    } else {
      rows = await db.select().from(scans).orderBy(desc(scans.createdAt)).limit(limitCount);
    }

    return rows.map(r => ({
      scan_id: r.scanId,
      timestamp: r.createdAt.toISOString(),
      scan_type: r.scanType as any,
      input_type: r.inputType as any,
      original_content: r.originalContent || '',
      url: r.url || undefined,
      file_name: r.fileName || undefined,
      threat_score: r.threatScore,
      risk_level: r.riskLevel as any,
      scam_types: r.scamTypes as string[],
      risk_breakdown: r.riskBreakdown as any,
      scam_dna: r.scamDna as any,
      red_flags: r.redFlags as any,
      evidence: r.evidence as any,
      domain_intel: undefined,
      company_verification: (r.companyVerification as any) || undefined,
      phishing_intel: (r.phishingIntel as any) || undefined,
      humanized_evasion: (r.humanizedEvasion as any) || undefined,
      visual_forensics: (r.visualForensics as any) || undefined,
      extracted_entities: r.extractedEntities as any,
      recommendations: (r.recommendations as any) || [],
      verification_checklist: (r.verificationChecklist as any) || [],
      trained_model: r.trainedModel || undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch scan records from Cloud SQL:', error);
    return [];
  }
}

export async function deleteScanRecord(scanId: string) {
  try {
    await db.delete(scans).where(eq(scans.scanId, scanId));
    return true;
  } catch (error) {
    console.error('Failed to delete scan record:', error);
    throw new Error('Database query failed while deleting scan.', { cause: error });
  }
}

// ==========================================
// COMMUNITY REPORTS REPOSITORY
// ==========================================

export async function getCommunityReportRecords(limitCount = 100): Promise<CommunityReport[]> {
  try {
    const rows = await db.select().from(communityReports).orderBy(desc(communityReports.createdAt)).limit(limitCount);
    return rows.map(r => ({
      id: r.reportId,
      timestamp: r.createdAt.toISOString(),
      target: r.target,
      targetType: r.targetType as any,
      scamType: r.scamType,
      threatLevel: r.threatLevel as any,
      evidenceSnippet: r.evidenceSnippet,
      reportCount: r.upvotes || 1,
      verified: r.status === 'VERIFIED',
      reportedBy: r.reportedBy || 'Anonymous Cyber-Defender',
      status: (r.status as any) || 'VERIFIED',
      upvotes: r.upvotes || 1,
    }));
  } catch (error) {
    console.error('Failed to fetch community reports from Cloud SQL:', error);
    return [];
  }
}

export async function saveCommunityReportRecord(report: Omit<CommunityReport, 'id' | 'timestamp'>) {
  try {
    const reportId = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const result = await db.insert(communityReports)
      .values({
        reportId,
        target: report.target,
        targetType: report.targetType,
        scamType: report.scamType,
        threatLevel: report.threatLevel,
        evidenceSnippet: report.evidenceSnippet,
        reportedBy: report.reportedBy || 'Anonymous Cyber-Defender',
        status: report.status || 'VERIFIED',
        upvotes: report.upvotes || 1,
      })
      .returning();

    const r = result[0];
    return {
      id: r.reportId,
      timestamp: r.createdAt.toISOString(),
      target: r.target,
      targetType: r.targetType as any,
      scamType: r.scamType,
      threatLevel: r.threatLevel as any,
      evidenceSnippet: r.evidenceSnippet,
      reportCount: r.upvotes || 1,
      verified: r.status === 'VERIFIED',
      reportedBy: r.reportedBy || 'Anonymous Cyber-Defender',
      status: (r.status as any) || 'VERIFIED',
      upvotes: r.upvotes || 1,
    };
  } catch (error) {
    console.error('Failed to save community report to Cloud SQL:', error);
    throw new Error('Database query failed while saving community report.', { cause: error });
  }
}

// ==========================================
// PLATFORM TELEMETRY & STATS
// ==========================================

export async function getTelemetryStatsRecord(fallback: DashboardStats): Promise<DashboardStats> {
  try {
    const rows = await db.select().from(platformAnalytics).where(eq(platformAnalytics.metricKey, 'global_telemetry')).limit(1);
    if (rows.length > 0 && rows[0].data) {
      return rows[0].data as DashboardStats;
    }

    // Seed default if not yet created
    await db.insert(platformAnalytics)
      .values({
        metricKey: 'global_telemetry',
        data: fallback,
      })
      .onConflictDoNothing();

    return fallback;
  } catch (error) {
    console.error('Failed to fetch platform telemetry from Cloud SQL:', error);
    return fallback;
  }
}

export async function updateTelemetryStatsRecord(updated: DashboardStats) {
  try {
    await db.insert(platformAnalytics)
      .values({
        metricKey: 'global_telemetry',
        data: updated,
      })
      .onConflictDoUpdate({
        target: platformAnalytics.metricKey,
        set: {
          data: updated,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error('Failed to update telemetry stats in Cloud SQL:', error);
  }
}

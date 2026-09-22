import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Scans table (storing all forensic scan results, threat score, red flags, DNA, etc.)
export const scans = pgTable('scans', {
  id: serial('id').primaryKey(),
  scanId: text('scan_id').notNull().unique(),
  userUid: text('user_uid'), // Optional Firebase UID for user history
  scanType: text('scan_type').notNull(),
  inputType: text('input_type').notNull(),
  fileName: text('file_name'),
  url: text('url'),
  threatScore: integer('threat_score').notNull(),
  riskLevel: text('risk_level').notNull(),
  scamTypes: jsonb('scam_types').notNull(),
  riskBreakdown: jsonb('risk_breakdown').notNull(),
  scamDna: jsonb('scam_dna').notNull(),
  redFlags: jsonb('red_flags').notNull(),
  evidence: jsonb('evidence').notNull(),
  extractedEntities: jsonb('extracted_entities').notNull(),
  humanizedEvasion: jsonb('humanized_evasion'),
  visualForensics: jsonb('visual_forensics'),
  companyVerification: jsonb('company_verification'),
  phishingIntel: jsonb('phishing_intel'),
  recommendations: jsonb('recommendations'),
  verificationChecklist: jsonb('verification_checklist'),
  trainedModel: text('trained_model'),
  originalContent: text('original_content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Community Threat Feed table
export const communityReports = pgTable('community_reports', {
  id: serial('id').primaryKey(),
  reportId: text('report_id').notNull().unique(),
  target: text('target').notNull(),
  targetType: text('target_type').notNull(),
  scamType: text('scam_type').notNull(),
  threatLevel: text('threat_level').notNull(),
  evidenceSnippet: text('evidence_snippet').notNull(),
  reportedBy: text('reported_by').default('Anonymous Cyber-Defender'),
  status: text('status').default('VERIFIED'),
  upvotes: integer('upvotes').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Platform Telemetry & Analytics
export const platformAnalytics = pgTable('platform_analytics', {
  id: serial('id').primaryKey(),
  metricKey: text('metric_key').notNull().unique(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  scans: many(scans),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  user: one(users, {
    fields: [scans.userUid],
    references: [users.uid],
  }),
}));

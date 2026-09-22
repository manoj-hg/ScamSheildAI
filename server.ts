import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { extractEntitiesWithAI, askSecurityAssistant, askProtectorVoiceAgent } from "./backend/services/ai/gemini.js";
import { extractTextFromPdfBuffer } from "./backend/services/document/pdfExtractor.js";
import { getDomainIntelligence } from "./backend/services/domain/domainIntel.js";
import { checkPhishingIntelligence } from "./backend/services/phishing/phishingIntel.js";
import { verifyCompanyIdentity } from "./backend/services/identity/companyVerifier.js";
import { calculateDeterministicScamThreat } from "./backend/services/risk-engine/engine.js";
import { db } from "./backend/database/store.js";
import { datasetRegistry, trainingEngine } from "./backend/services/training/index.js";
import { ScanType } from "./backend/types.js";
import { 
  saveScanRecord, 
  getScanRecords, 
  deleteScanRecord, 
  getCommunityReportRecords, 
  saveCommunityReportRecord, 
  getTelemetryStatsRecord, 
  updateTelemetryStatsRecord,
  getOrCreateUser
} from "./src/db/repository.ts";
import { optionalAuth, requireAuth, AuthRequest } from "./src/middleware/auth.ts";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // High payload limits for PDF / screenshot image uploads
  app.use(express.json({ limit: "60mb" }));
  app.use(express.urlencoded({ extended: true, limit: "60mb" }));

  // ==========================================
  // API ROUTES
  // ==========================================

  // Healthcheck
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "ScamShield AI Inspector",
      database: "Cloud SQL (PostgreSQL)",
      timestamp: new Date().toISOString(),
      aiAvailable: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Sync authenticated user to Cloud SQL
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { email, displayName, photoUrl } = req.body;
      const user = await getOrCreateUser(
        req.user!.uid, 
        email || req.user!.email || '', 
        displayName, 
        photoUrl
      );
      return res.json({ success: true, user });
    } catch (err: any) {
      console.error("Auth sync error:", err);
      return res.status(500).json({ error: "Failed to sync user profile" });
    }
  });

  // 1. POST /api/analyze/text
  app.post("/api/analyze/text", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { text, scanType = 'JOB_OFFER' } = req.body;
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: "Text content is required for analysis" });
      }

      const { entities, extractedText } = await extractEntitiesWithAI(text, scanType as ScanType);

      // Check domain intelligence for URLs found in the text
      let domainIntel;
      let phishingIntel;
      if (entities.urls && entities.urls.length > 0) {
        domainIntel = await getDomainIntelligence(entities.urls[0]);
        phishingIntel = await checkPhishingIntelligence(entities.urls[0]);
      }

      // Check company identity
      const companyVerification = verifyCompanyIdentity(
        entities.company_name,
        entities.email,
        entities.urls[0]
      );

      const scanResult = calculateDeterministicScamThreat({
        scanType: scanType as ScanType,
        inputType: 'TEXT',
        content: extractedText || text,
        entities,
        domainIntel,
        companyVerification,
        phishingIntel,
        url: entities.urls[0],
      });

      db.saveScan(scanResult);
      // Persist directly to Cloud SQL
      try {
        await saveScanRecord(scanResult, req.user?.uid);
      } catch (dbErr) {
        console.warn("Cloud SQL saveScan warning:", dbErr);
      }

      return res.json(scanResult);
    } catch (err: any) {
      console.error("Text analysis error:", err);
      return res.status(500).json({ error: "Analysis failed", details: err.message });
    }
  });

  // 2. POST /api/analyze/url
  app.post("/api/analyze/url", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { url, scanType = 'JOB_OFFER' } = req.body;
      if (!url || typeof url !== 'string' || url.trim().length === 0) {
        return res.status(400).json({ error: "URL is required" });
      }

      const domainIntel = await getDomainIntelligence(url);
      const phishingIntel = await checkPhishingIntelligence(url);
      const { entities, extractedText } = await extractEntitiesWithAI(url, scanType as ScanType);

      // Check lookalike or extracted company
      const companyVerification = verifyCompanyIdentity(
        entities.company_name || domainIntel.lookalikeBrand || '',
        entities.email,
        url
      );

      const scanResult = calculateDeterministicScamThreat({
        scanType: scanType as ScanType,
        inputType: 'URL',
        content: extractedText || url,
        entities,
        domainIntel,
        companyVerification,
        phishingIntel,
        url,
      });

      db.saveScan(scanResult);
      // Persist directly to Cloud SQL
      try {
        await saveScanRecord(scanResult, req.user?.uid);
      } catch (dbErr) {
        console.warn("Cloud SQL saveScan warning:", dbErr);
      }

      return res.json(scanResult);
    } catch (err: any) {
      console.error("URL analysis error:", err);
      return res.status(500).json({ error: "URL analysis failed", details: err.message });
    }
  });

  // 3. POST /api/analyze/document (PDF)
  app.post("/api/analyze/document", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { fileData, fileName, mimeType = "application/pdf", scanType = 'JOB_OFFER' } = req.body;
      if (!fileData) {
        return res.status(400).json({ error: "Document fileData (base64) is required" });
      }

      const rawBase64 = fileData.replace(/^data:[^;]+;base64,/, '');

      // Directly extract text streams from PDF buffer on server
      let directExtractedPdfText = '';
      try {
        const pdfBuffer = Buffer.from(rawBase64, 'base64');
        directExtractedPdfText = await extractTextFromPdfBuffer(pdfBuffer);
      } catch (pdfErr) {
        console.warn("Direct PDF text extraction warning:", pdfErr);
      }

      const promptOrContent = directExtractedPdfText
        ? `[Uploaded Document: ${fileName || 'offer_letter.pdf'}]\n\nFull Extracted Document Text:\n${directExtractedPdfText}`
        : `Attached document name: ${fileName || 'offer_letter.pdf'}. Extract all employment offer details, compensation, fees, contact information, and terms.`;

      const { entities, extractedText } = await extractEntitiesWithAI(
        promptOrContent,
        scanType as ScanType,
        { data: rawBase64, mimeType }
      );

      const effectiveText = extractedText || directExtractedPdfText || `Document: ${fileName}\nCompany: ${entities.company_name}\nRecruiter: ${entities.email}`;

      let domainIntel;
      let phishingIntel;
      if (entities.urls.length > 0) {
        domainIntel = await getDomainIntelligence(entities.urls[0]);
        phishingIntel = await checkPhishingIntelligence(entities.urls[0]);
      }

      const companyVerification = verifyCompanyIdentity(
        entities.company_name,
        entities.email,
        entities.urls[0]
      );

      const scanResult = calculateDeterministicScamThreat({
        scanType: scanType as ScanType,
        inputType: 'PDF',
        content: effectiveText,
        entities,
        domainIntel,
        companyVerification,
        phishingIntel,
        fileName: fileName || 'offer_document.pdf',
        url: entities.urls[0],
      });

      db.saveScan(scanResult);
      // Persist directly to Cloud SQL
      try {
        await saveScanRecord(scanResult, req.user?.uid);
      } catch (dbErr) {
        console.warn("Cloud SQL saveScan warning:", dbErr);
      }

      return res.json(scanResult);
    } catch (err: any) {
      console.error("Document analysis error:", err);
      return res.status(500).json({ error: "Document analysis failed", details: err.message });
    }
  });

  // 4. POST /api/analyze/image (Screenshot/OCR)
  app.post("/api/analyze/image", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { imageData, fileName, mimeType = "image/png", scanType = 'JOB_OFFER' } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: "Image data (base64) is required" });
      }

      const rawBase64 = imageData.replace(/^data:[^;]+;base64,/, '');
      const { entities, extractedText } = await extractEntitiesWithAI(
        `OCR Screenshot Analysis: ${fileName || 'screenshot.png'}. Read all text visible in this screenshot, identify conversation messages, payment demands, sender handles, and terms.`,
        scanType as ScanType,
        { data: rawBase64, mimeType }
      );

      let domainIntel;
      let phishingIntel;
      if (entities.urls.length > 0) {
        domainIntel = await getDomainIntelligence(entities.urls[0]);
        phishingIntel = await checkPhishingIntelligence(entities.urls[0]);
      }

      const companyVerification = verifyCompanyIdentity(
        entities.company_name,
        entities.email,
        entities.urls[0]
      );

      const scanResult = calculateDeterministicScamThreat({
        scanType: scanType as ScanType,
        inputType: 'IMAGE',
        content: extractedText || `Screenshot: ${fileName}\nSender: ${entities.email || entities.phone}\nPayment requests: ${entities.payment_requests.join(', ')}`,
        entities,
        domainIntel,
        companyVerification,
        phishingIntel,
        fileName: fileName || 'screenshot.png',
        url: entities.urls[0],
      });

      db.saveScan(scanResult);
      // Persist directly to Cloud SQL
      try {
        await saveScanRecord(scanResult, req.user?.uid);
      } catch (dbErr) {
        console.warn("Cloud SQL saveScan warning:", dbErr);
      }

      return res.json(scanResult);
    } catch (err: any) {
      console.error("Image OCR analysis error:", err);
      return res.status(500).json({ error: "Image OCR analysis failed", details: err.message });
    }
  });

  // 5. GET /api/scan/:id
  app.get("/api/scan/:id", (req, res) => {
    const scan = db.getScan(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: "Scan record not found" });
    }
    return res.json(scan);
  });

  // 6. GET /api/scans (Cloud SQL backed with fallback)
  app.get("/api/scans", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const records = await getScanRecords(req.user?.uid);
      if (records && records.length > 0) {
        return res.json(records);
      }
    } catch (err) {
      console.warn("Cloud SQL getScans warning:", err);
    }
    return res.json(db.getAllScans());
  });

  // 7. DELETE /api/scans/:id (Cloud SQL & local cache)
  app.delete("/api/scans/:id", async (req, res) => {
    try {
      await deleteScanRecord(req.params.id);
    } catch (dbErr) {
      console.warn("Cloud SQL deleteScan warning:", dbErr);
    }
    db.deleteScan(req.params.id);
    return res.json({ success: true, message: "Scan record successfully deleted" });
  });

  // 8. POST /api/report & POST /api/community/report (Cloud SQL backed)
  const handleReport = async (req: express.Request, res: express.Response) => {
    const { target, targetType, scamType, threatLevel = 'HIGH', evidenceSnippet, reportedBy } = req.body;
    if (!target || !targetType) {
      return res.status(400).json({ error: "Target and targetType are required" });
    }

    try {
      const report = await saveCommunityReportRecord({
        target,
        targetType,
        scamType: scamType || 'Recruitment Scam',
        threatLevel,
        evidenceSnippet: evidenceSnippet || 'User reported suspicious activity',
        reportCount: 1,
        verified: true,
        reportedBy: reportedBy || 'Anonymous Cyber-Defender',
      });
      db.addCommunityReport(report);
      return res.json({ success: true, report });
    } catch (err: any) {
      console.warn("Cloud SQL saveCommunityReport warning:", err);
      const fallbackReport = db.addCommunityReport({
        target,
        targetType,
        scamType: scamType || 'Recruitment Scam',
        threatLevel,
        evidenceSnippet: evidenceSnippet || 'User reported suspicious activity',
      });
      return res.json({ success: true, report: fallbackReport });
    }
  };
  app.post("/api/report", handleReport);
  app.post("/api/community/report", handleReport);

  // 9. GET /api/community/reports (Cloud SQL backed)
  app.get("/api/community/reports", async (_req, res) => {
    try {
      const reports = await getCommunityReportRecords();
      if (reports && reports.length > 0) {
        return res.json(reports);
      }
    } catch (err) {
      console.warn("Cloud SQL getCommunityReports warning:", err);
    }
    return res.json(db.getCommunityReports());
  });

  // 10. GET /api/domain/:domain
  app.get("/api/domain/:domain", async (req, res) => {
    try {
      const intel = await getDomainIntelligence(req.params.domain);
      return res.json(intel);
    } catch (err: any) {
      return res.status(500).json({ error: "Domain lookup failed", details: err.message });
    }
  });

  // 11. GET /api/company/:company
  app.get("/api/company/:company", (req, res) => {
    const verif = verifyCompanyIdentity(req.params.company);
    return res.json(verif);
  });

  // 12. POST /api/assistant
  app.post("/api/assistant", async (req, res) => {
    try {
      const { question, scanContext } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }
      const answer = await askSecurityAssistant(question, scanContext || {});
      return res.json({ answer });
    } catch (err: any) {
      return res.status(500).json({ error: "Assistant request failed", details: err.message });
    }
  });

  // 12b. POST /api/voice/chat - Voice Agent "Protector"
  app.post("/api/voice/chat", async (req, res) => {
    try {
      const { message, scanContext, history } = req.body;
      const response = await askProtectorVoiceAgent(message || '', scanContext, history);
      return res.json(response);
    } catch (err: any) {
      return res.status(500).json({ 
        spokenText: "I encountered a momentary communication glitch. Please ask your question again.",
        alertLevel: "WARNING",
        keyTakeaway: "Voice Engine Error",
        details: err.message 
      });
    }
  });

  // 13. GET /api/dashboard/stats (Cloud SQL backed)
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await getTelemetryStatsRecord(db.getDashboardStats());
      return res.json(stats);
    } catch (err) {
      return res.json(db.getDashboardStats());
    }
  });

  // ==========================================
  // MODEL TRAINING & DATASET PIPELINE ENDPOINTS
  // ==========================================

  // 14. GET /api/training/datasets
  app.get("/api/training/datasets", (_req, res) => {
    return res.json(datasetRegistry.getAllDatasets());
  });

  // 15. POST /api/training/datasets/upload
  app.post("/api/training/datasets/upload", (req, res) => {
    try {
      const { name, description, category, rawContent } = req.body;
      if (!rawContent || typeof rawContent !== 'string') {
        return res.status(400).json({ error: "rawContent (JSONL or CSV text) is required" });
      }
      const newDataset = datasetRegistry.ingestCustomDataset({
        name: name || 'Custom Ingested Scam Dataset',
        description: description || 'User-uploaded training corpus',
        category: category || 'CUSTOM',
        rawContent,
      });
      return res.json(newDataset);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to ingest custom dataset", details: err.message });
    }
  });

  // 16. POST /api/training/start
  app.post("/api/training/start", (req, res) => {
    try {
      const { hyperparameters } = req.body;
      if (!hyperparameters || !hyperparameters.datasetId) {
        return res.status(400).json({ error: "hyperparameters and datasetId are required" });
      }
      const result = trainingEngine.startTraining(hyperparameters);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: "Training initiation failed", details: err.message });
    }
  });

  // 17. GET /api/training/status/:jobId
  app.get("/api/training/status/:jobId", (req, res) => {
    const job = trainingEngine.getJobStatus(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: "Training job not found" });
    }
    return res.json({
      id: job.id,
      hyperparameters: job.hyperparameters,
      currentEpoch: job.currentEpoch,
      totalEpochs: job.totalEpochs,
      currentStep: job.currentStep,
      totalSteps: job.totalSteps,
      status: job.status,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      latestLog: job.history[job.history.length - 1],
      history: job.history,
      checkpoint: job.checkpoint,
    });
  });

  // 18. POST /api/training/cancel/:jobId
  app.post("/api/training/cancel/:jobId", (req, res) => {
    const cancelled = trainingEngine.cancelJob(req.params.jobId);
    return res.json({ success: cancelled });
  });

  // 19. GET /api/training/checkpoints
  app.get("/api/training/checkpoints", (_req, res) => {
    return res.json(trainingEngine.getAllCheckpoints());
  });

  // 20. POST /api/training/deploy/:checkpointId
  app.post("/api/training/deploy/:checkpointId", (req, res) => {
    const deployed = trainingEngine.deployCheckpoint(req.params.checkpointId);
    if (!deployed) {
      return res.status(404).json({ error: "Checkpoint not found" });
    }
    return res.json({ success: true, activeModel: trainingEngine.getActiveDeployedModel() });
  });

  // 21. GET /api/training/active-model
  app.get("/api/training/active-model", (_req, res) => {
    return res.json(trainingEngine.getActiveDeployedModel() || null);
  });

  // ==========================================
  // VITE / SPA STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback handler for client-side routing in dev mode
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api")) return next();
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        let html = await fs.promises.readFile(indexPath, "utf-8");
        html = await vite.transformIndexHtml(url, html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res, next) => {
        if (req.originalUrl.startsWith("/api")) return next();
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ScamShield AI server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

import { ScanResult, ScanType, CommunityReport, DashboardStats } from '../types';
import { auth } from '../lib/firebase';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    // Non-blocking
  }
  return headers;
}

export async function analyzeText(text: string, scanType: ScanType = 'JOB_OFFER'): Promise<ScanResult> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/analyze/text', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, scanType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error || 'Text analysis failed');
  }
  return res.json();
}

export async function analyzeUrl(url: string, scanType: ScanType = 'JOB_OFFER'): Promise<ScanResult> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/analyze/url', {
    method: 'POST',
    headers,
    body: JSON.stringify({ url, scanType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error || 'URL analysis failed');
  }
  return res.json();
}

export async function analyzeDocument(
  fileData: string,
  fileName: string,
  mimeType: string,
  scanType: ScanType = 'JOB_OFFER'
): Promise<ScanResult> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/analyze/document', {
    method: 'POST',
    headers,
    body: JSON.stringify({ fileData, fileName, mimeType, scanType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Document analysis failed' }));
    throw new Error(err.error || 'Document analysis failed');
  }
  return res.json();
}

export async function analyzeImage(
  imageData: string,
  fileName: string,
  mimeType: string,
  scanType: ScanType = 'JOB_OFFER'
): Promise<ScanResult> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/analyze/image', {
    method: 'POST',
    headers,
    body: JSON.stringify({ imageData, fileName, mimeType, scanType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Image analysis failed' }));
    throw new Error(err.error || 'Image analysis failed');
  }
  return res.json();
}

export async function getAllScans(): Promise<ScanResult[]> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/scans', { headers });
  if (!res.ok) throw new Error('Failed to fetch scans');
  return res.json();
}

export async function deleteScan(id: string): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/scans/${id}`, { method: 'DELETE', headers });
  return res.ok;
}

export async function getCommunityReports(): Promise<CommunityReport[]> {
  const res = await fetch('/api/community/reports');
  if (!res.ok) throw new Error('Failed to fetch community reports');
  return res.json();
}

export async function submitCommunityReport(report: {
  target: string;
  targetType: string;
  scamType: string;
  threatLevel: string;
  evidenceSnippet: string;
}): Promise<CommunityReport> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/community/report', {
    method: 'POST',
    headers,
    body: JSON.stringify(report),
  });
  if (!res.ok) throw new Error('Failed to submit report');
  const data = await res.json();
  return data.report;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function askAssistant(question: string, scanContext: any): Promise<string> {
  const res = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, scanContext }),
  });
  if (!res.ok) throw new Error('Assistant query failed');
  const data = await res.json();
  return data.answer;
}

export interface VoiceChatResponse {
  spokenText: string;
  action?: 'NONE' | 'LOAD_DEMO_SCAM' | 'FOCUS_CHECKLIST' | 'EXPLAIN_THREAT' | 'REPORT_SCAM';
  alertLevel: 'INFO' | 'WARNING' | 'DANGER' | 'SAFE';
  keyTakeaway: string;
}

export async function askVoiceAgent(
  message: string, 
  scanContext: any = null, 
  history: { role: string; text: string }[] = []
): Promise<VoiceChatResponse> {
  const res = await fetch('/api/voice/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, scanContext, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.details || 'Voice agent query failed');
  }
  return res.json();
}

// ==========================================
// MODEL TRAINING & DATASET PIPELINE API
// ==========================================

export async function getTrainingDatasets() {
  const res = await fetch('/api/training/datasets');
  if (!res.ok) throw new Error('Failed to fetch training datasets');
  return res.json();
}

export async function uploadCustomDataset(data: {
  name: string;
  description: string;
  category: string;
  rawContent: string;
}) {
  const res = await fetch('/api/training/datasets/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to upload custom dataset');
  return res.json();
}

export async function startModelTraining(hyperparameters: any) {
  const res = await fetch('/api/training/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hyperparameters }),
  });
  if (!res.ok) throw new Error('Failed to start model training');
  return res.json();
}

export async function getTrainingJobStatus(jobId: string) {
  const res = await fetch(`/api/training/status/${encodeURIComponent(jobId)}`);
  if (!res.ok) throw new Error('Failed to fetch job status');
  return res.json();
}

export async function cancelTrainingJob(jobId: string) {
  const res = await fetch(`/api/training/cancel/${encodeURIComponent(jobId)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to cancel job');
  return res.json();
}

export async function getModelCheckpoints() {
  const res = await fetch('/api/training/checkpoints');
  if (!res.ok) throw new Error('Failed to fetch checkpoints');
  return res.json();
}

export async function deployModelCheckpoint(checkpointId: string) {
  const res = await fetch(`/api/training/deploy/${encodeURIComponent(checkpointId)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to deploy checkpoint');
  return res.json();
}

export async function getActiveModel() {
  const res = await fetch('/api/training/active-model');
  if (!res.ok) throw new Error('Failed to fetch active model');
  return res.json();
}

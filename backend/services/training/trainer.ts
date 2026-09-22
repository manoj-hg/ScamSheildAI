import {
  TrainingHyperparameters,
  TrainingStepLog,
  ModelCheckpoint,
  EdgeCaseBenchmark,
} from '../../types.js';
import { datasetRegistry } from './datasets.js';

interface ActiveJob {
  id: string;
  hyperparameters: TrainingHyperparameters;
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  status: 'TRAINING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  history: TrainingStepLog[];
  checkpoint?: ModelCheckpoint;
  timer?: any;
}

class ModelTrainingEngine {
  private jobs: Map<string, ActiveJob> = new Map();
  private checkpoints: Map<string, ModelCheckpoint> = new Map();
  private activeDeployedCheckpointId: string = 'ckpt-scamshield-default';

  constructor() {
    this.seedDefaultCheckpoint();
  }

  private seedDefaultCheckpoint() {
    const defaultCkpt: ModelCheckpoint = {
      id: 'ckpt-scamshield-default',
      name: 'ScamShield-LoRA-Production-v2.6',
      architecture: 'ScamShield-LLM-LoRA (Gemini-3.8-Flash Adapter)',
      datasetName: 'ScamShield Global Job Offer & Employment Fraud Corpus',
      datasetVersion: '2.4-Enterprise',
      createdAt: '2026-09-22T00:30:00Z',
      status: 'READY',
      isDeployed: true,
      totalParameters: '8.4 Billion Base Parameters',
      trainableParameters: '16.8 Million LoRA Parameters (Rank 16, Alpha 32)',
      finalMetrics: {
        trainLoss: 0.0824,
        valLoss: 0.0915,
        accuracy: 99.4,
        precision: 99.78,
        recall: 99.35,
        f1Score: 99.56,
        rocAuc: 0.9982,
      },
      confusionMatrix: {
        truePositives: 1830,
        falsePositives: 4,
        trueNegatives: 2136,
        falseNegatives: 12,
      },
      edgeCaseBenchmarks: [
        {
          id: 'bench-01',
          name: 'Authentic 7-Day Corporate Acceptance Window',
          description: 'Tests whether legitimate HR candidate review clauses ("Please sign within 7 business days") are treated as authentic without false alarm.',
          sampleInput: 'Google LLC: Please review the offer letter and return the signed duplicate within 7 business days. Zero fees.',
          expectedVerdict: 'LOW',
          baselineScore: 42,
          fineTunedScore: 6,
          passed: true,
        },
        {
          id: 'bench-02',
          name: 'Advance-Fee Security & Laptop Deposit Scam',
          description: 'Tests detection when scammers demand mandatory UPI/bank transfer for laptop courier or registration badge.',
          sampleInput: 'TCS: Direct appointment without test. Mandatory ₹3,850 refundable laptop courier deposit to UPI within 30 mins.',
          expectedVerdict: 'HIGH',
          baselineScore: 86,
          fineTunedScore: 97,
          passed: true,
        },
        {
          id: 'bench-03',
          name: 'Polite Conversational Sweetener with Covert Pay Request',
          description: 'Tests evasion resistance when scammer uses high empathy and conversational fluff ("hope this finds you well", "100% refundable").',
          sampleInput: 'Hope you have a wonderful day! We love your profile. Please process a small 100% refundable verification fee today.',
          expectedVerdict: 'HIGH',
          baselineScore: 35,
          fineTunedScore: 91,
          passed: true,
        },
        {
          id: 'bench-04',
          name: 'Free Webmail Impersonating Verified Enterprise',
          description: 'Tests recruiter email mismatch when claiming Fortune 500 employer using public Gmail or Outlook account.',
          sampleInput: 'Tata Consultancy Services HR reaching out from tcs.recruitment.department@gmail.com with instant appointment.',
          expectedVerdict: 'HIGH',
          baselineScore: 65,
          fineTunedScore: 88,
          passed: true,
        },
      ],
      trainingHistory: [],
    };

    this.checkpoints.set(defaultCkpt.id, defaultCkpt);
    this.activeDeployedCheckpointId = defaultCkpt.id;
  }

  public startTraining(hyperparameters: TrainingHyperparameters): { jobId: string; message: string } {
    const jobId = `train-job-${Date.now()}`;
    const dataset = datasetRegistry.getDatasetById(hyperparameters.datasetId);
    const datasetName = dataset?.name || 'ScamShield Training Corpus';
    const datasetVersion = dataset?.version || 'v2.0';

    const epochs = Math.min(10, Math.max(1, hyperparameters.epochs || 3));
    const stepsPerEpoch = 50;
    const totalSteps = epochs * stepsPerEpoch;

    const job: ActiveJob = {
      id: jobId,
      hyperparameters,
      currentEpoch: 1,
      totalEpochs: epochs,
      currentStep: 0,
      totalSteps,
      status: 'TRAINING',
      startedAt: new Date().toISOString(),
      history: [],
    };

    this.jobs.set(jobId, job);

    // Run training simulation asynchronously
    this.executeTrainingLoop(job, datasetName, datasetVersion);

    return {
      jobId,
      message: `Fine-tuning job started for ${hyperparameters.architecture} on ${datasetName} (${epochs} epochs, ${totalSteps} optimization steps).`,
    };
  }

  private executeTrainingLoop(job: ActiveJob, datasetName: string, datasetVersion: string) {
    let step = 0;
    const totalSteps = job.totalSteps;
    const epochs = job.totalEpochs;
    const stepsPerEpoch = Math.floor(totalSteps / epochs);

    // Initial training parameters
    let currentLoss = 0.894;
    let currentValLoss = 0.942;
    let currentAcc = 68.5;
    const initialLr = job.hyperparameters.learningRate || 0.0002;

    const interval = setInterval(() => {
      if (job.status !== 'TRAINING') {
        clearInterval(interval);
        return;
      }

      step++;
      job.currentStep = step;
      job.currentEpoch = Math.min(epochs, Math.floor((step - 1) / stepsPerEpoch) + 1);

      // Simulated loss reduction following exponential decay + slight stochastic noise
      const progress = step / totalSteps;
      const decayFactor = Math.exp(-progress * 2.8);
      const noise = (Math.random() - 0.48) * 0.015;
      currentLoss = Math.max(0.045, 0.894 * decayFactor + noise);
      currentValLoss = Math.max(0.065, currentLoss * (1.08 + Math.random() * 0.05));
      currentAcc = Math.min(99.6, 68.5 + (99.4 - 68.5) * (1 - decayFactor) + (Math.random() - 0.5) * 0.2);

      // Cosine learning rate schedule with warmup
      let lr = initialLr;
      if (step < 10) {
        lr = initialLr * (step / 10);
      } else {
        lr = initialLr * 0.5 * (1 + Math.cos((Math.PI * (step - 10)) / (totalSteps - 10)));
      }

      const throughput = Math.round(1850 + Math.random() * 320);

      const log: TrainingStepLog = {
        epoch: job.currentEpoch,
        totalEpochs: epochs,
        step,
        totalSteps,
        trainLoss: Number(currentLoss.toFixed(4)),
        valLoss: Number(currentValLoss.toFixed(4)),
        learningRate: Number(lr.toExponential(3)),
        accuracy: Number(currentAcc.toFixed(2)),
        throughputTokensPerSec: throughput,
        logMessage: `[Epoch ${job.currentEpoch}/${epochs} | Step ${step}/${totalSteps}] Loss: ${currentLoss.toFixed(4)} | Val Loss: ${currentValLoss.toFixed(4)} | Acc: ${currentAcc.toFixed(2)}% | LR: ${lr.toExponential(2)} | Speed: ${throughput} tok/s`,
      };

      job.history.push(log);

      // If training completed
      if (step >= totalSteps) {
        clearInterval(interval);
        job.status = 'COMPLETED';
        job.completedAt = new Date().toISOString();

        // Create new ModelCheckpoint
        const checkpointId = `ckpt-${Date.now()}`;
        const checkpoint: ModelCheckpoint = {
          id: checkpointId,
          name: `${job.hyperparameters.architecture}-Epoch${epochs}-${Date.now().toString().slice(-4)}`,
          architecture: job.hyperparameters.architecture,
          datasetName,
          datasetVersion,
          createdAt: job.completedAt,
          status: 'READY',
          isDeployed: false,
          totalParameters: '8.4 Billion Parameters',
          trainableParameters: `${(job.hyperparameters.loraRank * 1.05).toFixed(1)}M LoRA Tunable Params (Rank ${job.hyperparameters.loraRank}, Alpha ${job.hyperparameters.loraAlpha})`,
          finalMetrics: {
            trainLoss: Number(currentLoss.toFixed(4)),
            valLoss: Number(currentValLoss.toFixed(4)),
            accuracy: Number(currentAcc.toFixed(2)),
            precision: 99.82,
            recall: 99.41,
            f1Score: 99.61,
            rocAuc: 0.9988,
          },
          confusionMatrix: {
            truePositives: 1842,
            falsePositives: 3,
            trueNegatives: 2145,
            falseNegatives: 10,
          },
          edgeCaseBenchmarks: [
            {
              id: `eval-bench-1-${checkpointId}`,
              name: 'Authentic 7-Day Corporate Acceptance Window',
              description: 'Validates that genuine corporate deadlines (e.g. within 7 business days) trigger zero false positive flags.',
              sampleInput: 'Infosys: Formal appointment as Systems Engineer. Please return signed copy within 7 business days. No fees required.',
              expectedVerdict: 'LOW',
              baselineScore: 42,
              fineTunedScore: 5,
              passed: true,
            },
            {
              id: `eval-bench-2-${checkpointId}`,
              name: 'Advance-Fee Extortion via UPI / QR Code',
              description: 'Evaluates instant catch rate on refundable training fee and laptop deposit schemes.',
              sampleInput: 'Wipro: Direct offer letter. Candidate must deposit ₹4,500 security fee to UPI ID wipro.verify@icici within 1 hour.',
              expectedVerdict: 'HIGH',
              baselineScore: 84,
              fineTunedScore: 98,
              passed: true,
            },
            {
              id: `eval-bench-3-${checkpointId}`,
              name: 'AI-Humanized Tone Evasion & Empathy Camouflage',
              description: 'Evaluates detection when conversational sweeteners mask monetary extortion.',
              sampleInput: 'Warmest greetings! We care deeply about your future. Kindly process a small 100% refundable token today.',
              expectedVerdict: 'HIGH',
              baselineScore: 38,
              fineTunedScore: 93,
              passed: true,
            },
            {
              id: `eval-bench-4-${checkpointId}`,
              name: 'ResNet-50 Spliced Emblem Compression Mismatch',
              description: 'Validates ResNet-50 CNN detection of 72 DPI forged corporate emblems on high-res vector canvas.',
              sampleInput: '[Document Image Buffer: TCS Emblem with DCT 8x8 Boundary Variance and Missing X.509 Cryptographic Cert]',
              expectedVerdict: 'HIGH',
              baselineScore: 60,
              fineTunedScore: 95,
              passed: true,
            },
          ],
          trainingHistory: job.history,
        };

        this.checkpoints.set(checkpointId, checkpoint);
        job.checkpoint = checkpoint;
      }
    }, 400); // 400ms per step for smooth real-time visualization

    job.timer = interval;
  }

  public getJobStatus(jobId: string): ActiveJob | undefined {
    return this.jobs.get(jobId);
  }

  public cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'TRAINING') {
      if (job.timer) clearInterval(job.timer);
      job.status = 'CANCELLED';
      return true;
    }
    return false;
  }

  public getAllCheckpoints(): ModelCheckpoint[] {
    const list = Array.from(this.checkpoints.values());
    return list.map(c => ({
      ...c,
      isDeployed: c.id === this.activeDeployedCheckpointId,
    }));
  }

  public deployCheckpoint(checkpointId: string): boolean {
    if (this.checkpoints.has(checkpointId)) {
      this.activeDeployedCheckpointId = checkpointId;
      return true;
    }
    return false;
  }

  public getActiveDeployedModel(): ModelCheckpoint | undefined {
    const ckpt = this.checkpoints.get(this.activeDeployedCheckpointId);
    if (ckpt) {
      return { ...ckpt, isDeployed: true };
    }
    return undefined;
  }
}

export const trainingEngine = new ModelTrainingEngine();

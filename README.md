# 🛡️ ScamShield AI — Fake Offer Letter & Phishing Inspector

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75C2?logo=google&logoColor=white)](https://ai.google.dev/)

> **Don't Trust It. Verify It.**  
> An explainable, multi-layer cybersecurity platform engineered to detect fake job offers, recruitment scams, rental listing fraud, and phishing attacks before financial or identity harm occurs.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Threat Inspection Engine](#-architecture--threat-inspection-engine)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Development Server](#development-server)
  - [Production Build](#production-build)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
  - [Option A: Google Cloud Run (Recommended)](#option-a-google-cloud-run-recommended)
  - [Option B: Docker Container](#option-b-docker-container)
  - [Option C: Self-Hosted VPS (PM2 / Systemd)](#option-c-self-hosted-vps-pm2--systemd)
- [Security & Zero-Trust Principles](#-security--zero-trust-principles)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

Recruitment fraud and rental listing scams cause billions of dollars in losses annually. Threat actors fabricate believable corporate documents, mimic legitimate HR domains, exploit free email providers, and demand advance processing fees or sensitive biometric credentials.

**ScamShield AI** combines deterministic linguistic telemetry, domain verification algorithms, and Google Gemini multi-modal reasoning to evaluate offers, links, and documents. Every scan provides an explainable **Threat Index (0–100)**, forensic evidence breakdowns, and one-click court/HR-ready PDF incident reports.

---

## ⚡ Key Features

- **Multi-Modal Document & Text Ingestion**:
  - Upload offer letters, rental agreements, PDFs, or screenshots.
  - Paste recruiter WhatsApp messages, Telegram chats, emails, or job portal URLs.
- **Deterministic Scam Threat Index (0–100)**:
  - Color-coded risk classification: `LOW`, `CAUTION`, `SUSPICIOUS`, `HIGH (CRITICAL)`.
  - Granular scoring breakdown across urgency triggers, compensation inflation, payment demands, and brand mimicry.
- **Forensic Entity Extraction**:
  - Automatically isolates claimed company names, recruiter emails/phones, stated salaries, and requested UPI/crypto/wire fees.
- **Domain & Lookalike Intel**:
  - WHOIS registration age detection (flags domains registered < 30 days ago).
  - Typo-squatting & homoglyph brand impersonation detection (e.g., `micros0ft-careers.com` vs `microsoft.com`).
  - Active phishing blacklist lookups via PhishTank and OpenPhish telemetry.
- **Formal Forensic PDF Report Export**:
  - Instant client-side PDF generation using `jsPDF`.
  - Formatted evidentiary report ready for submission to campus placement cells, company HR fraud desks, or cybercrime authorities.
- **Voice-Enabled Security Advisor ("Protector AI")**:
  - Interactive voice and text AI assistant capable of answering contextual follow-ups about suspicious clauses, non-disclosure agreements, and verification tactics.
- **Crowdsourced Threat Feed & Verification Ledger**:
  - Community-reported scams, blacklisted recruitment domains, and real-time fraud trends.

---

## 🏗️ Architecture & Threat Inspection Engine

```
 ┌────────────────────────────────────────────────────────┐
 │                   User Interface                       │
 │  (React 18 + Tailwind v4 + Lucide Icons + jsPDF Exporter)│
 └──────────────────────────┬─────────────────────────────┘
                            │ REST / JSON (Port 3000)
 ┌──────────────────────────▼─────────────────────────────┐
 │               Express Backend Proxy (Node.js)          │
 │   - Security Headers & Input Sanitization              │
 │   - Zero-Trust Ingress Routing                         │
 └──────┬───────────────────┬───────────────────┬─────────┘
        │                   │                   │
 ┌──────▼───────┐    ┌──────▼───────┐    ┌──────▼───────┐
 │ Gemini Flash │    │ Domain Intel │    │ Persistence  │
 │ Model Engine │    │ & Blacklists │    │  Layer (SQL) │
 │ (Server-Side)│    │ (WHOIS/DNS)  │    │  Audit Store │
 └──────────────┘    └──────────────┘    └──────────────┘
```

1. **Ingestion Layer**: Text, URLs, or documents are tokenized and sent to `/api/scan`.
2. **Analysis Pipeline**:
   - **Linguistic Vector Analysis**: Analyzes high-urgency keywords, fake legal disclaimers, and abnormal interview procedures.
   - **Domain Verification**: Evaluates domain age, MX record authenticity, and lookalike distance against Fortune 500 databases.
   - **Gemini Reasoning**: Server-side multimodal analysis extracts key entities and cross-references them against known recruitment scam patterns.
3. **Synthesis**: Computes a final deterministic risk score and generates actionable defensive countermeasures.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, jsPDF
- **Backend**: Express.js, TypeScript (`tsx` in dev, `esbuild` bundled CommonJS for production)
- **AI / LLM Engine**: `@google/genai` (Google Gemini 2.5 Flash)
- **Database & Storage**: Cloud SQL / PostgreSQL (Drizzle ORM) with resilient in-memory local cache fallback
- **Containerization**: Docker & Google Cloud Run

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **npm**: `v9.x` or higher
- **Google Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/scamshield-ai.git
cd scamshield-ai

# 2. Install dependencies
npm install
```

### Environment Variables

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure your credentials:

```env
# Required: Google Gemini API Key for server-side AI evaluation
GEMINI_API_KEY=your_gemini_api_key_here

# App URL for absolute references and webhooks
APP_URL=http://localhost:3000

# Optional: Real-time Phishing Intelligence providers
PHISHTANK_API_KEY=
OPENPHISH_API_KEY=

# Optional: Cloud SQL / PostgreSQL Connection String
DATABASE_URL=
```

### Development Server

Start the full-stack development server:

```bash
npm run dev
```

The application will be accessible at:  
👉 **`http://localhost:3000`**

### Production Build

To compile both the React frontend and the Express backend bundle:

```bash
npm run build
```

This generates:
- `dist/`: Optimized static frontend assets (HTML, CSS, JS)
- `dist/server.cjs`: Standalone self-contained backend server

Run the production build locally:

```bash
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check and telemetry status |
| `POST` | `/api/scan` | Analyze offer letter, job description, or message |
| `POST` | `/api/chat` | Contextual conversational queries with Protector AI |
| `GET` | `/api/community/feed` | Retrieve recent crowdsourced scam reports |
| `POST` | `/api/community/report` | Submit a fraudulent recruiter or fake listing to the blacklist |
| `GET` | `/api/stats` | Global threat statistics and threat score distribution |

---

## 🚢 Deployment

### Option A: Google Cloud Run (Recommended)

1. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
2. Deploy directly from the source directory:
   ```bash
   gcloud run deploy scamshield-ai \
     --source . \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --port 3000 \
     --set-env-vars GEMINI_API_KEY="your-gemini-api-key"
   ```

### Option B: Docker Container

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

Build and run:

```bash
docker build -t scamshield-ai .
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key" scamshield-ai
```

### Option C: Self-Hosted VPS (PM2 / Systemd)

On Ubuntu/Debian:

```bash
npm ci
npm run build
npm install -g pm2
pm2 start dist/server.cjs --name "scamshield"
pm2 save
pm2 startup
```

---

## 🔒 Security & Zero-Trust Principles

- **No Client-Side Secrets**: Gemini API keys and threat intelligence credentials never touch the browser. All AI processing is proxied through server-side endpoints.
- **Client-Side Document Parsing**: Sensitive PII within uploaded documents is sanitized prior to LLM submission.
- **Evidentiary Integrity**: Incident logs record hash signatures to prevent tampering when submitted to law enforcement or legal counsel.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for candidate protection and digital safety.
</p>

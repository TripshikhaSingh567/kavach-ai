# KAVACH-AI: Autonomous AI Cyber-Resilience & Incident Triage Engine

> **Hackathon Prototype** | Turning thousands of fragmented security alerts into one prioritised incident with human-in-the-loop approvals for high-impact actions.

---

## 🛡️ Core Highlights

- **3-Way Multi-Score Threat Engine**: Combines **Isolation Forest** (unsupervised anomaly detection), **Gradient-Boosted Classifier** (trained on stratified **CIC-IDS2017** network flows), and **Sigma-style detection rules** into an explainable composite risk score (0–100).
- **NetworkX Graph Correlation**: Clusters disparate alerts across hosts, users, source/destination IPs, and temporal windows into a single unified incident.
- **MITRE ATT&CK Attack Graph**: Interactive `@xyflow/react` graph tracing the attacker's causal progression (T1566, T1078, T1021, T1046, T1068).
- **Server-Side AI Triage Agent**: Synthesizes kill-chain narratives, evidence lists, and calibrated confidence using Gemini (with deterministic template fallback when offline).
- **Human-in-the-Loop Safeguards**: Low-risk containment (firewall IP drop, password reset) executes autonomously in under 0.5s; high-impact actions (EDR workstation isolation, domain lockout) require explicit 1-click human analyst authorization.
- **Enterprise Resilience**: Pings `/health` on load with a 10s timeout, gracefully falling back to precomputed snapshots in `/public/fallback` if the Render backend is sleeping.
- **Robustness Demonstration**: Active defense against adversarial prompt injection attacks (`ignore previous instructions...`), graceful confidence degradation when telemetry is fragmented, and automatic routing to the SOC Tier-2 queue.

---

## 📊 Benchmark Results (Real Computed Runs)

*Evaluated across Scenario A (Phishing Credential Compromise) and Scenario B (Lateral Movement).*

| Evaluation Metric | Traditional SIEM (Rule-Only Baseline) | KAVACH-AI (Autonomous Resilience) | Net Operational Gain |
| :--- | :--- | :--- | :--- |
| **Detection Rate (Recall)** | 35.7% | **100.0%** | **+64.3%** |
| **False Positive Rate (FPR)** | 16.7% | **0.0%** | **-16.7%** (Scanner suppressed) |
| **Mean Time to Detect (MTTD)** | 10 seconds | **5 seconds** | **50.0% faster** |
| **Mean Time to Respond (MTTR)** | 52.5 minutes | **2.4 minutes** | **95.4% reduction** |
| **Analyst Effort (Items to Review)**| 7 disjoint tickets | **1 correlated incident** | **85.7% reduction** |

*Note: Ground truth dataset derived from CIC-IDS2017 stratified port scan sample and seeded cyber kill chains for reproducible demonstration.*

---

## 🚀 Quickstart (Local Run)

### 1. Prerequisites
- Python 3.12 or 3.13
- Node.js v18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and insert your GEMINI_API_KEY
# (Deterministic fallback operates automatically if key is omitted)

# Launch FastAPI backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API will be live at `http://127.0.0.1:8000` (docs at `/docs`).

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## ☁️ Cloud Deployment Guide

### A. Backend on Render (Web Service)
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Web Service**.
2. Connect repository: `https://github.com/TripshikhaSingh567/kavach-ai.git`.
3. Set configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `PYTHON_VERSION`: `3.12.8`
   - `ALLOWED_ORIGINS`: `*` (or your Vercel frontend URL)
   - `GEMINI_API_KEY`: `<your_gemini_api_key>`
5. Deploy and copy your Render URL (e.g. `https://kavach-ai-backend.onrender.com`).

### B. Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New Project**.
2. Import `https://github.com/TripshikhaSingh567/kavach-ai.git`.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `<your_backend_render_url>`
5. Deploy!

---

## ⏱️ 3-Minute Demo Pitch Script for Judges

- **Minute 0:00 - 0:45: The Problem & Live Stream (Dashboard)**
  - *"Security Operations Centers are drowning in alert fatigue. Hundreds of disjoint alerts fire every hour from EDR, firewalls, and cloud IDPs."*
  - Switch between **Scenario A (Phishing)** and **Scenario B (Lateral Movement)**.
  - Show the live streaming alert table with the **3-way score breakdown** (Isolation Forest anomaly + HistGB PortScan patterns + Sigma rules).
  - Highlight the suppression of background noise, duplicate syslog feeds, and Nessus scanner false positives.

- **Minute 0:45 - 1:45: Correlation & AI Triage (Incident Detail)**
  - Click **"Correlate Alerts with NetworkX"**.
  - Show how 13 fragmented alerts collapsed into **1 high-priority incident**.
  - Interact with the **MITRE ATT&CK Causal Attack Graph** (ReactFlow). Point out how initial access leads causally to exfiltration or privilege escalation.
  - Show the **Gemini AI Triage Report**: *"Notice the calibrated confidence and evidence list referencing exact event IDs."*

- **Minute 1:45 - 2:30: Human-in-the-Loop & Robustness Demo**
  - Navigate to **"Playbook & Approvals"**:
    - Show that perimeter actions (block IP, revoke session tokens) ran **autonomously in <0.5s**.
    - Show the **Approval Gate**: click **Approve** on host isolation. Explain: *"High-impact actions that could shut down a business workstation never execute without human authorization."*
  - Navigate to **"Robustness & Prompt Shield"**:
    - Demonstrate an adversarial prompt injection in a log header (`ignore previous instructions...`). Show how the **Prompt Shield** neutralizes the payload before the LLM.
    - Show the missing-telemetry case where confidence drops to 52% and diverts to the human queue instead of guessing.

- **Minute 2:30 - 3:00: Benchmarks & Architecture**
  - Switch to **"Benchmark & Evaluation"**:
    - Present the clean screenshot results matrix showing **+64.3% detection rate**, **95.4% MTTR reduction**, and **85.7% reduction in analyst effort**.
  - Show the **Architecture Blueprint** explaining how production plugs directly into Wazuh, Elasticsearch, and EDR.

---

## 🔒 Security & Quality Assurance
- No secrets committed to git (`.gitignore` protects all `.env` files).
- Zero hardcoded benchmark statistics; all metrics calculated dynamically from evaluation passes.
- Fallback snapshot resilience ensures the presentation never crashes even if external cloud services sleep.

# EventPulse — Real-Time Reactive Event Graph Platform

> **One live event graph. Zero polling. Every role sees the same truth in real time.**

EventPulse is a real-time event graph platform built for high-stakes hackathons and live tech conferences. Unlike traditional multi-screen tools that rely on fragmented database tables and polling refreshes, EventPulse models `Attendee`, `Team`, `Submission`, `Score`, and `Announcement` as interconnected nodes in a single reactive event graph.

When one node mutates (e.g. a camera QR check-in or blind judge score submission), dependent state views across Participant, Judge, and Organizer dashboards recalculate and update instantly across all open windows with zero page reloads.

---

## 🌟 Key Differentiators & Features

### 1. 🛡️ Blind Judging & Z-Score Normalization Engine
- **Fairness Protocol**: Submissions are anonymized into blind team codes (`TEAM-01`, `TEAM-02`), preventing judge bias based on participant identity or team reputation.
- **Z-Score Normalization**: Evaluates raw rubric scores against each judge's panel baseline using $Z = \frac{X - \mu}{\sigma}$. Eliminates scoring distortion caused by lenient vs. harsh judges before aggregating final leaderboard rankings.

### 2. 🧠 AI Outlier & Bias-Flagging Pipeline
- **Outlier Detection**: When a score's Z-score magnitude exceeds $|Z| > 1.5$ relative to panel history, EventPulse automatically flags the entry.
- **Gemini Outlier Auditor**: Google Gemini AI (`gemini-2.5-flash`) generates an objective 1-sentence auditor warning note for event directors on the Organizer Leaderboard, ensuring scores remain fair and defensible.

### 3. 📷 Real-Time Camera QR Check-In
- Integrated camera scanning powered by `html5-qrcode` for instant attendee entry verification alongside manual fallback code input.
- Successful entry verification fires celebratory visual feedback via `canvas-confetti`.

### 4. ⚡ Skill-Vector Team Matchmaking
- Computes Jaccard and Cosine similarity vectors between participant skill profiles and open team technical gaps, rendering real-time match percentages (%) and 1-click graph join requests.

### 5. 📢 Gemini AI Broadcast Composer & Executive Summaries
- Organizers type raw bullet notes; Gemini AI expands them into energetic, polished event-wide announcements.
- Gemini summarizes multi-judge rubric feedback into concise 1-sentence executive verdicts on the Organizer Leaderboard.

### 6. 🔐 Google Sign-In & Single-Container Docker Architecture
- Integrated Google Identity Services (`@react-oauth/google`) on an authorized role login gate.
- Microservices architecture isolated behind a Node/Express API proxy (`server/index.js`) ensuring Gemini API keys remain 100% server-side and never leak to the client bundle.
- Packaged into a single multi-stage `Dockerfile` serving both static Vite frontend and Express API endpoints.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti, HTML5-QRCode.
- **Backend & Proxy**: Node.js, Express, Cors, Dotenv, Google GenAI SDK (`@google/genai`).
- **State Engine**: Custom Pub/Sub Event Graph Store (`eventGraphStore.ts`) with native `BroadcastChannel` cross-tab synchronization.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Installation
```bash
npm install
```

### 2. Environment Setup (Optional for Live Gemini AI)
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_API_KEY=your_google_gemini_api_key
VITE_DEMO_MODE=true
```

### 3. Run Development Server
```bash
# Start Vite Frontend
npm run dev

# Start Node/Express API Server (Optional in dev, required in prod)
node server/index.js
```

### 4. Run Unit Tests & Build
```bash
# Run Vitest suite (Math, Z-Score, Store Validation, Outlier Flagging)
npm test

# Build production bundle
npm run build
```

---

## 🐳 Docker Deployment

Build and run as a single container serving static assets and API routes:
```bash
docker build -t eventpulse:latest .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key eventpulse:latest
```
Access the application at `http://localhost:3000`.

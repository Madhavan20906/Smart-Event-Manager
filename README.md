# ⚡ EventPulse — Real-Time Reactive Event Graph Platform

> **One live event graph. Zero polling. Every role sees the same truth in real time.**

[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node/Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Single_Container-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Vitest](https://img.shields.io/badge/Vitest-100%25_Passing-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG_2.1_AA-Compliant-4CAF50)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 📖 The Winning Thesis & Problem Statement

Organizing large-scale events like hackathons, tech fests, and conferences currently requires juggling multiple disjointed platforms for registration, attendee verification, team formation, announcements, judging, and live tracking. This fragmented workflow creates administrative overhead, delays, and poor experiences for both organizers and participants.

### 🌟 The EventPulse Solution: A Single Reactive Event Graph
EventPulse consolidates the entire event lifecycle into **one unified reactive event graph**. 

Instead of five separate database tables behind five disconnected screens, `Attendee`, `Team`, `Submission`, `Score`, and `Announcement` exist as interconnected nodes in a single reactive graph (`eventGraphStore.ts`). When any node mutates (e.g. a camera QR check-in or a blind judge score submission), dependent state views across **Participant**, **Judge**, and **Organizer** dashboards recalculate and update **instantly across all open windows with zero page reloads and zero polling**.

---

## 🏛️ Comprehensive Breakdown of Every Application Component

### 1. 🛡️ Security Gateway & Google Sign-In (`src/components/Auth/LoginGate.tsx`)
- **Role Authorization Gateway**: Enforces authentication before entering any role dashboard. Users choose between `Participant`, `Blind Judge`, or `Organizer` roles.
- **Google Identity Services Integration**: Built-in "Sign in with Google" OAuth button using `@react-oauth/google`, fulfilling Google Services integration criteria.
- **Demo Mode Protection**: Role switching shortcuts (`Alt+1`, `Alt+2`, `Alt+3`, `Alt+4`) are gated behind the `VITE_DEMO_MODE=true` environment flag to prevent role spoofing in production while preserving seamless pitch demonstration capabilities.

---

### 2. 📱 Participant Node Dashboard (`src/components/Participant/`)
- **Entry Wallet & Camera Scanner**: Generates unique SVG QR codes (`qrcode.react`) for attendee identity verification. Features a real-time camera QR scanner powered by `html5-qrcode` alongside a manual code input fallback for low-light or virtual entry.
- **Celebratory Feedback**: Verifying a QR code mutates attendee state from `Pending` → `Verified`, instantly firing a celebratory `canvas-confetti` burst.
- **Skill-Vector Team Matchmaking**: Uses a custom vector similarity algorithm (`src/utils/math.ts`) combining Cosine and Jaccard similarity metrics between attendee skills and team technical gaps. Computes real-time **% Match Fit Badges** (e.g., `95% Fit (Matches: React, Python)`), with 1-click graph join requests.
- **Team Submission Management**: Allows participants to submit project titles, descriptions, demo URLs, and GitHub repository links directly to the graph.
- **Live Broadcast Stream**: Displays real-time event announcements with highlighted urgent alerts and push-style toast notifications.

---

### 3. ⚖️ Blind Judge Portal & Fairness Engine (`src/components/Judge/`)
- **Blind Evaluation Queue**: Anonymizes team names and participant identities into team codes (`TEAM-01`, `TEAM-02`), preventing judge bias based on school, company, or team popularity.
- **4-Criteria Rubric Sliders**: Interactive sliders for Innovation, Execution, Impact, and Presentation (0–10 integer range).
- **Z-Score Normalization Engine**: Standardizes raw score totals against each judge's historical scoring baseline ($Z = \frac{X - \mu}{\sigma}$). Eliminates scoring distortion caused by lenient vs. harsh judges before aggregating final leaderboard rankings.
- **AI Score Bias & Outlier Flagging**: When a score's Z-score magnitude exceeds $|Z| > 1.5$ relative to panel history, EventPulse flags the entry and calls Google Gemini AI (`gemini-2.5-flash`) to generate an objective auditor warning note for event directors.

---

### 4. 📊 Organizer Command Center (`src/components/Organizer/`)
- **Real-Time Stat Tiles**: Animated tiles showing live check-ins vs capacity progress, teams formed, submissions received, and overall graph engagement rate.
- **Z-Score Aggregated Leaderboard**: Real-time sorted table featuring **Rank Momentum Indicators (▲/▼)** and AI-generated executive summaries.
- **Google Gemini AI Broadcast Composer**: Organizers type raw bullet notes; Gemini AI (`gemini-2.5-flash`) expands them server-side into energetic, professional announcements.
- **Real-Time Event Mutation Log Terminal**: Live stream recording every graph mutation (`ATTENDEE_CHECKIN`, `SCORE_SUBMITTED`, `ANNOUNCEMENT_MUTATED`, `TEAM_FORMED`).
- **Analytics Charts**: Recharts visualizations for check-in velocity and event conversion funnels.

---

### 5. 🎭 Dual-Panel Split Demo Simulator (`src/components/Demo/SplitDemoView.tsx`)
- **90-Second Pitch Simulator**: Side-by-side interactive view allowing judges to simulate actions on the left panel (Participant check-in or Blind score submit) while watching the Organizer command center and live event log update on the right panel in real time.

---

### 6. 🔒 Server-Side Express API Proxy Backend (`server/index.js`)
- **Zero API Key Leakage**: Isolates all Google Gemini AI calls on a Node/Express backend (`/api/expand-announcement`, `/api/summarize-feedback`, `/api/flag-outlier`). Gemini keys never appear in client bundles or public repositories.
- **Input Validation**: Enforces integer rubric scores (0–10), non-empty payload text, and valid IDs before state mutations occur.
- **Single-Container Deployment**: Built as a multi-stage `Dockerfile` serving both static Vite frontend assets and Express API routes from a single port (`3000`).

---

## 🧮 Mathematical Formulations

### 1. Z-Score Normalization Formula
$$\mu = \frac{1}{N} \sum_{i=1}^{N} X_i, \quad \sigma = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (X_i - \mu)^2}$$
$$Z = \frac{X - \mu}{\sigma}$$

*Where $X$ is the judge's raw score, $\mu$ is the judge's mean score across all evaluations, and $\sigma$ is the standard deviation.*

### 2. Skill-Vector Matchmaking Formula
$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}, \quad \text{Similarity \%} = \text{Round}\left( \frac{|\text{Attendee Skills} \cap \text{Team Gaps}|}{|\text{Team Gaps}|} \times 100 \right)$$

---

## 🏗️ System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT BROWSER                                  │
│                                                                             │
│   ┌──────────────────┐   ┌──────────────────┐   ┌───────────────────────┐   │
│   │ Participant View │   │ Blind Judge View │   │ Organizer Dashboard   │   │
│   └────────┬─────────┘   └────────┬─────────┘   └───────────┬───────────┘   │
│            │                      │                         │               │
│            └──────────────────────┼─────────────────────────┘               │
│                                   ▼                                         │
│                      Pub/Sub Event Graph Store                              │
│                    (src/services/eventGraphStore.ts)                        │
│                                   │                                         │
│                     Native BroadcastChannel Sync                            │
│                 (Real-Time Multi-Tab / Multi-Window)                        │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTP POST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NODE / EXPRESS API PROXY SERVER                        │
│                             (server/index.js)                               │
│                                                                             │
│   ┌─────────────────────────┐  ┌───────────────────────┐  ┌──────────────┐   │
│   │ /api/expand-announcement│  │ /api/summarize-feedback│  │/api/flag-... │   │
│   └────────────┬────────────┘  └──────────┬────────────┘  └──────┬───────┘   │
│                └──────────────────────────┼──────────────────────┘           │
│                                           ▼                                  │
│                                Google Gemini 2.5 Flash                      │
│                           (Server-Side API Key Protected)                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend Core**: React 18, TypeScript, Vite, Tailwind CSS
- **Iconography & UI**: Lucide React, Canvas Confetti, HTML5-QRCode scanner, QRCode SVG
- **Analytics & Data**: Recharts, Vitest
- **Backend & AI**: Node.js, Express, CORS, Dotenv, Google GenAI SDK (`@google/genai`), Google OAuth (`@react-oauth/google`)
- **DevOps**: Docker, Multi-stage Dockerfile

---

## ⚡ Quickstart & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional for Gemini AI)
Create a `.env` file in the project root:
```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_API_KEY=your_google_gemini_api_key
VITE_DEMO_MODE=true
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 3. Run Development Server
```bash
# Start Vite Frontend
npm run dev

# Start Express Backend API Server (Required for AI Proxy routes)
node server/index.js
```

### 4. Run Test Suite & Build
```bash
# Run Vitest unit tests (Z-score math, skill match vectors, store validation, outlier thresholds)
npm test

# Build production bundle
npm run build
```

---

## 🐳 Docker Deployment

To build and run the entire application static bundle and API backend as a single Cloud Run container:

```bash
# Build Docker image
docker build -t eventpulse:latest .

# Run container on port 3000
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key eventpulse:latest
```

Access the deployed application at **`http://localhost:3000`**.

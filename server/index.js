import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Google Gemini AI server-side using secure environment key
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
let aiClient = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log('✅ Google Gemini AI client initialized securely on backend server.');
  } catch (err) {
    console.warn('⚠️ Gemini AI server client init error:', err);
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY not configured in backend environment. Fallbacks active.');
}

// ROUTE 1: Expand Announcement Bullets
app.post('/api/expand-announcement', async (req, res) => {
  const { bulletPoints } = req.body;

  if (!bulletPoints || typeof bulletPoints !== 'string') {
    return res.status(400).json({ error: 'bulletPoints parameter is required.' });
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an energetic event director for a high-stakes hackathon called EventPulse. 
Expand the following bullet points into a single, punchy 1-2 sentence announcement for participants and judges.
Keep it direct, professional, and clear. Do not use markdown headers.

Bullet points:
${bulletPoints}`,
      });

      if (response.text) {
        return res.json({ text: response.text.trim() });
      }
    } catch (err) {
      console.warn('Backend Gemini call error:', err);
    }
  }

  // Server-side fallback
  const cleaned = bulletPoints
    .split('\n')
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .join('. ');

  return res.json({
    text: `📢 EVENT NOTICE: ${cleaned}. Stay tuned to the live graph feed for updates!`,
  });
});

// ROUTE 2: Summarize Judge Feedback
app.post('/api/summarize-feedback', async (req, res) => {
  const { teamCode, scores } = req.body;

  if (!teamCode || !Array.isArray(scores)) {
    return res.status(400).json({ error: 'Invalid teamCode or scores payload.' });
  }

  const combinedFeedback = scores.map(s => `Score ${s.rawTotal}/40: "${s.feedback}"`).join('\n');

  if (aiClient && combinedFeedback.trim()) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert hackathon head judge. Summarize the following feedback for ${teamCode} into exactly ONE concise sentence highlighting key strengths and areas of improvement:

${combinedFeedback}`,
      });

      if (response.text) {
        return res.json({ summary: response.text.trim() });
      }
    } catch (err) {
      console.warn('Backend Gemini feedback summary error:', err);
    }
  }

  if (scores.length === 0) {
    return res.json({ summary: 'Awaiting judge evaluation.' });
  }
  const avg = scores.reduce((a, b) => a + b.rawTotal, 0) / scores.length;
  return res.json({
    summary: `${teamCode} evaluated by ${scores.length} judge(s) with an average raw score of ${avg.toFixed(1)}/40. ${scores[0]?.feedback || ''}`,
  });
});

// ROUTE 3: AI Bias Flagging for Outlier Scores
app.post('/api/flag-outlier', async (req, res) => {
  const { teamCode, zScore, rawTotal, judgeName, feedback } = req.body;

  if (!teamCode || zScore === undefined) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI fairness auditor for hackathon scoring. A judge (${judgeName || 'Panel Judge'}) submitted a score for ${teamCode} (Raw: ${rawTotal}/40) resulting in a significant Z-score deviation (${zScore > 0 ? '+' : ''}${zScore}).
Write a 1-sentence objective auditor note explaining why this score stands out from the judge panel baseline.

Judge Notes: "${feedback || 'No comments provided'}"`,
      });

      if (response.text) {
        return res.json({ outlierNote: response.text.trim() });
      }
    } catch (err) {
      console.warn('Backend Gemini outlier flag error:', err);
    }
  }

  const direction = zScore > 0 ? 'significantly higher' : 'significantly lower';
  return res.json({
    outlierNote: `Score is a notable outlier (${zScore > 0 ? '+' : ''}${zScore} Z-score) — ${direction} than panel baseline.`,
  });
});

// Serve Vite production build static files
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 EventPulse Production Server running on port ${PORT}`);
});

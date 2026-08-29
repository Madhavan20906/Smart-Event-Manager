import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { teamCode, zScore, rawTotal, judgeName, feedback } = req.body || {};

  if (!teamCode || zScore === undefined) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

  if (apiKey) {
    try {
      const aiClient = new GoogleGenAI({ apiKey });
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI fairness auditor for hackathon scoring. A judge (${judgeName || 'Panel Judge'}) submitted a score for ${teamCode} (Raw: ${rawTotal}/40) resulting in a significant Z-score deviation (${zScore > 0 ? '+' : ''}${zScore}).
Write a 1-sentence objective auditor note explaining why this score stands out from the judge panel baseline.

Judge Notes: "${feedback || 'No comments provided'}"`,
      });

      if (response.text) {
        return res.status(200).json({ outlierNote: response.text.trim() });
      }
    } catch (err) {
      console.warn('Vercel Gemini outlier flag error:', err);
    }
  }

  const direction = zScore > 0 ? 'significantly higher' : 'significantly lower';
  return res.status(200).json({
    outlierNote: `Score is a notable outlier (${zScore > 0 ? '+' : ''}${zScore} Z-score) — ${direction} than panel baseline.`,
  });
}

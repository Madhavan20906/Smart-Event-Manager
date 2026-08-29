import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bulletPoints } = req.body || {};

  if (!bulletPoints || typeof bulletPoints !== 'string') {
    return res.status(400).json({ error: 'bulletPoints parameter is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

  if (apiKey) {
    try {
      const aiClient = new GoogleGenAI({ apiKey });
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an energetic event director for a high-stakes hackathon called EventPulse. 
Expand the following bullet points into a single, punchy 1-2 sentence announcement for participants and judges.
Keep it direct, professional, and clear. Do not use markdown headers.

Bullet points:
${bulletPoints}`,
      });

      if (response.text) {
        return res.status(200).json({ text: response.text.trim() });
      }
    } catch (err) {
      console.warn('Vercel Serverless Gemini error:', err);
    }
  }

  // Fallback
  const cleaned = bulletPoints
    .split('\n')
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .join('. ');

  return res.status(200).json({
    text: `📢 EVENT NOTICE: ${cleaned}. Stay tuned to the live graph feed for updates!`,
  });
}

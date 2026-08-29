import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { teamCode, scores } = req.body || {};

  if (!teamCode || !Array.isArray(scores)) {
    return res.status(400).json({ error: 'Invalid teamCode or scores payload.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  const combinedFeedback = scores.map(s => `Score ${s.rawTotal}/40: "${s.feedback}"`).join('\n');

  if (apiKey && combinedFeedback.trim()) {
    try {
      const aiClient = new GoogleGenAI({ apiKey });
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert hackathon head judge. Summarize the following feedback for ${teamCode} into exactly ONE concise sentence highlighting key strengths and areas of improvement:

${combinedFeedback}`,
      });

      if (response.text) {
        return res.status(200).json({ summary: response.text.trim() });
      }
    } catch (err) {
      console.warn('Vercel Gemini feedback summary error:', err);
    }
  }

  if (scores.length === 0) {
    return res.status(200).json({ summary: 'Awaiting judge evaluation.' });
  }
  const avg = scores.reduce((a, b) => a + b.rawTotal, 0) / scores.length;
  return res.status(200).json({
    summary: `${teamCode} evaluated by ${scores.length} judge(s) with an average raw score of ${avg.toFixed(1)}/40. ${scores[0]?.feedback || ''}`,
  });
}

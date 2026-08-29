import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client using environment key if present
const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

/**
 * Uses Google Gemini AI to expand bullet points into a polished event broadcast announcement.
 */
export async function expandAnnouncementWithGemini(bulletPoints: string): Promise<string> {
  if (!bulletPoints || !bulletPoints.trim()) {
    return 'Please provide bullet points to expand.';
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an energetic, clear event director for a high-stakes hackathon called EventPulse. 
Expand the following bullet points into a single, punchy 1-2 sentence announcement for participants and judges.
Keep it direct, professional, and clear. Do not use markdown headers.

Bullet points:
${bulletPoints}`,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local expansion:', err);
    }
  }

  // Graceful local fallback if Gemini API key is not configured
  const cleaned = bulletPoints
    .split('\n')
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .join('. ');

  return `📢 EVENT NOTICE: ${cleaned}. Please stay tuned to the live graph feed for updates!`;
}

/**
 * Uses Google Gemini AI to summarize judge feedback comments into a 1-sentence executive verdict.
 */
export async function summarizeJudgeFeedbackWithGemini(
  teamCode: string,
  scores: Array<{ rawTotal: number; feedback: string }>
): Promise<string> {
  const combinedFeedback = scores.map(s => `Score ${s.rawTotal}/40: "${s.feedback}"`).join('\n');

  if (aiClient && combinedFeedback.trim()) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert hackathon head judge. Summarize the following feedback for ${teamCode} into exactly ONE concise sentence highlighting key strengths and areas of improvement:

${combinedFeedback}`,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini API feedback summary failed:', err);
    }
  }

  // Fallback summary generator
  if (scores.length === 0) return 'Awaiting judge evaluation.';
  const avg = scores.reduce((a, b) => a + b.rawTotal, 0) / scores.length;
  return `${teamCode} evaluated by ${scores.length} judge(s) with an average raw score of ${avg.toFixed(1)}/40. ${scores[0]?.feedback || ''}`;
}

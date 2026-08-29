/**
 * Client-side Gemini Service Proxy.
 * Calls backend Express API routes (/api/expand-announcement, /api/summarize-feedback, /api/flag-outlier)
 * ensuring Gemini API keys remain strictly server-side.
 */

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

export async function expandAnnouncementWithGemini(bulletPoints: string): Promise<string> {
  if (!bulletPoints || !bulletPoints.trim()) {
    return 'Please provide bullet points to expand.';
  }

  try {
    const res = await fetch(`${API_BASE}/api/expand-announcement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bulletPoints }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) return data.text;
    }
  } catch (err) {
    console.warn('API Proxy call failed, falling back to local formatting:', err);
  }

  const cleaned = bulletPoints
    .split('\n')
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .join('. ');

  return `📢 EVENT NOTICE: ${cleaned}. Stay tuned to the live graph feed for updates!`;
}

export async function summarizeJudgeFeedbackWithGemini(
  teamCode: string,
  scores: Array<{ rawTotal: number; feedback: string }>
): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/summarize-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamCode, scores }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.summary) return data.summary;
    }
  } catch (err) {
    console.warn('API Proxy feedback summary error:', err);
  }

  if (scores.length === 0) return 'Awaiting judge evaluation.';
  const avg = scores.reduce((a, b) => a + b.rawTotal, 0) / scores.length;
  return `${teamCode} evaluated by ${scores.length} judge(s) with raw average ${avg.toFixed(1)}/40. ${scores[0]?.feedback || ''}`;
}

export async function flagScoreOutlierWithGemini(payload: {
  teamCode: string;
  zScore: number;
  rawTotal: number;
  judgeName: string;
  feedback: string;
}): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/flag-outlier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.outlierNote) return data.outlierNote;
    }
  } catch (err) {
    console.warn('API Proxy outlier flag error:', err);
  }

  return `Score deviates notably (${payload.zScore > 0 ? '+' : ''}${payload.zScore} Z-Score) relative to panel baseline.`;
}

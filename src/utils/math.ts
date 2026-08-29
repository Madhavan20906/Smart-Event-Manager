import { Score } from '../types';

/**
 * Computes the Z-Score for a raw total score relative to a collection of raw scores from the same judge.
 * Z = (x - mean) / stdDev
 * If there are fewer than 2 scores or stdDev is 0, returns 0.
 */
export function calculateZScore(currentRawScore: number, judgeRawScores: number[]): number {
  if (judgeRawScores.length === 0) return 0;
  
  const sum = judgeRawScores.reduce((acc, val) => acc + val, 0);
  const mean = sum / judgeRawScores.length;

  if (judgeRawScores.length < 2) {
    return 0;
  }

  const variance = judgeRawScores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / judgeRawScores.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return 0; // All scores are identical
  }

  const z = (currentRawScore - mean) / stdDev;
  return Number(z.toFixed(3));
}

/**
 * Re-normalizes all scores for a specific judge when a new score is added or modified.
 */
export function recalibrateJudgeScores(allScores: Score[], judgeId: string): Score[] {
  const judgeScores = allScores.filter(s => s.judgeId === judgeId);
  const rawScores = judgeScores.map(s => s.rawTotal);

  return allScores.map(score => {
    if (score.judgeId !== judgeId) return score;
    const zScore = calculateZScore(score.rawTotal, rawScores);
    return { ...score, zScore };
  });
}

export interface SkillMatchResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingGaps: string[];
}

/**
 * Calculates skill compatibility between an attendee's skills and a team's required skill gaps.
 * Uses normalized token matching and calculates fit ratio & Jaccard index.
 */
export function calculateSkillMatch(attendeeSkills: string[], teamSkillGaps: string[]): SkillMatchResult {
  if (!attendeeSkills.length || !teamSkillGaps.length) {
    return {
      matchPercentage: 0,
      matchingSkills: [],
      missingGaps: teamSkillGaps,
    };
  }

  const normalizedAttendeeSkills = attendeeSkills.map(s => s.trim().toLowerCase());
  const matchingSkills: string[] = [];
  const missingGaps: string[] = [];

  teamSkillGaps.forEach(gap => {
    const normGap = gap.trim().toLowerCase();
    const isMatch = normalizedAttendeeSkills.some(skill => 
      skill === normGap || skill.includes(normGap) || normGap.includes(skill)
    );
    if (isMatch) {
      matchingSkills.push(gap);
    } else {
      missingGaps.push(gap);
    }
  });

  // Calculate percentage: Ratio of gaps satisfied + Jaccard weighting
  const gapCoverage = matchingSkills.length / Math.max(1, teamSkillGaps.length);
  
  // Convert to 0-100 percentage with minimum boost for partial matches
  let percentage = Math.round(gapCoverage * 100);
  if (matchingSkills.length > 0 && percentage === 0) percentage = 15;

  return {
    matchPercentage: Math.min(100, percentage),
    matchingSkills,
    missingGaps,
  };
}

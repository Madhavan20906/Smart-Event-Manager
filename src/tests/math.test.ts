import { describe, it, expect, beforeEach } from 'vitest';
import { calculateZScore, calculateSkillMatch } from '../utils/math';
import { eventGraphStore } from '../services/eventGraphStore';

describe('Z-Score Normalization Engine', () => {
  it('returns 0 when there are fewer than 2 scores', () => {
    expect(calculateZScore(25, [25])).toBe(0);
    expect(calculateZScore(30, [])).toBe(0);
  });

  it('returns 0 when standard deviation is 0 (all scores identical)', () => {
    expect(calculateZScore(20, [20, 20, 20])).toBe(0);
  });

  it('correctly calculates positive z-score for a harsh judge giving a high score', () => {
    // Scores: 10, 12, 14, 24 -> Mean = 15, Variance = 29, StdDev ~ 5.385
    // Z for 24 = (24 - 15) / 5.385 = 1.671
    const scores = [10, 12, 14, 24];
    const z = calculateZScore(24, scores);
    expect(z).toBeGreaterThan(1.5);
    expect(z).toBeLessThan(1.8);
  });

  it('correctly calculates negative z-score for a low score', () => {
    const scores = [10, 20, 30, 40];
    const z = calculateZScore(10, scores);
    expect(z).toBeLessThan(0);
  });
});

describe('Skill-Vector Matchmaking Engine Edge Cases', () => {
  it('returns 100% fit when attendee fulfills all team skill gaps', () => {
    const skills = ['React', 'TypeScript', 'Tailwind', 'Python'];
    const gaps = ['React', 'Python'];
    const result = calculateSkillMatch(skills, gaps);
    expect(result.matchPercentage).toBe(100);
    expect(result.matchingSkills).toEqual(['React', 'Python']);
    expect(result.missingGaps).toEqual([]);
  });

  it('handles empty inputs gracefully', () => {
    const result = calculateSkillMatch([], []);
    expect(result.matchPercentage).toBe(0);
    expect(result.matchingSkills).toEqual([]);
    expect(result.missingGaps).toEqual([]);
  });

  it('handles duplicate skills and punctuation variants', () => {
    const skills = ['ReactJS!', 'ReactJS!', '  Node.JS  '];
    const gaps = ['ReactJS', 'Node.JS'];
    const result = calculateSkillMatch(skills, gaps);
    expect(result.matchingSkills.length).toBeGreaterThan(0);
  });
});

describe('EventGraphStore Validation & AI Outlier Flagging', () => {
  beforeEach(() => {
    eventGraphStore.resetStore();
    eventGraphStore.getState().scores = [];
  });

  it('rejects out-of-range rubric score values (> 10)', () => {
    expect(() => {
      eventGraphStore.submitScore({
        judgeId: 'att-3',
        judgeName: 'Marcus Vance',
        submissionId: 'sub-1',
        teamId: 'team-1',
        rubricScores: { innovation: 15, execution: 8, impact: 9, presentation: 10 },
        feedback: 'Out of bounds test',
      });
    }).toThrow('Invalid rubric score');
  });

  it('rejects negative rubric scores (< 0)', () => {
    expect(() => {
      eventGraphStore.submitScore({
        judgeId: 'att-3',
        judgeName: 'Marcus Vance',
        submissionId: 'sub-1',
        teamId: 'team-1',
        rubricScores: { innovation: -2, execution: 8, impact: 9, presentation: 10 },
        feedback: 'Negative score test',
      });
    }).toThrow('Invalid rubric score');
  });

  it('triggers AI outlier flagging when Z-score magnitude exceeds 1.5 threshold', () => {
    // Submit 3 low baseline scores + 1 outlier score
    eventGraphStore.submitScore({
      judgeId: 'att-3',
      judgeName: 'Marcus Vance',
      submissionId: 'sub-1',
      teamId: 'team-1',
      rubricScores: { innovation: 1, execution: 1, impact: 0, presentation: 0 },
      feedback: 'Harsh assessment 1',
    });

    eventGraphStore.submitScore({
      judgeId: 'att-3',
      judgeName: 'Marcus Vance',
      submissionId: 'sub-2',
      teamId: 'team-2',
      rubricScores: { innovation: 1, execution: 0, impact: 1, presentation: 0 },
      feedback: 'Harsh assessment 2',
    });

    eventGraphStore.submitScore({
      judgeId: 'att-3',
      judgeName: 'Marcus Vance',
      submissionId: 'sub-3',
      teamId: 'team-3',
      rubricScores: { innovation: 0, execution: 1, impact: 1, presentation: 0 },
      feedback: 'Harsh assessment 3',
    });

    // 4. Submit massive outlier score 40/40 for sub-4
    const scoreOutlier = eventGraphStore.submitScore({
      judgeId: 'att-3',
      judgeName: 'Marcus Vance',
      submissionId: 'sub-4',
      teamId: 'team-4',
      rubricScores: { innovation: 10, execution: 10, impact: 10, presentation: 10 },
      feedback: 'Exceptional performance',
    });

    expect(scoreOutlier.isOutlier).toBe(true);
    expect(scoreOutlier.zScore).toBeGreaterThan(1.5);
  });
});

import { describe, it, expect } from 'vitest';
import { calculateZScore, calculateSkillMatch } from '../utils/math';

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
    // Mean = 25, StdDev ~ 11.18
    // Z for 10 = (10 - 25) / 11.18 = -1.34
    const z = calculateZScore(10, scores);
    expect(z).toBeLessThan(0);
  });
});

describe('Skill-Vector Matchmaking Engine', () => {
  it('returns 100% fit when attendee fulfills all team skill gaps', () => {
    const skills = ['React', 'TypeScript', 'Tailwind', 'Python'];
    const gaps = ['React', 'Python'];
    const result = calculateSkillMatch(skills, gaps);
    expect(result.matchPercentage).toBe(100);
    expect(result.matchingSkills).toEqual(['React', 'Python']);
    expect(result.missingGaps).toEqual([]);
  });

  it('returns partial match when some skills align', () => {
    const skills = ['UI Design', 'Figma'];
    const gaps = ['Figma', 'Rust', 'GraphQL'];
    const result = calculateSkillMatch(skills, gaps);
    expect(result.matchPercentage).toBe(33);
    expect(result.matchingSkills).toEqual(['Figma']);
    expect(result.missingGaps).toEqual(['Rust', 'GraphQL']);
  });

  it('handles case-insensitivity and whitespace trim', () => {
    const skills = ['  react ', 'TYPESCRIPT '];
    const gaps = ['React', 'TypeScript'];
    const result = calculateSkillMatch(skills, gaps);
    expect(result.matchPercentage).toBe(100);
  });

  it('returns 0% when no skills overlap', () => {
    const skills = ['C++', 'Assembly'];
    const gaps = ['React', 'CSS'];
    const result = calculateSkillMatch(skills, gaps);
    expect(result.matchPercentage).toBe(0);
    expect(result.matchingSkills).toHaveLength(0);
  });
});

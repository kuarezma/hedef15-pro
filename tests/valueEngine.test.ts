import { describe, it, expect } from 'vitest';
import { calculateImpliedProbabilities, analyzeValueBetsForMatch } from '../src/core/valueEngine';
import { INITIAL_MATCHES } from '../src/data/sampleBulletin';

describe('AI Value Arbitrage Engine', () => {
  it('correctly calculates implied market probabilities from odds', () => {
    const odds = { '1': 2.0, 'X': 3.0, '2': 6.0 };
    // 1/2 = 0.5, 1/3 = 0.333, 1/6 = 0.166 -> sum = 1.0
    const implied = calculateImpliedProbabilities(odds);
    expect(implied['1']).toBeCloseTo(50.0, 1);
    expect(implied['X']).toBeCloseTo(33.3, 1);
    expect(implied['2']).toBeCloseTo(16.7, 1);
  });

  it('identifies strong positive value when true probability exceeds public pick proportion', () => {
    const match = {
      ...INITIAL_MATCHES[0],
      odds: { '1': 2.0, 'X': 3.2, '2': 3.8 }, // Implied ~46% for '1'
      publicPicks: { '1': 25, 'X': 35, '2': 40 } // Public severely under-bet '1'
    };

    const analyses = analyzeValueBetsForMatch(match);
    const outcome1 = analyses.find(a => a.outcome === '1');
    expect(outcome1).toBeDefined();
    expect(outcome1?.valueRatio).toBeGreaterThan(1.2);
    expect(outcome1?.recommendation).toBe('STRONG_VALUE');
  });
});

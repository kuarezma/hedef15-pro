import { describe, it, expect } from 'vitest';
import { runMonteCarloSimulation } from '../src/core/monteCarloEngine';
import { Match, Column } from '../src/core/types';

describe('Monte Carlo Simulation Engine', () => {
  const sampleMatches: Match[] = Array(15).fill(null).map((_, i) => ({
    id: i + 1,
    order: i + 1,
    homeTeam: `Home ${i + 1}`,
    awayTeam: `Away ${i + 1}`,
    matchDate: '15.08.2026',
    matchTime: '20:00',
    league: 'Süper Lig',
    odds: { '1': 2.0, 'X': 3.2, '2': 3.5 },
    publicPicks: { '1': 45, 'X': 25, '2': 30 },
    aiPicks: { '1': 48, 'X': 24, '2': 28 },
    userPicks: { '1': true, 'X': false, '2': false },
    userPercents: { '1': 50, 'X': 25, '2': 25 }
  }));

  const sampleCols: Column[] = [
    Array(15).fill('1'),
    Array(15).fill('X'),
    Array(15).fill('2')
  ];

  it('runs monte carlo simulation and produces valid probability metrics', () => {
    const res = runMonteCarloSimulation(sampleMatches, sampleCols, 1000, 2);

    expect(res.simulationsCount).toBe(1000);
    expect(res.distribution.length).toBe(16);
    expect(res.hitProbabilities['15']).toBeGreaterThanOrEqual(0);
    expect(res.financials.totalCostTL).toBe(6);
  });
});

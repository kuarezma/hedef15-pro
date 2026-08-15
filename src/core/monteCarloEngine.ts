import { Column, Match, Outcome } from './types';
import { countMatches } from './combinatorics';

export interface MonteCarloResult {
  simulationsCount: number;
  hitCounts: {
    '15': number;
    '14': number;
    '13': number;
    '12': number;
    '11': number;
    '10_less': number;
  };
  hitProbabilities: {
    '15': number;
    '14': number;
    '13': number;
    '12': number;
    'at_least_12': number;
  };
  financials: {
    totalCostTL: number;
    expectedReturnTL: number;
    roiPercent: number;
    profitProbability: number;
  };
  distribution: { hits: number; count: number; percent: number }[];
}

/**
 * Runs fast Monte Carlo simulations for a set of columns against realistic match probabilities
 */
export function runMonteCarloSimulation(
  matches: Match[],
  columns: Column[],
  simulationsCount: number = 10000,
  unitPriceTL: number = 2
): MonteCarloResult {
  if (columns.length === 0 || matches.length !== 15) {
    return {
      simulationsCount: 0,
      hitCounts: { '15': 0, '14': 0, '13': 0, '12': 0, '11': 0, '10_less': 0 },
      hitProbabilities: { '15': 0, '14': 0, '13': 0, '12': 0, 'at_least_12': 0 },
      financials: { totalCostTL: 0, expectedReturnTL: 0, roiPercent: 0, profitProbability: 0 },
      distribution: []
    };
  }

  // Precompute outcome cumulative probability intervals for 15 matches
  const matchProbs = matches.map(m => {
    // Convert odds to normalized probabilities
    const rawP1 = 1 / m.odds['1'];
    const rawPX = 1 / m.odds['X'];
    const rawP2 = 1 / m.odds['2'];
    const sum = rawP1 + rawPX + rawP2;

    const p1 = rawP1 / sum;
    const pX = rawPX / sum;

    return {
      t1: p1,
      tX: p1 + pX
    };
  });

  const hitCounts = {
    '15': 0,
    '14': 0,
    '13': 0,
    '12': 0,
    '11': 0,
    '10_less': 0
  };

  const hitHistogram: number[] = Array(16).fill(0);
  let totalSimReturnTL = 0;
  let profitableSimulations = 0;

  const totalCostTL = columns.length * unitPriceTL;

  // Approximate realistic prize payoffs
  const PRIZE_15_TL = 7500000;
  const PRIZE_14_TL = 65000;
  const PRIZE_13_TL = 5800;
  const PRIZE_12_TL = 780;

  for (let sim = 0; sim < simulationsCount; sim++) {
    // Generate 15 match random outcomes
    const simOutcome: Outcome[] = [];
    for (let m = 0; m < 15; m++) {
      const r = Math.random();
      const { t1, tX } = matchProbs[m];
      if (r < t1) {
        simOutcome.push('1');
      } else if (r < tX) {
        simOutcome.push('X');
      } else {
        simOutcome.push('2');
      }
    }

    // Evaluate best hit across all user columns in this simulation
    let maxHits = 0;
    let simPayoff = 0;

    for (let c = 0; c < columns.length; c++) {
      const hits = countMatches(columns[c], simOutcome);
      if (hits > maxHits) {
        maxHits = hits;
      }
      if (hits === 15) simPayoff += PRIZE_15_TL;
      else if (hits === 14) simPayoff += PRIZE_14_TL;
      else if (hits === 13) simPayoff += PRIZE_13_TL;
      else if (hits === 12) simPayoff += PRIZE_12_TL;
    }

    hitHistogram[maxHits]++;
    totalSimReturnTL += simPayoff;
    if (simPayoff >= totalCostTL && simPayoff > 0) {
      profitableSimulations++;
    }

    if (maxHits === 15) hitCounts['15']++;
    else if (maxHits === 14) hitCounts['14']++;
    else if (maxHits === 13) hitCounts['13']++;
    else if (maxHits === 12) hitCounts['12']++;
    else if (maxHits === 11) hitCounts['11']++;
    else hitCounts['10_less']++;
  }

  const p15 = (hitCounts['15'] / simulationsCount) * 100;
  const p14 = (hitCounts['14'] / simulationsCount) * 100;
  const p13 = (hitCounts['13'] / simulationsCount) * 100;
  const p12 = (hitCounts['12'] / simulationsCount) * 100;
  const pAtLeast12 = p15 + p14 + p13 + p12;

  const expectedReturnTL = Math.round(totalSimReturnTL / simulationsCount);
  const roiPercent = totalCostTL > 0 ? Math.round(((expectedReturnTL - totalCostTL) / totalCostTL) * 100) : 0;
  const profitProbability = Math.round((profitableSimulations / simulationsCount) * 1000) / 10;

  const distribution = hitHistogram.map((count, hits) => ({
    hits,
    count,
    percent: Math.round((count / simulationsCount) * 1000) / 10
  }));

  return {
    simulationsCount,
    hitCounts,
    hitProbabilities: {
      '15': Math.round(p15 * 100) / 100,
      '14': Math.round(p14 * 100) / 100,
      '13': Math.round(p13 * 100) / 100,
      '12': Math.round(p12 * 100) / 100,
      'at_least_12': Math.round(pAtLeast12 * 100) / 100
    },
    financials: {
      totalCostTL,
      expectedReturnTL,
      roiPercent,
      profitProbability
    },
    distribution
  };
}

import { describe, it, expect } from 'vitest';
import {
  calculateRawCombinationCount,
  generateCartesianProduct,
  countMatches,
  hammingDistance
} from '../src/core/combinatorics';
import { INITIAL_MATCHES } from '../src/data/sampleBulletin';
import { Column } from '../src/core/types';

describe('Combinatorics Engine', () => {
  it('correctly calculates raw combination count for single, double and triple picks', () => {
    const customMatches = INITIAL_MATCHES.map((m, idx) => ({
      ...m,
      userPicks: idx < 3
        ? { '1': true, 'X': true, '2': true } // 3 triples = 3^3 = 27
        : idx < 5
        ? { '1': true, 'X': true, '2': false } // 2 doubles = 2^2 = 4
        : { '1': true, 'X': false, '2': false } // 10 singles = 1^10 = 1
    }));

    const rawCount = calculateRawCombinationCount(customMatches);
    expect(rawCount).toBe(27 * 4); // 108
  });

  it('generates exact number of Cartesian combinations', () => {
    const customMatches = INITIAL_MATCHES.map((m, idx) => ({
      ...m,
      userPicks: idx < 3
        ? { '1': true, 'X': true, '2': false } // 3 doubles = 8 combinations
        : { '1': true, 'X': false, '2': false } // 12 singles
    }));

    const combinations = generateCartesianProduct(customMatches);
    expect(combinations.length).toBe(8);
    expect(combinations[0].length).toBe(15);
  });

  it('accurately counts matching outcomes and Hamming distance', () => {
    const colA: Column = ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'];
    const colB: Column = ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', 'X', '2'];

    expect(countMatches(colA, colB)).toBe(13);
    expect(hammingDistance(colA, colB)).toBe(2);
  });
});

import { describe, it, expect } from 'vitest';
import { reduceColumnsByGuarantee, calculateCoverageStats } from '../src/core/reduction';
import { generateCartesianProduct } from '../src/core/combinatorics';
import { INITIAL_MATCHES } from '../src/data/sampleBulletin';

describe('Reduction & Covering Engine', () => {
  it('reduces universe while achieving >= 100% 14-guarantee coverage', () => {
    // 4 triples = 81 columns
    const customMatches = INITIAL_MATCHES.map((m, idx) => ({
      ...m,
      userPicks: idx < 4
        ? { '1': true, 'X': true, '2': true }
        : { '1': true, 'X': false, '2': false }
    }));

    const universe = generateCartesianProduct(customMatches);
    expect(universe.length).toBe(81);

    const reduced14 = reduceColumnsByGuarantee(universe, '14');
    // Reduced set should be much smaller than 81 (typically ~9 to 15 columns)
    expect(reduced14.length).toBeLessThan(universe.length);
    expect(reduced14.length).toBeGreaterThan(0);

    const stats = calculateCoverageStats(reduced14, universe);
    expect(stats['14']).toBe(100);
    expect(stats['15']).toBeGreaterThan(0);
  });

  it('reduces universe for 13-guarantee with even greater compression', () => {
    const customMatches = INITIAL_MATCHES.map((m, idx) => ({
      ...m,
      userPicks: idx < 5
        ? { '1': true, 'X': true, '2': true } // 3^5 = 243
        : { '1': true, 'X': false, '2': false }
    }));

    const universe = generateCartesianProduct(customMatches);
    expect(universe.length).toBe(243);

    const reduced13 = reduceColumnsByGuarantee(universe, '13');
    expect(reduced13.length).toBeLessThan(40);

    const stats = calculateCoverageStats(reduced13, universe);
    expect(stats['13']).toBe(100);
  });
});

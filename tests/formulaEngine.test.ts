import { describe, it, expect } from 'vitest';
import { generateNineColumnFormula, generateSuperSevenFormula } from '../src/core/formulaEngine';
import { INITIAL_MATCHES, INITIAL_FILTERS } from '../src/data/sampleBulletin';

describe('Formula Engine', () => {
  it('generates exactly 9 columns for 4 triple-pick matches', () => {
    const customMatches = INITIAL_MATCHES.map((m, idx) => ({
      ...m,
      userPicks: idx < 4
        ? { '1': true, 'X': true, '2': true }
        : { '1': true, 'X': false, '2': false }
    }));

    const cols = generateNineColumnFormula(customMatches, { ...INITIAL_FILTERS, enabled: false });
    expect(cols.length).toBe(9);
    cols.forEach(col => expect(col.length).toBe(15));
  });

  it('generates 16 columns for super seven formula', () => {
    const cols = generateSuperSevenFormula(INITIAL_MATCHES, { ...INITIAL_FILTERS, enabled: false });
    expect(cols.length).toBeGreaterThan(0);
    expect(cols.length).toBeLessThanOrEqual(16);
    cols.forEach(col => expect(col.length).toBe(15));
  });
});

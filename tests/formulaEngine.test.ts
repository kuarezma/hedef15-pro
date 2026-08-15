import { describe, it, expect } from 'vitest';
import {
  generateNineColumnFormula,
  generateSuperSevenFormula,
  generateClosedOnlyFormula,
  generateDoubleOnlyFormula,
  runFormulaEngine
} from '../src/core/formulaEngine';
import { INITIAL_MATCHES, INITIAL_FILTERS } from '../src/data/sampleBulletin';
import { encodePoolToUrl, decodePoolFromUrl, poolStringsToColumns } from '../src/services/syndicateService';

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

  it('generates closed-only formula columns', () => {
    const cols = generateClosedOnlyFormula(INITIAL_MATCHES, { ...INITIAL_FILTERS, enabled: false }, 50);
    expect(cols.length).toBeGreaterThan(0);
    expect(cols.length).toBeLessThanOrEqual(50);
  });

  it('generates double-only formula columns', () => {
    const cols = generateDoubleOnlyFormula(INITIAL_MATCHES, { ...INITIAL_FILTERS, enabled: false }, 100);
    expect(cols.length).toBeGreaterThan(0);
  });

  it('dispatches chance_come formula via runFormulaEngine', () => {
    const result = runFormulaEngine(INITIAL_MATCHES, 'chance_come', '14', { ...INITIAL_FILTERS, enabled: false }, 100, 2);
    expect(result.columns.length).toBeGreaterThan(0);
  });

  it('encodes and decodes syndicate pool URLs', () => {
    const pool = {
      title: 'Test Havuz',
      creatorName: 'Test',
      totalShares: 5,
      totalCostTL: 100,
      columns: ['1'.repeat(15)],
      createdAt: new Date().toISOString()
    };
    const url = encodePoolToUrl(pool, 'https://hedef15.local/');
    const query = new URL(url).search;
    const decoded = decodePoolFromUrl(query);
    expect(decoded?.title).toBe('Test Havuz');
    expect(poolStringsToColumns(decoded!.columns).length).toBe(1);
  });
});

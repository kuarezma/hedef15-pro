import { describe, it, expect } from 'vitest';
import { testColumnAgainstFilters, filterColumns, getOutcomeCategory } from '../src/core/filters';
import { INITIAL_MATCHES } from '../src/data/sampleBulletin';
import { Column, FilterConfig } from '../src/core/types';

describe('Filter Engine', () => {
  const baseFilterConfig: FilterConfig = {
    enabled: true,
    count1: [5, 10],
    countX: [2, 5],
    count2: [1, 5],
    surpriseCount: [0, 10],
    maxConsecutive1: 4,
    maxConsecutiveX: 2,
    maxConsecutive2: 3,
    signChanges: [4, 12],
    groupFilters: []
  };

  it('correctly categorizes favorite, plase, and surprise outcomes', () => {
    const match = {
      ...INITIAL_MATCHES[0],
      odds: { '1': 1.62, 'X': 3.75, '2': 4.80 }
    };
    expect(getOutcomeCategory(match, '1')).toBe('FAVORITE');
    expect(getOutcomeCategory(match, 'X')).toBe('PLASE');
    expect(getOutcomeCategory(match, '2')).toBe('SURPRISE');
  });

  it('rejects columns that violate total count restrictions', () => {
    // Column with 15 "1"s should be rejected because count1 max is 10
    const colAll1: Column = Array(15).fill('1');
    const result = testColumnAgainstFilters(colAll1, INITIAL_MATCHES, baseFilterConfig);
    expect(result).toBe(false);
  });

  it('accepts columns matching all count and consecutive criteria', () => {
    // 7 '1's, 4 'X's, 4 '2's
    const validCol: Column = [
      '1', '1', 'X', 'X', '2',
      '1', '1', '2', '2', 'X',
      '1', '1', '2', 'X', '1'
    ];
    const result = testColumnAgainstFilters(validCol, INITIAL_MATCHES, baseFilterConfig);
    expect(result).toBe(true);
  });

  it('rejects columns that exceed max consecutive outcomes', () => {
    // 3 consecutive X's when maxConsecutiveX is 2
    const invalidConsecutiveCol: Column = [
      'X', 'X', 'X', '1', '1',
      '1', '1', '2', '2', '1',
      '1', '1', '2', '2', '1'
    ];
    const result = testColumnAgainstFilters(invalidConsecutiveCol, INITIAL_MATCHES, baseFilterConfig);
    expect(result).toBe(false);
  });
});

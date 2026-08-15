import { Column, FilterConfig, Match, Outcome } from './types';
import { countMatches } from './combinatorics';

/**
 * Categorizes an outcome for a match into:
 * - 'FAVORITE' (Lowest odds / highest prob)
 * - 'PLASE' (Middle odds)
 * - 'SURPRISE' (Highest odds / lowest prob)
 */
export function getOutcomeCategory(match: Match, outcome: Outcome): 'FAVORITE' | 'PLASE' | 'SURPRISE' {
  const oddsEntries: { outcome: Outcome; odd: number }[] = [
    { outcome: '1' as Outcome, odd: match.odds['1'] },
    { outcome: 'X' as Outcome, odd: match.odds['X'] },
    { outcome: '2' as Outcome, odd: match.odds['2'] }
  ].sort((a, b) => a.odd - b.odd);

  if (outcome === oddsEntries[0].outcome) return 'FAVORITE';
  if (outcome === oddsEntries[1].outcome) return 'PLASE';
  return 'SURPRISE';
}

/**
 * Checks whether a single column satisfies all active user filters.
 */
export function testColumnAgainstFilters(
  column: Column,
  matches: Match[],
  filterConfig: FilterConfig
): boolean {
  if (!filterConfig.enabled) return true;

  let count1 = 0;
  let countX = 0;
  let count2 = 0;
  let surpriseCount = 0;
  let signChanges = 0;

  let currentConsec1 = 0;
  let maxConsec1 = 0;
  let currentConsecX = 0;
  let maxConsecX = 0;
  let currentConsec2 = 0;
  let maxConsec2 = 0;

  for (let i = 0; i < 15; i++) {
    const outcome = column[i];
    const match = matches[i];

    // Counts
    if (outcome === '1') {
      count1++;
      currentConsec1++;
      if (currentConsec1 > maxConsec1) maxConsec1 = currentConsec1;
      currentConsecX = 0;
      currentConsec2 = 0;
    } else if (outcome === 'X') {
      countX++;
      currentConsecX++;
      if (currentConsecX > maxConsecX) maxConsecX = currentConsecX;
      currentConsec1 = 0;
      currentConsec2 = 0;
    } else if (outcome === '2') {
      count2++;
      currentConsec2++;
      if (currentConsec2 > maxConsec2) maxConsec2 = currentConsec2;
      currentConsec1 = 0;
      currentConsecX = 0;
    }

    // Surprise check
    if (getOutcomeCategory(match, outcome) === 'SURPRISE') {
      surpriseCount++;
    }

    // Sign Changes (Dalgalanma)
    if (i > 0 && outcome !== column[i - 1]) {
      signChanges++;
    }
  }

  // Check 1, X, 2 ranges
  if (count1 < filterConfig.count1[0] || count1 > filterConfig.count1[1]) return false;
  if (countX < filterConfig.countX[0] || countX > filterConfig.countX[1]) return false;
  if (count2 < filterConfig.count2[0] || count2 > filterConfig.count2[1]) return false;

  // Check surprise count
  if (surpriseCount < filterConfig.surpriseCount[0] || surpriseCount > filterConfig.surpriseCount[1]) return false;

  // Check consecutives
  if (maxConsec1 > filterConfig.maxConsecutive1) return false;
  if (maxConsecX > filterConfig.maxConsecutiveX) return false;
  if (maxConsec2 > filterConfig.maxConsecutive2) return false;

  // Check sign changes
  if (signChanges < filterConfig.signChanges[0] || signChanges > filterConfig.signChanges[1]) return false;

  // Check group filters
  if (filterConfig.groupFilters && filterConfig.groupFilters.length > 0) {
    for (const group of filterConfig.groupFilters) {
      if (!group.enabled) continue;

      let g1 = 0, gX = 0, g2 = 0, gSurprise = 0;
      for (const matchId of group.matchIds) {
        const matchIdx = matches.findIndex(m => m.id === matchId);
        if (matchIdx >= 0 && matchIdx < 15) {
          const out = column[matchIdx];
          if (out === '1') g1++;
          else if (out === 'X') gX++;
          else if (out === '2') g2++;

          if (getOutcomeCategory(matches[matchIdx], out) === 'SURPRISE') {
            gSurprise++;
          }
        }
      }

      if (g1 < group.min1 || g1 > group.max1) return false;
      if (gX < group.minX || gX > group.maxX) return false;
      if (g2 < group.min2 || g2 > group.max2) return false;
      if (gSurprise < group.minSurprise || gSurprise > group.maxSurprise) return false;
    }
  }

  // Check reference column distance (Ortak Kolon Eleme)
  if (filterConfig.referenceColumn && filterConfig.referenceColumn.length === 15) {
    const hits = countMatches(column, filterConfig.referenceColumn);
    if (filterConfig.minMatchWithRef !== undefined && hits < filterConfig.minMatchWithRef) return false;
    if (filterConfig.maxMatchWithRef !== undefined && hits > filterConfig.maxMatchWithRef) return false;
  }

  return true;
}

/**
 * Filter an array of columns against given filter configurations.
 */
export function filterColumns(
  columns: Column[],
  matches: Match[],
  filterConfig: FilterConfig
): Column[] {
  if (!filterConfig.enabled) return columns;
  return columns.filter(col => testColumnAgainstFilters(col, matches, filterConfig));
}

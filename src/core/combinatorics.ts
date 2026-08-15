import { Column, Match, Outcome } from './types';

/**
 * High-performance Combinatorics Generator for Spor Toto.
 */

export function getSelectedOutcomesForMatch(match: Match): Outcome[] {
  const outcomes: Outcome[] = [];
  if (match.userPicks['1']) outcomes.push('1');
  if (match.userPicks['X']) outcomes.push('X');
  if (match.userPicks['2']) outcomes.push('2');
  // Fallback to '1' if nothing selected
  return outcomes.length > 0 ? outcomes : ['1'];
}

export function calculateRawCombinationCount(matches: Match[]): number {
  if (!matches || matches.length === 0) return 0;
  return matches.reduce((total, match) => {
    const count = getSelectedOutcomesForMatch(match).length;
    return total * count;
  }, 1);
}

/**
 * Generates Cartesian product of selected outcomes across all 15 matches.
 * Caps at maxLimit for browser safety.
 */
export function generateCartesianProduct(matches: Match[], maxLimit = 250000): Column[] {
  if (matches.length !== 15) {
    throw new Error(`Spor Toto requires exactly 15 matches, received: ${matches.length}`);
  }

  const choices: Outcome[][] = matches.map(getSelectedOutcomesForMatch);
  const totalCount = choices.reduce((acc, curr) => acc * curr.length, 1);

  if (totalCount > maxLimit) {
    console.warn(`Total combinations (${totalCount}) exceeds safety threshold (${maxLimit}). Truncating combinations.`);
  }

  let result: Column[] = [[]];

  for (let matchIdx = 0; matchIdx < 15; matchIdx++) {
    const currentChoices = choices[matchIdx];
    const nextResult: Column[] = [];

    for (const prefix of result) {
      for (const choice of currentChoices) {
        nextResult.push([...prefix, choice]);
        if (nextResult.length >= maxLimit) {
          return nextResult;
        }
      }
    }
    result = nextResult;
  }

  return result;
}

/**
 * Compares two 15-length columns and returns the number of identical outcomes.
 */
export function countMatches(colA: Column, colB: Column): number {
  let hits = 0;
  for (let i = 0; i < 15; i++) {
    if (colA[i] === colB[i]) hits++;
  }
  return hits;
}

/**
 * Computes Hamming Distance between two columns: 15 - hits.
 */
export function hammingDistance(colA: Column, colB: Column): number {
  return 15 - countMatches(colA, colB);
}

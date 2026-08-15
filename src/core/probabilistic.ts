import { Column, FilterConfig, Match, Outcome } from './types';
import { testColumnAgainstFilters } from './filters';

/**
 * Probabilistic / Monte Carlo column generator for Spor Toto ("Yüzdesel Formül").
 */

/**
 * Samples a single outcome based on given percentage probabilities.
 */
export function sampleOutcomeFromProbabilities(probs: { '1': number; 'X': number; '2': number }): Outcome {
  const sum = probs['1'] + probs['X'] + probs['2'];
  if (sum <= 0) return '1';

  const r = Math.random() * sum;
  if (r < probs['1']) return '1';
  if (r < probs['1'] + probs['X']) return 'X';
  return '2';
}

/**
 * Generates a targeted number of columns matching user's custom percentage distributions per match.
 * Automatically filters against active filter rules and deduplicates.
 */
export function generateProbabilisticColumns(
  matches: Match[],
  targetColumnCount: number,
  filterConfig: FilterConfig,
  maxAttempts = 50000
): Column[] {
  if (matches.length !== 15) {
    throw new Error('Spor Toto requires 15 matches');
  }

  const generatedSet = new Set<string>();
  const columns: Column[] = [];
  let attempts = 0;

  while (columns.length < targetColumnCount && attempts < maxAttempts) {
    attempts++;
    const col: Outcome[] = [];

    for (let i = 0; i < 15; i++) {
      const match = matches[i];
      // Use user-defined percentages if sum > 0, otherwise fallback to AI/Public picks
      const probs = (match.userPercents['1'] + match.userPercents['X'] + match.userPercents['2'] > 0)
        ? match.userPercents
        : (match.aiPicks['1'] + match.aiPicks['X'] + match.aiPicks['2'] > 0 ? match.aiPicks : match.publicPicks);

      col.push(sampleOutcomeFromProbabilities(probs));
    }

    const key = col.join('');
    if (generatedSet.has(key)) {
      continue;
    }

    if (testColumnAgainstFilters(col, matches, filterConfig)) {
      generatedSet.add(key);
      columns.push(col);
    }
  }

  return columns;
}

/**
 * Calculates empirical outcome percentages for a generated column list.
 */
export function calculateEmpiricalDistribution(columns: Column[]): { '1': number; 'X': number; '2': number }[] {
  if (columns.length === 0) {
    return Array.from({ length: 15 }, () => ({ '1': 0, 'X': 0, '2': 0 }));
  }

  const result: { '1': number; 'X': number; '2': number }[] = [];
  const n = columns.length;

  for (let i = 0; i < 15; i++) {
    let c1 = 0, cX = 0, c2 = 0;
    for (let k = 0; k < n; k++) {
      const out = columns[k][i];
      if (out === '1') c1++;
      else if (out === 'X') cX++;
      else if (out === '2') c2++;
    }

    result.push({
      '1': Number(((c1 / n) * 100).toFixed(1)),
      'X': Number(((cX / n) * 100).toFixed(1)),
      '2': Number(((c2 / n) * 100).toFixed(1))
    });
  }

  return result;
}

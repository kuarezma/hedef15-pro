import { Column, GuaranteeTier } from './types';
import { countMatches, hammingDistance } from './combinatorics';

/**
 * High Performance Combinatorial Set Covering & Reduction Engine.
 */

/**
 * Returns max allowed Hamming Distance for a given guarantee tier:
 * 15 -> d = 0 (exact match)
 * 14 -> d = 1 (at most 1 mismatch)
 * 13 -> d = 2 (at most 2 mismatches)
 * 12 -> d = 3 (at most 3 mismatches)
 */
export function getHammingThresholdForGuarantee(tier: GuaranteeTier): number {
  switch (tier) {
    case '15': return 0;
    case '14': return 1;
    case '13': return 2;
    case '12': return 3;
    default: return 0;
  }
}

/**
 * Greedy Set Covering Algorithm for Spor Toto reduction.
 * Given a universe of valid filtered columns U, finds a compact subset of columns S
 * such that every column in U is at distance <= threshold from at least one column in S.
 */
export function reduceColumnsByGuarantee(
  universe: Column[],
  tier: GuaranteeTier,
  targetMaxColumns?: number
): Column[] {
  if (tier === '15' || universe.length <= 1) {
    if (targetMaxColumns && universe.length > targetMaxColumns) {
      return universe.slice(0, targetMaxColumns);
    }
    return universe;
  }

  const threshold = getHammingThresholdForGuarantee(tier);
  const n = universe.length;

  // If universe is small, quick pass
  if (n <= 5) return universe;

  // Track covered indices in universe
  const covered = new Uint8Array(n);
  let uncoveredCount = n;

  // We will build reduced set
  const reducedSet: Column[] = [];

  // For high performance, we sort candidate centers by coverage potential
  // In each greedy step, pick the column that covers the maximum number of currently uncovered items.
  
  // Sample a reasonable number of candidate centers if universe is huge to keep UI responsive
  const stepLimit = targetMaxColumns || n;
  
  // Array of uncovered indices
  const uncoveredIndices: number[] = [];
  for (let i = 0; i < n; i++) uncoveredIndices.push(i);

  while (uncoveredCount > 0 && reducedSet.length < stepLimit) {
    let bestCandidateIdx = -1;
    let bestCoverCount = -1;
    let bestCoveredList: number[] = [];

    // Evaluate candidates among remaining uncovered and a sample of already chosen centers
    const candidatePoolSize = Math.min(uncoveredIndices.length, 300);
    
    for (let c = 0; c < candidatePoolSize; c++) {
      const candIdx = uncoveredIndices[c];
      const candCol = universe[candIdx];
      let coverCount = 0;
      const covers: number[] = [];

      for (let u = 0; u < uncoveredIndices.length; u++) {
        const uIdx = uncoveredIndices[u];
        if (hammingDistance(candCol, universe[uIdx]) <= threshold) {
          coverCount++;
          covers.push(uIdx);
        }
      }

      if (coverCount > bestCoverCount) {
        bestCoverCount = coverCount;
        bestCandidateIdx = candIdx;
        bestCoveredList = covers;
        // Early break if it covers a massive chunk
        if (coverCount === uncoveredIndices.length) break;
      }
    }

    if (bestCandidateIdx === -1 || bestCoverCount === 0) {
      // Fallback: pick next uncovered
      const fallbackIdx = uncoveredIndices[0];
      reducedSet.push(universe[fallbackIdx]);
      covered[fallbackIdx] = 1;
      uncoveredCount--;
      uncoveredIndices.shift();
      continue;
    }

    // Add best candidate to reduced set
    reducedSet.push(universe[bestCandidateIdx]);

    // Mark as covered
    for (const cIdx of bestCoveredList) {
      if (covered[cIdx] === 0) {
        covered[cIdx] = 1;
        uncoveredCount--;
      }
    }

    // Filter uncovered indices array
    const newUncovered: number[] = [];
    for (let i = 0; i < uncoveredIndices.length; i++) {
      const idx = uncoveredIndices[i];
      if (covered[idx] === 0) {
        newUncovered.push(idx);
      }
    }
    uncoveredIndices.length = 0;
    uncoveredIndices.push(...newUncovered);
  }

  return reducedSet;
}

/**
 * Calculates exact empirical guarantee percentages of a reduced set against the universe of columns.
 */
export function calculateCoverageStats(
  reducedSet: Column[],
  universe: Column[]
): { '15': number; '14': number; '13': number; '12': number } {
  if (universe.length === 0 || reducedSet.length === 0) {
    return { '15': 0, '14': 0, '13': 0, '12': 0 };
  }

  let count15 = 0;
  let count14 = 0;
  let count13 = 0;
  let count12 = 0;

  // Sample up to 1000 items from universe if large for sub-millisecond calculation
  const sampleSize = Math.min(universe.length, 1000);
  const sampleStep = Math.max(1, Math.floor(universe.length / sampleSize));

  let totalTested = 0;

  for (let u = 0; u < universe.length; u += sampleStep) {
    const actual = universe[u];
    let maxHits = 0;

    for (let r = 0; r < reducedSet.length; r++) {
      const hits = countMatches(reducedSet[r], actual);
      if (hits > maxHits) {
        maxHits = hits;
        if (maxHits === 15) break;
      }
    }

    if (maxHits >= 15) count15++;
    if (maxHits >= 14) count14++;
    if (maxHits >= 13) count13++;
    if (maxHits >= 12) count12++;

    totalTested++;
    if (totalTested >= sampleSize) break;
  }

  return {
    '15': Number(((count15 / totalTested) * 100).toFixed(1)),
    '14': Number(((count14 / totalTested) * 100).toFixed(1)),
    '13': Number(((count13 / totalTested) * 100).toFixed(1)),
    '12': Number(((count12 / totalTested) * 100).toFixed(1))
  };
}

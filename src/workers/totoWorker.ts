import { Column, FilterConfig, FormulaType, GuaranteeTier, Match, ReductionSummary } from '../core/types';
import {
  generateBitwiseCombinations,
  testBitwiseColumnAgainstFilters,
  bitwiseCountMatches,
  bitwiseHammingDistance,
  decodeColumn,
  encodeColumn
} from '../core/bitwiseEngine';
import { calculateRawCombinationCount } from '../core/combinatorics';
import { generateProbabilisticColumns } from '../core/probabilistic';
import { getHammingThresholdForGuarantee } from '../core/reduction';

export interface WorkerCalcPayload {
  matches: Match[];
  formulaType: FormulaType;
  guaranteeTier: GuaranteeTier;
  filters: FilterConfig;
  targetBudgetTL: number;
  unitPriceTL: number;
}

export interface WorkerCalcResponse {
  finalCols: Column[];
  summary: ReductionSummary;
}

self.onmessage = (event: MessageEvent<WorkerCalcPayload>) => {
  const { matches, formulaType, guaranteeTier, filters, targetBudgetTL, unitPriceTL } = event.data;
  const start = performance.now();

  try {
    let finalCols: Column[] = [];
    let rawCount = 0;
    let filteredCount = 0;

    if (formulaType === 'probabilistic') {
      const targetCols = Math.max(1, Math.floor(targetBudgetTL / unitPriceTL));
      rawCount = targetCols * 5;
      finalCols = generateProbabilisticColumns(matches, targetCols, filters);
      filteredCount = finalCols.length;
    } else if (formulaType === 'flat') {
      rawCount = calculateRawCombinationCount(matches);
      const rawBitCodes = generateBitwiseCombinations(matches, 30000);
      const filteredCodes = rawBitCodes.filter(c => testBitwiseColumnAgainstFilters(c, matches, filters));
      filteredCount = filteredCodes.length;
      finalCols = filteredCodes.map(decodeColumn);
    } else {
      // Guaranteed Reduction Modes (14/13/12 Garanti) using Bitwise Set-Covering
      rawCount = calculateRawCombinationCount(matches);
      const rawBitCodes = generateBitwiseCombinations(matches, 40000);
      const filteredCodes = rawBitCodes.filter(c => testBitwiseColumnAgainstFilters(c, matches, filters));
      filteredCount = filteredCodes.length;

      const threshold = getHammingThresholdForGuarantee(guaranteeTier);
      const targetMaxCols = Math.max(1, Math.floor(targetBudgetTL / unitPriceTL));

      if (threshold === 0 || filteredCodes.length <= targetMaxCols) {
        finalCols = filteredCodes.slice(0, targetMaxCols).map(decodeColumn);
      } else {
        // Fast Bitwise Greedy Set-Covering
        const n = filteredCodes.length;
        const covered = new Uint8Array(n);
        let uncoveredCount = n;
        const reducedCodes: number[] = [];

        // Sample uncovered pool for candidate centers
        const uncoveredIndices: number[] = [];
        for (let i = 0; i < n; i++) uncoveredIndices.push(i);

        while (uncoveredCount > 0 && reducedCodes.length < targetMaxCols) {
          let bestIdx = -1;
          let bestCover = -1;
          let bestCoversList: number[] = [];

          const poolLimit = Math.min(uncoveredIndices.length, 150);

          for (let p = 0; p < poolLimit; p++) {
            const candIdx = uncoveredIndices[p];
            const candCode = filteredCodes[candIdx];
            let covers = 0;
            const currentCovered: number[] = [];

            for (let u = 0; u < uncoveredIndices.length; u++) {
              const uIdx = uncoveredIndices[u];
              if (bitwiseHammingDistance(candCode, filteredCodes[uIdx]) <= threshold) {
                covers++;
                currentCovered.push(uIdx);
              }
            }

            if (covers > bestCover) {
              bestCover = covers;
              bestIdx = candIdx;
              bestCoversList = currentCovered;
              if (covers === uncoveredIndices.length) break;
            }
          }

          if (bestIdx === -1 || bestCover === 0) {
            const fallback = uncoveredIndices.shift();
            if (fallback !== undefined) {
              reducedCodes.push(filteredCodes[fallback]);
              covered[fallback] = 1;
              uncoveredCount--;
            }
            continue;
          }

          reducedCodes.push(filteredCodes[bestIdx]);
          for (let k = 0; k < bestCoversList.length; k++) {
            const cIdx = bestCoversList[k];
            if (covered[cIdx] === 0) {
              covered[cIdx] = 1;
              uncoveredCount--;
            }
          }

          // Compact uncoveredIndices
          const newUncovered: number[] = [];
          for (let i = 0; i < uncoveredIndices.length; i++) {
            const idx = uncoveredIndices[i];
            if (covered[idx] === 0) newUncovered.push(idx);
          }
          uncoveredIndices.length = 0;
          uncoveredIndices.push(...newUncovered);
        }

        finalCols = reducedCodes.map(decodeColumn);
      }
    }

    const end = performance.now();
    const duration = Math.max(1, Math.round(end - start));

    // Coverage statistics calculation
    let count15 = 0, count14 = 0, count13 = 0, count12 = 0;
    const reducedBitCodes = finalCols.map(encodeColumn);
    const universeBitCodes = generateBitwiseCombinations(matches, 1000);
    const sampleSize = universeBitCodes.length;

    for (let u = 0; u < sampleSize; u++) {
      const uCode = universeBitCodes[u];
      let maxHits = 0;
      for (let r = 0; r < reducedBitCodes.length; r++) {
        const hits = bitwiseCountMatches(reducedBitCodes[r], uCode);
        if (hits > maxHits) {
          maxHits = hits;
          if (maxHits === 15) break;
        }
      }
      if (maxHits >= 15) count15++;
      if (maxHits >= 14) count14++;
      if (maxHits >= 13) count13++;
      if (maxHits >= 12) count12++;
    }

    const response: WorkerCalcResponse = {
      finalCols,
      summary: {
        rawCombinations: rawCount,
        filteredCombinations: filteredCount,
        reducedColumns: finalCols.length,
        totalCostTL: Number((finalCols.length * unitPriceTL).toFixed(2)),
        unitPriceTL,
        estimatedGuaranteeRatio: {
          '15': sampleSize > 0 ? Number(((count15 / sampleSize) * 100).toFixed(1)) : 100,
          '14': sampleSize > 0 ? Number(((count14 / sampleSize) * 100).toFixed(1)) : 100,
          '13': sampleSize > 0 ? Number(((count13 / sampleSize) * 100).toFixed(1)) : 100,
          '12': sampleSize > 0 ? Number(((count12 / sampleSize) * 100).toFixed(1)) : 100,
        },
        durationMs: duration
      }
    };

    self.postMessage(response);
  } catch (err: any) {
    console.error('Worker calculation failed:', err);
  }
};

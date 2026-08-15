import { Column, FilterConfig, FormulaType, GuaranteeTier, Match, ReductionSummary } from '../core/types';
import { runFormulaEngine } from '../core/formulaEngine';
import { calculateCoverageStats } from '../core/reduction';
import { generateCartesianProduct } from '../core/combinatorics';

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
    const { columns: finalCols, rawCount, filteredCount } = runFormulaEngine(
      matches,
      formulaType,
      guaranteeTier,
      filters,
      targetBudgetTL,
      unitPriceTL
    );

    const end = performance.now();
    const duration = Math.max(1, Math.round(end - start));

    const coverageStats = (formulaType === 'flat' || formulaType === 'nine_columns' || formulaType === 'super_seven')
      ? { '15': 100, '14': 100, '13': 100, '12': 100 }
      : calculateCoverageStats(finalCols, generateCartesianProduct(matches, 2000));

    const response: WorkerCalcResponse = {
      finalCols,
      summary: {
        rawCombinations: rawCount,
        filteredCombinations: filteredCount,
        reducedColumns: finalCols.length,
        totalCostTL: Number((finalCols.length * unitPriceTL).toFixed(2)),
        unitPriceTL,
        estimatedGuaranteeRatio: coverageStats,
        durationMs: duration
      }
    };

    self.postMessage(response);
  } catch (err: any) {
    console.error('Worker calculation failed:', err);
  }
};

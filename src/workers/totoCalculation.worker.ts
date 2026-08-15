import { runFormulaEngine } from '../core/formulaEngine';
import { calculateCoverageStats } from '../core/reduction';
import { generateCartesianProduct } from '../core/combinatorics';
import type { FilterConfig, GuaranteeTier, Match } from '../core/types';

export interface WorkerCalcRequest {
  id: number;
  matches: Match[];
  formulaType: string;
  guaranteeTier: GuaranteeTier;
  filters: FilterConfig;
  targetBudgetTL: number;
  unitPriceTL: number;
}

export interface WorkerCalcResponse {
  id: number;
  success: boolean;
  columns?: string[][];
  rawCount?: number;
  filteredCount?: number;
  coverageStats?: { '15': number; '14': number; '13': number; '12': number };
  durationMs?: number;
  error?: string;
}

self.onmessage = (event: MessageEvent<WorkerCalcRequest>) => {
  const { id, matches, formulaType, guaranteeTier, filters, targetBudgetTL, unitPriceTL } = event.data;
  const start = performance.now();

  try {
    const { columns, rawCount, filteredCount } = runFormulaEngine(
      matches,
      formulaType,
      guaranteeTier,
      filters,
      targetBudgetTL,
      unitPriceTL
    );

    const matrixFormulas = new Set(['flat', 'nine_columns', 'super_seven', 'closed_only', 'double_only']);
    const coverageStats = matrixFormulas.has(formulaType)
      ? { '15': 100, '14': 100, '13': 100, '12': 100 }
      : calculateCoverageStats(columns, generateCartesianProduct(matches, 2000));

    const response: WorkerCalcResponse = {
      id,
      success: true,
      columns,
      rawCount,
      filteredCount,
      coverageStats,
      durationMs: Math.max(1, Math.round(performance.now() - start))
    };
    self.postMessage(response);
  } catch (err) {
    const response: WorkerCalcResponse = {
      id,
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
    self.postMessage(response);
  }
};

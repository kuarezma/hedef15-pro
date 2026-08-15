import { runFormulaEngine } from '../core/formulaEngine';
import { calculateCoverageStats } from '../core/reduction';
import { generateCartesianProduct } from '../core/combinatorics';
import type { Column, FilterConfig, GuaranteeTier, Match } from '../core/types';
import type { WorkerCalcRequest, WorkerCalcResponse } from '../workers/totoCalculation.worker';

let worker: Worker | null = null;
let workerSupported = typeof Worker !== 'undefined';

function getWorker(): Worker | null {
  if (!workerSupported) return null;
  if (!worker) {
    try {
      worker = new Worker(new URL('../workers/totoCalculation.worker.ts', import.meta.url), {
        type: 'module'
      });
    } catch {
      workerSupported = false;
      return null;
    }
  }
  return worker;
}

export interface CalculationOutput {
  columns: Column[];
  rawCount: number;
  filteredCount: number;
  coverageStats: { '15': number; '14': number; '13': number; '12': number };
  durationMs: number;
}

function runOnMainThread(
  matches: Match[],
  formulaType: string,
  guaranteeTier: GuaranteeTier,
  filters: FilterConfig,
  targetBudgetTL: number,
  unitPriceTL: number
): CalculationOutput {
  const start = performance.now();
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

  return {
    columns,
    rawCount,
    filteredCount,
    coverageStats,
    durationMs: Math.max(1, Math.round(performance.now() - start))
  };
}

export function runCalculationAsync(
  request: Omit<WorkerCalcRequest, 'id'>,
  calcId: number
): Promise<CalculationOutput> {
  const w = getWorker();

  if (!w) {
    return Promise.resolve(
      runOnMainThread(
        request.matches,
        request.formulaType,
        request.guaranteeTier,
        request.filters,
        request.targetBudgetTL,
        request.unitPriceTL
      )
    );
  }

  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent<WorkerCalcResponse>) => {
      if (event.data.id !== calcId) return;
      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);

      if (!event.data.success) {
        reject(new Error(event.data.error ?? 'Worker calculation failed'));
        return;
      }

      resolve({
        columns: (event.data.columns ?? []) as Column[],
        rawCount: event.data.rawCount ?? 0,
        filteredCount: event.data.filteredCount ?? 0,
        coverageStats: event.data.coverageStats ?? { '15': 0, '14': 0, '13': 0, '12': 0 },
        durationMs: event.data.durationMs ?? 1
      });
    };

    const onError = () => {
      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);
      resolve(
        runOnMainThread(
          request.matches,
          request.formulaType,
          request.guaranteeTier,
          request.filters,
          request.targetBudgetTL,
          request.unitPriceTL
        )
      );
    };

    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    w.postMessage({ ...request, id: calcId } satisfies WorkerCalcRequest);
  });
}

export function terminateCalculationWorker(): void {
  worker?.terminate();
  worker = null;
}

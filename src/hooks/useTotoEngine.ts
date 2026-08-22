import { useState, useEffect, useRef, useCallback } from 'react';
import { Match, FormulaType, GuaranteeTier, FilterConfig, Column, ReductionSummary } from '../core/types';
import { INITIAL_MATCHES, INITIAL_FILTERS } from '../data/sampleBulletin';
import { CURRENT_BULLETIN_ID, WEEK2_MATCHES, sameFixtureSet } from '../data/officialBulletins';
import { WorkerCalcPayload, WorkerCalcResponse } from '../workers/totoWorker';

const STORAGE_KEY_MATCHES = 'hedef15_matches_v5';
const STORAGE_KEY_BULLETIN = 'hedef15_bulletin_id';
const STORAGE_KEY_FILTERS = 'hedef15_filters_v3';
const STORAGE_KEY_FORMULA = 'hedef15_formula_v3';
const STORAGE_KEY_TIER = 'hedef15_tier_v3';
const STORAGE_KEY_BUDGET = 'hedef15_budget_v3';

function loadPersistedMatches(): Match[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MATCHES);
    const savedId = localStorage.getItem(STORAGE_KEY_BULLETIN);
    if (saved && savedId === CURRENT_BULLETIN_ID) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 15 && sameFixtureSet(parsed, WEEK2_MATCHES)) {
        return parsed;
      }
    }
  } catch (_) {}
  return INITIAL_MATCHES;
}

const CALC_DEBOUNCE_MS = 150;

export function useTotoEngine() {
  const [matches, setMatches] = useState<Match[]>(() => loadPersistedMatches());

  const [formulaType, setFormulaType] = useState<FormulaType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FORMULA) as FormulaType;
      if (saved) return saved;
    } catch (_) {}
    return 'guaranteed_custom';
  });

  const [guaranteeTier, setGuaranteeTier] = useState<GuaranteeTier>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIER) as GuaranteeTier;
      if (saved) return saved;
    } catch (_) {}
    return '14';
  });

  const [filters, setFilters] = useState<FilterConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILTERS);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_FILTERS;
  });

  const [targetBudgetTL, setTargetBudgetTL] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUDGET);
      if (saved) return Number(saved);
    } catch (_) {}
    return 300;
  });

  const [unitPriceTL, setUnitPriceTL] = useState<number>(2.0);
  const [generatedColumns, setGeneratedColumns] = useState<Column[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcSummary, setCalcSummary] = useState<ReductionSummary>({
    rawCombinations: 0,
    filteredCombinations: 0,
    reducedColumns: 0,
    totalCostTL: 0,
    unitPriceTL: 2.0,
    estimatedGuaranteeRatio: { '15': 0, '14': 0, '13': 0, '12': 0 },
    durationMs: 0
  });

  // Dedicated Web Worker reference
  const workerRef = useRef<Worker | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/totoWorker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e: MessageEvent<WorkerCalcResponse>) => {
      const { finalCols, summary } = e.data;
      setGeneratedColumns(finalCols);
      setCalcSummary(summary);
      setIsCalculating(false);
    };

    workerRef.current.onerror = (err) => {
      console.error('Toto Worker Error:', err);
      setIsCalculating(false);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches));
      localStorage.setItem(STORAGE_KEY_BULLETIN, CURRENT_BULLETIN_ID);
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
      localStorage.setItem(STORAGE_KEY_FORMULA, formulaType);
      localStorage.setItem(STORAGE_KEY_TIER, guaranteeTier);
      localStorage.setItem(STORAGE_KEY_BUDGET, targetBudgetTL.toString());
    } catch (_) {}
  }, [matches, filters, formulaType, guaranteeTier, targetBudgetTL]);

  // Fast background execution trigger
  const runCalculation = useCallback(() => {
    if (!workerRef.current) return;

    setIsCalculating(true);
    const payload: WorkerCalcPayload = {
      matches,
      formulaType,
      guaranteeTier,
      filters,
      targetBudgetTL,
      unitPriceTL
    };

    workerRef.current.postMessage(payload);
  }, [matches, formulaType, guaranteeTier, filters, targetBudgetTL, unitPriceTL]);

  // Debounced auto-recalculate on changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      runCalculation();
    }, CALC_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [matches, formulaType, guaranteeTier, filters, targetBudgetTL, unitPriceTL, runCalculation]);

  // Instant optimistic match selection toggles (0ms latency)
  const toggleMatchPick = useCallback((matchId: number, outcome: '1' | 'X' | '2') => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const currentVal = m.userPicks[outcome];
      const newPicks = { ...m.userPicks, [outcome]: !currentVal };
      if (!newPicks['1'] && !newPicks['X'] && !newPicks['2']) {
        return m;
      }
      return { ...m, userPicks: newPicks };
    }));
  }, []);

  const setSinglePick = useCallback((matchId: number, outcome: '1' | 'X' | '2') => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        userPicks: { '1': outcome === '1', 'X': outcome === 'X', '2': outcome === '2' }
      };
    }));
  }, []);

  const updateMatchPercent = useCallback((matchId: number, outcome: '1' | 'X' | '2', value: number) => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        userPercents: { ...m.userPercents, [outcome]: Math.max(0, Math.min(100, value)) }
      };
    }));
  }, []);

  const applyPreset = useCallback((presetName: 'ALL_FAVORITES' | 'BALANCED' | 'CLEAR_ALL' | 'DOUBLE_SURPRISE' | 'ALL_1' | 'ALL_X' | 'ALL_2') => {
    setMatches(prev => prev.map(m => {
      if (presetName === 'ALL_FAVORITES') {
        const lowestOdd = Math.min(m.odds['1'], m.odds['X'], m.odds['2']);
        return {
          ...m,
          userPicks: {
            '1': m.odds['1'] === lowestOdd,
            'X': m.odds['X'] === lowestOdd,
            '2': m.odds['2'] === lowestOdd
          }
        };
      } else if (presetName === 'BALANCED') {
        const sorted = [
          { out: '1' as const, odd: m.odds['1'] },
          { out: 'X' as const, odd: m.odds['X'] },
          { out: '2' as const, odd: m.odds['2'] }
        ].sort((a, b) => a.odd - b.odd);

        return {
          ...m,
          userPicks: {
            '1': sorted[0].out === '1' || sorted[1].out === '1',
            'X': sorted[0].out === 'X' || sorted[1].out === 'X',
            '2': sorted[0].out === '2' || sorted[1].out === '2'
          }
        };
      } else if (presetName === 'CLEAR_ALL') {
        const initial = INITIAL_MATCHES.find(im => im.id === m.id);
        return initial ? { ...m, userPicks: { ...initial.userPicks } } : m;
      } else if (presetName === 'DOUBLE_SURPRISE') {
        return {
          ...m,
          userPicks: { '1': true, 'X': true, '2': true }
        };
      } else if (presetName === 'ALL_1') {
        return { ...m, userPicks: { '1': true, 'X': false, '2': false } };
      } else if (presetName === 'ALL_X') {
        return { ...m, userPicks: { '1': false, 'X': true, '2': false } };
      } else if (presetName === 'ALL_2') {
        return { ...m, userPicks: { '1': false, 'X': false, '2': true } };
      }
      return m;
    }));
  }, []);

  return {
    matches,
    setMatches,
    toggleMatchPick,
    setSinglePick,
    updateMatchPercent,
    applyPreset,
    formulaType,
    setFormulaType,
    guaranteeTier,
    setGuaranteeTier,
    filters,
    setFilters,
    targetBudgetTL,
    setTargetBudgetTL,
    unitPriceTL,
    setUnitPriceTL,
    generatedColumns,
    calcSummary,
    isCalculating,
    runCalculation
  };
}

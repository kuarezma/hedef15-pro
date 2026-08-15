import { useState, useEffect, useCallback, useRef } from 'react';
import { Match, FormulaType, GuaranteeTier, FilterConfig, Column, ReductionSummary } from '../core/types';
import { INITIAL_MATCHES, INITIAL_FILTERS } from '../data/sampleBulletin';
import { generateCartesianProduct } from '../core/combinatorics';
import { calculateCoverageStats } from '../core/reduction';
import { runFormulaEngine } from '../core/formulaEngine';

const STORAGE_KEY_MATCHES = 'hedef15_matches_v1';
const STORAGE_KEY_FILTERS = 'hedef15_filters_v1';
const STORAGE_KEY_FORMULA = 'hedef15_formula_v1';
const STORAGE_KEY_TIER = 'hedef15_tier_v1';
const STORAGE_KEY_BUDGET = 'hedef15_budget_v1';

const CALC_DEBOUNCE_MS = 300;

export function useTotoEngine() {
  const calcGenerationRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial state with LocalStorage fallback
  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MATCHES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 15) return parsed;
      }
    } catch (_) {}
    return INITIAL_MATCHES;
  });

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

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches));
    } catch (_) {}
  }, [matches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
    } catch (_) {}
  }, [filters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FORMULA, formulaType);
    } catch (_) {}
  }, [formulaType]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TIER, guaranteeTier);
    } catch (_) {}
  }, [guaranteeTier]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET, targetBudgetTL.toString());
    } catch (_) {}
  }, [targetBudgetTL]);

  // Toggle user pick for a match
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

  // Set single pick for a match
  const setSinglePick = useCallback((matchId: number, outcome: '1' | 'X' | '2') => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        userPicks: { '1': outcome === '1', 'X': outcome === 'X', '2': outcome === '2' }
      };
    }));
  }, []);

  // Update custom percentage for probabilistic mode
  const updateMatchPercent = useCallback((matchId: number, outcome: '1' | 'X' | '2', value: number) => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      return {
        ...m,
        userPercents: { ...m.userPercents, [outcome]: Math.max(0, Math.min(100, value)) }
      };
    }));
  }, []);

  // Reset to default bulletin
  const resetToDefaultBulletin = useCallback(() => {
    setMatches(INITIAL_MATCHES);
    setFilters(INITIAL_FILTERS);
    setFormulaType('guaranteed_custom');
    setGuaranteeTier('14');
    setTargetBudgetTL(300);
  }, []);

  // Quick preset handlers
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

  // Non-blocking calculation with generation token for cancellation
  const runCalculation = useCallback(() => {
    const generation = ++calcGenerationRef.current;
    setIsCalculating(true);

    requestAnimationFrame(() => {
      if (generation !== calcGenerationRef.current) return;

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

        if (generation !== calcGenerationRef.current) return;

        const end = performance.now();
        const duration = Math.max(1, Math.round(end - start));

        const coverageStats = formulaType === 'flat' || formulaType === 'nine_columns' || formulaType === 'super_seven'
          ? { '15': 100, '14': 100, '13': 100, '12': 100 }
          : calculateCoverageStats(finalCols, generateCartesianProduct(matches, 2000));

        setGeneratedColumns(finalCols);
        setCalcSummary({
          rawCombinations: rawCount,
          filteredCombinations: filteredCount,
          reducedColumns: finalCols.length,
          totalCostTL: Number((finalCols.length * unitPriceTL).toFixed(2)),
          unitPriceTL,
          estimatedGuaranteeRatio: coverageStats,
          durationMs: duration
        });
      } catch (err) {
        if (generation === calcGenerationRef.current) {
          console.error('Toto Engine Calculation Error:', err);
        }
      } finally {
        if (generation === calcGenerationRef.current) {
          setIsCalculating(false);
        }
      }
    });
  }, [matches, formulaType, guaranteeTier, filters, targetBudgetTL, unitPriceTL]);

  // Debounced recalculation — prevents UI freeze during slider drags / rapid toggles
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      runCalculation();
    }, CALC_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      calcGenerationRef.current++;
    };
  }, [formulaType, guaranteeTier, targetBudgetTL, unitPriceTL, matches, filters, runCalculation]);

  return {
    matches,
    setMatches,
    toggleMatchPick,
    setSinglePick,
    updateMatchPercent,
    applyPreset,
    resetToDefaultBulletin,
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

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Match, FormulaType, GuaranteeTier, FilterConfig, Column, ReductionSummary } from '../core/types';
import { INITIAL_MATCHES, INITIAL_FILTERS } from '../data/sampleBulletin';
import { calculateRawCombinationCount, generateCartesianProduct } from '../core/combinatorics';
import { filterColumns } from '../core/filters';
import { reduceColumnsByGuarantee, calculateCoverageStats } from '../core/reduction';
import { generateProbabilisticColumns } from '../core/probabilistic';
import { MATRIX_4_TRIPLES_9_COLS } from '../core/matrixTables';

export function useTotoEngine() {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [formulaType, setFormulaType] = useState<FormulaType>('guaranteed_custom');
  const [guaranteeTier, setGuaranteeTier] = useState<GuaranteeTier>('14');
  const [filters, setFilters] = useState<FilterConfig>(INITIAL_FILTERS);
  const [targetBudgetTL, setTargetBudgetTL] = useState<number>(300);
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

  // Toggle user pick for a match
  const toggleMatchPick = useCallback((matchId: number, outcome: '1' | 'X' | '2') => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const currentVal = m.userPicks[outcome];
      const newPicks = { ...m.userPicks, [outcome]: !currentVal };
      // Ensure at least one pick is active
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
        userPercents: { ...m.userPercents, [outcome]: value }
      };
    }));
  }, []);

  // Quick preset handlers
  const applyPreset = useCallback((presetName: 'ALL_FAVORITES' | 'BALANCED' | 'CLEAR_ALL' | 'DOUBLE_SURPRISE') => {
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
        // Favori + Plase
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
      } else if (presetName === 'DOUBLE_SURPRISE') {
        return {
          ...m,
          userPicks: { '1': true, 'X': true, '2': true }
        };
      }
      return m;
    }));
  }, []);

  // Compute and run reduction engine
  const runCalculation = useCallback(() => {
    setIsCalculating(true);
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
        const rawUniverse = generateCartesianProduct(matches, 50000);
        finalCols = filterColumns(rawUniverse, matches, filters);
        filteredCount = finalCols.length;
      } else {
        // Guaranteed & Matrix Reduction Modes
        rawCount = calculateRawCombinationCount(matches);
        const rawUniverse = generateCartesianProduct(matches, 100000);
        const filteredUniverse = filterColumns(rawUniverse, matches, filters);
        filteredCount = filteredUniverse.length;

        const targetCols = Math.floor(targetBudgetTL / unitPriceTL);
        finalCols = reduceColumnsByGuarantee(filteredUniverse, guaranteeTier, targetCols > 0 ? targetCols : undefined);
      }

      const end = performance.now();
      const duration = Math.round(end - start);

      // Coverage stats
      const coverageStats = formulaType === 'flat'
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
      console.error('Toto Engine Calculation Error:', err);
    } finally {
      setIsCalculating(false);
    }
  }, [matches, formulaType, guaranteeTier, filters, targetBudgetTL, unitPriceTL]);

  // Initial calculation on load
  useEffect(() => {
    runCalculation();
  }, [formulaType, guaranteeTier, targetBudgetTL, unitPriceTL]);

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

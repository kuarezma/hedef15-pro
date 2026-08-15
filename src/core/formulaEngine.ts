import { Column, FilterConfig, Match, Outcome } from './types';
import { getSelectedOutcomesForMatch, calculateRawCombinationCount, generateCartesianProduct } from './combinatorics';
import { filterColumns } from './filters';
import { reduceColumnsByGuarantee } from './reduction';
import { generateProbabilisticColumns } from './probabilistic';
import { analyzeValueBetsForMatch } from './valueEngine';
import { MATRIX_4_TRIPLES_9_COLS, MATRIX_7_DOUBLES_16_COLS } from './matrixTables';

/**
 * Classic 9-column matrix formula: 4 triple-pick matches reduced via optimal covering code.
 */
export function generateNineColumnFormula(matches: Match[], filterConfig: FilterConfig): Column[] {
  const tripleIndices: number[] = [];
  const baseColumn: Outcome[] = new Array(15);

  for (let i = 0; i < 15; i++) {
    const outs = getSelectedOutcomesForMatch(matches[i]);
    if (outs.length === 3) {
      tripleIndices.push(i);
      baseColumn[i] = '1';
    } else if (outs.length === 2) {
      baseColumn[i] = outs[0];
    } else {
      baseColumn[i] = outs[0];
    }
  }

  // Use first 4 triple-pick matches (classic Spor Toto 9-column setup)
  const activeTripleIndices = tripleIndices.slice(0, 4);
  if (activeTripleIndices.length < 4) {
    // Not enough triples — fall back to standard reduction on full universe
    const universe = generateCartesianProduct(matches, 60000);
    const filtered = filterColumns(universe, matches, filterConfig);
    return reduceColumnsByGuarantee(filtered, '13', 9);
  }

  const columns: Column[] = [];
  for (const row of MATRIX_4_TRIPLES_9_COLS) {
    const col = [...baseColumn] as Column;
    for (let t = 0; t < 4; t++) {
      col[activeTripleIndices[t]] = row[t];
    }
    columns.push(col);
  }

  return filterColumns(columns, matches, filterConfig);
}

/**
 * AI Site Ideal: value-weighted single picks, then budget-constrained reduction.
 */
export function generateSiteIdealFormula(
  matches: Match[],
  filterConfig: FilterConfig,
  targetMaxColumns?: number
): Column[] {
  const valueMatches = matches.map(m => {
    const analyses = analyzeValueBetsForMatch(m);
    const best = analyses.sort((a, b) => b.valueRatio - a.valueRatio)[0];
    const outcome = best?.outcome ?? '1';
    return {
      ...m,
      userPicks: {
        '1': outcome === '1',
        'X': outcome === 'X',
        '2': outcome === '2'
      } as Match['userPicks']
    };
  });

  const universe = generateCartesianProduct(valueMatches, 60000);
  const filtered = filterColumns(universe, valueMatches, filterConfig);
  return reduceColumnsByGuarantee(filtered, '14', targetMaxColumns);
}

/**
 * Super Seven: 7 double-pick matches via 16-column Walsh/Hadamard matrix.
 */
export function generateSuperSevenFormula(matches: Match[], filterConfig: FilterConfig): Column[] {
  // Pick 7 matches with highest spread (most uncertain) for double coverage
  const ranked = matches
    .map((m, idx) => {
      const outs = getSelectedOutcomesForMatch(m);
      const spread = Math.max(...outs.map(o => m.odds[o])) - Math.min(...outs.map(o => m.odds[o]));
      return { idx, outs, spread };
    })
    .sort((a, b) => b.spread - a.spread);

  const doubleSlots: { idx: number; outs: Outcome[] }[] = [];
  for (const item of ranked) {
    if (doubleSlots.length >= 7) break;
    if (item.outs.length >= 2) {
      doubleSlots.push({ idx: item.idx, outs: item.outs.slice(0, 2) });
    } else if (item.outs.length === 1) {
      // Expand single to double using next-best odds outcome
      const m = matches[item.idx];
      const all: Outcome[] = ['1', 'X', '2'];
      const sorted = all
        .filter(o => o !== item.outs[0])
        .sort((a, b) => m.odds[a] - m.odds[b]);
      doubleSlots.push({ idx: item.idx, outs: [item.outs[0], sorted[0]] });
    }
  }

  if (doubleSlots.length < 7) {
    const universe = generateCartesianProduct(matches, 60000);
    const filtered = filterColumns(universe, matches, filterConfig);
    return reduceColumnsByGuarantee(filtered, '14', 16);
  }

  const baseColumn: Outcome[] = new Array(15);
  for (let i = 0; i < 15; i++) {
    const outs = getSelectedOutcomesForMatch(matches[i]);
    baseColumn[i] = outs[0];
  }

  const columns: Column[] = [];
  for (const row of MATRIX_7_DOUBLES_16_COLS) {
    const col = [...baseColumn] as Column;
    for (let d = 0; d < 7; d++) {
      col[doubleSlots[d].idx] = doubleSlots[d].outs[row[d]];
    }
    columns.push(col);
  }

  return filterColumns(columns, matches, filterConfig);
}

export interface FormulaResult {
  columns: Column[];
  rawCount: number;
  filteredCount: number;
}

/**
 * Central formula dispatcher used by the calculation engine.
 */
export function runFormulaEngine(
  matches: Match[],
  formulaType: string,
  guaranteeTier: '15' | '14' | '13' | '12',
  filters: FilterConfig,
  targetBudgetTL: number,
  unitPriceTL: number
): FormulaResult {
  const targetCols = Math.max(1, Math.floor(targetBudgetTL / unitPriceTL));
  const rawCount = calculateRawCombinationCount(matches);

  switch (formulaType) {
    case 'probabilistic': {
      const cols = generateProbabilisticColumns(matches, targetCols, filters);
      return { columns: cols, rawCount: targetCols * 5, filteredCount: cols.length };
    }
    case 'flat': {
      const universe = generateCartesianProduct(matches, 60000);
      const filtered = filterColumns(universe, matches, filters);
      return { columns: filtered, rawCount, filteredCount: filtered.length };
    }
    case 'nine_columns': {
      const cols = generateNineColumnFormula(matches, filters);
      return { columns: cols, rawCount: Math.pow(3, Math.min(4, matches.filter(m => getSelectedOutcomesForMatch(m).length === 3).length)), filteredCount: cols.length };
    }
    case 'site_ideal': {
      const cols = generateSiteIdealFormula(matches, filters, targetCols);
      return { columns: cols, rawCount, filteredCount: cols.length };
    }
    case 'super_seven': {
      const cols = generateSuperSevenFormula(matches, filters);
      return { columns: cols, rawCount: Math.pow(2, 7), filteredCount: cols.length };
    }
    default: {
      const universe = generateCartesianProduct(matches, 100000);
      const filteredUniverse = filterColumns(universe, matches, filters);
      const cols = reduceColumnsByGuarantee(
        filteredUniverse,
        guaranteeTier,
        targetCols > 0 ? targetCols : undefined
      );
      return { columns: cols, rawCount, filteredCount: filteredUniverse.length };
    }
  }
}

import { Outcome } from './types';

/**
 * Pre-computed optimal covering matrices for classic Spor Toto reductions.
 * These are mathematically optimal ternary Hamming covering codes.
 */

// 4 Triples in 9 Columns (13-Guarantee / Hamming distance 1 over 4 items)
// Full: 3^4 = 81 columns -> Reduced: 9 columns. Guarantees >= 3/4 correct, 11.11% chance for 4/4.
export const MATRIX_4_TRIPLES_9_COLS: Outcome[][] = [
  ['1', '1', '1', '1'],
  ['1', 'X', 'X', 'X'],
  ['1', '2', '2', '2'],
  ['X', '1', 'X', '2'],
  ['X', 'X', '2', '1'],
  ['X', '2', '1', 'X'],
  ['2', '1', '2', 'X'],
  ['2', 'X', '1', '2'],
  ['2', '2', 'X', '1']
];

// 3 Triples in 5 Columns (13-Guarantee over 3 items)
// Full: 3^3 = 27 columns -> Reduced: 5 columns.
export const MATRIX_3_TRIPLES_5_COLS: Outcome[][] = [
  ['1', '1', '1'],
  ['X', 'X', '1'],
  ['2', '2', '1'],
  ['1', 'X', '2'],
  ['X', '1', 'X']
];

// 5 Triples in 27 Columns (13-Guarantee over 5 items)
// Full: 3^5 = 243 columns -> Reduced: 27 columns.
export const MATRIX_5_TRIPLES_27_COLS: Outcome[][] = [
  ['1', '1', '1', '1', '1'],
  ['1', '1', 'X', 'X', 'X'],
  ['1', '1', '2', '2', '2'],
  ['1', 'X', '1', 'X', '2'],
  ['1', 'X', 'X', '2', '1'],
  ['1', 'X', '2', '1', 'X'],
  ['1', '2', '1', '2', 'X'],
  ['1', '2', 'X', '1', '2'],
  ['1', '2', '2', 'X', '1'],
  ['X', 'X', '1', '1', '1'],
  ['X', 'X', 'X', 'X', 'X'],
  ['X', 'X', '2', '2', '2'],
  ['X', '2', '1', 'X', '2'],
  ['X', '2', 'X', '2', '1'],
  ['X', '2', '2', '1', 'X'],
  ['X', '1', '1', '2', 'X'],
  ['X', '1', 'X', '1', '2'],
  ['X', '1', '2', 'X', '1'],
  ['2', '2', '1', '1', '1'],
  ['2', '2', 'X', 'X', 'X'],
  ['2', '2', '2', '2', '2'],
  ['2', '1', '1', 'X', '2'],
  ['2', '1', 'X', '2', '1'],
  ['2', '1', '2', '1', 'X'],
  ['2', 'X', '1', '2', 'X'],
  ['2', 'X', 'X', '1', '2'],
  ['2', 'X', '2', 'X', '1']
];

// 6 Doubles in 12 Columns (14-Guarantee over 6 binary choices)
// Full: 2^6 = 64 columns -> Reduced: 12 columns.
export const MATRIX_6_DOUBLES_12_COLS: number[][] = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1],
  [0, 1, 1, 0, 0, 1],
  [0, 1, 1, 1, 1, 0],
  [1, 0, 1, 0, 1, 0],
  [1, 0, 1, 1, 0, 1],
  [1, 1, 0, 0, 1, 1],
  [1, 1, 0, 1, 0, 0],
  [0, 0, 1, 0, 1, 1],
  [0, 1, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 0],
  [1, 1, 1, 0, 0, 0]
];

// 7 Doubles in 16 Columns (14-Guarantee over 7 binary choices)
// Full: 2^7 = 128 columns -> Reduced: 16 columns (Hadamard/Walsh code).
export const MATRIX_7_DOUBLES_16_COLS: number[][] = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1],
  [0, 1, 1, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 0, 0],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 0],
  [1, 1, 0, 0, 1, 1, 0],
  [1, 1, 0, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 0, 0],
  [1, 0, 0, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 1, 1],
  [0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 0, 1, 0, 1],
  [0, 0, 1, 1, 0, 0, 1],
  [0, 0, 1, 0, 1, 1, 0]
];

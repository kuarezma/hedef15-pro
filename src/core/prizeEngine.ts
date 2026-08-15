import { Outcome, PrizeSimulation } from './types';

/**
 * Official Spor Toto Prize Pool & Payout Simulation Engine.
 */

export interface PrizeEngineParams {
  totalTurnoverTL: number; // Toplam Hasılat (Örn: 25.000.000 TL)
  rollover15TL: number;    // Devreden İkramiye (Örn: 10.000.000 TL)
  payoutRate?: number;     // Yasal ikramiye dağıtım oranı (Varsayılan %50)
  outcomes: Outcome[];     // 15 maçın gerçekleşen/varsayılan sonuçları
  publicDistributions: { '1': number; 'X': number; '2': number }[]; // Her maçın halk oynama yüzdeleri
  totalColumnsPlayed?: number; // Toplam oynanan kolon sayısı (hasılat / birim_fiyat)
  unitPriceTL?: number;    // Kolon bedeli (Varsayılan 2.0 TL)
}

export function simulatePrizeDistribution(params: PrizeEngineParams): PrizeSimulation {
  const {
    totalTurnoverTL,
    rollover15TL,
    payoutRate = 0.50,
    outcomes,
    publicDistributions,
    unitPriceTL = 2.0
  } = params;

  const totalPrizePool = totalTurnoverTL * payoutRate;
  const totalColumnsPlayed = params.totalColumnsPlayed || Math.floor(totalTurnoverTL / unitPriceTL);

  // Official Tier Ratios:
  // 15: %35 + Devir
  // 14: %20
  // 13: %20
  // 12: %25
  const pool15 = (totalPrizePool * 0.35) + rollover15TL;
  const pool14 = (totalPrizePool * 0.20);
  const pool13 = (totalPrizePool * 0.20);
  const pool12 = (totalPrizePool * 0.25);

  // Calculate probability of the specific 15-match result according to public pick distribution
  // P(15) = product of public probabilities for each match outcome
  let p15Joint = 1.0;
  const probs: number[] = [];

  for (let i = 0; i < 15; i++) {
    const outcome = outcomes[i] || '1';
    const dist = publicDistributions[i] || { '1': 40, 'X': 30, '2': 30 };
    const p = (dist[outcome] || 33.3) / 100;
    probs.push(p);
    p15Joint *= p;
  }

  // Expected 15 winners
  const expected15 = Math.max(0, p15Joint * totalColumnsPlayed);

  // For 14, 13, 12, we calculate the Poisson binomial sum of probabilities:
  // P(14) = sum of combinations with exactly 1 mistake
  let p14Joint = 0;
  for (let i = 0; i < 15; i++) {
    let term = 1.0;
    for (let j = 0; j < 15; j++) {
      if (j === i) {
        term *= (1 - probs[j]);
      } else {
        term *= probs[j];
      }
    }
    p14Joint += term;
  }
  const expected14 = Math.max(1, p14Joint * totalColumnsPlayed);

  // Approximation for 13 and 12 based on combinatorial multipliers
  const p13Joint = p14Joint * 7.5;
  const p12Joint = p14Joint * 35.0;

  const expected13 = Math.max(1, p13Joint * totalColumnsPlayed);
  const expected12 = Math.max(1, p12Joint * totalColumnsPlayed);

  // Round winners for realistic display
  const winners15 = expected15 < 0.5 ? 0 : Math.round(expected15);
  const winners14 = Math.max(1, Math.round(expected14));
  const winners13 = Math.max(1, Math.round(expected13));
  const winners12 = Math.max(1, Math.round(expected12));

  return {
    totalTurnoverTL,
    rollover15TL,
    payoutRate,
    pool15,
    pool14,
    pool13,
    pool12,
    estimatedWinners: {
      '15': winners15,
      '14': winners14,
      '13': winners13,
      '12': winners12
    },
    estimatedPayoutPerWinner: {
      '15': winners15 > 0 ? Math.round(pool15 / winners15) : pool15,
      '14': Math.round(pool14 / winners14),
      '13': Math.round(pool13 / winners13),
      '12': Math.round(pool12 / winners12)
    }
  };
}

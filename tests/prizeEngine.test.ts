import { describe, it, expect } from 'vitest';
import { simulatePrizeDistribution } from '../src/core/prizeEngine';
import { Outcome } from '../src/core/types';

describe('Prize Simulation Engine', () => {
  it('correctly allocates pools across all four tiers with rollover inclusion', () => {
    const outcomes: Outcome[] = Array(15).fill('1');
    const publicDistributions = Array(15).fill({ '1': 60, 'X': 25, '2': 15 });

    const result = simulatePrizeDistribution({
      totalTurnoverTL: 20000000, // 20M Hasılat -> 10M İkramiye Havuzu (%50)
      rollover15TL: 5000000,    // 5M Devir
      payoutRate: 0.50,
      outcomes,
      publicDistributions,
      unitPriceTL: 2.0
    });

    // Total Prize Pool = 10,000,000 TL
    // Pool 15 = 10M * 0.35 + 5M Devir = 3.5M + 5M = 8,500,000 TL
    expect(result.pool15).toBe(8500000);
    // Pool 14 = 10M * 0.20 = 2,000,000 TL
    expect(result.pool14).toBe(2000000);
    // Pool 13 = 10M * 0.20 = 2,000,000 TL
    expect(result.pool13).toBe(2000000);
    // Pool 12 = 10M * 0.25 = 2,500,000 TL
    expect(result.pool12).toBe(2500000);

    expect(result.estimatedPayoutPerWinner['15']).toBeGreaterThan(0);
    expect(result.estimatedPayoutPerWinner['14']).toBeGreaterThan(0);
  });
});

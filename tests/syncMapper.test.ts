import { describe, it, expect } from 'vitest';
import { impliedPercentsFromOdds, favoriteOutcomeFromOdds, gameResultToOutcome, mapExternalRowToMatch } from '../scripts/providers/mapMatch';

describe('Sync mapper', () => {
  it('computes implied probabilities from odds', () => {
    const p = impliedPercentsFromOdds({ '1': 2.0, 'X': 3.0, '2': 4.0 });
    expect(p['1'] + p['X'] + p['2']).toBeCloseTo(100, 0);
    expect(p['1']).toBeGreaterThan(p['2']);
  });

  it('maps external API row to Match', () => {
    const m = mapExternalRowToMatch({
      MatchID: 99,
      Team1: 'Galatasaray',
      Team2: 'Fenerbahçe',
      League: 'Süper Lig',
      Date: '2026-08-15',
      Time: '20:00:00',
      HomeWin: 2.1,
      Draw: 3.2,
      AwayWin: 3.0
    }, 0);
    expect(m.id).toBe(99);
    expect(m.homeTeam).toBe('Galatasaray');
    expect(m.odds['1']).toBe(2.1);
    expect(m.userPicks[favoriteOutcomeFromOdds(m.odds)]).toBe(true);
  });

  it('maps game result codes', () => {
    expect(gameResultToOutcome(1)).toBe('1');
    expect(gameResultToOutcome(2)).toBe('X');
    expect(gameResultToOutcome(3)).toBe('2');
    expect(gameResultToOutcome(0)).toBeNull();
  });
});

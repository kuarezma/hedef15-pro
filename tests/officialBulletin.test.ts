import { describe, it, expect } from 'vitest';
import {
  CURRENT_BULLETIN_ID,
  WEEK1_MATCHES,
  WEEK1_OFFICIAL_SCORES,
  WEEK2_CONFIRMED_MS,
  WEEK2_MATCHES
} from '../src/data/officialBulletins';
import { archiveStatuses, mergeLiveWithConfirmedOfficial } from '../src/core/officialBoard';
import { getInitialWeekendStatuses } from '../src/core/mackolikService';
import { getOfficialWeek } from '../src/data/officialBulletins';

describe('Official Spor Toto bulletin', () => {
  it('uses the published week-2 15-list instead of invented Premier League fillers', () => {
    expect(CURRENT_BULLETIN_ID).toBe('2026_w2_official_st15');
    expect(WEEK2_MATCHES).toHaveLength(15);
    expect(WEEK2_MATCHES[0]).toMatchObject({ homeTeam: 'Erzurumspor FK', awayTeam: 'Galatasaray' });
    expect(WEEK2_MATCHES[1]).toMatchObject({ homeTeam: 'Olympique Marseille', awayTeam: 'Strasbourg' });
    expect(WEEK2_MATCHES[2]).toMatchObject({ homeTeam: 'Real Betis', awayTeam: 'Real Sociedad' });
    expect(WEEK2_MATCHES[6]).toMatchObject({ homeTeam: 'Borussia Dortmund', awayTeam: 'Bayern Münih' });
    expect(WEEK2_MATCHES[7]).toMatchObject({ homeTeam: 'Atlético Madrid', awayTeam: 'Villarreal' });
    expect(WEEK2_MATCHES[13]).toMatchObject({ homeTeam: 'Torino', awayTeam: 'AC Milan' });
    expect(WEEK2_MATCHES.some(m => m.homeTeam === 'Arsenal' && m.awayTeam === 'Coventry City')).toBe(false);
    expect(WEEK2_MATCHES.some(m => m.homeTeam === 'Hull City')).toBe(false);
  });

  it('keeps week-1 official MS: Galatasaray-Çorum 2-2 X, not a fake 3-0', () => {
    expect(WEEK1_MATCHES[0]).toMatchObject({ homeTeam: 'Galatasaray', awayTeam: 'Çorum FK' });
    expect(WEEK1_OFFICIAL_SCORES[0]).toEqual({
      homeScore: 2,
      awayScore: 2,
      outcome: 'X',
      status: 'FINISHED'
    });
    expect(WEEK1_OFFICIAL_SCORES[1]).toMatchObject({ homeScore: 1, awayScore: 1, outcome: 'X' });
    expect(WEEK1_OFFICIAL_SCORES[2]).toMatchObject({ homeScore: 0, awayScore: 1, outcome: '2' });
    expect(WEEK1_OFFICIAL_SCORES[4]).toMatchObject({ homeScore: 2, awayScore: 1, outcome: '1' });
    expect(WEEK1_OFFICIAL_SCORES[14]?.status).toBe('POSTPONED');
    expect(WEEK1_OFFICIAL_SCORES[14]?.outcome).toBeNull();

    const archived = archiveStatuses(getOfficialWeek('2026_w1'));
    expect(archived[0].currentOutcome).toBe('X');
    expect(archived[0].homeScore).toBe(2);
    expect(archived[0].awayScore).toBe(2);
    expect(archived[1].currentOutcome).toBe('X');
    expect(archived[14].status).toBe('POSTPONED');
    expect(archived[14].currentOutcome).toBeNull();
  });

  it('fills confirmed Friday MS when the live board is still scheduled', () => {
    const initial = getInitialWeekendStatuses(WEEK2_MATCHES);
    const merged = mergeLiveWithConfirmedOfficial(WEEK2_MATCHES, initial, WEEK2_CONFIRMED_MS);
    expect(merged[0]).toMatchObject({
      status: 'FINISHED',
      homeScore: 0,
      awayScore: 4,
      currentOutcome: '2',
      matched: true
    });
    expect(merged[1]).toMatchObject({ homeScore: 4, awayScore: 0, currentOutcome: '1' });
    expect(merged[2]).toMatchObject({ homeScore: 1, awayScore: 0, currentOutcome: '1' });
    expect(merged[3].status).toBe('SCHEDULED');
    expect(merged[3].currentOutcome).toBeNull();
  });

  it('does not stamp week-2 Friday scores onto a stale week-1 Galatasaray-Çorum row', () => {
    const stale = [{ ...WEEK1_MATCHES[0] }];
    const initial = getInitialWeekendStatuses(stale);
    const merged = mergeLiveWithConfirmedOfficial(stale, initial, WEEK2_CONFIRMED_MS);
    expect(merged[0].status).toBe('SCHEDULED');
    expect(merged[0].currentOutcome).toBeNull();
    expect(merged[0].homeScore).toBe(0);
    expect(merged[0].awayScore).toBe(0);
  });

  it('records the announced week-1 prize table without inventing 15 winners', () => {
    const week1 = getOfficialWeek('2026_w1');
    expect(week1.prize.tier15.winners).toBe(0);
    expect(week1.prize.tier15.rolledOver).toBe(true);
    expect(week1.prize.rolloverToNextWeekTL).toBe(30149380);
    expect(week1.prize.tier14).toMatchObject({ winners: 8, prizePerWinnerTL: 2153527 });
    expect(week1.prize.tier13).toMatchObject({ winners: 210, prizePerWinnerTL: 82039 });
    expect(getOfficialWeek('2026_w2').prize.announced).toBe(false);
  });
});

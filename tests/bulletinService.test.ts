import { describe, it, expect } from 'vitest';
import {
  bulletinFingerprint,
  currentSuperLigWeek,
  displayTeamName,
  eventsToMatches,
  kickoffInTurkey,
  selectWeeklyBulletinEvents
} from '../src/core/bulletinService';
import { LiveFootballEvent } from '../src/core/mackolikService';

function event(partial: Partial<LiveFootballEvent> & Pick<LiveFootballEvent, 'homeTeam' | 'awayTeam' | 'league' | 'kickoffIso'>): LiveFootballEvent {
  return {
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED',
    minute: 0,
    displayClock: '',
    ...partial
  };
}

describe('Weekly bulletin builder', () => {
  it('computes Super Lig week 2 on 21 August 2026', () => {
    expect(currentSuperLigWeek(new Date('2026-08-21T22:00:00Z'))).toBe(2);
    expect(currentSuperLigWeek(new Date('2026-08-14T18:30:00Z'))).toBe(1);
  });

  it('maps ESPN club names into Turkish bulletin names', () => {
    expect(displayTeamName('Erzurum BB')).toBe('Erzurumspor FK');
    expect(displayTeamName('Caykur Rizespor')).toBe('Çaykur Rizespor');
    expect(displayTeamName('Istanbul Basaksehir')).toBe('Başakşehir FK');
  });

  it('converts kickoff instants to Turkey weekday and clock', () => {
    const tr = kickoffInTurkey('2026-08-21T18:30:00Z');
    expect(tr.matchDate).toBe('Cuma');
    expect(tr.matchTime).toBe('21:30');
  });

  it('takes all Super Lig games first and fills to 15 with the biggest European ties', () => {
    const now = new Date('2026-08-21T20:00:00Z');
    const events: LiveFootballEvent[] = [
      event({ homeTeam: 'Erzurum BB', awayTeam: 'Galatasaray', league: 'tur.1', kickoffIso: '2026-08-21T18:30:00Z' }),
      event({ homeTeam: 'Caykur Rizespor', awayTeam: 'Samsunspor', league: 'tur.1', kickoffIso: '2026-08-22T16:00:00Z' }),
      event({ homeTeam: 'Corum FK', awayTeam: 'Kasimpasa', league: 'tur.1', kickoffIso: '2026-08-22T16:00:00Z' }),
      event({ homeTeam: 'Fenerbahce', awayTeam: 'Konyaspor', league: 'tur.1', kickoffIso: '2026-08-22T18:30:00Z' }),
      event({ homeTeam: 'Eyupspor', awayTeam: 'Gaziantep FK', league: 'tur.1', kickoffIso: '2026-08-23T16:00:00Z' }),
      event({ homeTeam: 'Trabzonspor', awayTeam: 'Istanbul Basaksehir', league: 'tur.1', kickoffIso: '2026-08-23T16:00:00Z' }),
      event({ homeTeam: 'Alanyaspor', awayTeam: 'Besiktas', league: 'tur.1', kickoffIso: '2026-08-23T18:30:00Z' }),
      event({ homeTeam: 'Goztepe', awayTeam: 'Genclerbirligi', league: 'tur.1', kickoffIso: '2026-08-23T18:30:00Z' }),
      event({ homeTeam: 'Kocaelispor', awayTeam: 'Amed SFK', league: 'tur.1', kickoffIso: '2026-08-24T18:30:00Z' }),
      event({ homeTeam: 'Arsenal', awayTeam: 'Coventry City', league: 'eng.1', kickoffIso: '2026-08-21T19:00:00Z' }),
      event({ homeTeam: 'Hull City', awayTeam: 'Manchester United', league: 'eng.1', kickoffIso: '2026-08-22T11:30:00Z' }),
      event({ homeTeam: 'Espanyol', awayTeam: 'Real Madrid', league: 'esp.1', kickoffIso: '2026-08-22T19:30:00Z' }),
      event({ homeTeam: 'Elche', awayTeam: 'Barcelona', league: 'esp.1', kickoffIso: '2026-08-23T19:30:00Z' }),
      event({ homeTeam: 'Stade Rennais', awayTeam: 'Paris Saint-Germain', league: 'fra.1', kickoffIso: '2026-08-23T18:45:00Z' }),
      event({ homeTeam: 'Newcastle United', awayTeam: 'Liverpool', league: 'eng.1', kickoffIso: '2026-08-23T15:30:00Z' }),
      event({ homeTeam: 'Albacete', awayTeam: 'Leganes', league: 'esp.2', kickoffIso: '2026-08-22T15:00:00Z' })
    ];

    const selected = selectWeeklyBulletinEvents(events, now);
    expect(selected).toHaveLength(15);
    expect(selected.filter(e => e.league === 'tur.1')).toHaveLength(9);
    expect(selected.some(e => e.awayTeam === 'Real Madrid')).toBe(true);
    expect(selected.some(e => e.homeTeam === 'Albacete')).toBe(false);

    const matches = eventsToMatches(selected);
    expect(matches[0].homeTeam).toBe('Erzurumspor FK');
    expect(matches[0].awayTeam).toBe('Galatasaray');
    expect(bulletinFingerprint(matches).includes('erzurum|galatasaray')).toBe(true);
  });
});

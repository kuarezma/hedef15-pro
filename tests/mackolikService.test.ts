import { describe, it, expect } from 'vitest';
import {
  americanToDecimal,
  applyLiveEventsToMatches,
  findMatchingEvent,
  getInitialWeekendStatuses,
  namesMatch,
  normalizeTeamName,
  parseEspnScoreboard
} from '../src/core/mackolikService';
import { getFavoriteOutcome } from '../src/core/valueEngine';
import { INITIAL_MATCHES } from '../src/data/sampleBulletin';
import { isFinishedStatus, isLiveStatus, isScheduledStatus, scoreToOutcome } from '../src/core/matchStatus';

describe('Real live score mapping', () => {
  it('normalizes Turkish club names so ESPN labels match the bulletin', () => {
    expect(normalizeTeamName('Çaykur Rizespor')).toBe(normalizeTeamName('Rizespor'));
    expect(normalizeTeamName('Erzurumspor FK')).toBe(normalizeTeamName('Erzurum BB'));
    expect(normalizeTeamName('Amed Sportif')).toBe(normalizeTeamName('Amed SFK'));
    expect(normalizeTeamName('İstanbul Başakşehir')).toBe(normalizeTeamName('Istanbul Basaksehir'));
    expect(namesMatch('Paris Saint Germain', 'Paris Saint-Germain')).toBe(true);
    expect(namesMatch('Galatasaray', 'Konyaspor')).toBe(false);
  });

  it('converts American moneylines into decimal 1X2 odds', () => {
    expect(americanToDecimal(-270)).toBeCloseTo(1.37, 2);
    expect(americanToDecimal('+750')).toBe(8.5);
    expect(americanToDecimal(400)).toBe(5);
  });

  it('picks the lowest-odds outcome as the iddaa favorite', () => {
    expect(getFavoriteOutcome({ '1': 8.5, 'X': 5.2, '2': 1.28 })).toBe('2');
    expect(getFavoriteOutcome({ '1': 1.32, 'X': 5.5, '2': 8.5 })).toBe('1');
  });

  it('does not invent 0-0 X as an official result before kickoff', () => {
    const statuses = getInitialWeekendStatuses(INITIAL_MATCHES);
    expect(statuses).toHaveLength(15);
    for (const status of statuses) {
      expect(status.status).toBe('SCHEDULED');
      expect(status.currentOutcome).toBeNull();
      expect(status.matched).toBe(false);
      expect(status.favoriteOutcome).toBeTruthy();
    }
  });

  it('maps a real ESPN scoreboard payload onto bulletin teams without swapping scores', () => {
    const payload = {
      events: [
        {
          date: '2026-08-21T18:30Z',
          competitions: [
            {
              startDate: '2026-08-21T18:30Z',
              competitors: [
                { homeAway: 'home', score: '0', team: { displayName: 'Erzurum BB' } },
                { homeAway: 'away', score: '4', team: { displayName: 'Galatasaray' } }
              ],
              status: {
                displayClock: "90'+3'",
                period: 2,
                type: { name: 'STATUS_FULL_TIME', state: 'post', completed: true, shortDetail: 'FT' }
              }
            }
          ]
        }
      ]
    };

    const events = parseEspnScoreboard(payload, 'tur.1');
    expect(events[0].homeScore).toBe(0);
    expect(events[0].awayScore).toBe(4);
    expect(events[0].status).toBe('FINISHED');

    const { statuses, newGoals } = applyLiveEventsToMatches(
      INITIAL_MATCHES,
      getInitialWeekendStatuses(INITIAL_MATCHES),
      events
    );

    const erzurumGs = statuses.find(s => s.matchId === 1);
    expect(erzurumGs?.matched).toBe(true);
    expect(erzurumGs?.status).toBe('FINISHED');
    expect(erzurumGs?.homeScore).toBe(0);
    expect(erzurumGs?.awayScore).toBe(4);
    expect(erzurumGs?.currentOutcome).toBe('2');
    expect(newGoals).toHaveLength(0);
  });

  it('detects a new goal only after a previously matched live snapshot', () => {
    const initial = getInitialWeekendStatuses(INITIAL_MATCHES);
    const liveFirst = applyLiveEventsToMatches(INITIAL_MATCHES, initial, [
      {
        homeTeam: 'Çorum FK',
        awayTeam: 'Kasimpasa',
        homeScore: 0,
        awayScore: 1,
        status: 'LIVE',
        minute: 22,
        displayClock: "22'",
        kickoffIso: '2026-08-22T16:00Z'
      }
    ]);
    expect(liveFirst.statuses[2].currentOutcome).toBe('2');
    expect(liveFirst.newGoals).toHaveLength(0);

    const liveSecond = applyLiveEventsToMatches(INITIAL_MATCHES, liveFirst.statuses, [
      {
        homeTeam: 'Çorum FK',
        awayTeam: 'Kasimpasa',
        homeScore: 1,
        awayScore: 1,
        status: 'LIVE',
        minute: 41,
        displayClock: "41'",
        kickoffIso: '2026-08-22T16:00Z'
      }
    ]);
    expect(liveSecond.statuses[2].currentOutcome).toBe('X');
    expect(liveSecond.newGoals).toHaveLength(1);
    expect(liveSecond.newGoals[0].scoringTeam).toBe('Çorum FK');
  });

  it('matches reversed home/away listings and remaps the score to the bulletin', () => {
    const gsAtHome = {
      ...INITIAL_MATCHES[0],
      homeTeam: 'Galatasaray',
      awayTeam: 'Erzurumspor FK'
    };
    const event = {
      homeTeam: 'Erzurum BB',
      awayTeam: 'Galatasaray',
      homeScore: 0,
      awayScore: 4,
      status: 'FINISHED' as const,
      minute: 90,
      displayClock: 'MS',
      kickoffIso: '2026-08-21T18:30Z'
    };

    const found = findMatchingEvent(gsAtHome.homeTeam, gsAtHome.awayTeam, [event]);
    expect(found?.swapped).toBe(true);

    const { statuses } = applyLiveEventsToMatches(
      [gsAtHome],
      getInitialWeekendStatuses([gsAtHome]),
      [event]
    );
    expect(statuses[0].homeScore).toBe(4);
    expect(statuses[0].awayScore).toBe(0);
    expect(statuses[0].currentOutcome).toBe('1');
  });

  it('classifies match phases without treating minute 90 as finished on its own', () => {
    expect(scoreToOutcome(2, 2)).toBe('X');
    expect(isFinishedStatus({ status: 'FINISHED' } as never)).toBe(true);
    expect(isLiveStatus({ status: 'HALFTIME' } as never)).toBe(true);
    expect(isScheduledStatus({ status: 'SCHEDULED', minute: 90 } as never)).toBe(true);
  });
});

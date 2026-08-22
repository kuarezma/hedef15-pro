import { LiveMatchStatus, Match, Outcome } from './types';
import { calculateImpliedProbabilities, getFavoriteOutcome } from './valueEngine';
import { isFinishedStatus, isLiveStatus } from './matchStatus';
import {
  OfficialScore,
  OfficialWeekBulletin,
  WEEK2_CONFIRMED_MS,
  WEEK2_MATCHES
} from '../data/officialBulletins';

export function officialScoreToStatus(match: Match, score: OfficialScore | null): LiveMatchStatus {
  const implied = calculateImpliedProbabilities(match.odds);
  const favoriteOutcome = getFavoriteOutcome(match.odds);

  if (!score) {
    return {
      matchId: match.id,
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      displayClock: '',
      status: 'SCHEDULED',
      currentOutcome: null,
      favoriteOutcome,
      favoriteImpliedPct: implied[favoriteOutcome],
      marketOdds: match.odds,
      matched: false
    };
  }

  if (score.status === 'POSTPONED') {
    return {
      matchId: match.id,
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      displayClock: '',
      status: 'POSTPONED',
      currentOutcome: null,
      favoriteOutcome,
      favoriteImpliedPct: implied[favoriteOutcome],
      marketOdds: match.odds,
      matched: true
    };
  }

  return {
    matchId: match.id,
    homeScore: score.homeScore ?? 0,
    awayScore: score.awayScore ?? 0,
    minute: 90,
    displayClock: 'MS',
    status: 'FINISHED',
    currentOutcome: score.outcome,
    favoriteOutcome,
    favoriteImpliedPct: implied[favoriteOutcome],
    marketOdds: match.odds,
    matched: true
  };
}

export function archiveStatuses(week: OfficialWeekBulletin): LiveMatchStatus[] {
  return week.matches.map((match, index) => officialScoreToStatus(match, week.officialScores[index] ?? null));
}

/**
 * Live ESPN snapshot wins when it already has a finished/live match.
 * Confirmed Friday MS fills gaps so a dead scoreboard never invents 0-0 X.
 */
export function mergeLiveWithConfirmedOfficial(
  matches: Match[],
  liveStatuses: LiveMatchStatus[],
  confirmed: Record<number, OfficialScore> = WEEK2_CONFIRMED_MS
): LiveMatchStatus[] {
  return matches.map((match, idx) => {
    const live = liveStatuses.find(s => s.matchId === match.id) || liveStatuses[idx];
    const officialFixture = WEEK2_MATCHES.find(m => m.id === match.id);
    const sameTeams = officialFixture?.homeTeam === match.homeTeam && officialFixture?.awayTeam === match.awayTeam;
    const official = sameTeams ? confirmed[match.id] : undefined;

    if (live && (live.status === 'LIVE' || live.status === 'HALFTIME' || live.status === 'FINISHED') && live.matched) {
      return live;
    }

    if (official) {
      return officialScoreToStatus(match, official);
    }

    return live || officialScoreToStatus(match, null);
  });
}

export function boardCounts(statuses: LiveMatchStatus[]): {
  finished: number;
  live: number;
  postponed: number;
  scheduled: number;
} {
  let finished = 0;
  let live = 0;
  let postponed = 0;
  let scheduled = 0;
  for (const status of statuses) {
    if (isFinishedStatus(status)) finished++;
    else if (isLiveStatus(status)) live++;
    else if (status.status === 'POSTPONED') postponed++;
    else scheduled++;
  }
  return { finished, live, postponed, scheduled };
}

export function officialOutcomesForCheck(statuses: LiveMatchStatus[]): Array<Outcome | null> {
  return statuses.map(status => {
    if (status.status === 'POSTPONED') return null;
    return isFinishedStatus(status) ? status.currentOutcome : null;
  });
}

export function weekResultsComplete(statuses: LiveMatchStatus[]): boolean {
  return statuses.length === 15 && statuses.every(s => isFinishedStatus(s) || s.status === 'POSTPONED');
}

import { LiveMatchStatus, MatchOdds, Outcome } from './types';

export function isFinishedStatus(status?: LiveMatchStatus | null): boolean {
  return status?.status === 'FINISHED';
}

export function isLiveStatus(status?: LiveMatchStatus | null): boolean {
  return status?.status === 'LIVE' || status?.status === 'HALFTIME';
}

export function isScheduledStatus(status?: LiveMatchStatus | null): boolean {
  return !status || status.status === 'SCHEDULED' || status.status === 'POSTPONED';
}

export function scoreToOutcome(homeScore: number, awayScore: number): Outcome {
  if (homeScore > awayScore) return '1';
  if (homeScore < awayScore) return '2';
  return 'X';
}

export function findMatchStatus(
  statuses: LiveMatchStatus[] | undefined,
  matchId: number
): LiveMatchStatus | undefined {
  return statuses?.find(s => s.matchId === matchId);
}

export function statusLabel(status?: LiveMatchStatus | null): string {
  if (!status || status.status === 'SCHEDULED') return 'Başlamadı';
  if (status.status === 'POSTPONED') return 'Ertelendi';
  if (status.status === 'HALFTIME') return 'Devre';
  if (status.status === 'FINISHED') return 'MS (Bitti)';
  return status.displayClock ? `${status.displayClock} Canlı` : `${status.minute}' Canlı`;
}

export function displayOdds(status: LiveMatchStatus | undefined, fallback: MatchOdds): MatchOdds {
  return status?.marketOdds ?? fallback;
}

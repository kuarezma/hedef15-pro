import type { Match, Outcome } from '../../src/core/types';

const TR_DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function impliedPercentsFromOdds(odds: { '1': number; 'X': number; '2': number }): { '1': number; 'X': number; '2': number } {
  const inv = {
    '1': odds['1'] > 1 ? 1 / odds['1'] : 0,
    'X': odds['X'] > 1 ? 1 / odds['X'] : 0,
    '2': odds['2'] > 1 ? 1 / odds['2'] : 0
  };
  const sum = inv['1'] + inv['X'] + inv['2'];
  if (sum <= 0) return { '1': 34, 'X': 33, '2': 33 };
  return {
    '1': Number(((inv['1'] / sum) * 100).toFixed(1)),
    'X': Number(((inv['X'] / sum) * 100).toFixed(1)),
    '2': Number(((inv['2'] / sum) * 100).toFixed(1))
  };
}

export function formatTrDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '—';
  return TR_DAYS[d.getDay()];
}

export function formatTrTime(time: string): string {
  if (!time) return '—';
  return time.slice(0, 5);
}

export function favoriteOutcomeFromOdds(odds: { '1': number; 'X': number; '2': number }): Outcome {
  const entries: Outcome[] = ['1', 'X', '2'];
  return entries.reduce((best, cur) => (odds[cur] < odds[best] ? cur : best), '1' as Outcome);
}

export function mapExternalRowToMatch(
  row: Record<string, unknown>,
  index: number,
  existing?: Match
): Match {
  const homeTeam = String(row.Team1 ?? row.homeTeam ?? row.home ?? 'Ev Sahibi');
  const awayTeam = String(row.Team2 ?? row.awayTeam ?? row.away ?? 'Deplasman');
  const league = String(row.League ?? row.league ?? row.Country ?? 'Spor Toto');
  const dateStr = String(row.Date ?? row.date ?? row.matchDate ?? '');
  const timeStr = String(row.Time ?? row.time ?? row.matchTime ?? '');

  const odds = {
    '1': Number(row.HomeWin ?? row.odds?.['1'] ?? row.homeWin ?? 2.0),
    'X': Number(row.Draw ?? row.odds?.['X'] ?? row.draw ?? 3.0),
    '2': Number(row.AwayWin ?? row.odds?.['2'] ?? row.awayWin ?? 3.5)
  };

  const aiPicks = impliedPercentsFromOdds(odds);
  const publicPicks = {
    '1': Number(row.publicPicks?.['1'] ?? row.HomePercent ?? aiPicks['1']),
    'X': Number(row.publicPicks?.['X'] ?? row.DrawPercent ?? aiPicks['X']),
    '2': Number(row.publicPicks?.['2'] ?? row.AwayPercent ?? aiPicks['2'])
  };

  const fav = existing?.userPicks
    ? existing.userPicks
    : (() => {
        const o = favoriteOutcomeFromOdds(odds);
        return { '1': o === '1', 'X': o === 'X', '2': o === '2' };
      })();

  return {
    id: Number(row.MatchID ?? row.id ?? index + 1),
    order: index + 1,
    homeTeam,
    awayTeam,
    league,
    matchDate: formatTrDate(dateStr),
    matchTime: formatTrTime(timeStr),
    odds,
    publicPicks,
    aiPicks,
    userPicks: fav,
    userPercents: existing?.userPercents ?? aiPicks,
    group: String(row.Country ?? row.group ?? league)
  };
}

export function gameResultToOutcome(result: number): Outcome | null {
  // NosyAPI / Spor Toto: 1=Ev, 2=Beraberlik, 3=Deplasman (yaygın kodlama)
  if (result === 1) return '1';
  if (result === 2) return 'X';
  if (result === 3) return '2';
  return null;
}

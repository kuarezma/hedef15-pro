import { Match, MatchOdds } from './types';
import { LiveFootballEvent, fetchLiveFootballEvents, normalizeTeamName } from './mackolikService';
import { buildMatch } from '../data/sampleBulletin';

export interface BulletinMeta {
  id: string;
  season: string;
  week: number;
  label: string;
}

const TEAM_DISPLAY_NAMES: Record<string, string> = {
  erzurum: 'Erzurumspor FK',
  rizespor: 'Çaykur Rizespor',
  corum: 'Çorum FK',
  kasimpasa: 'Kasımpaşa',
  fenerbahce: 'Fenerbahçe',
  konyaspor: 'Konyaspor',
  eyupspor: 'Eyüpspor',
  gaziantep: 'Gaziantep FK',
  trabzonspor: 'Trabzonspor',
  basaksehir: 'Başakşehir FK',
  alanyaspor: 'Alanyaspor',
  besiktas: 'Beşiktaş',
  goztepe: 'Göztepe',
  genclerbirligi: 'Gençlerbirliği',
  kocaelispor: 'Kocaelispor',
  amed: 'Amed Sportif',
  galatasaray: 'Galatasaray',
  samsunspor: 'Samsunspor',
  psg: 'Paris Saint Germain',
  rennes: 'Stade Rennais',
  manutd: 'Manchester United',
  mancity: 'Manchester City',
  hull: 'Hull City',
  coventry: 'Coventry City',
  realmadrid: 'Real Madrid',
  barcelona: 'Barcelona',
  liverpool: 'Liverpool',
  newcastle: 'Newcastle United',
  arsenal: 'Arsenal',
  espanyol: 'Espanyol',
  elche: 'Elche'
};

const LEAGUE_LABELS: Record<string, { league: string; group: string }> = {
  'tur.1': { league: 'Trendyol Süper Lig', group: 'Süper Lig' },
  'tur.2': { league: 'Trendyol 1. Lig', group: '1. Lig' },
  'eng.1': { league: 'Premier League', group: 'Avrupa' },
  'esp.1': { league: 'La Liga', group: 'Avrupa' },
  'fra.1': { league: 'Ligue 1', group: 'Avrupa' },
  'ita.1': { league: 'Serie A', group: 'Avrupa' },
  'ger.1': { league: 'Bundesliga', group: 'Avrupa' }
};

const BIG_CLUBS = new Set([
  'galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor',
  'realmadrid', 'barcelona', 'atletico',
  'manutd', 'mancity', 'liverpool', 'arsenal', 'chelsea', 'tottenham', 'newcastle',
  'psg', 'bayern', 'dortmund', 'juventus', 'inter', 'acmilan', 'milan', 'napoli'
]);

const TR_WEEKDAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function bulletinFingerprint(matches: Pick<Match, 'homeTeam' | 'awayTeam'>[]): string {
  return matches.map(m => `${normalizeTeamName(m.homeTeam)}|${normalizeTeamName(m.awayTeam)}`).join('::');
}

export function currentSuperLigWeek(now: Date = new Date()): number {
  const week1Start = Date.UTC(2026, 7, 14);
  const days = Math.floor((now.getTime() - week1Start) / 86400000);
  return Math.max(1, Math.floor(days / 7) + 1);
}

export function buildBulletinMeta(now: Date = new Date()): BulletinMeta {
  const week = currentSuperLigWeek(now);
  return {
    id: `2026-27-w${week}`,
    season: '2026/2027',
    week,
    label: `2026/27 • ${week}. Hafta`
  };
}

export function displayTeamName(raw: string): string {
  const key = normalizeTeamName(raw);
  return TEAM_DISPLAY_NAMES[key] || raw;
}

export function kickoffInTurkey(iso: string): { matchDate: string; matchTime: string } {
  const utc = new Date(iso);
  const tr = new Date(utc.getTime() + 3 * 60 * 60 * 1000);
  const matchDate = TR_WEEKDAYS[tr.getUTCDay()];
  const matchTime = `${String(tr.getUTCHours()).padStart(2, '0')}:${String(tr.getUTCMinutes()).padStart(2, '0')}`;
  return { matchDate, matchTime };
}

function clubFame(team: string): number {
  return BIG_CLUBS.has(normalizeTeamName(team)) ? 1 : 0;
}

function eventFame(event: LiveFootballEvent): number {
  return clubFame(event.homeTeam) + clubFame(event.awayTeam);
}

function minOdd(odds?: MatchOdds): number {
  if (!odds) return 99;
  return Math.min(odds['1'], odds['X'], odds['2']);
}

function defaultOdds(event: LiveFootballEvent): MatchOdds {
  if (event.odds) return event.odds;
  const fameHome = clubFame(event.homeTeam);
  const fameAway = clubFame(event.awayTeam);
  if (fameHome > fameAway) return { '1': 1.55, 'X': 4.00, '2': 5.50 };
  if (fameAway > fameHome) return { '1': 5.50, 'X': 4.00, '2': 1.55 };
  return { '1': 2.40, 'X': 3.20, '2': 2.90 };
}

function inWeekendWindow(iso: string, now: Date): boolean {
  if (!iso) return false;
  const kickoff = new Date(iso).getTime();
  const start = now.getTime() - 2 * 86400000;
  const end = now.getTime() + 6 * 86400000;
  return kickoff >= start && kickoff <= end;
}

export function selectWeeklyBulletinEvents(events: LiveFootballEvent[], now: Date = new Date()): LiveFootballEvent[] {
  const weekend = events.filter(e => inWeekendWindow(e.kickoffIso, now));
  const superLig = weekend
    .filter(e => e.league === 'tur.1')
    .sort((a, b) => a.kickoffIso.localeCompare(b.kickoffIso));

  const europe = weekend
    .filter(e => e.league && e.league !== 'tur.1' && e.league !== 'tur.2')
    .sort((a, b) => {
      const fameDiff = eventFame(b) - eventFame(a);
      if (fameDiff !== 0) return fameDiff;
      const oddDiff = minOdd(a.odds) - minOdd(b.odds);
      if (oddDiff !== 0) return oddDiff;
      return a.kickoffIso.localeCompare(b.kickoffIso);
    });

  const firstDiv = weekend
    .filter(e => e.league === 'tur.2')
    .sort((a, b) => a.kickoffIso.localeCompare(b.kickoffIso));

  const selected: LiveFootballEvent[] = [...superLig];
  for (const event of [...europe, ...firstDiv]) {
    if (selected.length >= 15) break;
    const duplicate = selected.some(
      s =>
        normalizeTeamName(s.homeTeam) === normalizeTeamName(event.homeTeam) &&
        normalizeTeamName(s.awayTeam) === normalizeTeamName(event.awayTeam)
    );
    if (!duplicate) selected.push(event);
  }

  return selected.slice(0, 15);
}

export function eventsToMatches(events: LiveFootballEvent[]): Match[] {
  return events.map((event, idx) => {
    const names = kickoffInTurkey(event.kickoffIso);
    const leagueInfo = LEAGUE_LABELS[event.league || ''] || { league: event.league || 'Futbol', group: 'Diğer' };
    const odds = defaultOdds(event);
    return buildMatch({
      id: idx + 1,
      homeTeam: displayTeamName(event.homeTeam),
      awayTeam: displayTeamName(event.awayTeam),
      league: leagueInfo.league,
      matchDate: names.matchDate,
      matchTime: names.matchTime,
      odds,
      group: leagueInfo.group
    });
  });
}

export async function fetchWeeklyBulletin(now: Date = new Date()): Promise<{ matches: Match[]; meta: BulletinMeta } | null> {
  const events = await fetchLiveFootballEvents(now);
  const selected = selectWeeklyBulletinEvents(events, now);
  if (selected.length !== 15) return null;
  return {
    matches: eventsToMatches(selected),
    meta: buildBulletinMeta(now)
  };
}

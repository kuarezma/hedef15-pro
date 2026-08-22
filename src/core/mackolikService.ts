import { LiveMatchStatus, Match, MatchOdds, Outcome } from './types';
import { calculateImpliedProbabilities, getFavoriteOutcome } from './valueEngine';
import { isFinishedStatus, scoreToOutcome } from './matchStatus';
import { mergeLiveWithConfirmedOfficial } from './officialBoard';

export interface GoalEvent {
  id: string;
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  scoringTeam: string;
  scoringSide: 'home' | 'away';
  newScore: string;
  minute: number;
  timestamp: string;
}

/** Normalized live fixture from a public scoreboard (ESPN). */
export interface LiveFootballEvent {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: LiveMatchStatus['status'];
  minute: number;
  displayClock: string;
  kickoffIso: string;
  odds?: MatchOdds;
  league?: string;
}

const ESPN_LEAGUES = [
  'tur.1',
  'tur.2',
  'eng.1',
  'eng.community_shield',
  'fra.1',
  'esp.1',
  'ita.1',
  'ger.1',
  'ger.super_cup'
] as const;

const TEAM_ALIASES: Record<string, string> = {
  galatasaray: 'galatasaray',
  corum: 'corum',
  corumfk: 'corum',
  arcacorum: 'corum',
  arcacorumfk: 'corum',
  kasimpasa: 'kasimpasa',
  trabzonspor: 'trabzonspor',
  konyaspor: 'konyaspor',
  rizespor: 'rizespor',
  caykurrizespor: 'rizespor',
  gaziantep: 'gaziantep',
  gaziantepfk: 'gaziantep',
  alanyaspor: 'alanyaspor',
  genclerbirligi: 'genclerbirligi',
  fenerbahce: 'fenerbahce',
  basaksehir: 'basaksehir',
  istanbulbasaksehir: 'basaksehir',
  basaksehirfk: 'basaksehir',
  kocaelispor: 'kocaelispor',
  amed: 'amed',
  amedsfk: 'amed',
  amedsportif: 'amed',
  amedsportiffaaliyetler: 'amed',
  erzurum: 'erzurum',
  erzurumbb: 'erzurum',
  erzurumspor: 'erzurum',
  erzurumsporfk: 'erzurum',
  besiktas: 'besiktas',
  eyupspor: 'eyupspor',
  eyupsor: 'eyupspor',
  samsunspor: 'samsunspor',
  goztepe: 'goztepe',
  arsenal: 'arsenal',
  coventry: 'coventry',
  coventrycity: 'coventry',
  hull: 'hull',
  hullcity: 'hull',
  manchesterunited: 'manutd',
  manutd: 'manutd',
  manunited: 'manutd',
  espanyol: 'espanyol',
  realmadrid: 'realmadrid',
  newcastle: 'newcastle',
  newcastleunited: 'newcastle',
  liverpool: 'liverpool',
  rennes: 'rennes',
  staderennais: 'rennes',
  psg: 'psg',
  parissaintgermain: 'psg',
  elche: 'elche',
  barcelona: 'barcelona',
  barca: 'barcelona',
  athleticclub: 'athletic',
  athleticbilbao: 'athletic',
  sevilla: 'sevilla',
  villarreal: 'villarreal',
  osasuna: 'osasuna',
  levante: 'levante',
  celtavigo: 'celta',
  celta: 'celta',
  racingsantander: 'racing',
  lens: 'lens',
  rclens: 'lens',
  manchestercity: 'mancity',
  mancity: 'mancity',
  marseille: 'marseille',
  olympiquemarseille: 'marseille',
  om: 'marseille',
  strasbourg: 'strasbourg',
  racingstrasbourg: 'strasbourg',
  rcstrasbourg: 'strasbourg',
  betis: 'betis',
  realbetis: 'betis',
  sociedad: 'sociedad',
  realsociedad: 'sociedad',
  dortmund: 'dortmund',
  borussiadortmund: 'dortmund',
  bvb: 'dortmund',
  bayern: 'bayern',
  bayernmunich: 'bayern',
  bayernmunih: 'bayern',
  fcbayern: 'bayern',
  atletico: 'atletico',
  atleticomadrid: 'atletico',
  atlmadrid: 'atletico',
  torino: 'torino',
  milan: 'milan',
  acmilan: 'milan',
  rayo: 'rayo',
  rayovallecano: 'rayo'
};

/**
 * Folds Turkish characters and strips club suffixes so "Çaykur Rizespor" matches "Rizespor".
 */
export function normalizeTeamName(name: string): string {
  const folded = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');

  const stripped = folded
    .replace(/futbolkulubu/g, '')
    .replace(/sportiffaaliyetler/g, '')
    .replace(/(afc|sfc)$/g, '')
    .replace(/(fk|sk|as|cf|fc)$/g, '');

  return TEAM_ALIASES[stripped] || TEAM_ALIASES[folded] || stripped;
}

export function namesMatch(a: string, b: string): boolean {
  const ca = normalizeTeamName(a);
  const cb = normalizeTeamName(b);
  if (!ca || !cb) return false;
  if (ca === cb) return true;
  if (ca.length >= 5 && cb.length >= 5 && (ca.includes(cb) || cb.includes(ca))) return true;
  return false;
}

export function americanToDecimal(american: string | number | null | undefined): number | null {
  if (american === null || american === undefined || american === '') return null;
  const n = typeof american === 'number' ? american : Number(String(american).replace('+', '').trim());
  if (!Number.isFinite(n) || n === 0) return null;
  if (n > 0) return Number((1 + n / 100).toFixed(2));
  return Number((1 + 100 / Math.abs(n)).toFixed(2));
}

function favoriteMeta(odds: MatchOdds): { favoriteOutcome: Outcome; favoriteImpliedPct: number } {
  const implied = calculateImpliedProbabilities(odds);
  const favoriteOutcome = getFavoriteOutcome(odds);
  return {
    favoriteOutcome,
    favoriteImpliedPct: implied[favoriteOutcome]
  };
}

export function getInitialWeekendStatuses(matches: Match[]): LiveMatchStatus[] {
  return matches.map(m => {
    const fav = favoriteMeta(m.odds);
    return {
      matchId: m.id,
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      displayClock: '',
      status: 'SCHEDULED',
      currentOutcome: null,
      favoriteOutcome: fav.favoriteOutcome,
      favoriteImpliedPct: fav.favoriteImpliedPct,
      marketOdds: m.odds,
      matched: false
    };
  });
}

function formatEspnDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function espnDateWindow(now: Date = new Date()): string {
  const start = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  return `${formatEspnDate(start)}-${formatEspnDate(end)}`;
}

function parseMinute(displayClock: string, period: number, completed: boolean): number {
  if (completed) return 90;
  const match = String(displayClock || '').match(/(\d+)/);
  if (match) return Number(match[1]);
  if (period >= 2) return 45;
  return 0;
}

function mapEspnStatus(type: { name?: string; state?: string; completed?: boolean; shortDetail?: string } | undefined): LiveMatchStatus['status'] {
  const name = (type?.name || '').toUpperCase();
  const state = (type?.state || '').toLowerCase();
  const detail = (type?.shortDetail || '').toUpperCase();

  if (name.includes('POSTPONE') || detail.includes('POSTP')) return 'POSTPONED';
  if (type?.completed || name.includes('FULL_TIME') || name.includes('FINAL') || detail === 'FT') {
    return 'FINISHED';
  }
  if (name.includes('HALFTIME') || detail === 'HT') return 'HALFTIME';
  if (state === 'in' || name.includes('IN_PROGRESS') || name.includes('SECOND_HALF') || name.includes('FIRST_HALF')) {
    return 'LIVE';
  }
  if (state === 'post') return 'FINISHED';
  return 'SCHEDULED';
}

function extractMoneylineOdds(oddsList: unknown): MatchOdds | undefined {
  if (!Array.isArray(oddsList)) return undefined;
  for (const entry of oddsList) {
    if (!entry || typeof entry !== 'object') continue;
    const moneyline = (entry as { moneyline?: { home?: { close?: { odds?: string }; open?: { odds?: string } }; away?: { close?: { odds?: string }; open?: { odds?: string } }; draw?: { close?: { odds?: string }; open?: { odds?: string } } } }).moneyline;
    if (!moneyline) continue;
    const homeRaw = moneyline.home?.close?.odds ?? moneyline.home?.open?.odds;
    const awayRaw = moneyline.away?.close?.odds ?? moneyline.away?.open?.odds;
    const drawRaw = moneyline.draw?.close?.odds ?? moneyline.draw?.open?.odds;
    const home = americanToDecimal(homeRaw);
    const away = americanToDecimal(awayRaw);
    const draw = americanToDecimal(drawRaw);
    if (home && away && draw) {
      return { '1': home, 'X': draw, '2': away };
    }
  }
  return undefined;
}

export function parseEspnScoreboard(payload: unknown, leagueSlug?: string): LiveFootballEvent[] {
  const events = (payload as { events?: unknown[] })?.events;
  if (!Array.isArray(events)) return [];

  const mapped: LiveFootballEvent[] = [];
  for (const event of events) {
    const ev = event as {
      date?: string;
      competitions?: Array<{
        competitors?: Array<{
          homeAway?: string;
          score?: string | number;
          team?: { displayName?: string; shortDisplayName?: string; name?: string };
        }>;
        status?: {
          displayClock?: string;
          period?: number;
          type?: { name?: string; state?: string; completed?: boolean; shortDetail?: string; detail?: string };
        };
        odds?: unknown;
        startDate?: string;
      }>;
      status?: { displayClock?: string; period?: number; type?: { name?: string; state?: string; completed?: boolean; shortDetail?: string } };
    };

    const competition = ev.competitions?.[0];
    if (!competition) continue;

    const teams = competition.competitors || [];
    const home = teams.find(t => t.homeAway === 'home');
    const away = teams.find(t => t.homeAway === 'away');
    if (!home || !away) continue;

    const homeName = home.team?.displayName || home.team?.shortDisplayName || home.team?.name || '';
    const awayName = away.team?.displayName || away.team?.shortDisplayName || away.team?.name || '';
    const statusNode = competition.status || ev.status;
    const type = statusNode?.type;
    const status = mapEspnStatus(type);
    const displayClock = statusNode?.displayClock || type?.shortDetail || '';
    const minute = parseMinute(displayClock, statusNode?.period || 0, type?.completed === true || status === 'FINISHED');

    mapped.push({
      homeTeam: homeName,
      awayTeam: awayName,
      homeScore: Number(home.score || 0) || 0,
      awayScore: Number(away.score || 0) || 0,
      status,
      minute,
      displayClock: status === 'FINISHED' ? 'MS' : status === 'HALFTIME' ? 'Devre' : displayClock,
      kickoffIso: competition.startDate || ev.date || '',
      odds: extractMoneylineOdds(competition.odds),
      league: leagueSlug
    });
  }
  return mapped;
}

export function findMatchingEvent(
  homeTeam: string,
  awayTeam: string,
  events: LiveFootballEvent[]
): { event: LiveFootballEvent; swapped: boolean } | null {
  let best: { event: LiveFootballEvent; swapped: boolean; rank: number } | null = null;

  for (const event of events) {
    const homeHome = namesMatch(homeTeam, event.homeTeam);
    const awayAway = namesMatch(awayTeam, event.awayTeam);
    const homeAway = namesMatch(homeTeam, event.awayTeam);
    const awayHome = namesMatch(awayTeam, event.homeTeam);

    let rank = 0;
    let swapped = false;
    if (homeHome && awayAway) {
      rank = 2;
      swapped = false;
    } else if (homeAway && awayHome) {
      rank = 2;
      swapped = true;
    } else {
      continue;
    }

    if (!best || rank > best.rank) {
      best = { event, swapped, rank };
    }
  }

  return best ? { event: best.event, swapped: best.swapped } : null;
}

export function applyLiveEventsToMatches(
  matches: Match[],
  previousStatuses: LiveMatchStatus[],
  events: LiveFootballEvent[]
): { statuses: LiveMatchStatus[]; newGoals: GoalEvent[] } {
  const newGoals: GoalEvent[] = [];
  const usedEventKeys = new Set<string>();

  const statuses = matches.map((match, idx) => {
    const prev = previousStatuses.find(s => s.matchId === match.id) || previousStatuses[idx];
    const remaining = events.filter(e => !usedEventKeys.has(`${e.kickoffIso}|${e.homeTeam}|${e.awayTeam}`));
    const found = findMatchingEvent(match.homeTeam, match.awayTeam, remaining);

    const bulletinFav = favoriteMeta(match.odds);

    if (!found) {
      return {
        matchId: match.id,
        homeScore: prev?.matched ? prev.homeScore : 0,
        awayScore: prev?.matched ? prev.awayScore : 0,
        minute: prev?.matched ? prev.minute : 0,
        displayClock: prev?.matched ? prev.displayClock : '',
        status: prev?.matched ? prev.status : 'SCHEDULED',
        currentOutcome: prev?.matched ? prev.currentOutcome : null,
        favoriteOutcome: prev?.favoriteOutcome || bulletinFav.favoriteOutcome,
        favoriteImpliedPct: prev?.favoriteImpliedPct || bulletinFav.favoriteImpliedPct,
        marketOdds: prev?.marketOdds || match.odds,
        kickoffIso: prev?.kickoffIso,
        matched: prev?.matched ?? false
      } satisfies LiveMatchStatus;
    }

    usedEventKeys.add(`${found.event.kickoffIso}|${found.event.homeTeam}|${found.event.awayTeam}`);

    const homeScore = found.swapped ? found.event.awayScore : found.event.homeScore;
    const awayScore = found.swapped ? found.event.homeScore : found.event.awayScore;
    const started = found.event.status === 'LIVE' || found.event.status === 'HALFTIME' || found.event.status === 'FINISHED';
    const currentOutcome = started ? scoreToOutcome(homeScore, awayScore) : null;
    const marketOdds = match.odds;
    const fav = favoriteMeta(marketOdds);

    if (prev?.matched && started) {
      const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      if (homeScore > (prev.homeScore || 0)) {
        newGoals.push({
          id: `goal_${match.id}_h_${homeScore}_${Date.now()}`,
          matchId: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          scoringTeam: match.homeTeam,
          scoringSide: 'home',
          newScore: `${homeScore} - ${awayScore}`,
          minute: found.event.minute,
          timestamp
        });
      }
      if (awayScore > (prev.awayScore || 0)) {
        newGoals.push({
          id: `goal_${match.id}_a_${awayScore}_${Date.now()}`,
          matchId: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          scoringTeam: match.awayTeam,
          scoringSide: 'away',
          newScore: `${homeScore} - ${awayScore}`,
          minute: found.event.minute,
          timestamp
        });
      }
    }

    return {
      matchId: match.id,
      homeScore,
      awayScore,
      minute: found.event.minute,
      displayClock: found.event.displayClock,
      status: found.event.status,
      currentOutcome,
      favoriteOutcome: fav.favoriteOutcome,
      favoriteImpliedPct: fav.favoriteImpliedPct,
      marketOdds,
      kickoffIso: found.event.kickoffIso,
      matched: true
    } satisfies LiveMatchStatus;
  });

  return { statuses, newGoals };
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchLiveFootballEvents(now: Date = new Date()): Promise<LiveFootballEvent[]> {
  const dates = espnDateWindow(now);
  const settled = await Promise.allSettled(
    ESPN_LEAGUES.map(async league => {
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=${dates}`;
      const payload = await fetchJson(url);
      return parseEspnScoreboard(payload, league);
    })
  );

  const events: LiveFootballEvent[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      events.push(...result.value);
    }
  }
  return events;
}

/**
 * Pulls live/finished scores from public ESPN scoreboards (CORS-enabled) and
 * maps them onto the 15-match Spor Toto bulletin. Never invents goals.
 */
export async function fetchLiveScoresFromMackolik(
  currentMatches: Match[],
  previousStatuses: LiveMatchStatus[]
): Promise<{ statuses: LiveMatchStatus[]; newGoals: GoalEvent[] }> {
  const events = await fetchLiveFootballEvents();
  if (events.length === 0) {
    const fallback = previousStatuses.length === currentMatches.length
      ? previousStatuses
      : getInitialWeekendStatuses(currentMatches);
    return {
      statuses: mergeLiveWithConfirmedOfficial(currentMatches, fallback),
      newGoals: []
    };
  }
  const applied = applyLiveEventsToMatches(currentMatches, previousStatuses, events);
  return {
    statuses: mergeLiveWithConfirmedOfficial(currentMatches, applied.statuses),
    newGoals: applied.newGoals
  };
}

export function allMatchesFinished(statuses: LiveMatchStatus[]): boolean {
  return statuses.length === 15 && statuses.every(isFinishedStatus);
}

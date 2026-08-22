import { Match, Outcome } from '../core/types';
import { buildMatch } from './matchBuilder';

export const CURRENT_BULLETIN_ID = '2026_w2_official_st15';

export interface OfficialScore {
  homeScore: number | null;
  awayScore: number | null;
  outcome: Outcome | null;
  status: 'FINISHED' | 'POSTPONED';
}

export interface OfficialPrizeTier {
  winners: number | null;
  prizePerWinnerTL: number | null;
  rolledOver: boolean;
  note?: string;
}

export interface OfficialPrizeBoard {
  sourceNote: string;
  announced: boolean;
  totalTurnoverTL: number | null;
  rolloverFromPreviousTL: number;
  rolloverToNextWeekTL: number | null;
  weekLabel: string;
  tier15: OfficialPrizeTier;
  tier14: OfficialPrizeTier;
  tier13: OfficialPrizeTier;
  tier12: OfficialPrizeTier;
}

export interface OfficialWeekBulletin {
  id: string;
  weekKey: string;
  label: string;
  isCurrent: boolean;
  matches: Match[];
  /** Only matches whose official MS (or postpone) is already published. */
  officialScores: Array<OfficialScore | null>;
  prize: OfficialPrizeBoard;
}

/**
 * 2026/2027 Sezonu 2. Hafta — resmi Spor Toto 15'li sıra
 * (Misli / Hürriyet 21.08.2026 duyurusu).
 */
export const WEEK2_MATCHES: Match[] = [
  buildMatch({
    id: 1,
    homeTeam: 'Erzurumspor FK',
    awayTeam: 'Galatasaray',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cuma',
    matchTime: '21:30',
    odds: { '1': 8.50, 'X': 5.20, '2': 1.28 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 2,
    homeTeam: 'Olympique Marseille',
    awayTeam: 'Strasbourg',
    league: 'Ligue 1',
    matchDate: 'Cuma',
    matchTime: '21:45',
    odds: { '1': 1.50, 'X': 4.20, '2': 6.00 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 3,
    homeTeam: 'Real Betis',
    awayTeam: 'Real Sociedad',
    league: 'La Liga',
    matchDate: 'Cuma',
    matchTime: '22:00',
    odds: { '1': 2.25, 'X': 3.20, '2': 3.20 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 4,
    homeTeam: 'Çaykur Rizespor',
    awayTeam: 'Samsunspor',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cumartesi',
    matchTime: '19:00',
    odds: { '1': 2.40, 'X': 3.20, '2': 2.90 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 5,
    homeTeam: 'Çorum FK',
    awayTeam: 'Kasımpaşa',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cumartesi',
    matchTime: '19:00',
    odds: { '1': 2.30, 'X': 3.40, '2': 3.05 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 6,
    homeTeam: 'Fenerbahçe',
    awayTeam: 'Konyaspor',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cumartesi',
    matchTime: '21:30',
    odds: { '1': 1.32, 'X': 5.50, '2': 8.50 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 7,
    homeTeam: 'Borussia Dortmund',
    awayTeam: 'Bayern Münih',
    league: 'Almanya Süper Kupası',
    matchDate: 'Cumartesi',
    matchTime: '21:30',
    odds: { '1': 2.70, 'X': 3.40, '2': 2.40 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 8,
    homeTeam: 'Atlético Madrid',
    awayTeam: 'Villarreal',
    league: 'La Liga',
    matchDate: 'Pazar',
    matchTime: '18:00',
    odds: { '1': 1.85, 'X': 3.50, '2': 4.20 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 9,
    homeTeam: 'Newcastle United',
    awayTeam: 'Liverpool',
    league: 'Premier League',
    matchDate: 'Pazar',
    matchTime: '18:30',
    odds: { '1': 3.70, 'X': 4.00, '2': 1.91 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 10,
    homeTeam: 'Eyüpspor',
    awayTeam: 'Gaziantep FK',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazar',
    matchTime: '19:00',
    odds: { '1': 2.90, 'X': 3.10, '2': 2.50 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 11,
    homeTeam: 'Trabzonspor',
    awayTeam: 'Başakşehir FK',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazar',
    matchTime: '19:00',
    odds: { '1': 2.10, 'X': 3.50, '2': 3.20 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 12,
    homeTeam: 'Alanyaspor',
    awayTeam: 'Beşiktaş',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazar',
    matchTime: '21:30',
    odds: { '1': 3.75, 'X': 3.60, '2': 1.91 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 13,
    homeTeam: 'Göztepe',
    awayTeam: 'Gençlerbirliği',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazar',
    matchTime: '21:30',
    odds: { '1': 2.10, 'X': 3.30, '2': 3.40 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 14,
    homeTeam: 'Torino',
    awayTeam: 'AC Milan',
    league: 'Serie A',
    matchDate: 'Pazar',
    matchTime: '21:45',
    odds: { '1': 3.80, 'X': 3.40, '2': 1.95 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 15,
    homeTeam: 'Kocaelispor',
    awayTeam: 'Amed Sportif',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazartesi',
    matchTime: '21:30',
    odds: { '1': 2.20, 'X': 3.20, '2': 3.30 },
    group: 'Süper Lig'
  })
];

/**
 * Cuma günü biten 2. hafta maçlarının yayımlanmış MS skorları.
 * Canlı skor kaynağı susarsa uydurma 0-0 yerine bunlar kullanılır.
 */
export const WEEK2_CONFIRMED_MS: Record<number, OfficialScore> = {
  1: { homeScore: 0, awayScore: 4, outcome: '2', status: 'FINISHED' },
  2: { homeScore: 4, awayScore: 0, outcome: '1', status: 'FINISHED' },
  3: { homeScore: 1, awayScore: 0, outcome: '1', status: 'FINISHED' }
};

export const WEEK1_MATCHES: Match[] = [
  buildMatch({
    id: 1,
    homeTeam: 'Galatasaray',
    awayTeam: 'Çorum FK',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cuma',
    matchTime: '21:30',
    odds: { '1': 1.25, 'X': 5.20, '2': 8.50 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 2,
    homeTeam: 'Kasımpaşa',
    awayTeam: 'Trabzonspor',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cumartesi',
    matchTime: '19:00',
    odds: { '1': 3.10, 'X': 3.40, '2': 2.05 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 3,
    homeTeam: 'Konyaspor',
    awayTeam: 'Çaykur Rizespor',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cumartesi',
    matchTime: '19:00',
    odds: { '1': 2.20, 'X': 3.25, '2': 2.95 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 4,
    homeTeam: 'Gaziantep FK',
    awayTeam: 'Alanyaspor',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cumartesi',
    matchTime: '21:45',
    odds: { '1': 2.35, 'X': 3.30, '2': 2.75 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 5,
    homeTeam: 'Gençlerbirliği',
    awayTeam: 'Fenerbahçe',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cumartesi',
    matchTime: '21:45',
    odds: { '1': 6.80, 'X': 4.50, '2': 1.38 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 6,
    homeTeam: 'Başakşehir FK',
    awayTeam: 'Kocaelispor',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazar',
    matchTime: '19:00',
    odds: { '1': 1.65, 'X': 3.65, '2': 4.60 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 7,
    homeTeam: 'Amed Sportif',
    awayTeam: 'Erzurumspor FK',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazar',
    matchTime: '19:00',
    odds: { '1': 1.95, 'X': 3.20, '2': 3.60 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 8,
    homeTeam: 'Beşiktaş',
    awayTeam: 'Eyüpspor',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazar',
    matchTime: '21:45',
    odds: { '1': 1.55, 'X': 3.90, '2': 5.20 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 9,
    homeTeam: 'Samsunspor',
    awayTeam: 'Göztepe',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazartesi',
    matchTime: '21:00',
    odds: { '1': 2.10, 'X': 3.20, '2': 3.25 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 10,
    homeTeam: 'Arsenal',
    awayTeam: 'Manchester City',
    league: 'İngiltere Community Shield',
    matchDate: 'Pazar',
    matchTime: '17:00',
    odds: { '1': 2.40, 'X': 3.40, '2': 2.70 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 11,
    homeTeam: 'RC Lens',
    awayTeam: 'Paris Saint Germain',
    league: 'Fransa Süper Kupası',
    matchDate: 'Pazar',
    matchTime: '21:45',
    odds: { '1': 4.20, 'X': 3.80, '2': 1.72 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 12,
    homeTeam: 'Sevilla',
    awayTeam: 'Rayo Vallecano',
    league: 'La Liga',
    matchDate: 'Cumartesi',
    matchTime: '22:30',
    odds: { '1': 1.90, 'X': 3.35, '2': 3.85 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 13,
    homeTeam: 'Racing Santander',
    awayTeam: 'Villarreal',
    league: 'La Liga',
    matchDate: 'Pazar',
    matchTime: '19:00',
    odds: { '1': 4.10, 'X': 3.60, '2': 1.80 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 14,
    homeTeam: 'Espanyol',
    awayTeam: 'Levante',
    league: 'La Liga',
    matchDate: 'Pazar',
    matchTime: '20:30',
    odds: { '1': 2.05, 'X': 3.25, '2': 3.45 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 15,
    homeTeam: 'Celta Vigo',
    awayTeam: 'Osasuna',
    league: 'La Liga',
    matchDate: 'Pazar',
    matchTime: '22:00',
    odds: { '1': 2.00, 'X': 3.30, '2': 3.60 },
    group: 'Avrupa'
  })
];

/** 1. hafta resmi MS — Galatasaray-Çorum 2-2, uydurma 3-0 değil. */
export const WEEK1_OFFICIAL_SCORES: Array<OfficialScore | null> = [
  { homeScore: 2, awayScore: 2, outcome: 'X', status: 'FINISHED' },
  { homeScore: 1, awayScore: 1, outcome: 'X', status: 'FINISHED' },
  { homeScore: 0, awayScore: 1, outcome: '2', status: 'FINISHED' },
  { homeScore: 1, awayScore: 1, outcome: 'X', status: 'FINISHED' },
  { homeScore: 2, awayScore: 1, outcome: '1', status: 'FINISHED' },
  { homeScore: 2, awayScore: 0, outcome: '1', status: 'FINISHED' },
  { homeScore: 3, awayScore: 0, outcome: '1', status: 'FINISHED' },
  { homeScore: 1, awayScore: 0, outcome: '1', status: 'FINISHED' },
  { homeScore: 3, awayScore: 3, outcome: 'X', status: 'FINISHED' },
  { homeScore: 3, awayScore: 0, outcome: '1', status: 'FINISHED' },
  { homeScore: 1, awayScore: 0, outcome: '1', status: 'FINISHED' },
  { homeScore: 2, awayScore: 1, outcome: '1', status: 'FINISHED' },
  { homeScore: 2, awayScore: 2, outcome: 'X', status: 'FINISHED' },
  { homeScore: 3, awayScore: 0, outcome: '1', status: 'FINISHED' },
  { homeScore: null, awayScore: null, outcome: null, status: 'POSTPONED' }
];

export const WEEK1_PRIZE: OfficialPrizeBoard = {
  sourceNote: '1. hafta açıklanan resmi ikramiye (Misli / basın). 15 bilen çıkmadı.',
  announced: true,
  totalTurnoverTL: null,
  rolloverFromPreviousTL: 0,
  rolloverToNextWeekTL: 30149380,
  weekLabel: '1. Hafta',
  tier15: {
    winners: 0,
    prizePerWinnerTL: null,
    rolledOver: true,
    note: '15 bilen olmadığından 30.149.380 TL 2. haftaya devretti'
  },
  tier14: { winners: 8, prizePerWinnerTL: 2153527, rolledOver: false },
  tier13: { winners: 210, prizePerWinnerTL: 82039, rolledOver: false },
  tier12: { winners: null, prizePerWinnerTL: null, rolledOver: false, note: 'Resmi 12 bilen rakamı yayımlanmadı' }
};

export const WEEK2_PRIZE: OfficialPrizeBoard = {
  sourceNote: '2. hafta henüz kapanmadı. Kazanan sayıları uydurulmaz.',
  announced: false,
  totalTurnoverTL: null,
  rolloverFromPreviousTL: 30149380,
  rolloverToNextWeekTL: null,
  weekLabel: '2. Hafta',
  tier15: {
    winners: null,
    prizePerWinnerTL: null,
    rolledOver: false,
    note: '1. haftadan 30.149.380 TL devir. Kazananlar hafta bitince açıklanır'
  },
  tier14: { winners: null, prizePerWinnerTL: null, rolledOver: false },
  tier13: { winners: null, prizePerWinnerTL: null, rolledOver: false },
  tier12: { winners: null, prizePerWinnerTL: null, rolledOver: false }
};

function scoresForWeek2(): Array<OfficialScore | null> {
  return WEEK2_MATCHES.map(m => WEEK2_CONFIRMED_MS[m.id] ?? null);
}

export const OFFICIAL_WEEKS: OfficialWeekBulletin[] = [
  {
    id: '2026_w2',
    weekKey: '2026_w2',
    label: '2026/2027 Sezonu 2. Hafta (Güncel)',
    isCurrent: true,
    matches: WEEK2_MATCHES,
    officialScores: scoresForWeek2(),
    prize: WEEK2_PRIZE
  },
  {
    id: '2026_w1',
    weekKey: '2026_w1',
    label: '2026/2027 Sezonu 1. Hafta (Arşiv)',
    isCurrent: false,
    matches: WEEK1_MATCHES,
    officialScores: WEEK1_OFFICIAL_SCORES,
    prize: WEEK1_PRIZE
  }
];

export function getOfficialWeek(weekKey: string): OfficialWeekBulletin {
  return OFFICIAL_WEEKS.find(w => w.weekKey === weekKey) ?? OFFICIAL_WEEKS[0];
}

export function sameFixtureSet(saved: Match[], official: Match[]): boolean {
  if (saved.length !== official.length) return false;
  return official.every((m, i) => saved[i]?.homeTeam === m.homeTeam && saved[i]?.awayTeam === m.awayTeam);
}

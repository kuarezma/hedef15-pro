import { Match, MatchOdds, MatchProbabilities } from '../core/types';
import { calculateImpliedProbabilities, getFavoriteOutcome } from '../core/valueEngine';

function roundDistribution(implied: MatchProbabilities): MatchProbabilities {
  const raw = {
    '1': Math.round(implied['1']),
    'X': Math.round(implied['X']),
    '2': Math.round(implied['2'])
  };
  const drift = 100 - (raw['1'] + raw['X'] + raw['2']);
  raw['1'] += drift;
  return raw;
}

function peakPublicTowardFavorite(implied: MatchProbabilities, odds: MatchOdds): MatchProbabilities {
  const favorite = getFavoriteOutcome(odds);
  const peaked = { ...implied };
  const takeFrom = (['1', 'X', '2'] as const).filter(o => o !== favorite);
  peaked[favorite] = Math.min(92, implied[favorite] + 8);
  peaked[takeFrom[0]] = Math.max(4, implied[takeFrom[0]] - 5);
  peaked[takeFrom[1]] = 100 - peaked[favorite] - peaked[takeFrom[0]];
  return roundDistribution(peaked);
}

function buildMatch(input: {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchDate: string;
  matchTime: string;
  odds: MatchOdds;
  group: string;
}): Match {
  const implied = calculateImpliedProbabilities(input.odds);
  const aiPicks = roundDistribution(implied);
  const publicPicks = peakPublicTowardFavorite(implied, input.odds);
  const favorite = getFavoriteOutcome(input.odds);

  return {
    id: input.id,
    order: input.id,
    homeTeam: input.homeTeam,
    awayTeam: input.awayTeam,
    league: input.league,
    matchDate: input.matchDate,
    matchTime: input.matchTime,
    odds: input.odds,
    publicPicks,
    aiPicks,
    userPicks: {
      '1': favorite === '1',
      'X': favorite === 'X',
      '2': favorite === '2'
    },
    userPercents: { ...aiPicks },
    group: input.group
  };
}

/**
 * 2026/2027 Sezonu 2. Hafta — güncel Spor Toto tarzı 15 maçlık bülten.
 * Skorlar canlı ESPN skor tablosundan gelir; burada yalnızca fikstür ve iddaa oranları tutulur.
 */
export const INITIAL_MATCHES: Match[] = [
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
    homeTeam: 'Çaykur Rizespor',
    awayTeam: 'Samsunspor',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cumartesi',
    matchTime: '19:00',
    odds: { '1': 2.40, 'X': 3.20, '2': 2.90 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 3,
    homeTeam: 'Çorum FK',
    awayTeam: 'Kasımpaşa',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cumartesi',
    matchTime: '19:00',
    odds: { '1': 2.30, 'X': 3.40, '2': 3.05 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 4,
    homeTeam: 'Fenerbahçe',
    awayTeam: 'Konyaspor',
    league: 'Trendyol Süper Lig',
    matchDate: 'Cumartesi',
    matchTime: '21:30',
    odds: { '1': 1.32, 'X': 5.50, '2': 8.50 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 5,
    homeTeam: 'Eyüpspor',
    awayTeam: 'Gaziantep FK',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazar',
    matchTime: '19:00',
    odds: { '1': 2.90, 'X': 3.10, '2': 2.50 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 6,
    homeTeam: 'Trabzonspor',
    awayTeam: 'Başakşehir FK',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazar',
    matchTime: '19:00',
    odds: { '1': 2.10, 'X': 3.50, '2': 3.20 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 7,
    homeTeam: 'Alanyaspor',
    awayTeam: 'Beşiktaş',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazar',
    matchTime: '21:30',
    odds: { '1': 3.75, 'X': 3.60, '2': 1.91 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 8,
    homeTeam: 'Göztepe',
    awayTeam: 'Gençlerbirliği',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazar',
    matchTime: '21:30',
    odds: { '1': 2.10, 'X': 3.30, '2': 3.40 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 9,
    homeTeam: 'Kocaelispor',
    awayTeam: 'Amed Sportif',
    league: 'Trendyol Süper Lig',
    matchDate: 'Pazartesi',
    matchTime: '21:30',
    odds: { '1': 2.20, 'X': 3.20, '2': 3.30 },
    group: 'Süper Lig'
  }),
  buildMatch({
    id: 10,
    homeTeam: 'Arsenal',
    awayTeam: 'Coventry City',
    league: 'Premier League',
    matchDate: 'Cuma',
    matchTime: '22:00',
    odds: { '1': 1.22, 'X': 6.50, '2': 13.00 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 11,
    homeTeam: 'Hull City',
    awayTeam: 'Manchester United',
    league: 'Premier League',
    matchDate: 'Cumartesi',
    matchTime: '14:30',
    odds: { '1': 8.50, 'X': 5.00, '2': 1.37 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 12,
    homeTeam: 'Espanyol',
    awayTeam: 'Real Madrid',
    league: 'La Liga',
    matchDate: 'Cumartesi',
    matchTime: '22:30',
    odds: { '1': 7.00, 'X': 4.70, '2': 1.43 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 13,
    homeTeam: 'Newcastle United',
    awayTeam: 'Liverpool',
    league: 'Premier League',
    matchDate: 'Pazar',
    matchTime: '18:30',
    odds: { '1': 3.70, 'X': 4.00, '2': 1.91 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 14,
    homeTeam: 'Stade Rennais',
    awayTeam: 'Paris Saint Germain',
    league: 'Ligue 1',
    matchDate: 'Pazar',
    matchTime: '21:45',
    odds: { '1': 5.50, 'X': 4.20, '2': 1.55 },
    group: 'Avrupa'
  }),
  buildMatch({
    id: 15,
    homeTeam: 'Elche',
    awayTeam: 'Barcelona',
    league: 'La Liga',
    matchDate: 'Pazar',
    matchTime: '22:30',
    odds: { '1': 8.50, 'X': 5.75, '2': 1.32 },
    group: 'Avrupa'
  })
];

export const INITIAL_FILTERS = {
  enabled: true,
  count1: [4, 11] as [number, number],
  countX: [1, 6] as [number, number],
  count2: [1, 6] as [number, number],
  surpriseCount: [1, 7] as [number, number],
  maxConsecutive1: 4,
  maxConsecutiveX: 3,
  maxConsecutive2: 3,
  signChanges: [4, 12] as [number, number],
  groupFilters: [
    {
      groupId: 'super_lig',
      groupName: 'Süper Lig (Maç 1-9)',
      matchIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      min1: 3,
      max1: 8,
      minX: 0,
      maxX: 4,
      min2: 0,
      max2: 4,
      minSurprise: 0,
      maxSurprise: 3,
      enabled: false
    },
    {
      groupId: 'avrupa',
      groupName: 'Avrupa Ligleri (Maç 10-15)',
      matchIds: [10, 11, 12, 13, 14, 15],
      min1: 1,
      max1: 5,
      minX: 0,
      maxX: 3,
      min2: 1,
      max2: 4,
      minSurprise: 0,
      maxSurprise: 3,
      enabled: false
    }
  ]
};

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

export function buildMatch(input: {
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

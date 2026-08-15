import { Match, Outcome, ValueBetAnalysis } from './types';

/**
 * AI Value Arbitrage & Odds Discrepancy Engine.
 * Finds outcomes where the public under-bets relative to true mathematical probability.
 */

export function calculateImpliedProbabilities(odds: { '1': number; 'X': number; '2': number }): { '1': number; 'X': number; '2': number } {
  const o1 = odds['1'] > 1 ? 1 / odds['1'] : 0;
  const oX = odds['X'] > 1 ? 1 / odds['X'] : 0;
  const o2 = odds['2'] > 1 ? 1 / odds['2'] : 0;
  const total = o1 + oX + o2;

  if (total <= 0) return { '1': 33.3, 'X': 33.3, '2': 33.3 };

  return {
    '1': Number(((o1 / total) * 100).toFixed(1)),
    'X': Number(((oX / total) * 100).toFixed(1)),
    '2': Number(((o2 / total) * 100).toFixed(1))
  };
}

export function analyzeValueBetsForMatch(match: Match): ValueBetAnalysis[] {
  const implied = calculateImpliedProbabilities(match.odds);
  const outcomes: Outcome[] = ['1', 'X', '2'];
  const results: ValueBetAnalysis[] = [];

  for (const out of outcomes) {
    const marketP = implied[out];
    const publicP = match.publicPicks[out] || 33.3;
    const ratio = publicP > 0 ? Number((marketP / publicP).toFixed(2)) : 1.0;

    let recommendation: 'STRONG_VALUE' | 'VALUE' | 'FAIR' | 'OVERPRICED' = 'FAIR';
    let rationale = 'Piyasa olasılığı ile halk tercihi dengeli.';

    if (ratio >= 1.25 && marketP >= 20) {
      recommendation = 'STRONG_VALUE';
      rationale = `Büyük Değer (Value)! Piyasa %${marketP} şans verirken halk sadece %${publicP} oynamış. İkramiye çarpanı çok yüksek!`;
    } else if (ratio >= 1.10) {
      recommendation = 'VALUE';
      rationale = `Pozitif Beklenen Değer (+EV). Halk bu sonuca hak ettiğinden daha az yönelmiş.`;
    } else if (ratio <= 0.75) {
      recommendation = 'OVERPRICED';
      rationale = `Halk Tuzağı (Şişirilmiş Tercih). Halk %${publicP} yüklenmiş ancak gerçek ihtimal %${marketP}. Gelirse ikramiye erir.`;
    }

    results.push({
      matchId: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      outcome: out,
      marketImpliedProb: marketP,
      publicPickProb: publicP,
      valueRatio: ratio,
      recommendation,
      rationale
    });
  }

  return results;
}

export function analyzeAllMatches(matches: Match[]): ValueBetAnalysis[] {
  return matches.flatMap(analyzeValueBetsForMatch);
}

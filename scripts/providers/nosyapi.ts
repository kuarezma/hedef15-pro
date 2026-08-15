import type { BulletinPayload, LiveScorePayload } from './types';
import { mapExternalRowToMatch, gameResultToOutcome } from './mapMatch';

const BASE = 'https://www.nosyapi.com/apiv2/service';

interface NosyResponse {
  status: string;
  data?: Record<string, unknown>[];
  message?: string;
}

export async function fetchFromNosyApi(apiKey: string): Promise<{ bulletin: BulletinPayload; live: LiveScorePayload } | null> {
  const url = `${BASE}/bettable-matches/sporToto?apiKey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Hedef15Pro-Sync/1.0' }
  });

  if (!res.ok) {
    console.warn(`[sync] NosyAPI HTTP ${res.status}`);
    return null;
  }

  const json = (await res.json()) as NosyResponse;
  if (json.status !== 'success' || !Array.isArray(json.data) || json.data.length < 15) {
    console.warn('[sync] NosyAPI geçersiz yanıt:', json.message ?? 'bilinmeyen');
    return null;
  }

  const rows = json.data.slice(0, 15);
  const matches = rows.map((row, idx) => mapExternalRowToMatch(row, idx));

  const now = new Date();
  const week = getWeekNumber(now);

  const bulletin: BulletinPayload = {
    week,
    season: `${now.getFullYear()}-${String(now.getFullYear() + 1).slice(-2)}`,
    updatedAt: now.toISOString(),
    source: 'NosyAPI (bettable-matches/sporToto)',
    matches
  };

  const live: LiveScorePayload = {
    updatedAt: now.toISOString(),
    source: 'NosyAPI (GameResult/LiveStatus)',
    matches: rows.map((row, idx) => {
      const liveStatus = Number(row.LiveStatus ?? 0);
      const gameResult = Number(row.GameResult ?? row.Result ?? 0);
      const outcome = gameResultToOutcome(gameResult);

      let status: LiveScorePayload['matches'][0]['status'] = 'SCHEDULED';
      let minute = 0;
      let homeScore = 0;
      let awayScore = 0;

      if (liveStatus === 2 || gameResult > 0) {
        status = 'FINISHED';
        minute = 90;
        if (outcome === '1') homeScore = 1;
        else if (outcome === '2') awayScore = 1;
      } else if (liveStatus === 1) {
        status = 'LIVE';
        minute = 45;
      }

      return {
        matchId: matches[idx].id,
        homeScore,
        awayScore,
        minute,
        status,
        currentOutcome: outcome ?? 'X'
      };
    })
  };

  return { bulletin, live };
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

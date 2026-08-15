import type { BulletinPayload, LiveScorePayload } from './types';
import { mapExternalRowToMatch } from './mapMatch';

export async function fetchBulletinFromUrl(url: string): Promise<BulletinPayload | null> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Hedef15Pro-Sync/1.0' }
  });
  if (!res.ok) return null;

  const data = (await res.json()) as BulletinPayload | { matches: Record<string, unknown>[] };
  if ('matches' in data && Array.isArray(data.matches)) {
    const payload = data as BulletinPayload;
    if (payload.matches.length === 15 && 'week' in payload) {
      return payload;
    }
    const now = new Date();
    return {
      week: getWeekNumber(now),
      season: `${now.getFullYear()}-${String(now.getFullYear() + 1).slice(-2)}`,
      updatedAt: now.toISOString(),
      source: url,
      matches: data.matches.slice(0, 15).map((row, idx) => mapExternalRowToMatch(row, idx))
    };
  }
  return null;
}

export async function fetchLiveFromUrl(url: string): Promise<LiveScorePayload | null> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Hedef15Pro-Sync/1.0' }
  });
  if (!res.ok) return null;
  const data = (await res.json()) as LiveScorePayload;
  if (!data.matches || !Array.isArray(data.matches)) return null;
  return { ...data, updatedAt: new Date().toISOString() };
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

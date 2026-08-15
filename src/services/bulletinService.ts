import { Match } from '../core/types';
import { INITIAL_MATCHES } from '../data/sampleBulletin';

const CACHE_KEY = 'hedef15_bulletin_cache_v1';
const CACHE_TTL_MS = 15 * 60 * 1000;

export interface BulletinPayload {
  week: number;
  season: string;
  updatedAt: string;
  source: string;
  matches: Match[];
}

interface CachedBulletin {
  fetchedAt: number;
  payload: BulletinPayload;
}

const BULLETIN_URL = '/bulletin/current.json';
const REMOTE_BULLETIN_URL = import.meta.env.VITE_BULLETIN_REMOTE_URL as string | undefined;

function bulletinUrls(): string[] {
  const urls: string[] = [];
  if (REMOTE_BULLETIN_URL) urls.push(REMOTE_BULLETIN_URL);
  urls.push(BULLETIN_URL);
  return urls;
}

async function fetchJsonFromUrls<T>(urls: string[]): Promise<T> {
  let lastError: unknown;
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

function normalizeMatches(raw: Match[]): Match[] {
  if (!Array.isArray(raw) || raw.length !== 15) {
    throw new Error('Bülten 15 maç içermelidir');
  }
  return raw.map((m, idx) => ({
    ...m,
    id: m.id ?? idx + 1,
    order: m.order ?? idx + 1,
    userPicks: m.userPicks ?? { '1': true, 'X': false, '2': false },
    userPercents: m.userPercents ?? { '1': 34, 'X': 33, '2': 33 }
  }));
}

function readCache(): CachedBulletin | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedBulletin;
  } catch {
    return null;
  }
}

function writeCache(payload: BulletinPayload): void {
  try {
    const cached: CachedBulletin = { fetchedAt: Date.now(), payload };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function getCachedBulletin(): BulletinPayload | null {
  const cached = readCache();
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;
  return cached.payload;
}

export async function fetchBulletin(forceRefresh = false): Promise<BulletinPayload> {
  if (!forceRefresh) {
    const cached = getCachedBulletin();
    if (cached) return cached;
  }

  try {
    const data = await fetchJsonFromUrls<BulletinPayload>(bulletinUrls());
    data.matches = normalizeMatches(data.matches);
    writeCache(data);
    return data;
  } catch (err) {
    console.warn('[Hedef15] Bülten API erişilemedi, örnek bülten kullanılıyor:', err);
    const fallback: BulletinPayload = {
      week: 12,
      season: '2025-26',
      updatedAt: new Date().toISOString(),
      source: 'sampleBulletin (offline fallback)',
      matches: INITIAL_MATCHES
    };
    return fallback;
  }
}

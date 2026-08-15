/**
 * Bülten ve canlı skor JSON dosyalarını senkronize eder.
 *
 * Kullanım:
 *   NOSYAPI_KEY=xxx npm run sync:data
 *   BULLETIN_API_URL=https://... npm run sync:data
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_MATCHES } from '../src/data/sampleBulletin.ts';
import { fetchFromNosyApi } from './providers/nosyapi.ts';
import { fetchBulletinFromUrl, fetchLiveFromUrl } from './providers/customUrl.ts';
import type { BulletinPayload, LiveScorePayload, SyncResult } from './providers/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BULLETIN_PATH = resolve(ROOT, 'public/bulletin/current.json');
const LIVE_PATH = resolve(ROOT, 'public/live/scores.json');

async function loadExistingBulletin(): Promise<BulletinPayload | null> {
  try {
    if (!existsSync(BULLETIN_PATH)) return null;
    return JSON.parse(readFileSync(BULLETIN_PATH, 'utf-8')) as BulletinPayload;
  } catch {
    return null;
  }
}

function buildFallback(): SyncResult {
  const now = new Date();
  const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 86400000));
  return {
    bulletin: {
      week,
      season: `${now.getFullYear()}-${String(now.getFullYear() + 1).slice(-2)}`,
      updatedAt: now.toISOString(),
      source: 'sampleBulletin (fallback — API anahtarı veya URL tanımlayın)',
      matches: INITIAL_MATCHES
    },
    live: {
      updatedAt: now.toISOString(),
      source: 'sample (no live feed)',
      matches: INITIAL_MATCHES.map(m => ({
        matchId: m.id,
        homeScore: 0,
        awayScore: 0,
        minute: 0,
        status: 'SCHEDULED' as const
      }))
    }
  };
}

async function sync(): Promise<SyncResult> {
  const nosyKey = process.env.NOSYAPI_KEY ?? process.env.NOSY_API_KEY;
  const bulletinUrl = process.env.BULLETIN_API_URL;
  const liveUrl = process.env.LIVE_SCORES_API_URL;
  const existing = await loadExistingBulletin();

  if (nosyKey) {
    console.log('[sync] NosyAPI deneniyor…');
    const result = await fetchFromNosyApi(nosyKey);
    if (result) {
      console.log('[sync] NosyAPI başarılı —', result.bulletin.matches.length, 'maç');
      return result;
    }
  }

  if (bulletinUrl) {
    console.log('[sync] Özel bülten URL deneniyor…', bulletinUrl);
    const bulletin = await fetchBulletinFromUrl(bulletinUrl);
    if (bulletin) {
      let live: LiveScorePayload | null = null;
      if (liveUrl) {
        live = await fetchLiveFromUrl(liveUrl);
      }
      if (!live) {
        live = {
          updatedAt: new Date().toISOString(),
          source: 'derived from bulletin',
          matches: bulletin.matches.map(m => ({
            matchId: m.id,
            homeScore: 0,
            awayScore: 0,
            minute: 0,
            status: 'SCHEDULED' as const
          }))
        };
      }
      return { bulletin, live };
    }
  }

  if (existing && existing.matches.length === 15) {
    console.log('[sync] Mevcut bülten korunuyor, yalnızca updatedAt güncelleniyor.');
    existing.updatedAt = new Date().toISOString();
    return {
      bulletin: existing,
      live: {
        updatedAt: new Date().toISOString(),
        source: existing.source,
        matches: existing.matches.map(m => ({
          matchId: m.id,
          homeScore: 0,
          awayScore: 0,
          minute: 0,
          status: 'SCHEDULED' as const
        }))
      }
    };
  }

  console.warn('[sync] Harici API yok — örnek bülten kullanılıyor.');
  return buildFallback();
}

function writeJson(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

const result = await sync();
writeJson(BULLETIN_PATH, result.bulletin);
writeJson(LIVE_PATH, result.live);

console.log('[sync] Yazıldı:', BULLETIN_PATH);
console.log('[sync] Yazıldı:', LIVE_PATH);
console.log('[sync] Kaynak:', result.bulletin.source);

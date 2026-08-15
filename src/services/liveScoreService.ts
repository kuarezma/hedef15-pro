import { LiveMatchStatus, Outcome } from '../core/types';

const LIVE_URL = '/live/scores.json';
const REMOTE_LIVE_URL = import.meta.env.VITE_LIVE_SCORES_REMOTE_URL as string | undefined;

function liveUrls(): string[] {
  const urls: string[] = [];
  if (REMOTE_LIVE_URL) urls.push(REMOTE_LIVE_URL);
  urls.push(LIVE_URL);
  return urls;
}
const POLL_INTERVAL_MS = 30_000;

export interface LiveScorePayload {
  updatedAt: string;
  source?: string;
  matches: {
    matchId: number;
    homeScore: number;
    awayScore: number;
    minute: number;
    status: LiveMatchStatus['status'];
  }[];
}

function outcomeFromScore(h: number, a: number): Outcome {
  if (h > a) return '1';
  if (h < a) return '2';
  return 'X';
}

export function mapPayloadToStatuses(payload: LiveScorePayload): LiveMatchStatus[] {
  return payload.matches.map(m => ({
    matchId: m.matchId,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    minute: m.minute,
    status: m.status,
    currentOutcome: outcomeFromScore(m.homeScore, m.awayScore)
  }));
}

export async function fetchLiveScores(): Promise<LiveScorePayload | null> {
  for (const url of liveUrls()) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const data = (await res.json()) as LiveScorePayload;
      return data;
    } catch {
      /* try next */
    }
  }
  return null;
}

export function startLiveScorePolling(
  onUpdate: (payload: LiveScorePayload) => void
): () => void {
  let active = true;

  const tick = async () => {
    if (!active) return;
    const data = await fetchLiveScores();
    if (data) onUpdate(data);
  };

  tick();
  const interval = setInterval(tick, POLL_INTERVAL_MS);
  return () => {
    active = false;
    clearInterval(interval);
  };
}

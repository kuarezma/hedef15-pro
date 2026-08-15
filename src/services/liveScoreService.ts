import { LiveMatchStatus, Outcome } from '../core/types';

const LIVE_URL = '/live/scores.json';
const POLL_INTERVAL_MS = 30_000;

export interface LiveScorePayload {
  updatedAt: string;
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
  try {
    const res = await fetch(LIVE_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as LiveScorePayload;
  } catch {
    return null;
  }
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

import type { Match } from '../../src/core/types';

export interface BulletinPayload {
  week: number;
  season: string;
  updatedAt: string;
  source: string;
  matches: Match[];
}

export interface LiveScoreEntry {
  matchId: number;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED';
  currentOutcome?: '1' | 'X' | '2';
}

export interface LiveScorePayload {
  updatedAt: string;
  source: string;
  matches: LiveScoreEntry[];
}

export interface SyncResult {
  bulletin: BulletinPayload;
  live: LiveScorePayload;
}

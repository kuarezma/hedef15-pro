export interface MatchDetailInfo {
  matchId: number;
  homeStandings: { rank: number; played: number; points: number; goalDiff: number };
  awayStandings: { rank: number; played: number; points: number; goalDiff: number };
  homeForm: ('W' | 'D' | 'L')[];
  awayForm: ('W' | 'D' | 'L')[];
  h2hMatches: { date: string; home: string; away: string; score: string; winner: '1' | 'X' | '2' }[];
  injuriesAndSuspensions: { team: string; player: string; reason: string; type: 'injured' | 'suspended' }[];
  expertCommentary: {
    author: string;
    role: string;
    title: string;
    text: string;
    recommendedPick: '1' | 'X' | '2' | '1-X' | 'X-2' | '1-2' | '1-X-2';
    confidence: number;
  };
  keyStats: {
    homePossessionAvg: number;
    awayPossessionAvg: number;
    homeAvgGoalsScored: number;
    awayAvgGoalsScored: number;
    homeCleanSheetPercent: number;
    awayCleanSheetPercent: number;
  };
}

/** H2H / sakat kadro notları canlı skor kaynağından gelmez; yoksa modal oranları gösterir. */
export const MATCH_DETAILS_DATA: Record<number, MatchDetailInfo> = {};

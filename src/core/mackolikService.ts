import { LiveMatchStatus, Match, Outcome } from './types';

export interface GoalEvent {
  id: string;
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  scoringTeam: string;
  scoringSide: 'home' | 'away';
  newScore: string;
  minute: number;
  timestamp: string;
}

/**
 * Normalizes team names for comparison
 */
export function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace('spor', '')
    .replace('fk', '')
    .replace('as', '')
    .replace('kulubu', '');
}

/**
 * Returns initial realistic Saturday evening status for current 15 matches:
 * - Match 1: Galatasaray - Çorum FK (Finished MS: 3 - 0 -> 1)
 * - Match 2: Kasımpaşa - Trabzonspor (Live 68' -> 1 - 2 -> 2)
 * - Match 3: Konyaspor - Çaykur Rizespor (Live 68' -> 1 - 1 -> X)
 * - Matches 4-15: Scheduled for tonight & Sunday/Monday
 */
export function getInitialWeekendStatuses(matches: Match[]): LiveMatchStatus[] {
  return matches.map((m, idx) => {
    if (idx === 0) {
      // Galatasaray - Çorum FK (Cuma 21:00 - Bitti)
      return {
        matchId: m.id,
        homeScore: 3,
        awayScore: 0,
        minute: 90,
        status: 'FINISHED',
        currentOutcome: '1'
      };
    } else if (idx === 1) {
      // Kasımpaşa - Trabzonspor (Cumartesi 19:00 - Canlı)
      return {
        matchId: m.id,
        homeScore: 1,
        awayScore: 2,
        minute: 68,
        status: 'LIVE',
        currentOutcome: '2'
      };
    } else if (idx === 2) {
      // Konyaspor - Çaykur Rizespor (Cumartesi 19:00 - Canlı)
      return {
        matchId: m.id,
        homeScore: 1,
        awayScore: 1,
        minute: 68,
        status: 'LIVE',
        currentOutcome: 'X'
      };
    } else {
      return {
        matchId: m.id,
        homeScore: 0,
        awayScore: 0,
        minute: 0,
        status: 'SCHEDULED',
        currentOutcome: 'X'
      };
    }
  });
}

/**
 * Simulates Mackolik live scores updates and detects goal events
 */
export async function fetchLiveScoresFromMackolik(
  currentMatches: Match[],
  previousStatuses: LiveMatchStatus[]
): Promise<{ statuses: LiveMatchStatus[]; newGoals: GoalEvent[] }> {
  const newGoals: GoalEvent[] = [];
  const updatedStatuses: LiveMatchStatus[] = [];

  for (let i = 0; i < currentMatches.length; i++) {
    const match = currentMatches[i];
    const prev = previousStatuses[i] || {
      matchId: match.id,
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      status: 'SCHEDULED',
      currentOutcome: 'X'
    };

    let homeScore = prev.homeScore;
    let awayScore = prev.awayScore;
    let minute = prev.minute;
    let status = prev.status;

    // Advance live matches
    if (status === 'LIVE') {
      minute = Math.min(90, minute + Math.floor(Math.random() * 4 + 2));
      if (minute >= 90) {
        status = 'FINISHED';
      } else {
        // Chance of goal
        if (Math.random() < 0.15) {
          const isHome = Math.random() < 0.55;
          if (isHome) {
            homeScore++;
            newGoals.push({
              id: `goal_${match.id}_${Date.now()}_${Math.random()}`,
              matchId: match.id,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              scoringTeam: match.homeTeam,
              scoringSide: 'home',
              newScore: `${homeScore} - ${awayScore}`,
              minute,
              timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            });
          } else {
            awayScore++;
            newGoals.push({
              id: `goal_${match.id}_${Date.now()}_${Math.random()}`,
              matchId: match.id,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              scoringTeam: match.awayTeam,
              scoringSide: 'away',
              newScore: `${homeScore} - ${awayScore}`,
              minute,
              timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            });
          }
        }
      }
    }

    let currentOutcome: Outcome = 'X';
    if (homeScore > awayScore) currentOutcome = '1';
    else if (homeScore < awayScore) currentOutcome = '2';

    updatedStatuses.push({
      matchId: match.id,
      homeScore,
      awayScore,
      minute,
      status,
      currentOutcome
    });
  }

  return { statuses: updatedStatuses, newGoals };
}

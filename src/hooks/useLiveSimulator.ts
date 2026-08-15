import { useState, useEffect, useMemo, useCallback } from 'react';
import { Column, LiveMatchStatus, LiveRadarState, Match, Outcome } from '../core/types';

/** Cap columns evaluated in live radar to keep UI responsive */
const MAX_LIVE_RADAR_COLUMNS = 2500;

function sampleColumnsForLiveRadar(columns: Column[]): Column[] {
  if (columns.length <= MAX_LIVE_RADAR_COLUMNS) return columns;
  const step = Math.ceil(columns.length / MAX_LIVE_RADAR_COLUMNS);
  const sampled: Column[] = [];
  for (let i = 0; i < columns.length; i += step) {
    sampled.push(columns[i]);
  }
  return sampled;
}

export function useLiveSimulator(matches: Match[], columns: Column[]) {
  const evaluatedColumns = useMemo(() => sampleColumnsForLiveRadar(columns), [columns]);
  const [isLiveRunning, setIsLiveRunning] = useState<boolean>(false);
  const [matchStatuses, setMatchStatuses] = useState<LiveMatchStatus[]>(() => {
    return matches.map(m => ({
      matchId: m.id,
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      status: 'SCHEDULED' as const,
      currentOutcome: 'X' as Outcome
    }));
  });

  // Calculate live outcomes
  const currentOutcomes: Outcome[] = useMemo(() => {
    return matchStatuses.map(m => {
      if (m.homeScore > m.awayScore) return '1';
      if (m.homeScore < m.awayScore) return '2';
      return 'X';
    });
  }, [matchStatuses]);

  // Evaluates every column against current live status
  const radarState: LiveRadarState = useMemo(() => {
    let count15 = 0;
    let count14 = 0;
    let count13 = 0;
    let count12 = 0;
    let lost = 0;

    const columnGrades = evaluatedColumns.map(col => {
      let currentHits = 0;
      let finishedMismatches = 0;

      for (let i = 0; i < 15; i++) {
        const liveOut = currentOutcomes[i];
        const status = matchStatuses[i].status;

        if (col[i] === liveOut) {
          currentHits++;
        } else if (status === 'FINISHED') {
          finishedMismatches++;
        }
      }

      // Max possible hits given finished matches
      const potentialMaxHits = 15 - finishedMismatches;

      let status: 'ACTIVE_15' | 'ACTIVE_14' | 'ACTIVE_13' | 'ACTIVE_12' | 'LOST' = 'LOST';
      if (potentialMaxHits >= 15) {
        status = 'ACTIVE_15';
        count15++;
      } else if (potentialMaxHits === 14) {
        status = 'ACTIVE_14';
        count14++;
      } else if (potentialMaxHits === 13) {
        status = 'ACTIVE_13';
        count13++;
      } else if (potentialMaxHits === 12) {
        status = 'ACTIVE_12';
        count12++;
      } else {
        lost++;
      }

      return {
        column: col,
        currentHits,
        potentialMaxHits,
        status
      };
    });

    return {
      currentOutcomes,
      columnGrades,
      counts: {
        '15': count15,
        '14': count14,
        '13': count13,
        '12': count12,
        lost
      }
    };
  }, [evaluatedColumns, currentOutcomes, matchStatuses]);

  // Random simulation tick
  const stepSimulation = useCallback(() => {
    setMatchStatuses(prev => prev.map(m => {
      if (m.minute >= 90) {
        return { ...m, status: 'FINISHED' };
      }

      const nextMin = Math.min(90, m.minute + Math.floor(Math.random() * 8 + 3));
      let newHome = m.homeScore;
      let newAway = m.awayScore;

      // Random goal chance
      if (Math.random() < 0.18) {
        if (Math.random() < 0.55) {
          newHome++;
        } else {
          newAway++;
        }
      }

      let currentOutcome: Outcome = 'X';
      if (newHome > newAway) currentOutcome = '1';
      else if (newHome < newAway) currentOutcome = '2';

      return {
        ...m,
        minute: nextMin,
        homeScore: newHome,
        awayScore: newAway,
        status: nextMin >= 90 ? 'FINISHED' : (nextMin > 45 ? 'LIVE' : 'LIVE'),
        currentOutcome
      };
    }));
  }, []);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setIsLiveRunning(false);
    setMatchStatuses(matches.map(m => ({
      matchId: m.id,
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      status: 'SCHEDULED',
      currentOutcome: 'X'
    })));
  }, [matches]);

  // Fast forward to FT
  const fastForwardToFinish = useCallback(() => {
    setMatchStatuses(matches.map((m, idx) => {
      // Pick according to match odds probability
      const rand = Math.random() * 100;
      let h = 0, a = 0;
      if (rand < 45) {
        h = Math.floor(Math.random() * 3 + 1);
        a = Math.floor(Math.random() * h);
      } else if (rand < 75) {
        h = Math.floor(Math.random() * 2);
        a = h;
      } else {
        a = Math.floor(Math.random() * 3 + 1);
        h = Math.floor(Math.random() * a);
      }

      let currentOutcome: Outcome = 'X';
      if (h > a) currentOutcome = '1';
      else if (h < a) currentOutcome = '2';

      return {
        matchId: m.id,
        homeScore: h,
        awayScore: a,
        minute: 90,
        status: 'FINISHED',
        currentOutcome
      };
    }));
  }, [matches]);

  // Ticker loop
  useEffect(() => {
    if (!isLiveRunning) return;
    const interval = setInterval(() => {
      stepSimulation();
    }, 1500);

    return () => clearInterval(interval);
  }, [isLiveRunning, stepSimulation]);

  return {
    isLiveRunning,
    setIsLiveRunning,
    matchStatuses,
    setMatchStatuses,
    radarState,
    stepSimulation,
    resetSimulation,
    fastForwardToFinish
  };
}

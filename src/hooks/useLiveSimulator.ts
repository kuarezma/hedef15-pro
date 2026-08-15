import { useState, useEffect, useMemo, useCallback } from 'react';
import { Column, LiveMatchStatus, LiveRadarState, Match, Outcome } from '../core/types';
import { fetchLiveScoresFromMackolik, getInitialWeekendStatuses, GoalEvent } from '../core/mackolikService';
import { playGoalSound } from '../core/goalAudio';

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
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [autoPollInterval, setAutoPollInterval] = useState<number>(15);
  const [recentGoals, setRecentGoals] = useState<GoalEvent[]>([]);
  const [activeGoalToast, setActiveGoalToast] = useState<GoalEvent | null>(null);
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);

  const [matchStatuses, setMatchStatuses] = useState<LiveMatchStatus[]>(() => {
    return getInitialWeekendStatuses(matches);
  });

  // Calculate live outcomes (1, X, 2)
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

  // Fetch / Advance live scores
  const syncMackolikScores = useCallback(async () => {
    setIsFetchingLive(true);
    try {
      const { statuses, newGoals } = await fetchLiveScoresFromMackolik(matches, matchStatuses);
      setMatchStatuses(statuses);

      if (newGoals.length > 0) {
        setRecentGoals(prev => [...newGoals, ...prev].slice(0, 15));
        const latestGoal = newGoals[0];
        setActiveGoalToast(latestGoal);

        if (isSoundEnabled) {
          playGoalSound();
        }

        setTimeout(() => {
          setActiveGoalToast(prev => (prev?.id === latestGoal.id ? null : prev));
        }, 6000);
      }
    } finally {
      setIsFetchingLive(false);
    }
  }, [matches, matchStatuses, isSoundEnabled]);

  // Auto-polling interval
  useEffect(() => {
    if (!isLiveRunning || autoPollInterval <= 0) return;

    const timer = setInterval(() => {
      syncMackolikScores();
    }, autoPollInterval * 1000);

    return () => clearInterval(timer);
  }, [isLiveRunning, autoPollInterval, syncMackolikScores]);

  // Manual fast forward to full-time
  const fastForwardToFinish = useCallback(() => {
    setMatchStatuses(prev => prev.map(m => ({
      ...m,
      minute: 90,
      status: 'FINISHED'
    })));
    setIsLiveRunning(false);
  }, []);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setIsLiveRunning(false);
    setRecentGoals([]);
    setActiveGoalToast(null);
    setMatchStatuses(getInitialWeekendStatuses(matches));
  }, [matches]);

  return {
    isLiveRunning,
    setIsLiveRunning,
    isSoundEnabled,
    setIsSoundEnabled,
    autoPollInterval,
    setAutoPollInterval,
    matchStatuses,
    radarState,
    currentOutcomes,
    recentGoals,
    activeGoalToast,
    isFetchingLive,
    syncMackolikScores,
    resetSimulation,
    fastForwardToFinish,
    dismissGoalToast: () => setActiveGoalToast(null)
  };
}

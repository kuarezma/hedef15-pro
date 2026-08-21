import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Column, LiveMatchStatus, LiveRadarState, Match, Outcome } from '../core/types';
import { fetchLiveScoresFromMackolik, getInitialWeekendStatuses, GoalEvent } from '../core/mackolikService';
import { playGoalSound } from '../core/goalAudio';
import { isFinishedStatus } from '../core/matchStatus';

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
  const [isLiveRunning, setIsLiveRunning] = useState<boolean>(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isBrowserNotifEnabled, setIsBrowserNotifEnabled] = useState<boolean>(false);
  const [autoPollInterval, setAutoPollInterval] = useState<number>(30);
  const [recentGoals, setRecentGoals] = useState<GoalEvent[]>([]);
  const [activeGoalToast, setActiveGoalToast] = useState<GoalEvent | null>(null);
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [matchStatuses, setMatchStatuses] = useState<LiveMatchStatus[]>(() => {
    return getInitialWeekendStatuses(matches);
  });

  const matchStatusesRef = useRef(matchStatuses);
  matchStatusesRef.current = matchStatuses;
  const matchesRef = useRef(matches);
  matchesRef.current = matches;

  const requestBrowserNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setIsBrowserNotifEnabled(perm === 'granted');
      return perm === 'granted';
    }
    return false;
  }, []);

  const currentOutcomes: Array<Outcome | null> = useMemo(() => {
    return matchStatuses.map(m => m.currentOutcome);
  }, [matchStatuses]);

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
        const status = matchStatuses[i];

        if (liveOut && col[i] === liveOut) {
          currentHits++;
        } else if (isFinishedStatus(status) && liveOut && col[i] !== liveOut) {
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

  const syncMackolikScores = useCallback(async () => {
    setIsFetchingLive(true);
    try {
      const { statuses, newGoals } = await fetchLiveScoresFromMackolik(
        matchesRef.current,
        matchStatusesRef.current
      );
      setMatchStatuses(statuses);
      matchStatusesRef.current = statuses;
      setLastSyncedAt(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSyncError(null);

      if (newGoals.length > 0) {
        setRecentGoals(prev => [...newGoals, ...prev].slice(0, 15));
        const latestGoal = newGoals[0];
        setActiveGoalToast(latestGoal);

        if (isSoundEnabled) {
          playGoalSound();
        }

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`⚽ GOL! ${latestGoal.scoringTeam}`, {
              body: `${latestGoal.homeTeam} ${latestGoal.newScore} ${latestGoal.awayTeam} (${latestGoal.minute}')`,
              icon: './favicon.svg'
            });
          } catch (_) {}
        }

        setTimeout(() => {
          setActiveGoalToast(prev => (prev?.id === latestGoal.id ? null : prev));
        }, 6000);
      }
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Canlı skorlar alınamadı');
    } finally {
      setIsFetchingLive(false);
    }
  }, [isSoundEnabled]);

  const fixtureKey = useMemo(
    () => matches.map(m => `${m.id}:${m.homeTeam}:${m.awayTeam}`).join('|'),
    [matches]
  );

  useEffect(() => {
    const reset = getInitialWeekendStatuses(matchesRef.current);
    setMatchStatuses(reset);
    matchStatusesRef.current = reset;
  }, [fixtureKey]);

  useEffect(() => {
    void syncMackolikScores();
  }, [fixtureKey, syncMackolikScores]);

  useEffect(() => {
    if (!isLiveRunning || autoPollInterval <= 0) return;

    const timer = setInterval(() => {
      void syncMackolikScores();
    }, autoPollInterval * 1000);

    return () => clearInterval(timer);
  }, [isLiveRunning, autoPollInterval, syncMackolikScores]);

  const resetLiveTracking = useCallback(() => {
    const reset = getInitialWeekendStatuses(matchesRef.current);
    setMatchStatuses(reset);
    matchStatusesRef.current = reset;
    setRecentGoals([]);
    setActiveGoalToast(null);
    setSyncError(null);
    void syncMackolikScores();
  }, [syncMackolikScores]);

  return {
    isLiveRunning,
    setIsLiveRunning,
    isSoundEnabled,
    setIsSoundEnabled,
    isBrowserNotifEnabled,
    requestBrowserNotificationPermission,
    autoPollInterval,
    setAutoPollInterval,
    matchStatuses,
    radarState,
    currentOutcomes,
    recentGoals,
    activeGoalToast,
    isFetchingLive,
    syncError,
    lastSyncedAt,
    syncMackolikScores,
    resetSimulation: resetLiveTracking,
    dismissGoalToast: () => setActiveGoalToast(null)
  };
}

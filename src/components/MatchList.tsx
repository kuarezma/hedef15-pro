import React, { useState, useMemo } from 'react';
import { FormulaType, LiveMatchStatus, Match } from '../core/types';
import { Sparkles, SlidersHorizontal, Layers, Search, CheckCircle2, Flame, BarChart2, Lock, Radio, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { displayOdds, findMatchStatus, isFinishedStatus, isLiveStatus, isScheduledStatus, statusLabel } from '../core/matchStatus';
import { calculateImpliedProbabilities, getFavoriteOutcome } from '../core/valueEngine';

interface MatchListProps {
  matches: Match[];
  formulaType: FormulaType;
  matchStatuses?: LiveMatchStatus[];
  onSelectMatchForDetail?: (match: Match) => void;
  onLockFinishedMatches?: () => void;
  toggleMatchPick: (matchId: number, outcome: '1' | 'X' | '2') => void;
  setSinglePick: (matchId: number, outcome: '1' | 'X' | '2') => void;
  updateMatchPercent: (matchId: number, outcome: '1' | 'X' | '2', value: number) => void;
  applyPreset: (preset: 'ALL_FAVORITES' | 'BALANCED' | 'CLEAR_ALL' | 'DOUBLE_SURPRISE' | 'ALL_1' | 'ALL_X' | 'ALL_2') => void;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  formulaType,
  matchStatuses,
  onSelectMatchForDetail,
  onLockFinishedMatches,
  toggleMatchPick,
  updateMatchPercent,
  applyPreset
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [matchStateFilter, setMatchStateFilter] = useState<'ALL' | 'LIVE' | 'FINISHED' | 'SCHEDULED'>('ALL');

  const leagues = useMemo(() => {
    const set = new Set<string>();
    matches.forEach(m => {
      if (m.league) set.add(m.league);
    });
    return ['ALL', ...Array.from(set)];
  }, [matches]);

  // Counts of status
  const counts = useMemo(() => {
    let finished = 0, live = 0, scheduled = 0;
    if (matchStatuses) {
      matchStatuses.forEach(s => {
        if (isFinishedStatus(s)) finished++;
        else if (isLiveStatus(s)) live++;
        else scheduled++;
      });
    } else {
      scheduled = matches.length;
    }
    return { finished, live, scheduled };
  }, [matchStatuses, matches.length]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchText = `${m.homeTeam} ${m.awayTeam} ${m.league}`.toLowerCase();
      const matchesSearch = searchQuery === '' || matchText.includes(searchQuery.toLowerCase());
      const matchesLeague = selectedLeague === 'ALL' || m.league === selectedLeague;

      const status = findMatchStatus(matchStatuses, m.id);
      const isFinished = isFinishedStatus(status);
      const isLive = isLiveStatus(status);
      const isScheduled = isScheduledStatus(status);

      let matchesState = true;
      if (matchStateFilter === 'LIVE') matchesState = isLive;
      else if (matchStateFilter === 'FINISHED') matchesState = isFinished;
      else if (matchStateFilter === 'SCHEDULED') matchesState = isScheduled;

      return matchesSearch && matchesLeague && matchesState;
    });
  }, [matches, searchQuery, selectedLeague, matchStateFilter, matchStatuses]);

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-sm">
      {/* Live Weekend Status Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-[#0B0F19] to-gray-950 border border-gray-800 rounded-2xl p-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Haftanın Canlı Durumu:
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono tabular-nums flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {counts.finished} Bitti
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-bold animate-pulse">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              {counts.live} Canlı
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {counts.scheduled} Başlamadı
            </span>
          </div>
        </div>

        {/* Action Button: Lock Finished Matches */}
        {counts.finished > 0 && onLockFinishedMatches && (
          <button
            onClick={() => {
              onLockFinishedMatches();
              confetti({ particleCount: 50, spread: 60 });
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Biten Maçları Kilitle ({counts.finished})</span>
          </button>
        )}
      </div>

      {/* Header with Title & Action Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Haftanın 15 Spor Toto Maçı & Tercihler</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              15 Maç
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            İstediğiniz maça tıklayarak maç merkezini inceleyebilir, başlamayan maçlarda en olası iddaa oranını görebilir ve tek/çifte/kapalı tercih yapabilirsiniz.
          </p>
        </div>

        {/* Action Presets */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            onClick={() => applyPreset('ALL_FAVORITES')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1 active:scale-95 shrink-0"
            title="En düşük oranlı favorileri seç"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Tüm Favoriler</span>
          </button>
          <button
            onClick={() => applyPreset('BALANCED')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1 active:scale-95 shrink-0"
            title="Favori ve Plase çifte şansları seç"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Dengeli (Çifte)</span>
          </button>
          <button
            onClick={() => applyPreset('DOUBLE_SURPRISE')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1 active:scale-95 shrink-0"
            title="Tüm maçları 1-X-2 kapat"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Tümünü Kapat</span>
          </button>
          <button
            onClick={() => applyPreset('ALL_1')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold border border-gray-700 transition-colors active:scale-95 shrink-0"
          >
            Hepsi 1
          </button>
          <button
            onClick={() => applyPreset('ALL_X')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold border border-gray-700 transition-colors active:scale-95 shrink-0"
          >
            Hepsi X
          </button>
          <button
            onClick={() => applyPreset('ALL_2')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold border border-gray-700 transition-colors active:scale-95 shrink-0"
          >
            Hepsi 2
          </button>
        </div>
      </div>

      {/* State & League Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setMatchStateFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              matchStateFilter === 'ALL'
                ? 'bg-emerald-500 text-white shadow-sm font-bold'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
            }`}
          >
            Tüm Maçlar ({matches.length})
          </button>
          <button
            onClick={() => setMatchStateFilter('LIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              matchStateFilter === 'LIVE'
                ? 'bg-amber-500 text-white shadow-sm font-bold'
                : 'bg-gray-900 text-amber-400 border border-gray-800 hover:border-amber-500/40'
            }`}
          >
            🔴 Canlı Oynananlar ({counts.live})
          </button>
          <button
            onClick={() => setMatchStateFilter('FINISHED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              matchStateFilter === 'FINISHED'
                ? 'bg-emerald-500 text-white shadow-sm font-bold'
                : 'bg-gray-900 text-emerald-400 border border-gray-800 hover:border-emerald-500/40'
            }`}
          >
            ✅ Biten Maçlar ({counts.finished})
          </button>
          <button
            onClick={() => setMatchStateFilter('SCHEDULED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              matchStateFilter === 'SCHEDULED'
                ? 'bg-blue-500 text-white shadow-sm font-bold'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
            }`}
          >
            ⏳ Başlamayanlar ({counts.scheduled})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60 shrink-0">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
          <input
            type="text"
            placeholder="Takım veya lig ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0F19] border border-gray-800 focus:border-emerald-500 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-white placeholder-gray-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Match Table / List */}
      <div className="space-y-2">
        {filteredMatches.map((match) => {
          const selectedCount = (match.userPicks['1'] ? 1 : 0) + (match.userPicks['X'] ? 1 : 0) + (match.userPicks['2'] ? 1 : 0);
          const pickTypeBadge = selectedCount === 1 ? 'Tek' : selectedCount === 2 ? 'Çifte' : 'Kapalı (3)';
          const badgeColor = selectedCount === 1
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : selectedCount === 2
            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            : 'bg-purple-500/10 text-purple-400 border-purple-500/30';

          const liveStatus = findMatchStatus(matchStatuses, match.id);
          const isFinished = isFinishedStatus(liveStatus);
          const isLive = isLiveStatus(liveStatus);
          const odds = displayOdds(liveStatus, match.odds);
          const favorite = liveStatus?.favoriteOutcome ?? getFavoriteOutcome(odds);

          return (
            <div
              key={match.id}
              className={`bg-[#0B0F19]/90 border rounded-xl p-3 sm:p-3.5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group ${
                isFinished
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : isLive
                  ? 'border-amber-500/40 bg-amber-950/10 ring-1 ring-amber-500/30'
                  : 'border-gray-800/80 hover:border-gray-700'
              }`}
            >
              {/* Match Info Column - Clickable for Mackolik Match Center */}
              <div
                onClick={() => onSelectMatchForDetail && onSelectMatchForDetail(match)}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                title="Maç merkezini ve detaylı analizleri açmak için tıklayın"
              >
                <div className={`w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center border shrink-0 tabular-nums ${
                  isFinished
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                    : isLive
                    ? 'bg-amber-500 text-white border-amber-400 animate-pulse'
                    : 'bg-gray-800 text-gray-300 border-gray-700'
                }`}>
                  {match.order}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate group-hover:text-emerald-400 transition-colors">
                      {match.homeTeam} - {match.awayTeam}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${badgeColor}`}>
                      {pickTypeBadge}
                    </span>

                    {/* Live or Finished Score Badge */}
                    {isFinished ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono tabular-nums flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>MS: {liveStatus?.homeScore} - {liveStatus?.awayScore} (Bitti: {liveStatus?.currentOutcome})</span>
                      </span>
                    ) : isLive ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono tabular-nums flex items-center gap-1 animate-pulse">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>{statusLabel(liveStatus)}: {liveStatus?.homeScore} - {liveStatus?.awayScore}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono tabular-nums">
                        En olası: {favorite} ({odds[favorite].toFixed(2)}) %{Math.round(liveStatus?.favoriteImpliedPct || calculateImpliedProbabilities(odds)[favorite])}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-[11px] text-gray-400 truncate">
                    <span>{match.league}</span>
                    <span>•</span>
                    <span>{match.matchDate} {match.matchTime}</span>
                    <span className="text-emerald-400/80 font-semibold flex items-center gap-0.5 ml-1">
                      <BarChart2 className="w-3 h-3" /> Maç Merkezi
                    </span>
                  </div>
                </div>
              </div>

              {/* Odds & Distribution Insight */}
              <div className="hidden lg:flex items-center gap-4 text-[11px] text-gray-400 border-x border-gray-800/80 px-4 shrink-0">
                <div className="text-center min-w-[100px]">
                  <div className="text-[10px] text-gray-500 font-semibold">Piyasa Oranları</div>
                  <div className="font-mono font-medium text-gray-300 tabular-nums">
                    {odds['1'].toFixed(2)} | {odds['X'].toFixed(2)} | {odds['2'].toFixed(2)}
                  </div>
                </div>
                <div className="text-center min-w-[110px]">
                  <div className="text-[10px] text-gray-500 font-semibold">Halk Tercihi %</div>
                  <div className="font-mono font-medium text-amber-400/90 tabular-nums">
                    %{match.publicPicks['1']} | %{match.publicPicks['X']} | %{match.publicPicks['2']}
                  </div>
                </div>
              </div>

              {/* Selection Buttons with Visual Winning and Finished Lock Indicators */}
              {formulaType === 'probabilistic' ? (
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                  {(['1', 'X', '2'] as const).map(out => (
                    <div key={out} className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 min-w-[68px]">
                      <span className="text-xs font-black text-gray-400 w-3">{out}:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={match.userPercents[out]}
                        onChange={(e) => updateMatchPercent(match.id, out, Number(e.target.value))}
                        className="w-8 bg-transparent text-xs font-bold text-emerald-400 text-right focus:outline-none font-mono tabular-nums"
                      />
                      <span className="text-[10px] text-gray-500">%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                  {(['1', 'X', '2'] as const).map(out => {
                    const isSelected = match.userPicks[out];
                    const odd = odds[out];
                    const isWinningOutcome = isFinished && liveStatus?.currentOutcome === out;
                    const isLiveLeading = isLive && liveStatus?.currentOutcome === out;
                    const isFavoritePick = !isFinished && favorite === out;

                    return (
                      <button
                        key={out}
                        onClick={() => toggleMatchPick(match.id, out)}
                        className={`w-14 sm:w-16 h-11 rounded-xl border font-bold text-xs flex flex-col items-center justify-center transition-all select-none relative ${
                          isWinningOutcome
                            ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/30'
                            : isLiveLeading
                            ? 'ring-1 ring-amber-400 shadow-sm'
                            : isFavoritePick
                            ? 'ring-1 ring-amber-400/70'
                            : ''
                        } ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                            : 'bg-gray-900/90 text-gray-300 border-gray-800 hover:border-gray-700 hover:bg-gray-800 active:scale-95'
                        }`}
                      >
                        <div className="flex items-center gap-0.5">
                          <span className="font-extrabold text-xs leading-none">{out}</span>
                          {isWinningOutcome && (
                            <span className="text-[9px] text-emerald-200">✓</span>
                          )}
                          {isLiveLeading && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping"></span>
                          )}
                          {isFavoritePick && !isWinningOutcome && (
                            <span className="text-[8px] text-amber-300">★</span>
                          )}
                        </div>
                        <span className={`text-[9px] font-mono tabular-nums mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                          {odd.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

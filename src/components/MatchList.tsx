import React, { useState, useMemo } from 'react';
import { FormulaType, Match } from '../core/types';
import { Sparkles, SlidersHorizontal, Layers, Search, RotateCcw, Filter, CheckCircle2 } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  formulaType: FormulaType;
  toggleMatchPick: (matchId: number, outcome: '1' | 'X' | '2') => void;
  setSinglePick: (matchId: number, outcome: '1' | 'X' | '2') => void;
  updateMatchPercent: (matchId: number, outcome: '1' | 'X' | '2', value: number) => void;
  applyPreset: (preset: 'ALL_FAVORITES' | 'BALANCED' | 'CLEAR_ALL' | 'DOUBLE_SURPRISE' | 'ALL_1' | 'ALL_X' | 'ALL_2') => void;
  onResetBulletin?: () => void;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  formulaType,
  toggleMatchPick,
  setSinglePick,
  updateMatchPercent,
  applyPreset,
  onResetBulletin
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');

  const leagues = useMemo(() => {
    const set = new Set<string>();
    matches.forEach(m => {
      if (m.league) set.add(m.league);
    });
    return ['ALL', ...Array.from(set)];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const matchText = `${m.homeTeam} ${m.awayTeam} ${m.league}`.toLowerCase();
      const matchesSearch = searchQuery === '' || matchText.includes(searchQuery.toLowerCase());
      const matchesLeague = selectedLeague === 'ALL' || m.league === selectedLeague;
      return matchesSearch && matchesLeague;
    });
  }, [matches, searchQuery, selectedLeague]);

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
      {/* Header with Title & Live Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Haftanın 15 Spor Toto Maçı & Tercihler</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              15 Maç Aktif
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            İstediğiniz maçlara tek, çifte (1-X, X-2, 1-2) veya kapalı (1-X-2) tercih yapabilirsiniz.
          </p>
        </div>

        {/* Action Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => applyPreset('ALL_FAVORITES')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-xs font-medium border border-gray-700 transition-colors flex items-center gap-1 active:scale-95"
            title="En düşük oranlı favorileri seç"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tüm Favoriler</span>
          </button>
          <button
            onClick={() => applyPreset('BALANCED')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-xs font-medium border border-gray-700 transition-colors flex items-center gap-1 active:scale-95"
            title="Favori ve Plase çifte şansları seç"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Dengeli (Çifte)</span>
          </button>
          <button
            onClick={() => applyPreset('DOUBLE_SURPRISE')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-xs font-medium border border-gray-700 transition-colors flex items-center gap-1 active:scale-95"
            title="Tüm maçları 1-X-2 kapat"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Tümünü Kapat</span>
          </button>
          <button
            onClick={() => applyPreset('ALL_1')}
            className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold border border-gray-700 transition-colors active:scale-95"
            title="Tümünü 1 Yap"
          >
            Hepsi 1
          </button>
          <button
            onClick={() => applyPreset('ALL_X')}
            className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold border border-gray-700 transition-colors active:scale-95"
            title="Tümünü X Yap"
          >
            Hepsi X
          </button>
          <button
            onClick={() => applyPreset('ALL_2')}
            className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold border border-gray-700 transition-colors active:scale-95"
            title="Tümünü 2 Yap"
          >
            Hepsi 2
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        {/* League Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {leagues.map(l => (
            <button
              key={l}
              onClick={() => setSelectedLeague(l)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLeague === l
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
              }`}
            >
              {l === 'ALL' ? 'Tüm Ligler (15)' : l}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Takım veya lig ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 focus:border-emerald-500 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-white placeholder-gray-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Match Table / List */}
      <div className="space-y-2.5">
        {filteredMatches.map((match) => {
          const selectedCount = (match.userPicks['1'] ? 1 : 0) + (match.userPicks['X'] ? 1 : 0) + (match.userPicks['2'] ? 1 : 0);
          const pickTypeBadge = selectedCount === 1 ? 'Tek' : selectedCount === 2 ? 'Çifte' : 'Kapalı (3)';
          const badgeColor = selectedCount === 1
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : selectedCount === 2
            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            : 'bg-purple-500/10 text-purple-400 border-purple-500/30';

          return (
            <div
              key={match.id}
              className="bg-[#0B0F19]/80 border border-gray-800/80 hover:border-gray-700/80 rounded-xl p-3 sm:p-3.5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
            >
              {/* Match Info Column */}
              <div className="flex items-center gap-3 min-w-[280px]">
                <div className="w-7 h-7 rounded-lg bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center font-black text-xs text-gray-300 border border-gray-700 transition-colors">
                  {match.order}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {match.homeTeam} - {match.awayTeam}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${badgeColor}`}>
                      {pickTypeBadge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                    <span>{match.league}</span>
                    <span>•</span>
                    <span>{match.matchDate} {match.matchTime}</span>
                  </div>
                </div>
              </div>

              {/* Odds & Distribution Insight */}
              <div className="hidden lg:flex items-center gap-4 text-[11px] text-gray-400 border-x border-gray-800/80 px-4">
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 font-semibold">Piyasa Oranları</div>
                  <div className="font-mono font-medium text-gray-300">
                    {match.odds['1'].toFixed(2)} | {match.odds['X'].toFixed(2)} | {match.odds['2'].toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 font-semibold">Halk Tercihi %</div>
                  <div className="font-mono font-medium text-amber-400/90">
                    %{match.publicPicks['1']} | %{match.publicPicks['X']} | %{match.publicPicks['2']}
                  </div>
                </div>
              </div>

              {/* Selection Buttons or Percentage Inputs */}
              {formulaType === 'probabilistic' ? (
                /* Probabilistic Percentage Inputs */
                <div className="flex items-center gap-2">
                  {(['1', 'X', '2'] as const).map(out => (
                    <div key={out} className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1">
                      <span className="text-xs font-black text-gray-400 w-3">{out}:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={match.userPercents[out]}
                        onChange={(e) => updateMatchPercent(match.id, out, Number(e.target.value))}
                        className="w-10 bg-transparent text-xs font-bold text-emerald-400 text-right focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-500">%</span>
                    </div>
                  ))}
                </div>
              ) : (
                /* Standard 1, X, 2 Toggle Buttons */
                <div className="flex items-center gap-1.5 self-end md:self-center">
                  {(['1', 'X', '2'] as const).map(out => {
                    const isSelected = match.userPicks[out];
                    const odd = match.odds[out];

                    return (
                      <button
                        key={out}
                        onClick={() => toggleMatchPick(match.id, out)}
                        className={`w-14 sm:w-16 py-1.5 rounded-lg border font-bold text-xs flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.03]'
                            : 'bg-gray-900/90 text-gray-300 border-gray-800 hover:border-gray-700 hover:bg-gray-800 active:scale-95'
                        }`}
                      >
                        <span className="font-extrabold text-sm">{out}</span>
                        <span className={`text-[9px] font-normal ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
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

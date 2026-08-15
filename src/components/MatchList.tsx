import React from 'react';
import { FormulaType, Match } from '../core/types';
import { Check, Sparkles, SlidersHorizontal, RefreshCw, Layers } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  formulaType: FormulaType;
  toggleMatchPick: (matchId: number, outcome: '1' | 'X' | '2') => void;
  setSinglePick: (matchId: number, outcome: '1' | 'X' | '2') => void;
  updateMatchPercent: (matchId: number, outcome: '1' | 'X' | '2', value: number) => void;
  applyPreset: (preset: 'ALL_FAVORITES' | 'BALANCED' | 'CLEAR_ALL' | 'DOUBLE_SURPRISE') => void;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  formulaType,
  toggleMatchPick,
  setSinglePick,
  updateMatchPercent,
  applyPreset
}) => {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
      {/* Header & Quick Action Presets */}
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

        {/* Preset Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('ALL_FAVORITES')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-xs font-medium border border-gray-700 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tüm Favoriler</span>
          </button>
          <button
            onClick={() => applyPreset('BALANCED')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-xs font-medium border border-gray-700 transition-colors flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Dengeli (Çifte)</span>
          </button>
          <button
            onClick={() => applyPreset('DOUBLE_SURPRISE')}
            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-xs font-medium border border-gray-700 transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Tümünü Kapat</span>
          </button>
        </div>
      </div>

      {/* Match Table / List */}
      <div className="space-y-2.5">
        {matches.map((match) => {
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
              className="bg-[#0B0F19]/80 border border-gray-800/80 hover:border-gray-700/80 rounded-xl p-3 sm:p-3.5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              {/* Match Info Column */}
              <div className="flex items-center gap-3 min-w-[280px]">
                <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center font-black text-xs text-gray-300 border border-gray-700">
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
                  <div className="text-[10px] text-gray-500">Piyasa Oranları</div>
                  <div className="font-mono font-medium text-gray-300">
                    {match.odds['1'].toFixed(2)} | {match.odds['X'].toFixed(2)} | {match.odds['2'].toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500">Halk Tercihi %</div>
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
                    const publicPct = match.publicPicks[out];

                    return (
                      <button
                        key={out}
                        onClick={() => toggleMatchPick(match.id, out)}
                        className={`w-14 sm:w-16 py-1.5 rounded-lg border font-bold text-xs flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]'
                            : 'bg-gray-900/90 text-gray-300 border-gray-800 hover:border-gray-700 hover:bg-gray-800'
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

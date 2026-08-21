import React, { useState } from 'react';
import { LiveMatchStatus, Match, Outcome } from '../core/types';
import { MATCH_DETAILS_DATA, MatchDetailInfo } from '../data/matchDetailsData';
import {
  X,
  AlertTriangle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { displayOdds, isFinishedStatus, isLiveStatus, statusLabel } from '../core/matchStatus';
import { calculateImpliedProbabilities, getFavoriteOutcome } from '../core/valueEngine';

interface MatchDetailModalProps {
  match: Match;
  liveStatus?: LiveMatchStatus;
  onClose: () => void;
  onApplyPick: (outcome: Outcome | '1-X' | 'X-2' | '1-2' | '1-X-2') => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  liveStatus,
  onClose,
  onApplyPick
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'h2h' | 'standings' | 'squad'>('overview');
  const detail: MatchDetailInfo | undefined = MATCH_DETAILS_DATA[match.id];
  const odds = displayOdds(liveStatus, match.odds);
  const favorite = liveStatus?.favoriteOutcome ?? getFavoriteOutcome(odds);
  const implied = calculateImpliedProbabilities(odds);

  const renderFormBadge = (result: 'W' | 'D' | 'L') => {
    if (result === 'W') {
      return <span className="w-5 h-5 rounded-md bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">G</span>;
    }
    if (result === 'D') {
      return <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">B</span>;
    }
    return <span className="w-5 h-5 rounded-md bg-red-500 text-white font-bold text-[10px] flex items-center justify-center">M</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 bg-gradient-to-r from-gray-900/90 to-[#0B0F19] flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                {match.league}
              </span>
              <span className="text-xs text-gray-400">
                {match.matchDate} {match.matchTime}
                {liveStatus ? ` • ${statusLabel(liveStatus)}` : ''}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white truncate tracking-wide">
              {match.homeTeam} <span className="text-gray-500 font-normal">vs</span> {match.awayTeam}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Odds & Distribution Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-gray-950/60 border-b border-gray-800/80 text-center font-mono">
          {(['1', 'X', '2'] as const).map(out => {
            const isFav = favorite === out;
            const color = out === '1' ? 'text-emerald-400' : out === 'X' ? 'text-amber-400' : 'text-cyan-400';
            return (
              <div
                key={out}
                className={`bg-gray-900/80 p-2 rounded-xl border ${
                  isFav ? 'border-amber-400/70 ring-1 ring-amber-400/40' : 'border-gray-800/80'
                }`}
              >
                <div className="text-[10px] text-gray-500 font-sans font-bold">
                  {out === '1' ? '1 (Ev Sahibi)' : out === 'X' ? 'X (Beraberlik)' : '2 (Deplasman)'}
                  {isFav ? ' ★' : ''}
                </div>
                <div className={`text-sm font-black tabular-nums ${color}`}>{odds[out].toFixed(2)}</div>
                <div className="text-[9px] text-gray-400 font-sans">
                  İhtimal: %{implied[out].toFixed(0)} • Halk: %{match.publicPicks[out]}
                </div>
              </div>
            );
          })}
        </div>
        {!isFinishedStatus(liveStatus) && !isLiveStatus(liveStatus) && (
          <div className="px-3 py-2 bg-blue-950/40 border-b border-blue-500/20 text-center text-[11px] text-blue-200">
            Maç başlamadı. İddaa piyasasında gerçekleşme ihtimali en yüksek sonuç:{' '}
            <span className="font-black">{favorite} ({odds[favorite].toFixed(2)})</span>
          </div>
        )}
        {isFinishedStatus(liveStatus) && (
          <div className="px-3 py-2 bg-emerald-950/40 border-b border-emerald-500/20 text-center text-[11px] text-emerald-200">
            Resmi skor: {liveStatus?.homeScore} - {liveStatus?.awayScore} (MS {liveStatus?.currentOutcome})
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 p-2 bg-gray-900/40 border-b border-gray-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ✍️ Editör Yorumu & Analiz
          </button>
          <button
            onClick={() => setActiveTab('h2h')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'h2h'
                ? 'bg-emerald-500 text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚔️ Aralarındaki Maçlar (H2H)
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'standings'
                ? 'bg-emerald-500 text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📈 Form & İstatistik
          </button>
          <button
            onClick={() => setActiveTab('squad')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'squad'
                ? 'bg-emerald-500 text-white shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏥 Sakat & Cezalılar
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Tab 1: Overview & Expert Commentary */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {detail?.expertCommentary && (
                <div className="bg-gradient-to-br from-emerald-950/20 via-[#0B0F19] to-gray-900/60 border border-emerald-500/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xs">
                        ✍️
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{detail.expertCommentary.author}</div>
                        <div className="text-[10px] text-emerald-400">{detail.expertCommentary.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 block">Güven Oranı</span>
                      <span className="text-xs font-black text-emerald-400 font-mono">%{detail.expertCommentary.confidence}</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1.5">
                    "{detail.expertCommentary.title}"
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {detail.expertCommentary.text}
                  </p>

                  <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Tavsiye Edilen Tercih:</span>
                    <button
                      onClick={() => onApplyPick(detail.expertCommentary.recommendedPick)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{detail.expertCommentary.recommendedPick} Uygula</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Form Comparison */}
              {detail && (
                <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5">
                  <h4 className="text-xs font-bold text-white mb-2.5">Son 5 Maç Form Durumu</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-semibold">{match.homeTeam}</span>
                      <div className="flex items-center gap-1">
                        {detail.homeForm.map((f, i) => <span key={i}>{renderFormBadge(f)}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-semibold">{match.awayTeam}</span>
                      <div className="flex items-center gap-1">
                        {detail.awayForm.map((f, i) => <span key={i}>{renderFormBadge(f)}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: H2H Aralarındaki Maçlar */}
          {activeTab === 'h2h' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white mb-2">Son Karşılaşmalar</h3>
              {detail?.h2hMatches && detail.h2hMatches.length > 0 ? (
                <div className="space-y-2">
                  {detail.h2hMatches.map((h2h, idx) => (
                    <div key={idx} className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{h2h.date}</span>
                      </div>
                      <div className="font-bold text-white text-center flex-1 mx-2 truncate font-sans">
                        {h2h.home} - {h2h.away}
                      </div>
                      <div className="px-2.5 py-1 rounded bg-gray-800 text-emerald-400 font-bold">
                        {h2h.score}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-6">
                  Bu iki takım arasında yakın tarihte resmi karşılaşma kaydı bulunmuyor.
                </p>
              )}
            </div>
          )}

          {/* Tab 3: Standings & Stats */}
          {activeTab === 'standings' && detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 text-center">
                  <div className="text-xs font-bold text-white truncate mb-1">{match.homeTeam}</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">{detail.homeStandings.rank}. Sıra</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-1">
                    {detail.homeStandings.points} Puan • {detail.homeStandings.goalDiff > 0 ? `+${detail.homeStandings.goalDiff}` : detail.homeStandings.goalDiff} Avj
                  </div>
                </div>
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 text-center">
                  <div className="text-xs font-bold text-white truncate mb-1">{match.awayTeam}</div>
                  <div className="text-2xl font-black text-blue-400 font-mono">{detail.awayStandings.rank}. Sıra</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-1">
                    {detail.awayStandings.points} Puan • {detail.awayStandings.goalDiff > 0 ? `+${detail.awayStandings.goalDiff}` : detail.awayStandings.goalDiff} Avj
                  </div>
                </div>
              </div>

              {/* Advanced Key Stats */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3.5 space-y-3 text-xs">
                <h4 className="font-bold text-white">Karşılaştırmalı Takım İstatistikleri</h4>
                
                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Topla Oynama: %{detail.keyStats.homePossessionAvg}</span>
                    <span>%{detail.keyStats.awayPossessionAvg}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${detail.keyStats.homePossessionAvg}%` }}></div>
                    <div className="bg-blue-500 h-full" style={{ width: `${detail.keyStats.awayPossessionAvg}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between text-gray-300 pt-2 border-t border-gray-800">
                  <span>Maç Başı Gol Ortalaması:</span>
                  <span className="font-mono font-bold text-white">{detail.keyStats.homeAvgGoalsScored} vs {detail.keyStats.awayAvgGoalsScored}</span>
                </div>

                <div className="flex justify-between text-gray-300 pt-2 border-t border-gray-800">
                  <span>Gol Yemeden Bitirme %:</span>
                  <span className="font-mono font-bold text-emerald-400">%{detail.keyStats.homeCleanSheetPercent} vs %{detail.keyStats.awayCleanSheetPercent}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Squad & Injuries */}
          {activeTab === 'squad' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white mb-2">Sakat ve Cezalı Oyuncular</h3>
              {detail?.injuriesAndSuspensions && detail.injuriesAndSuspensions.length > 0 ? (
                <div className="space-y-2">
                  {detail.injuriesAndSuspensions.map((item, idx) => (
                    <div key={idx} className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded ${item.type === 'injured' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <div className="font-bold text-white">{item.player}</div>
                          <div className="text-[10px] text-gray-400">{item.team}</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 italic">{item.reason}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-6">
                  Bu maç için bildirilen kritik sakat veya cezalı oyuncu bulunmuyor.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Quick Action Bar */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-gray-400 font-semibold">
            Hızlı Kupon Seçimi:
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onApplyPick(favorite)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition-colors"
            >
              En olası ({favorite})
            </button>
            <button
              onClick={() => onApplyPick('1')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-emerald-500 hover:text-white border border-gray-800 text-xs font-bold transition-colors"
            >
              1
            </button>
            <button
              onClick={() => onApplyPick('X')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-amber-500 hover:text-white border border-gray-800 text-xs font-bold transition-colors"
            >
              X
            </button>
            <button
              onClick={() => onApplyPick('2')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-cyan-500 hover:text-white border border-gray-800 text-xs font-bold transition-colors"
            >
              2
            </button>
            <button
              onClick={() => onApplyPick('1-X')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-blue-600 hover:text-white border border-gray-800 text-xs font-bold transition-colors"
            >
              1-X
            </button>
            <button
              onClick={() => onApplyPick('X-2')}
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-purple-600 hover:text-white border border-gray-800 text-xs font-bold transition-colors"
            >
              X-2
            </button>
            <button
              onClick={() => onApplyPick('1-X-2')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/40 text-xs font-bold transition-colors"
            >
              1-X-2 Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Column, LiveMatchStatus, Match, Outcome, SavedCoupon } from '../core/types';
import { countMatches } from '../core/combinatorics';
import {
  Trophy,
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { displayOdds, findMatchStatus, isFinishedStatus, isLiveStatus, statusLabel } from '../core/matchStatus';
import { getFavoriteOutcome } from '../core/valueEngine';
import { archiveStatuses, boardCounts, mergeLiveWithConfirmedOfficial, weekResultsComplete } from '../core/officialBoard';
import { getOfficialWeek, OFFICIAL_WEEKS } from '../data/officialBulletins';

interface OfficialResultsProps {
  matches: Match[];
  matchStatuses: LiveMatchStatus[];
  savedCoupons: SavedCoupon[];
  currentColumns: Column[];
  onRefreshResults: () => void;
  isRefreshing: boolean;
}

function formatTl(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${value.toLocaleString('tr-TR')} TL`;
}

export const OfficialResults: React.FC<OfficialResultsProps> = ({
  matches,
  matchStatuses,
  savedCoupons,
  currentColumns,
  onRefreshResults,
  isRefreshing
}) => {
  const [selectedWeek, setSelectedWeek] = useState<string>('2026_w2');
  const [couponCheckResult, setCouponCheckResult] = useState<{
    totalChecked: number;
    hits15: number;
    hits14: number;
    hits13: number;
    hits12: number;
    estimatedWonTL: number;
  } | null>(null);

  const week = getOfficialWeek(selectedWeek);
  const isCurrentWeek = week.isCurrent;

  const boardMatches = isCurrentWeek ? matches : week.matches;
  const boardStatuses = useMemo(() => {
    if (!isCurrentWeek) return archiveStatuses(week);
    return mergeLiveWithConfirmedOfficial(matches, matchStatuses);
  }, [isCurrentWeek, week, matches, matchStatuses]);

  const counts = boardCounts(boardStatuses);
  const resultsComplete = isCurrentWeek && weekResultsComplete(boardStatuses);

  const handleCheckAllCoupons = () => {
    if (!resultsComplete) {
      setCouponCheckResult({
        totalChecked: 0,
        hits15: 0,
        hits14: 0,
        hits13: 0,
        hits12: 0,
        estimatedWonTL: 0
      });
      return;
    }

    const resolvedOutcomes = boardStatuses.map(s => s.currentOutcome) as Outcome[];
    let hits15 = 0;
    let hits14 = 0;
    let hits13 = 0;
    let hits12 = 0;
    let totalCols = currentColumns.length;

    for (const col of currentColumns) {
      const matchCount = countMatches(col, resolvedOutcomes);
      if (matchCount === 15) hits15++;
      else if (matchCount === 14) hits14++;
      else if (matchCount === 13) hits13++;
      else if (matchCount === 12) hits12++;
    }

    for (const sc of savedCoupons) {
      totalCols += sc.columns.length;
      for (const col of sc.columns) {
        const matchCount = countMatches(col, resolvedOutcomes);
        if (matchCount === 15) hits15++;
        else if (matchCount === 14) hits14++;
        else if (matchCount === 13) hits13++;
        else if (matchCount === 12) hits12++;
      }
    }

    const prize = week.prize;
    const estimatedWonTL =
      hits15 * (prize.tier15.prizePerWinnerTL || 0) +
      hits14 * (prize.tier14.prizePerWinnerTL || 0) +
      hits13 * (prize.tier13.prizePerWinnerTL || 0) +
      hits12 * (prize.tier12.prizePerWinnerTL || 0);

    setCouponCheckResult({
      totalChecked: totalCols,
      hits15,
      hits14,
      hits13,
      hits12,
      estimatedWonTL
    });

    if (hits15 > 0 || hits14 > 0 || hits13 > 0 || hits12 > 0) {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    }
  };

  const prize = week.prize;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-900 via-[#0B0F19] to-gray-900 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Spor Toto Resmi Sonuçları
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider shrink-0">
                {isCurrentWeek ? 'Güncel 15\'li' : 'Arşiv MS'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {isCurrentWeek
                ? 'Resmi 15\'li sıra. Bitmemiş maç 1-X-2 sayılmaz; 0-0 uydurulmaz. MS gelenler yayımlanmış skordur.'
                : '1. haftanın yayımlanmış maç sonu skorları. Galatasaray-Çorum resmi sonucu 2-2 (X), 3-0 değil.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <select
            value={selectedWeek}
            onChange={(e) => {
              setSelectedWeek(e.target.value);
              setCouponCheckResult(null);
            }}
            className="bg-gray-900 border border-gray-700 text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {OFFICIAL_WEEKS.map(option => (
              <option key={option.weekKey} value={option.weekKey}>
                {option.label}
              </option>
            ))}
          </select>

          {isCurrentWeek && (
            <button
              onClick={onRefreshResults}
              disabled={isRefreshing}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 active:scale-95"
              title="Canlı skor tablosunu yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Skorları Yenile</span>
            </button>
          )}
        </div>
      </div>

      {isCurrentWeek && (
        <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Kuponlarımı Resmi Sonuçla Denetle
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Yalnızca 15 maç da MS (veya resmi erteleme) olduktan sonra 15/14/13/12 sayılır.
            </p>
          </div>

          <button
            onClick={handleCheckAllCoupons}
            disabled={!resultsComplete}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>
              {resultsComplete
                ? 'Kuponlarımı Sorgula'
                : `Resmi MS için ${15 - counts.finished - counts.postponed} maç bekleniyor`}
            </span>
          </button>
        </div>
      )}

      {couponCheckResult && (
        <div className="bg-gradient-to-br from-emerald-950/30 via-[#0B0F19] to-gray-900 border-2 border-emerald-500/50 rounded-2xl p-5 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Sorgulama Raporu</span>
              <h3 className="text-base font-black text-white">
                Toplam {couponCheckResult.totalChecked.toLocaleString('tr-TR')} Kolon İncelendi
              </h3>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-gray-400 font-sans block">
                {prize.announced ? 'Açıklanan kişi başı × isabet' : 'İkramiye henüz açıklanmadı'}
              </span>
              <span className="text-xl font-black text-emerald-400 tabular-nums">
                {prize.announced ? formatTl(couponCheckResult.estimatedWonTL) : '—'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="bg-[#0B0F19] border border-emerald-500/30 p-3 rounded-xl">
              <div className="text-[10px] text-emerald-400 font-sans font-bold">15 Bilen</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{couponCheckResult.hits15} Kolon</div>
            </div>
            <div className="bg-[#0B0F19] border border-teal-500/30 p-3 rounded-xl">
              <div className="text-[10px] text-teal-400 font-sans font-bold">14 Bilen</div>
              <div className="text-xl font-black text-teal-400 mt-0.5">{couponCheckResult.hits14} Kolon</div>
            </div>
            <div className="bg-[#0B0F19] border border-blue-500/30 p-3 rounded-xl">
              <div className="text-[10px] text-blue-400 font-sans font-bold">13 Bilen</div>
              <div className="text-xl font-black text-blue-400 mt-0.5">{couponCheckResult.hits13} Kolon</div>
            </div>
            <div className="bg-[#0B0F19] border border-purple-500/30 p-3 rounded-xl">
              <div className="text-[10px] text-purple-400 font-sans font-bold">12 Bilen</div>
              <div className="text-xl font-black text-purple-400 mt-0.5">{couponCheckResult.hits12} Kolon</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
            <div>
              <h3 className="text-sm font-bold text-white">15 Maçın Resmi Skorları</h3>
              <p className="text-xs text-gray-400">
                {counts.finished} Bitti • {counts.live} Canlı • {counts.scheduled} Başlamadı
                {counts.postponed > 0 ? ` • ${counts.postponed} Ertelendi` : ''}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {boardMatches.map((m) => {
              const status = findMatchStatus(boardStatuses, m.id);
              const isFinished = isFinishedStatus(status);
              const isLive = isLiveStatus(status);
              const isPostponed = status?.status === 'POSTPONED';
              const odds = displayOdds(status, m.odds);
              const favorite = status?.favoriteOutcome ?? getFavoriteOutcome(odds);

              return (
                <div
                  key={m.id}
                  className={`bg-[#0B0F19] border rounded-xl p-3 flex items-center justify-between gap-3 font-sans transition-all ${
                    isFinished
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : isLive
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : isPostponed
                      ? 'border-gray-600/60'
                      : 'border-gray-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-6 h-6 rounded bg-gray-800 text-gray-300 font-mono text-xs font-black flex items-center justify-center shrink-0">
                      {m.order}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {m.homeTeam} - {m.awayTeam}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">
                        {m.league} • {m.matchDate} {m.matchTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {isFinished || isLive ? (
                      <>
                        <div className="text-right font-mono">
                          <div className="text-xs sm:text-sm font-black text-white tabular-nums">
                            {status ? `${status.homeScore} - ${status.awayScore}` : '—'}
                          </div>
                          <div className="text-[9px] text-gray-400 font-sans">
                            {isFinished ? 'Resmi MS' : statusLabel(status)}
                          </div>
                        </div>
                        <span className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                          status?.currentOutcome === '1'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : status?.currentOutcome === 'X'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-cyan-500 text-white shadow-sm'
                        }`}>
                          {status?.currentOutcome ?? '—'}
                        </span>
                      </>
                    ) : isPostponed ? (
                      <div className="text-right">
                        <div className="text-[10px] font-black text-gray-300">Ertelendi</div>
                        <div className="text-[10px] text-gray-500">Resmi 1-X-2 yok</div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-[10px] font-black text-blue-300">
                          En olası {favorite} ★
                        </div>
                        <div className="text-[10px] font-mono text-gray-400">
                          {odds[favorite].toFixed(2)} • resmi skor yok
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-white">İkramiye Dağıtımı</h3>
                <p className="text-xs text-gray-400">{prize.sourceNote}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {prize.weekLabel}
              </span>
            </div>

            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 mb-4 font-mono">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Haftalık hasılat:</span>
                <span className="font-bold text-white">{formatTl(prize.totalTurnoverTL)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-400">
                <span>{prize.announced ? '15\'ten devreden:' : '15 havuzuna devir:'}</span>
                <span className="font-bold">
                  {formatTl(prize.announced ? prize.rolloverToNextWeekTL : prize.rolloverFromPreviousTL)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {([
                { key: '15', label: '15 Bilenler', titleClass: 'text-emerald-400', prizeClass: 'text-emerald-400', cardClass: 'bg-gradient-to-r from-emerald-950/40 to-[#0B0F19] border-emerald-500/40', tier: prize.tier15 },
                { key: '14', label: '14 Bilenler', titleClass: 'text-teal-400', prizeClass: 'text-teal-400', cardClass: 'border-gray-800', tier: prize.tier14 },
                { key: '13', label: '13 Bilenler', titleClass: 'text-blue-400', prizeClass: 'text-blue-400', cardClass: 'border-gray-800', tier: prize.tier13 },
                { key: '12', label: '12 Bilenler', titleClass: 'text-purple-400', prizeClass: 'text-purple-400', cardClass: 'border-gray-800', tier: prize.tier12 }
              ] as const).map(row => (
                <div
                  key={row.key}
                  className={`bg-[#0B0F19] border rounded-xl p-3 flex items-center justify-between ${row.cardClass}`}
                >
                  <div>
                    <div className={`text-xs font-black ${row.titleClass} flex items-center gap-1`}>
                      {row.key === '15' && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{row.label}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {row.tier.note
                        ? row.tier.note
                        : row.tier.winners === null
                        ? 'Henüz açıklanmadı'
                        : row.tier.winners === 0
                        ? 'Kazanan yok'
                        : `${row.tier.winners} adet kazanan kupon`}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-sm font-black text-white tabular-nums">
                      {formatTl(row.tier.prizePerWinnerTL)}
                    </div>
                    <div className={`text-[9px] ${row.prizeClass}`}>Kişi başı</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

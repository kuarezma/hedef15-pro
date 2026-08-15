import React, { useState } from 'react';
import { Column, LiveMatchStatus, Match, Outcome, SavedCoupon } from '../core/types';
import { countMatches } from '../core/combinatorics';
import {
  Trophy,
  CheckCircle2,
  Calendar,
  DollarSign,
  Award,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OfficialResultsProps {
  matches: Match[];
  matchStatuses: LiveMatchStatus[];
  savedCoupons: SavedCoupon[];
  currentColumns: Column[];
  onRefreshResults: () => void;
  isRefreshing: boolean;
}

export const OfficialResults: React.FC<OfficialResultsProps> = ({
  matches,
  matchStatuses,
  savedCoupons,
  currentColumns,
  onRefreshResults,
  isRefreshing
}) => {
  const [selectedWeek, setSelectedWeek] = useState<string>('2026_w1');
  const [couponCheckResult, setCouponCheckResult] = useState<{
    totalChecked: number;
    hits15: number;
    hits14: number;
    hits13: number;
    hits12: number;
    estimatedWonTL: number;
  } | null>(null);

  // Extract official outcomes
  const officialOutcomes: Outcome[] = matchStatuses.map(s => s.currentOutcome);

  const finishedCount = matchStatuses.filter(s => s.status === 'FINISHED' || s.minute >= 90).length;
  const liveCount = matchStatuses.filter(s => s.minute > 0 && s.minute < 90).length;
  const scheduledCount = 15 - finishedCount - liveCount;

  // Official prize pool estimates for the week
  const prizePool = {
    totalTurnoverTL: 48500000,
    rolloverTL: 12500000, // 15'e devreden
    tier15: { winners: 3, prizePerWinnerTL: 9833333 },
    tier14: { winners: 74, prizePerWinnerTL: 65540 },
    tier13: { winners: 820, prizePerWinnerTL: 5914 },
    tier12: { winners: 7450, prizePerWinnerTL: 813 }
  };

  const handleCheckAllCoupons = () => {
    let hits15 = 0;
    let hits14 = 0;
    let hits13 = 0;
    let hits12 = 0;
    let totalCols = currentColumns.length;

    // Check currently generated columns
    for (const col of currentColumns) {
      const matchCount = countMatches(col, officialOutcomes);
      if (matchCount === 15) hits15++;
      else if (matchCount === 14) hits14++;
      else if (matchCount === 13) hits13++;
      else if (matchCount === 12) hits12++;
    }

    // Check all saved coupons
    for (const sc of savedCoupons) {
      totalCols += sc.columns.length;
      for (const col of sc.columns) {
        const matchCount = countMatches(col, officialOutcomes);
        if (matchCount === 15) hits15++;
        else if (matchCount === 14) hits14++;
        else if (matchCount === 13) hits13++;
        else if (matchCount === 12) hits12++;
      }
    }

    const estimatedWonTL =
      hits15 * prizePool.tier15.prizePerWinnerTL +
      hits14 * prizePool.tier14.prizePerWinnerTL +
      hits13 * prizePool.tier13.prizePerWinnerTL +
      hits12 * prizePool.tier12.prizePerWinnerTL;

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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-[#0B0F19] to-gray-900 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Spor Toto Resmi Sonuçları & İkramiye Dağıtımı
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider shrink-0">
                Resmi Bülten
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Haftanın 15 resmi maç skorunu, kazanan sonuçları ve resmi ikramiye dağıtım tablosunu inceleyin.
            </p>
          </div>
        </div>

        {/* Action Buttons & Week Selector */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="2026_w1">2026/2027 Sezonu 1. Hafta (Güncel)</option>
            <option value="2025_w42">2025/2026 Sezonu 42. Hafta (Arşiv)</option>
            <option value="2025_w41">2025/2026 Sezonu 41. Hafta (Devirli)</option>
          </select>

          <button
            onClick={onRefreshResults}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 active:scale-95"
            title="Mackolik ve Spor Toto resmi skorlarını yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sonuçları Yenile</span>
          </button>
        </div>
      </div>

      {/* Quick Check Coupons Against Official Results */}
      <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Kuponlarımı Resmi Sonuçla Otomatik Denetle
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Oluşturduğunuz ve kaydettiğiniz tüm kuponları resmi 15 maç sonucuyla saniyede karşılaştırır, kaç adet 15, 14, 13, 12 tutturduğunuzu hesaplar.
          </p>
        </div>

        <button
          onClick={handleCheckAllCoupons}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Kuponlarımı Sorgula & Kazancımı Gör</span>
        </button>
      </div>

      {/* Coupon Inspection Result Card */}
      {couponCheckResult && (
        <div className="bg-gradient-to-br from-emerald-950/30 via-[#0B0F19] to-gray-900 border-2 border-emerald-500/50 rounded-2xl p-5 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Sorgulama Raporu</span>
              <h3 className="text-base font-black text-white">
                Toplam {couponCheckResult.totalChecked.toLocaleString()} Kolon İncelendi
              </h3>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-gray-400 font-sans block">Tahmini Toplam Kazanç</span>
              <span className="text-xl font-black text-emerald-400 tabular-nums">
                {couponCheckResult.estimatedWonTL.toLocaleString()} TL
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="bg-[#0B0F19] border border-emerald-500/30 p-3 rounded-xl">
              <div className="text-[10px] text-emerald-400 font-sans font-bold">15 Bilen</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{couponCheckResult.hits15} Kolon</div>
              <div className="text-[10px] text-gray-500">Büyük İkramiye</div>
            </div>

            <div className="bg-[#0B0F19] border border-teal-500/30 p-3 rounded-xl">
              <div className="text-[10px] text-teal-400 font-sans font-bold">14 Bilen</div>
              <div className="text-xl font-black text-teal-400 mt-0.5">{couponCheckResult.hits14} Kolon</div>
              <div className="text-[10px] text-gray-500">1 Hata Payı</div>
            </div>

            <div className="bg-[#0B0F19] border border-blue-500/30 p-3 rounded-xl">
              <div className="text-[10px] text-blue-400 font-sans font-bold">13 Bilen</div>
              <div className="text-xl font-black text-blue-400 mt-0.5">{couponCheckResult.hits13} Kolon</div>
              <div className="text-[10px] text-gray-500">2 Hata Payı</div>
            </div>

            <div className="bg-[#0B0F19] border border-purple-500/30 p-3 rounded-xl">
              <div className="text-[10px] text-purple-400 font-sans font-bold">12 Bilen</div>
              <div className="text-xl font-black text-purple-400 mt-0.5">{couponCheckResult.hits12} Kolon</div>
              <div className="text-[10px] text-gray-500">3 Hata Payı</div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: 15 Official Match Results Table & Prize Payout Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 15 Official Matches List (7 Cols) */}
        <div className="lg:col-span-7 bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
            <div>
              <h3 className="text-sm font-bold text-white">15 Maçın Resmi Skorları</h3>
              <p className="text-xs text-gray-400">
                {finishedCount} Bitti • {liveCount} Canlı • {scheduledCount} Başlamadı
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {matches.map((m, idx) => {
              const status = matchStatuses[idx];
              const isFinished = status?.status === 'FINISHED' || (status?.minute ?? 0) >= 90;
              const isLive = (status?.minute ?? 0) > 0 && !isFinished;

              return (
                <div
                  key={m.id}
                  className={`bg-[#0B0F19] border rounded-xl p-3 flex items-center justify-between gap-3 font-sans transition-all ${
                    isFinished
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : isLive
                      ? 'border-amber-500/40 bg-amber-950/10'
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

                  {/* Status & Official Score */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right font-mono">
                      <div className="text-xs sm:text-sm font-black text-white tabular-nums">
                        {status ? `${status.homeScore} - ${status.awayScore}` : '0 - 0'}
                      </div>
                      <div className="text-[9px] text-gray-400 font-sans">
                        {isFinished ? 'MS (Bitti)' : isLive ? `${status.minute}' Canlı` : 'Başlamadı'}
                      </div>
                    </div>

                    {/* Winning Outcome Badge */}
                    <span className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                      status?.currentOutcome === '1'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : status?.currentOutcome === 'X'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-cyan-500 text-white shadow-sm'
                    }`}>
                      {status?.currentOutcome ?? 'X'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Official Prize Pool Payouts Table (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-white">Resmi İkramiye Dağıtımı</h3>
                <p className="text-xs text-gray-400">Spor Toto Teşkilat Başkanlığı Resmi Havuz</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                1. Hafta
              </span>
            </div>

            {/* Total Turnover Banner */}
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 mb-4 font-mono">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Haftalık Toplam Hasılat:</span>
                <span className="font-bold text-white">{prizePool.totalTurnoverTL.toLocaleString()} TL</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-400">
                <span>15'e Devreden Tutar:</span>
                <span className="font-bold">{prizePool.rolloverTL.toLocaleString()} TL</span>
              </div>
            </div>

            {/* Payout Tiers List */}
            <div className="space-y-2.5">
              {/* 15 Bilen */}
              <div className="bg-gradient-to-r from-emerald-950/40 to-[#0B0F19] border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>15 Bilenler (%35 + Devir)</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {prizePool.tier15.winners} Adet Kazanan Kupon
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-black text-white tabular-nums">
                    {prizePool.tier15.prizePerWinnerTL.toLocaleString()} TL
                  </div>
                  <div className="text-[9px] text-emerald-400">Kişi Başı</div>
                </div>
              </div>

              {/* 14 Bilen */}
              <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-teal-400">14 Bilenler (%20)</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {prizePool.tier14.winners} Adet Kazanan Kupon
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-black text-white tabular-nums">
                    {prizePool.tier14.prizePerWinnerTL.toLocaleString()} TL
                  </div>
                  <div className="text-[9px] text-teal-400">Kişi Başı</div>
                </div>
              </div>

              {/* 13 Bilen */}
              <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-400">13 Bilenler (%20)</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {prizePool.tier13.winners} Adet Kazanan Kupon
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-black text-white tabular-nums">
                    {prizePool.tier13.prizePerWinnerTL.toLocaleString()} TL
                  </div>
                  <div className="text-[9px] text-blue-400">Kişi Başı</div>
                </div>
              </div>

              {/* 12 Bilen */}
              <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-purple-400">12 Bilenler (%25)</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {prizePool.tier12.winners} Adet Kazanan Kupon
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-black text-white tabular-nums">
                    {prizePool.tier12.prizePerWinnerTL.toLocaleString()} TL
                  </div>
                  <div className="text-[9px] text-purple-400">Kişi Başı</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

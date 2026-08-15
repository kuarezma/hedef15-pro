import React, { useState, useMemo } from 'react';
import { Match, Outcome } from '../core/types';
import { simulatePrizeDistribution } from '../core/prizeEngine';
import { DollarSign, TrendingUp, Award, Coins, PieChart, ShieldCheck } from 'lucide-react';

interface PrizeCalculatorProps {
  matches: Match[];
}

export const PrizeCalculator: React.FC<PrizeCalculatorProps> = ({ matches }) => {
  const [turnoverTL, setTurnoverTL] = useState<number>(30000000); // 30 Milyon TL
  const [rolloverTL, setRolloverTL] = useState<number>(15000000); // 15 Milyon TL Devir
  const [unitPriceTL, setUnitPriceTL] = useState<number>(2.0);

  // Selected default outcomes for calculation
  const defaultOutcomes: Outcome[] = useMemo(() => {
    return matches.map(m => {
      if (m.userPicks['1']) return '1';
      if (m.userPicks['X']) return 'X';
      return '2';
    });
  }, [matches]);

  const publicDistributions = useMemo(() => {
    return matches.map(m => m.publicPicks);
  }, [matches]);

  const simulation = useMemo(() => {
    return simulatePrizeDistribution({
      totalTurnoverTL: turnoverTL,
      rollover15TL: rolloverTL,
      payoutRate: 0.50,
      outcomes: defaultOutcomes,
      publicDistributions,
      unitPriceTL
    });
  }, [turnoverTL, rolloverTL, unitPriceTL, defaultOutcomes, publicDistributions]);

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Resmi Spor Toto İkramiye & Havuz Simülatörü</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Hasılat, devir tutarı ve halk dağılımına göre tüm derecelerin (15, 14, 13, 12) tahmini ikramiye paylarını anlık hesaplar.
          </p>
        </div>
      </div>

      {/* Input Parameters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-300">Tahmini Toplam Hasılat</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {(turnoverTL / 1000000).toFixed(1)} Milyon TL
            </span>
          </div>
          <input
            type="range"
            min="5000000"
            max="80000000"
            step="1000000"
            value={turnoverTL}
            onChange={(e) => setTurnoverTL(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>5M TL</span>
            <span>80M TL</span>
          </div>
        </div>

        <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-300">Önceki Haftadan Devreden</span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {(rolloverTL / 1000000).toFixed(1)} Milyon TL
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50000000"
            step="1000000"
            value={rolloverTL}
            onChange={(e) => setRolloverTL(Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>0 TL (Devir Yok)</span>
            <span>50M TL</span>
          </div>
        </div>

        <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-xs font-bold text-gray-300">Toplam Oynanan Kolon Hacmi</div>
          <div className="text-lg font-black text-cyan-400 font-mono">
            {Math.floor(turnoverTL / unitPriceTL).toLocaleString()} Kolon
          </div>
          <div className="text-[10px] text-gray-500">Yasal İkramiye Dağıtım Oranı: %50</div>
        </div>
      </div>

      {/* 4 Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tier 15 */}
        <div className="bg-gradient-to-br from-emerald-950/30 to-[#0B0F19] border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                15 BİLENLER
              </span>
              <span className="text-[10px] text-gray-400">%35 + Devir</span>
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {simulation.pool15.toLocaleString()} TL
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Toplam 15 Havuzu</div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/20 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>Tahmini Kazanan:</span>
              <span className="font-mono font-bold text-white">
                {simulation.estimatedWinners['15'] === 0 ? '0 (Devir Eder!)' : `${simulation.estimatedWinners['15']} Kişi`}
              </span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Kişi Başı İkramiye:</span>
              <span className="font-mono font-black">
                {simulation.estimatedPayoutPerWinner['15'].toLocaleString()} TL
              </span>
            </div>
          </div>
        </div>

        {/* Tier 14 */}
        <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-teal-400 px-2 py-0.5 rounded bg-teal-500/20 border border-teal-500/30">
                14 BİLENLER
              </span>
              <span className="text-[10px] text-gray-400">%20 Havuz</span>
            </div>
            <div className="text-xl font-black text-white font-mono mt-2">
              {simulation.pool14.toLocaleString()} TL
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Toplam 14 Havuzu</div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Tahmini Kazanan:</span>
              <span className="font-mono font-bold text-white">{simulation.estimatedWinners['14']} Kişi</span>
            </div>
            <div className="flex justify-between text-teal-400 font-bold">
              <span>Kişi Başı İkramiye:</span>
              <span className="font-mono font-black">
                {simulation.estimatedPayoutPerWinner['14'].toLocaleString()} TL
              </span>
            </div>
          </div>
        </div>

        {/* Tier 13 */}
        <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-blue-400 px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">
                13 BİLENLER
              </span>
              <span className="text-[10px] text-gray-400">%20 Havuz</span>
            </div>
            <div className="text-xl font-black text-white font-mono mt-2">
              {simulation.pool13.toLocaleString()} TL
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Toplam 13 Havuzu</div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Tahmini Kazanan:</span>
              <span className="font-mono font-bold text-white">{simulation.estimatedWinners['13']} Kişi</span>
            </div>
            <div className="flex justify-between text-blue-400 font-bold">
              <span>Kişi Başı İkramiye:</span>
              <span className="font-mono font-black">
                {simulation.estimatedPayoutPerWinner['13'].toLocaleString()} TL
              </span>
            </div>
          </div>
        </div>

        {/* Tier 12 */}
        <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-purple-400 px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                12 BİLENLER
              </span>
              <span className="text-[10px] text-gray-400">%25 Havuz</span>
            </div>
            <div className="text-xl font-black text-white font-mono mt-2">
              {simulation.pool12.toLocaleString()} TL
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Toplam 12 Havuzu</div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Tahmini Kazanan:</span>
              <span className="font-mono font-bold text-white">{simulation.estimatedWinners['12']} Kişi</span>
            </div>
            <div className="flex justify-between text-purple-400 font-bold">
              <span>Kişi Başı İkramiye:</span>
              <span className="font-mono font-black">
                {simulation.estimatedPayoutPerWinner['12'].toLocaleString()} TL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

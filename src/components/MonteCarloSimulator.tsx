import React, { useState, useMemo } from 'react';
import { Column, Match } from '../core/types';
import { runMonteCarloSimulation, MonteCarloResult } from '../core/monteCarloEngine';
import {
  Dice5,
  TrendingUp,
  Award,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Percent,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MonteCarloSimulatorProps {
  matches: Match[];
  columns: Column[];
  unitPriceTL: number;
}

export const MonteCarloSimulator: React.FC<MonteCarloSimulatorProps> = ({
  matches,
  columns,
  unitPriceTL
}) => {
  const [simCount, setSimCount] = useState<number>(10000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [result, setResult] = useState<MonteCarloResult | null>(() => {
    if (columns.length > 0) {
      return runMonteCarloSimulation(matches, columns.slice(0, 1000), 5000, unitPriceTL);
    }
    return null;
  });

  const handleRunSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      // Sample columns if too large to run 50k quickly in browser
      const sample = columns.length > 2000 ? columns.slice(0, 2000) : columns;
      const res = runMonteCarloSimulation(matches, sample, simCount, unitPriceTL);
      setResult(res);
      setIsSimulating(false);

      if (res.hitProbabilities['15'] > 0 || res.hitProbabilities['14'] > 5) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    }, 250);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/90 via-[#0B0F19] to-gray-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-400 p-0.5 shadow-lg shadow-purple-500/20 shrink-0">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Dice5 className="w-6 h-6 text-purple-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Monte Carlo Kupon Simülatörü & Olasılık Stres-Testi
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 uppercase tracking-wider shrink-0">
                10.000+ Sezon Testi
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Kuponunuzun gerçek piyasa olasılıklarına göre 10.000 sanal hafta sonundaki kazanma ihtimalini, beklenen getirisini (ROI) ve amorti olasılığını hesaplar.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <select
            value={simCount}
            onChange={(e) => setSimCount(Number(e.target.value))}
            className="bg-[#0B0F19] border border-gray-700 text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer font-mono"
          >
            <option value={5000}>5.000 Simülasyon (Hızlı)</option>
            <option value={10000}>10.000 Simülasyon (Standart)</option>
            <option value={25000}>25.000 Simülasyon (Yüksek Hassasiyet)</option>
          </select>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating || columns.length === 0}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isSimulating ? 'Simüle Ediliyor...' : 'Simülasyonu Başlat'}</span>
          </button>
        </div>
      </div>

      {columns.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-xs">
          Simülasyon çalıştırabilmek için lütfen önce maç tercihlerinizi yapıp kupon oluşturun.
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 15 Prob */}
            <div className="bg-[#0B0F19] border border-emerald-500/40 rounded-2xl p-4 text-center">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">15 Tutturma Şansı</div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">
                %{result.hitProbabilities['15']}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                {result.hitCounts['15']} / {result.simulationsCount.toLocaleString()}
              </div>
            </div>

            {/* 14 Prob */}
            <div className="bg-[#0B0F19] border border-teal-500/40 rounded-2xl p-4 text-center">
              <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">14 Tutturma Şansı</div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">
                %{result.hitProbabilities['14']}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                {result.hitCounts['14']} / {result.simulationsCount.toLocaleString()}
              </div>
            </div>

            {/* 13 & 12 At Least */}
            <div className="bg-[#0B0F19] border border-blue-500/40 rounded-2xl p-4 text-center">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">İkramiye Kazanma (%12+)</div>
              <div className="text-2xl font-black text-white font-mono tabular-nums">
                %{result.hitProbabilities['at_least_12']}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">En Az 12 Bilme</div>
            </div>

            {/* Expected Return */}
            <div className="bg-[#0B0F19] border border-amber-500/40 rounded-2xl p-4 text-center">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Beklenen Getiri (EV)</div>
              <div className={`text-2xl font-black font-mono tabular-nums ${result.financials.roiPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.financials.roiPercent >= 0 ? `+${result.financials.roiPercent}%` : `${result.financials.roiPercent}%`}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                Ort. {result.financials.expectedReturnTL.toLocaleString()} TL
              </div>
            </div>
          </div>

          {/* Graphical Histogram Distribution */}
          <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-bold text-white mb-3 flex items-center justify-between">
              <span>İsabet Dağılım Grafiği (0 - 15 İsabet Histogramı)</span>
              <span className="text-[10px] text-gray-400 font-mono">{result.simulationsCount.toLocaleString()} Simülasyon</span>
            </h3>

            <div className="space-y-2">
              {result.distribution
                .filter(d => d.hits >= 8)
                .map((item) => {
                  const isTopTier = item.hits >= 12;
                  const barColor = item.hits === 15
                    ? 'bg-emerald-500'
                    : item.hits === 14
                    ? 'bg-teal-500'
                    : item.hits === 13
                    ? 'bg-blue-500'
                    : item.hits === 12
                    ? 'bg-purple-500'
                    : 'bg-gray-700';

                  return (
                    <div key={item.hits} className="flex items-center gap-3 text-xs font-mono">
                      <span className={`w-14 text-right font-bold shrink-0 ${isTopTier ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {item.hits} İsabet:
                      </span>
                      <div className="flex-1 bg-gray-800/80 h-3.5 rounded-full overflow-hidden flex">
                        <div
                          className={`${barColor} h-full transition-all duration-500 rounded-full`}
                          style={{ width: `${Math.min(100, item.percent * 3)}%` }}
                        ></div>
                      </div>
                      <span className="w-14 text-right font-bold text-white shrink-0 tabular-nums">
                        %{item.percent}
                      </span>
                      <span className="w-20 text-right text-[10px] text-gray-500 shrink-0 hidden sm:inline tabular-nums">
                        ({item.count.toLocaleString()})
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

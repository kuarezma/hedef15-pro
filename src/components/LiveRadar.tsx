import React from 'react';
import { Column, Match } from '../core/types';
import { useLiveSimulator } from '../hooks/useLiveSimulator';
import { Radio, Play, Pause, RotateCcw, FastForward, Activity, Flame } from 'lucide-react';

interface LiveRadarProps {
  matches: Match[];
  columns: Column[];
}

export const LiveRadar: React.FC<LiveRadarProps> = ({ matches, columns }) => {
  const {
    isLiveRunning,
    setIsLiveRunning,
    matchStatuses,
    radarState,
    stepSimulation,
    resetSimulation,
    fastForwardToFinish,
    useLiveApi,
    setUseLiveApi,
    liveApiActive
  } = useLiveSimulator(matches, columns);

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-sm">
      {/* Header & Simulator Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
            <h2 className="text-base font-bold text-white tracking-tight">Canlı Hafta Sonu Skor & Derece Radarı</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
              {useLiveApi && liveApiActive ? 'CANLI API' : isLiveRunning ? 'SİMÜLASYON' : 'HAZIR / DURDU'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Maçlar oynanırken tüm kuponlarınızın anlık derecesini (15, 14, 13, 12) saniye saniye simüle eder.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setUseLiveApi(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              useLiveApi
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
            }`}
          >
            {useLiveApi ? 'Canlı API Açık' : 'Canlı API'}
          </button>

          <button
            onClick={() => setIsLiveRunning(prev => !prev)}
            disabled={useLiveApi}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shrink-0 ${
              isLiveRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
            }`}
          >
            {isLiveRunning ? <Pause className="w-3.5 h-3.5 shrink-0" /> : <Play className="w-3.5 h-3.5 shrink-0" />}
            <span className="whitespace-nowrap">{isLiveRunning ? 'Duraklat' : 'Simülasyonu Başlat'}</span>
          </button>

          <button
            onClick={stepSimulation}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1 active:scale-95 shrink-0"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="whitespace-nowrap">+5 Dk İlerle</span>
          </button>

          <button
            onClick={fastForwardToFinish}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1 active:scale-95 shrink-0"
          >
            <FastForward className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="whitespace-nowrap">Maçları Bitir (FT)</span>
          </button>

          <button
            onClick={resetSimulation}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl border border-gray-700 transition-colors shrink-0 active:scale-95"
            title="Simülasyonu Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-Time Live Status Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-gradient-to-br from-emerald-950/40 to-[#0B0F19] border border-emerald-500/40 rounded-xl p-3 text-center shadow-md">
          <div className="text-[10px] text-emerald-400 font-bold uppercase">15'te Kalan Kolon</div>
          <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums mt-0.5">
            {radarState.counts['15']}
          </div>
          <div className="text-[10px] text-gray-400">Canlı Şampiyonluk</div>
        </div>

        <div className="bg-[#0B0F19] border border-teal-500/30 rounded-xl p-3 text-center">
          <div className="text-[10px] text-teal-400 font-bold uppercase">14 Potansiyeli</div>
          <div className="text-2xl font-black text-teal-400 font-mono tabular-nums mt-0.5">
            {radarState.counts['14']}
          </div>
          <div className="text-[10px] text-gray-400">1 Hata Payı</div>
        </div>

        <div className="bg-[#0B0F19] border border-blue-500/30 rounded-xl p-3 text-center">
          <div className="text-[10px] text-blue-400 font-bold uppercase">13 Potansiyeli</div>
          <div className="text-2xl font-black text-blue-400 font-mono tabular-nums mt-0.5">
            {radarState.counts['13']}
          </div>
          <div className="text-[10px] text-gray-400">2 Hata Payı</div>
        </div>

        <div className="bg-[#0B0F19] border border-purple-500/30 rounded-xl p-3 text-center">
          <div className="text-[10px] text-purple-400 font-bold uppercase">12 Potansiyeli</div>
          <div className="text-2xl font-black text-purple-400 font-mono tabular-nums mt-0.5">
            {radarState.counts['12']}
          </div>
          <div className="text-[10px] text-gray-400">3 Hata Payı</div>
        </div>

        <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
          <div className="text-[10px] text-gray-500 font-bold uppercase">Derece Dışı</div>
          <div className="text-2xl font-black text-gray-400 font-mono tabular-nums mt-0.5">
            {radarState.counts.lost}
          </div>
          <div className="text-[10px] text-gray-500">Elenenler</div>
        </div>
      </div>

      {/* 15 Matches Live Score Cards */}
      <div>
        <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Canlı Maç Skorları & Anlık İhtimal</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {matches.map((m, idx) => {
            const status = matchStatuses[idx];
            const isLive = status.minute > 0 && status.minute < 90;
            const isFinished = status.minute >= 90;

            return (
              <div
                key={m.id}
                className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 flex items-center justify-between gap-2 min-h-[58px]"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded bg-gray-800 text-gray-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                    {m.order}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-gray-200 truncate">
                      {m.homeTeam} - {m.awayTeam}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {isFinished ? (
                        <span className="text-gray-400 font-semibold">MS (Bitti)</span>
                      ) : isLive ? (
                        <span className="text-emerald-400 font-bold animate-pulse font-mono tabular-nums">{status.minute}' Canlı</span>
                      ) : (
                        <span>Henüz Başlamadı</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="font-mono text-xs sm:text-sm font-black text-white bg-gray-900 px-2 py-1 rounded-lg border border-gray-800 min-w-[48px] text-center tabular-nums">
                    {status.homeScore} - {status.awayScore}
                  </div>
                  <span className={`w-6 h-6 rounded-lg font-mono font-extrabold text-xs flex items-center justify-center shrink-0 ${
                    status.currentOutcome === '1'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : status.currentOutcome === 'X'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    {status.currentOutcome}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

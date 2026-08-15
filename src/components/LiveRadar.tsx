import React from 'react';
import { Column, Match } from '../core/types';
import { useLiveSimulator } from '../hooks/useLiveSimulator';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Activity,
  Flame,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  Sparkles,
  X,
  Bell
} from 'lucide-react';

interface LiveRadarProps {
  matches: Match[];
  columns: Column[];
}

export const LiveRadar: React.FC<LiveRadarProps> = ({ matches, columns }) => {
  const {
    isLiveRunning,
    setIsLiveRunning,
    isSoundEnabled,
    setIsSoundEnabled,
    autoPollInterval,
    setAutoPollInterval,
    matchStatuses,
    radarState,
    recentGoals,
    activeGoalToast,
    isFetchingLive,
    syncMackolikScores,
    resetSimulation,
    fastForwardToFinish,
    dismissGoalToast
  } = useLiveSimulator(matches, columns);

  return (
    <div className="relative">
      {/* Real-Time Goal Toast Notification Overlay */}
      {activeGoalToast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-300 max-w-sm w-full flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
              ⚽
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>GOL OLDU! (Dk {activeGoalToast.minute}')</span>
              </div>
              <h4 className="text-sm font-black text-white">
                {activeGoalToast.scoringTeam}
              </h4>
              <p className="text-xs font-bold text-emerald-100 font-mono">
                {activeGoalToast.homeTeam} {activeGoalToast.newScore} {activeGoalToast.awayTeam}
              </p>
            </div>
          </div>
          <button
            onClick={dismissGoalToast}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-sm">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Mackolik Canlı Skor & Derece Radarı
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                {isLiveRunning ? 'CANLI TAKİP AÇIK' : 'BEKLEMEDE'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Mackolik canlı skorlarıyla entegre çalışır; gol olduğunda anında sesli bildirim verir ve kupon derecelerinizi hesaplar.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Mackolik Sync Button */}
            <button
              onClick={syncMackolikScores}
              disabled={isFetchingLive}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
              title="Mackolik canlı sonuçlarını sorgula"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? 'animate-spin' : ''}`} />
              <span>Mackolik'ten Çek</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsSoundEnabled(prev => !prev)}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all shrink-0 active:scale-95 ${
                isSoundEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
              title={isSoundEnabled ? 'Gol Sesi Açık' : 'Gol Sesi Kapalı'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Auto Poll Interval Selector */}
            <div className="flex items-center gap-1 bg-[#0B0F19] border border-gray-800 rounded-xl px-2 py-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={autoPollInterval}
                onChange={(e) => setAutoPollInterval(Number(e.target.value))}
                className="bg-transparent text-xs text-gray-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value={10}>10 Sn</option>
                <option value={15}>15 Sn</option>
                <option value={30}>30 Sn</option>
                <option value={60}>60 Sn</option>
              </select>
            </div>

            {/* Play / Pause Simulation */}
            <button
              onClick={() => setIsLiveRunning(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shrink-0 ${
                isLiveRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              }`}
            >
              {isLiveRunning ? <Pause className="w-3.5 h-3.5 shrink-0" /> : <Play className="w-3.5 h-3.5 shrink-0" />}
              <span className="whitespace-nowrap">{isLiveRunning ? 'Durdur' : 'Canlı Başlat'}</span>
            </button>

            {/* Finish FT */}
            <button
              onClick={fastForwardToFinish}
              className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1 active:scale-95 shrink-0"
              title="Tüm maçları 90. dakikada bitir"
            >
              <FastForward className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Bitir (FT)</span>
            </button>

            {/* Reset */}
            <button
              onClick={resetSimulation}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl border border-gray-700 transition-colors shrink-0 active:scale-95"
              title="Sıfırla"
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
        <div className="mb-6">
          <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>15 Spor Toto Maçının Anlık Skorları</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {matches.map((m, idx) => {
              const status = matchStatuses[idx];
              const isLive = status.minute > 0 && status.minute < 90;
              const isFinished = status.minute >= 90;

              return (
                <div
                  key={m.id}
                  className={`bg-[#0B0F19] border rounded-xl p-3 flex items-center justify-between gap-2 min-h-[58px] transition-all ${
                    isLive
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded bg-gray-800 text-gray-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                      {m.order}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-gray-200 truncate">
                        {m.homeTeam} - {m.awayTeam}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate flex items-center gap-1.5">
                        {isFinished ? (
                          <span className="text-gray-400 font-semibold">MS (Bitti)</span>
                        ) : isLive ? (
                          <span className="text-emerald-400 font-bold font-mono tabular-nums flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                            {status.minute}' Canlı
                          </span>
                        ) : (
                          <span>{m.matchDate} {m.matchTime}</span>
                        )}
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">{m.league}</span>
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

        {/* Live Goal Feed / Recent Goal Events Log */}
        {recentGoals.length > 0 && (
          <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5">
            <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Son Goller & Anlık Gelişmeler</span>
            </h4>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {recentGoals.map(goal => (
                <div key={goal.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-gray-900/60 border border-gray-800/60 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">⚽ GOL!</span>
                    <span className="text-white font-bold">{goal.scoringTeam}</span>
                    <span className="text-gray-500 text-[10px]">({goal.homeTeam} {goal.newScore} {goal.awayTeam})</span>
                  </div>
                  <span className="text-emerald-400 text-[11px] font-bold">Dk {goal.minute}'</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

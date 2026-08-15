import React, { useMemo } from 'react';
import { Match, Outcome } from '../core/types';
import { analyzeAllMatches } from '../core/valueEngine';
import { TrendingUp, Sparkles, AlertCircle, ShieldAlert, ArrowUpRight, Zap, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AIValueRadarProps {
  matches: Match[];
  onApplyValueSelections: (selections: { matchId: number; outcome: Outcome }[]) => void;
}

export const AIValueRadar: React.FC<AIValueRadarProps> = ({
  matches,
  onApplyValueSelections
}) => {
  const analysisList = useMemo(() => analyzeAllMatches(matches), [matches]);

  const strongValueList = useMemo(() => {
    return analysisList.filter(a => a.recommendation === 'STRONG_VALUE' || a.recommendation === 'VALUE');
  }, [analysisList]);

  const overpricedList = useMemo(() => {
    return analysisList.filter(a => a.recommendation === 'OVERPRICED');
  }, [analysisList]);

  const handleApplyOptimalCoupon = () => {
    // Generate AI recommendations
    const selections: { matchId: number; outcome: Outcome }[] = [];
    matches.forEach(m => {
      // Find outcome with highest value ratio or favorite
      const matchAnalyses = analysisList.filter(a => a.matchId === m.id);
      const best = matchAnalyses.sort((a, b) => b.valueRatio - a.valueRatio)[0];
      if (best) {
        selections.push({ matchId: m.id, outcome: best.outcome });
      }
    });

    onApplyValueSelections(selections);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
      {/* Header & 1-Click AI Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Yapay Zeka Değer (Value) Radarı & Arbitraj Analizi</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              +EV Engine
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            İddaa/Global piyasa olasılıkları ile Spor Toto halk dağılımını kıyaslayarak büyük ikramiyeyi getirecek gizli değerleri tespit eder.
          </p>
        </div>

        <button
          onClick={handleApplyOptimalCoupon}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Değer Odaklı Kuponu Kuponuma Yükle</span>
        </button>
      </div>

      {/* Value Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Strong Value Bets */}
        <div className="bg-[#0B0F19] border border-emerald-500/30 bg-emerald-950/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">Büyük İkramiye Fırsatları (Pozitif Değer)</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {strongValueList.length} Maç
            </span>
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {strongValueList.map((item, idx) => (
              <div key={idx} className="bg-gray-900/90 border border-gray-800 rounded-lg p-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-gray-200">
                    Maç {item.matchId}: {item.homeTeam} - {item.awayTeam} ({item.outcome})
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Piyasa Şansı: %{item.marketImpliedProb} | Halk Oynama: %{item.publicPickProb}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    {item.valueRatio}x Değer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Traps */}
        <div className="bg-[#0B0F19] border border-red-500/30 bg-red-950/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-bold text-white">Halk Tuzakları (Aşırı Şişirilmişler)</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400">
              {overpricedList.length} Maç
            </span>
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {overpricedList.map((item, idx) => (
              <div key={idx} className="bg-gray-900/90 border border-gray-800 rounded-lg p-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-gray-200">
                    Maç {item.matchId}: {item.homeTeam} - {item.awayTeam} ({item.outcome})
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Piyasa Şansı: %{item.marketImpliedProb} | Halk Yığılması: %{item.publicPickProb}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                    {item.valueRatio}x (Şişirilmiş)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comprehensive Match Analysis Table */}
      <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4">
        <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>Tüm 15 Maçın Detaylı Arbitraj Analiz Tablosu</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-semibold">
                <th className="pb-2">#</th>
                <th className="pb-2">Karşılaşma</th>
                <th className="pb-2 text-center">İhtimal</th>
                <th className="pb-2 text-center">Gerçek İhtimal</th>
                <th className="pb-2 text-center">Halk Tercihi</th>
                <th className="pb-2 text-center">Değer Çarpanı</th>
                <th className="pb-2">AI Tavsiyesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-medium">
              {analysisList.map((item, idx) => {
                const badgeColor = item.recommendation === 'STRONG_VALUE'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : item.recommendation === 'VALUE'
                  ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                  : item.recommendation === 'OVERPRICED'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-gray-800 text-gray-400 border-gray-700';

                return (
                  <tr key={idx} className="hover:bg-gray-900/40">
                    <td className="py-2 text-gray-500 font-mono">{item.matchId}</td>
                    <td className="py-2 text-white font-bold">{item.homeTeam} - {item.awayTeam}</td>
                    <td className="py-2 text-center font-mono font-bold text-emerald-400">{item.outcome}</td>
                    <td className="py-2 text-center font-mono text-gray-300">%{item.marketImpliedProb}</td>
                    <td className="py-2 text-center font-mono text-amber-400">%{item.publicPickProb}</td>
                    <td className="py-2 text-center font-mono font-extrabold text-white">{item.valueRatio}x</td>
                    <td className="py-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                        {item.recommendation}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

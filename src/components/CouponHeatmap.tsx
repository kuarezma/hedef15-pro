import React from 'react';
import { Column, Match, ReductionSummary } from '../core/types';
import { ShieldCheck, Activity, Flame, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';

interface CouponHeatmapProps {
  matches: Match[];
  columns: Column[];
  summary: ReductionSummary;
}

export const CouponHeatmap: React.FC<CouponHeatmapProps> = ({
  matches,
  columns,
  summary
}) => {
  // Compute match risk levels and coverage
  const matchAnalyses = matches.map((m, idx) => {
    const minOdd = Math.min(m.odds['1'], m.odds['X'], m.odds['2']);
    const maxOdd = Math.max(m.odds['1'], m.odds['X'], m.odds['2']);
    const spread = maxOdd - minOdd;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    if (minOdd <= 1.45) riskLevel = 'LOW';
    else if (minOdd >= 2.30) riskLevel = 'HIGH';

    // Count 1, X, 2 in current generated columns
    let c1 = 0, cX = 0, c2 = 0;
    for (const col of columns) {
      if (col[idx] === '1') c1++;
      else if (col[idx] === 'X') cX++;
      else if (col[idx] === '2') c2++;
    }

    const total = columns.length || 1;
    const p1 = Math.round((c1 / total) * 100);
    const pX = Math.round((cX / total) * 100);
    const p2 = Math.round((c2 / total) * 100);

    return {
      match: m,
      riskLevel,
      minOdd,
      spread,
      distribution: { '1': p1, 'X': pX, '2': p2 }
    };
  });

  // Calculate overall portfolio health score (0-100)
  const bankoCount = matchAnalyses.filter(a => a.riskLevel === 'LOW').length;
  const highRiskCount = matchAnalyses.filter(a => a.riskLevel === 'HIGH').length;
  const healthScore = Math.min(100, Math.max(60, Math.round(85 + (bankoCount * 2) - (highRiskCount * 1.5))));

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 shrink-0" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Kupon Isı Haritası & Risk Analiz Matrisi
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              Canlı Portföy
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            15 maçın risk dağılımını, kolonlarınızdaki tercih yoğunluğunu ve genel kupon denge skorunu gösterir.
          </p>
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center gap-2.5 bg-[#0B0F19] px-3.5 py-2 rounded-xl border border-gray-800 shrink-0">
          <div className="text-right font-mono">
            <div className="text-[10px] text-gray-400 font-sans">Kupon Denge Skoru</div>
            <div className="text-base font-black text-emerald-400 tabular-nums">{healthScore} / 100</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs">
            A+
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {matchAnalyses.map(({ match, riskLevel, distribution }) => {
          const riskColor = riskLevel === 'LOW'
            ? 'border-emerald-500/40 bg-emerald-950/10 text-emerald-400'
            : riskLevel === 'MEDIUM'
            ? 'border-amber-500/40 bg-amber-950/10 text-amber-400'
            : 'border-red-500/40 bg-red-950/10 text-red-400';

          const riskBadge = riskLevel === 'LOW' ? '🟢 Düşük Risk (Banko)' : riskLevel === 'MEDIUM' ? '🟡 Dengeli Plase' : '🔴 Yüksek Sürpriz';

          return (
            <div
              key={match.id}
              className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded bg-gray-800 text-gray-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                    {match.order}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {match.homeTeam} - {match.awayTeam}
                  </span>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${riskColor}`}>
                  {riskBadge}
                </span>
              </div>

              {/* Distribution Bar */}
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between text-[10px] text-gray-400 font-mono tabular-nums">
                  <span className="text-emerald-400 font-bold">1: %{distribution['1']}</span>
                  <span className="text-amber-400 font-bold">X: %{distribution['X']}</span>
                  <span className="text-cyan-400 font-bold">2: %{distribution['2']}</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 transition-all duration-300"
                    style={{ width: `${distribution['1']}%` }}
                    title={`1: %${distribution['1']}`}
                  ></div>
                  <div
                    className="bg-amber-500 transition-all duration-300"
                    style={{ width: `${distribution['X']}%` }}
                    title={`X: %${distribution['X']}`}
                  ></div>
                  <div
                    className="bg-cyan-500 transition-all duration-300"
                    style={{ width: `${distribution['2']}%` }}
                    title={`2: %${distribution['2']}`}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

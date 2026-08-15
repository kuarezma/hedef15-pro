import React, { useState } from 'react';
import { Match, FormulaType, GuaranteeTier, FilterConfig } from '../core/types';
import {
  Bot,
  Sparkles,
  Zap,
  Shield,
  Flame,
  Target,
  Sliders,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AICouponWizardProps {
  matches: Match[];
  onApplyAIOptimization: (params: {
    formulaType: FormulaType;
    guaranteeTier: GuaranteeTier;
    targetBudget: number;
    filters: Partial<FilterConfig>;
    picksModifier: (matches: Match[]) => Match[];
  }) => void;
}

export type AIStrategy = 'SAFE_BANKO' | 'BALANCED_14' | 'JACKPOT_HUNTER' | 'SURPRISE_9';

export const AICouponWizard: React.FC<AICouponWizardProps> = ({
  matches,
  onApplyAIOptimization
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<AIStrategy>('BALANCED_14');
  const [budget, setBudget] = useState<number>(300);
  const [surpriseLevel, setSurpriseLevel] = useState<number>(2);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const strategies = [
    {
      id: 'BALANCED_14' as AIStrategy,
      title: '⚖️ Dengeli 14 Garanti',
      desc: 'En popüler strateji. Favori bankolar + kritik maçlarda çifte şans ile 14 garanti Hamming indirgemesi.',
      badge: 'En Popüler',
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
      icon: Shield,
      defaultBudget: 250,
      tier: '14' as GuaranteeTier,
      formula: 'guaranteed_custom' as FormulaType
    },
    {
      id: 'SAFE_BANKO' as AIStrategy,
      title: '🛡️ Güvenli & Favori Ağırlıklı',
      desc: 'Düşük riskli favori takımlar üzerine kurulu, bütçeyi koruyan sağlam kupon yapısı.',
      badge: 'Düşük Risk',
      color: 'border-blue-500/40 bg-blue-950/20 text-blue-400',
      icon: CheckCircle2,
      defaultBudget: 120,
      tier: '14' as GuaranteeTier,
      formula: 'guaranteed_custom' as FormulaType
    },
    {
      id: 'JACKPOT_HUNTER' as AIStrategy,
      title: '🔥 Büyük İkramiye & Arbitraj',
      desc: 'Halkın kaçırdığı yapay zeka (+EV) değer tercihlerini yakalar, 15 devrettiğinde büyük havuzu hedefler.',
      badge: 'Yüksek Kazanç',
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
      icon: Flame,
      defaultBudget: 480,
      tier: '14' as GuaranteeTier,
      formula: 'site_ideal' as FormulaType
    },
    {
      id: 'SURPRISE_9' as AIStrategy,
      title: '🎯 9 Kolonluk Akıllı Matris',
      desc: '4 zorlu maçı tamamen kapatıp sadece 9 kolonda 13 garanti sağlayan süper tasarruf formülü.',
      badge: 'Minimum Maliyet',
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-400',
      icon: Target,
      defaultBudget: 18,
      tier: '13' as GuaranteeTier,
      formula: 'nine_columns' as FormulaType
    }
  ];

  const handleSelectStrategy = (strat: typeof strategies[0]) => {
    setSelectedStrategy(strat.id);
    setBudget(strat.defaultBudget);
  };

  const handleGenerateAICoupon = () => {
    setIsApplying(true);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    setTimeout(() => {
      const currentStrat = strategies.find(s => s.id === selectedStrategy)!;

      onApplyAIOptimization({
        formulaType: currentStrat.formula,
        guaranteeTier: currentStrat.tier,
        targetBudget: budget,
        filters: {
          enabled: true,
          surpriseCount: [1, surpriseLevel + 2],
          count1: [4, 11],
          countX: [1, 6],
          count2: [1, 6]
        },
        picksModifier: (currentMatches) => {
          return currentMatches.map((m, idx) => {
            if (selectedStrategy === 'SAFE_BANKO') {
              const lowest = Math.min(m.odds['1'], m.odds['X'], m.odds['2']);
              return {
                ...m,
                userPicks: {
                  '1': m.odds['1'] === lowest,
                  'X': m.odds['X'] === lowest,
                  '2': m.odds['2'] === lowest
                }
              };
            } else if (selectedStrategy === 'SURPRISE_9') {
              if (idx < 4) {
                return { ...m, userPicks: { '1': true, 'X': true, '2': true } };
              }
              const lowest = Math.min(m.odds['1'], m.odds['X'], m.odds['2']);
              return {
                ...m,
                userPicks: {
                  '1': m.odds['1'] === lowest,
                  'X': m.odds['X'] === lowest,
                  '2': m.odds['2'] === lowest
                }
              };
            } else if (selectedStrategy === 'JACKPOT_HUNTER') {
              // Pick highest EV arbitrage outcomes
              const sorted = [
                { out: '1' as const, prob: m.aiPicks['1'] },
                { out: 'X' as const, prob: m.aiPicks['X'] },
                { out: '2' as const, prob: m.aiPicks['2'] }
              ].sort((a, b) => b.prob - a.prob);

              return {
                ...m,
                userPicks: {
                  '1': sorted[0].out === '1' || (idx % 3 === 0 && sorted[1].out === '1'),
                  'X': sorted[0].out === 'X' || (idx % 3 === 0 && sorted[1].out === 'X'),
                  '2': sorted[0].out === '2' || (idx % 3 === 0 && sorted[1].out === '2')
                }
              };
            } else {
              // BALANCED 14
              const sorted = [
                { out: '1' as const, odd: m.odds['1'] },
                { out: 'X' as const, odd: m.odds['X'] },
                { out: '2' as const, odd: m.odds['2'] }
              ].sort((a, b) => a.odd - b.odd);

              const isDouble = idx === 1 || idx === 3 || idx === 6 || idx === 9 || idx === 11 || idx === 13;
              return {
                ...m,
                userPicks: {
                  '1': sorted[0].out === '1' || (isDouble && sorted[1].out === '1'),
                  'X': sorted[0].out === 'X' || (isDouble && sorted[1].out === 'X'),
                  '2': sorted[0].out === '2' || (isDouble && sorted[1].out === '2')
                }
              };
            }
          });
        }
      });

      setIsApplying(false);
    }, 400);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/90 via-[#0B0F19] to-gray-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Yapay Zeka Kupon Asistanı & Akıllı Optimizasyon
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider shrink-0">
                AI Auto-Pilot
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Hedef bütçenizi ve risk tercihinizi belirleyin, yapay zeka 15 maçı matematiksel olarak optimize edip ideal kuponu çıkarsın.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Strategy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {strategies.map((strat) => {
          const isSelected = selectedStrategy === strat.id;
          const Icon = strat.icon;

          return (
            <div
              key={strat.id}
              onClick={() => handleSelectStrategy(strat)}
              className={`rounded-2xl p-4 border transition-all cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? `${strat.color} ring-1 ring-emerald-400 shadow-lg`
                  : 'bg-[#0B0F19]/80 border-gray-800 hover:border-gray-700 hover:bg-gray-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                    {strat.badge}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1">{strat.title}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">{strat.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-gray-500">Önerilen Bütçe:</span>
                <span className="text-emerald-400 font-bold tabular-nums">{strat.defaultBudget} TL</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Sliders & One-Click Trigger */}
      <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {/* Target Budget Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400 font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Hedef Kupon Bütçesi:
              </span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">{budget} TL</span>
            </div>
            <input
              type="range"
              min="18"
              max="2000"
              step="10"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Surprise Level Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Sürpriz Maç Toleransı:
              </span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">{surpriseLevel} Sürpriz Maç</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={surpriseLevel}
              onChange={(e) => setSurpriseLevel(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateAICoupon}
          disabled={isApplying}
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isApplying ? 'Yapay Zeka Hesaplanıyor...' : 'AI ile Otomatik Kupon Üret'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

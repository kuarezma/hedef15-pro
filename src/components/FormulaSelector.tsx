import React from 'react';
import { FormulaType, GuaranteeTier } from '../core/types';
import { ShieldCheck, Percent, Layers, Sparkles, Grid, Sliders, DollarSign, Loader2, RefreshCw, Lock, Copy, BookOpen, Clover } from 'lucide-react';

interface FormulaSelectorProps {
  formulaType: FormulaType;
  setFormulaType: (type: FormulaType) => void;
  guaranteeTier: GuaranteeTier;
  setGuaranteeTier: (tier: GuaranteeTier) => void;
  targetBudgetTL: number;
  setTargetBudgetTL: (budget: number) => void;
  unitPriceTL: number;
  setUnitPriceTL: (price: number) => void;
  onRecalculate: () => void;
  isCalculating: boolean;
}

export const FormulaSelector: React.FC<FormulaSelectorProps> = ({
  formulaType,
  setFormulaType,
  guaranteeTier,
  setGuaranteeTier,
  targetBudgetTL,
  setTargetBudgetTL,
  unitPriceTL,
  setUnitPriceTL,
  onRecalculate,
  isCalculating
}) => {
  const formulas = [
    {
      id: 'guaranteed_custom' as FormulaType,
      title: '🎯 Garantili Özel Sistem',
      desc: '14, 13 veya 12 Garanti Hamming kodları ile israf kolonları eler, maliyeti %85 düşürür.',
      badge: 'Popüler',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400'
    },
    {
      id: 'nine_columns' as FormulaType,
      title: '🎯 9 Kolonlu Garantili',
      desc: '4 kapalı maçı 81 kolon yerine sadece 9 kolonda 13 garanti ile oynatır.',
      badge: 'Klasik Matris',
      icon: Grid,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400'
    },
    {
      id: 'probabilistic' as FormulaType,
      title: '% Yüzdesel Formülü',
      desc: 'Her maça verdiğiniz yüzde ihtimallerine göre belirlenen bütçede kolon üretir.',
      badge: 'Monte Carlo',
      icon: Percent,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400'
    },
    {
      id: 'site_ideal' as FormulaType,
      title: '🤖 AI Site İdeal',
      desc: 'İddaa piyasa oranları ile halk dağılımı arasındaki arbitrajı otomatik harmanlar.',
      badge: 'AI Destekli',
      icon: Sparkles,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400'
    },
    {
      id: 'super_seven' as FormulaType,
      title: '➆ Süper Yedili',
      desc: '7 kilit maç üzerine odaklanıp diğer maçları istatistiksel varyasyonla optimize eder.',
      badge: 'Stratejik',
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400'
    },
    {
      id: 'flat' as FormulaType,
      title: '─ Düz Oynama (Filtreli)',
      desc: 'Tüm kombinasyonları üretir ve sadece aktif filtre kurallarına uyanları alır.',
      badge: 'Standart',
      icon: Sliders,
      color: 'from-gray-500/20 to-slate-500/20 border-gray-500/40 text-gray-300'
    },
    {
      id: 'closed_only' as FormulaType,
      title: '🔒 Kapalı Formül',
      desc: 'Tüm maçları 1-X-2 kapalı oynayıp 13 garanti ile indirger.',
      badge: 'Tam Kapama',
      icon: Lock,
      color: 'from-red-500/20 to-orange-500/20 border-red-500/40 text-red-400'
    },
    {
      id: 'double_only' as FormulaType,
      title: '✌ Çifte Formül',
      desc: 'Her maçta en düşük 2 oranı seçerek çifte şans kombinasyonları üretir.',
      badge: 'Çifte Şans',
      icon: Copy,
      color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/40 text-indigo-400'
    },
    {
      id: 'comprehensive' as FormulaType,
      title: '📚 Kapsamlı Formül',
      desc: 'Geniş evren + 13 garanti indirgeme ile maksimum kapsama sağlar.',
      badge: 'Geniş Havuz',
      icon: BookOpen,
      color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/40 text-teal-400'
    },
    {
      id: 'chance_come' as FormulaType,
      title: '🍀 Şans Gele',
      desc: 'Yüksek sürpriz ağırlıklı Monte Carlo ile şanslı kolonlar üretir.',
      badge: 'Sürpriz',
      icon: Clover,
      color: 'from-lime-500/20 to-green-500/20 border-lime-500/40 text-lime-400'
    }
  ];

  const guaranteeTiers: { id: GuaranteeTier; label: string; desc: string }[] = [
    { id: '15', label: '15 Garanti', desc: 'Filtreler tutarsa %100 15 Garantisi' },
    { id: '14', label: '14 Garanti', desc: 'Maks. 1 hata payı (~%75 Tasarruf)' },
    { id: '13', label: '13 Garanti', desc: 'Maks. 2 hata payı (~%92 Tasarruf)' },
    { id: '12', label: '12 Garanti', desc: 'Maks. 3 hata payı (Geniş havuz)' }
  ];

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Formül & İndirgeme Modu Seçimi</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Bütçenize ve stratejinize en uygun matematiksel indirgeme algoritmasını seçin.
          </p>
        </div>

        {/* Target Budget & Unit Price Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRecalculate}
            disabled={isCalculating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed text-gray-200 rounded-xl border border-gray-700 text-xs font-semibold transition-colors shrink-0"
            title="Kolonları yeniden hesapla"
          >
            {isCalculating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="whitespace-nowrap">{isCalculating ? 'Hesaplanıyor…' : 'Yeniden Hesapla'}</span>
          </button>

          <div className="flex items-center gap-3 bg-[#0B0F19] px-3 py-1.5 rounded-xl border border-gray-800 shrink-0">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <label className="text-xs text-gray-400 font-medium whitespace-nowrap">Bütçe:</label>
            <input
              type="number"
              min="10"
              max="50000"
              step="10"
              value={targetBudgetTL}
              onChange={(e) => setTargetBudgetTL(Number(e.target.value))}
              className="w-16 bg-gray-900 border border-gray-700 focus:border-emerald-500 rounded px-1.5 py-0.5 text-xs font-bold font-mono tabular-nums text-emerald-400 text-right focus:outline-none"
            />
            <span className="text-xs text-gray-500">TL</span>
          </div>

          <div className="h-3.5 w-px bg-gray-800 shrink-0"></div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-400 font-medium whitespace-nowrap">Birim:</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={unitPriceTL}
              onChange={(e) => setUnitPriceTL(Number(e.target.value))}
              className="w-12 bg-gray-900 border border-gray-700 focus:border-emerald-500 rounded px-1.5 py-0.5 text-xs font-bold font-mono tabular-nums text-white text-right focus:outline-none"
            />
            <span className="text-xs text-gray-500">TL</span>
          </div>
          </div>
        </div>
      </div>

      {/* Formula Cards Grid with equal heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {formulas.map(formula => {
          const isSelected = formulaType === formula.id;
          const Icon = formula.icon;
          return (
            <div
              key={formula.id}
              onClick={() => setFormulaType(formula.id)}
              className={`relative cursor-pointer rounded-xl p-3.5 border transition-all duration-150 flex flex-col justify-between min-h-[92px] select-none ${
                isSelected
                  ? `bg-gradient-to-br ${formula.color} shadow-md ring-1 ring-emerald-500/50`
                  : 'bg-[#0B0F19]/80 border-gray-800 hover:border-gray-700 hover:bg-gray-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                    {formula.title}
                  </h3>
                </div>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 shrink-0 whitespace-nowrap">
                  {formula.badge}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed pl-7">
                {formula.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Guarantee Tier Selector */}
      {(formulaType === 'guaranteed_custom' || formulaType === 'nine_columns' || formulaType === 'comprehensive' || formulaType === 'closed_only' || formulaType === 'double_only') && (
        <div className="bg-[#0B0F19]/90 border border-gray-800 rounded-xl p-3 sm:p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-white">Hedef Garanti Seviyesi (Hamming Kapsaması)</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Tercihleriniz ve filtreleriniz tuttuğunda kazanması kesinleştirilen minimum derece:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto shrink-0">
            {guaranteeTiers.map(tier => {
              const isSelected = guaranteeTier === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => setGuaranteeTier(tier.id)}
                  title={tier.desc}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-center select-none active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                      : 'bg-gray-900 text-gray-300 border-gray-800 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  <div className="font-extrabold leading-none">{tier.label}</div>
                  <div className="text-[9px] font-normal opacity-80 mt-0.5 whitespace-nowrap">
                    {tier.id === '15' ? '%100 15' : tier.id === '14' ? 'd=1 Kapsama' : tier.id === '13' ? 'd=2 Kapsama' : 'd=3 Kapsama'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

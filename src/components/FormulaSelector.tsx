import React from 'react';
import { FormulaType, GuaranteeTier } from '../core/types';
import { ShieldCheck, Percent, Layers, Sparkles, Grid, Sliders, DollarSign, Info } from 'lucide-react';

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
      badge: 'En Çok Tercih Edilen',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400'
    },
    {
      id: 'nine_columns' as FormulaType,
      title: '🎯 9 Kolonlu Garantili Formül',
      desc: '4 kapalı maçı 81 kolon yerine sadece 9 kolonda 13 garanti ile oynatır.',
      badge: 'Klasik Matris',
      icon: Grid,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400'
    },
    {
      id: 'probabilistic' as FormulaType,
      title: '% Yüzdesel Formülü',
      desc: 'Her maça verdiğiniz yüzde ihtimallerine göre belirlenen bütçede en dengeli kolonları üretir.',
      badge: 'Monte Carlo',
      icon: Percent,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400'
    },
    {
      id: 'site_ideal' as FormulaType,
      title: '🤖 Yapay Zeka Site İdeal',
      desc: 'İddaa piyasa oranları ile halk dağılımı arasındaki arbitrajı (Value) otomatik harmanlar.',
      badge: 'AI Destekli',
      icon: Sparkles,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400'
    },
    {
      id: 'super_seven' as FormulaType,
      title: '➆ Süper Yedili Formülü',
      desc: '7 kilit maç üzerine odaklanıp diğer maçları istatistiksel varyasyonla optimize eder.',
      badge: 'Stratejik',
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400'
    },
    {
      id: 'flat' as FormulaType,
      title: '─ Düz Oynama (Klasik Filtreli)',
      desc: 'Tüm kombinasyonları üretir ve sadece aktif filtre kurallarına uyanları alır.',
      badge: 'Standart',
      icon: Sliders,
      color: 'from-gray-500/20 to-slate-500/20 border-gray-500/40 text-gray-300'
    }
  ];

  const guaranteeTiers: { id: GuaranteeTier; label: string; desc: string }[] = [
    { id: '15', label: '15 Garanti', desc: 'Filtreler tutarsa %100 15 Garantisi (Maksimum Kapsama)' },
    { id: '14', label: '14 Garanti', desc: 'Maks. 1 hata payı (Kolon maliyetini ~%75 azaltır)' },
    { id: '13', label: '13 Garanti', desc: 'Maks. 2 hata payı (Kolon maliyetini ~%92 azaltır)' },
    { id: '12', label: '12 Garanti', desc: 'Maks. 3 hata payı (Geniş havuzu küçük bütçeye sıkıştırır)' }
  ];

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Formül & İndirgeme Modu Seçimi</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Bütçenize ve stratejinize en uygun matematiksel indirgeme algoritmasını seçin.
          </p>
        </div>

        {/* Target Budget & Unit Price Controls */}
        <div className="flex items-center gap-3 bg-[#0B0F19] px-3.5 py-2 rounded-xl border border-gray-800">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <label className="text-xs text-gray-400 font-medium whitespace-nowrap">Hedef Bütçe:</label>
            <input
              type="number"
              min="10"
              max="50000"
              step="10"
              value={targetBudgetTL}
              onChange={(e) => setTargetBudgetTL(Number(e.target.value))}
              className="w-20 bg-gray-900 border border-gray-700 focus:border-emerald-500 rounded px-2 py-1 text-xs font-bold text-emerald-400 text-right focus:outline-none"
            />
            <span className="text-xs text-gray-500">TL</span>
          </div>

          <div className="h-4 w-px bg-gray-800"></div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-400 font-medium whitespace-nowrap">Kolon Fiyatı:</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={unitPriceTL}
              onChange={(e) => setUnitPriceTL(Number(e.target.value))}
              className="w-14 bg-gray-900 border border-gray-700 focus:border-emerald-500 rounded px-2 py-1 text-xs font-bold text-white text-right focus:outline-none"
            />
            <span className="text-xs text-gray-500">TL</span>
          </div>
        </div>
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {formulas.map(formula => {
          const isSelected = formulaType === formula.id;
          const Icon = formula.icon;
          return (
            <div
              key={formula.id}
              onClick={() => setFormulaType(formula.id)}
              className={`relative cursor-pointer rounded-xl p-3.5 border transition-all duration-200 ${
                isSelected
                  ? `bg-gradient-to-br ${formula.color} shadow-lg ring-1 ring-emerald-500/50 scale-[1.01]`
                  : 'bg-[#0B0F19]/80 border-gray-800 hover:border-gray-700 hover:bg-gray-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                    {formula.title}
                  </h3>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                  {formula.badge}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed pl-8">
                {formula.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Guarantee Tier Selector (Only for Guaranteed custom/matrix modes) */}
      {(formulaType === 'guaranteed_custom' || formulaType === 'nine_columns') && (
        <div className="bg-[#0B0F19]/90 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Hedef Garanti Seviyesi (Hamming Kapsaması)</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Tercihleriniz ve filtreleriniz tuttuğunda kazanması kesinleştirilen minimum derece:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
            {guaranteeTiers.map(tier => {
              const isSelected = guaranteeTier === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => setGuaranteeTier(tier.id)}
                  title={tier.desc}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-gray-900 text-gray-300 border-gray-800 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  <div className="font-extrabold">{tier.label}</div>
                  <div className="text-[9px] font-normal opacity-80 mt-0.5">
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

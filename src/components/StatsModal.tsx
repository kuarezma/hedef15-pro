import React from 'react';
import { X, Trophy, Award, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const goldenRules = [
    {
      title: '1. Asla Tüm Favorilere Güvenmeyin',
      desc: 'Her Spor Toto haftasında ortalama 2 ile 5 arasında sürpriz veya beraberlik mutlaka çıkar. Düz favori kuponları kazandırsa bile ikramiye binlerce kişiye bölünür ve kupon parasını bile kurtarmaz.'
    },
    {
      title: '2. Değerli Sürprizleri (Value) Hedefleyin',
      desc: 'Halkın %10 oynadığı ama gerçekte %25 gelme ihtimali olan takımlara yönelin. Büyük ikramiyeyi getiren kolonlar her zaman halkın az tercih ettiği maçlardan geçer.'
    },
    {
      title: '3. 14 ve 13 Garanti İndirgemelerini Kullanın',
      desc: 'Tüm bütçenizi az maça basıp kapatmak yerine, 14 veya 13 Garanti formülleriyle 10-12 maçı kapsayın. Bütçenizi %80 tasarruf ettirerek şansınızı 10 kat artırır.'
    },
    {
      title: '4. İsraf Kolonları Filtrelerle Eleyin',
      desc: '15 maçın tamamının "1" veya tamamının "X" bitme ihtimali milyonda birdir. Beraberlik sayısını 2-5, sürpriz sayısını 1-5 aralığına filtreleyerek kolon sayınızı optimize edin.'
    }
  ];

  const hallOfFame = [
    {
      week: '2026 / 12. Hafta',
      tier: '15 BİLEN',
      prize: '4.850.000 TL',
      formula: 'Garantili Özel Sistem (14 Garanti)',
      playedCols: '192 Kolon (384 TL)'
    },
    {
      week: '2026 / 08. Hafta',
      tier: '15 BİLEN',
      prize: '1.920.000 TL',
      formula: '% Yüzdesel Formül + Sürpriz Filtresi',
      playedCols: '320 Kolon (640 TL)'
    },
    {
      week: '2025 / 45. Hafta',
      tier: '15 BİLEN',
      prize: '7.340.000 TL',
      formula: '9 Kolonlu Garantili Matris',
      playedCols: '108 Kolon (216 TL)'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Spor Toto Altın Kurallar & Gurur Kuponlarımız</h3>
              <p className="text-xs text-gray-400">İstatistikler, kazanma stratejileri ve geçmiş başarılar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Golden Rules */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Totoda Kazanmanın 4 Altın Kuralı</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goldenRules.map((rule, idx) => (
                <div key={idx} className="bg-gray-900/90 border border-gray-800 rounded-xl p-3.5">
                  <div className="text-xs font-bold text-emerald-400 mb-1">{rule.title}</div>
                  <div className="text-[11px] text-gray-400 leading-relaxed">{rule.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hall of Fame */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Gurur Kuponlarımız (Son Büyük Kazananlar)</span>
            </h4>
            <div className="space-y-2.5">
              {hallOfFame.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-gray-900 to-[#0B0F19] border border-gray-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.week}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.tier}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      Kullanılan Sistem: <span className="text-gray-300 font-semibold">{item.formula}</span> • {item.playedCols}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-400 font-mono">{item.prize}</div>
                    <div className="text-[10px] text-gray-500">Kazanılan İkramiye</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

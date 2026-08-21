import React, { useState, useMemo } from 'react';
import { Column, Match, SavedCoupon, FormulaType, GuaranteeTier, Outcome } from '../core/types';
import { exportToExtra1X2, exportToCSV } from '../core/exporters';
import { countMatches } from '../core/combinatorics';
import {
  FileText,
  Upload,
  BookmarkPlus,
  Trash2,
  Download,
  Zap,
  Play,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MyCouponsProps {
  currentColumns: Column[];
  currentMatches: Match[];
  currentFormulaType: FormulaType;
  currentGuaranteeTier: GuaranteeTier;
  currentCostTL: number;
  onLoadCouponIntoEditor: (coupon: SavedCoupon) => void;
  onOpenAutoPlayWithColumns: (columns: Column[]) => void;
  liveOutcomes?: Array<Outcome | null>;
}

const STORAGE_SAVED_COUPONS = 'hedef15_saved_coupons_v1';

export const MyCoupons: React.FC<MyCouponsProps> = ({
  currentColumns,
  currentMatches,
  currentFormulaType,
  currentGuaranteeTier,
  currentCostTL,
  onLoadCouponIntoEditor,
  onOpenAutoPlayWithColumns,
  liveOutcomes
}) => {
  // Load saved coupons from LocalStorage
  const [savedCoupons, setSavedCoupons] = useState<SavedCoupon[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_COUPONS);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [];
  });

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newCouponName, setNewCouponName] = useState('');
  const [newCouponNotes, setNewCouponNotes] = useState('');
  
  // Import modal state
  const [importText, setImportText] = useState('');
  const [importName, setImportName] = useState('');
  const [importError, setImportError] = useState('');

  // Selected coupon for inspection modal
  const [inspectingCoupon, setInspectingCoupon] = useState<SavedCoupon | null>(null);

  // Sync to localStorage
  const saveToStorage = (coupons: SavedCoupon[]) => {
    setSavedCoupons(coupons);
    try {
      localStorage.setItem(STORAGE_SAVED_COUPONS, JSON.stringify(coupons));
    } catch (_) {}
  };

  // Handle saving current coupon
  const handleSaveCurrentCoupon = () => {
    if (currentColumns.length === 0) return;

    const name = newCouponName.trim() || `Kupon #${savedCoupons.length + 1} (${currentColumns.length} Kolon)`;
    const newCoupon: SavedCoupon = {
      id: `coupon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name,
      createdAt: new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
      formulaType: currentFormulaType,
      guaranteeTier: currentGuaranteeTier,
      columnCount: currentColumns.length,
      totalCostTL: currentCostTL,
      columns: currentColumns,
      matches: currentMatches,
      notes: newCouponNotes.trim()
    };

    const updated = [newCoupon, ...savedCoupons];
    saveToStorage(updated);
    setIsSaveModalOpen(false);
    setNewCouponName('');
    setNewCouponNotes('');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
  };

  // Handle importing columns from Extra1X2 TXT / Paste
  const handleImportText = () => {
    setImportError('');
    const lines = importText
      .split('\n')
      .map(l => l.trim().toUpperCase())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      setImportError('Lütfen geçerli kolon metni yapıştırın!');
      return;
    }

    const parsedColumns: Column[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/[^1X2]/g, '');
      if (line.length === 15) {
        parsedColumns.push(line.split('') as Column);
      }
    }

    if (parsedColumns.length === 0) {
      setImportError('15 maçlık geçerli (1, X, 2 içeren) kolon bulunamadı!');
      return;
    }

    const name = importName.trim() || `İçe Aktarılan Kupon (${parsedColumns.length} Kolon)`;
    const importedCoupon: SavedCoupon = {
      id: `import_${Date.now()}`,
      name,
      createdAt: new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
      formulaType: 'flat',
      guaranteeTier: '15',
      columnCount: parsedColumns.length,
      totalCostTL: parsedColumns.length * 2.0,
      columns: parsedColumns,
      matches: currentMatches,
      notes: 'Dosyadan / Metinden İçe Aktarıldı'
    };

    saveToStorage([importedCoupon, ...savedCoupons]);
    setIsImportModalOpen(false);
    setImportText('');
    setImportName('');
    confetti({ particleCount: 50, spread: 60 });
  };

  // Delete coupon
  const handleDeleteCoupon = (id: string) => {
    const updated = savedCoupons.filter(c => c.id !== id);
    saveToStorage(updated);
  };

  // Evaluate coupon against live / finished match results
  const evaluateCouponLiveHits = (coupon: SavedCoupon) => {
    if (!liveOutcomes || liveOutcomes.length !== 15) return null;
    if (liveOutcomes.some(out => !out)) return null;

    let hits15 = 0;
    let hits14 = 0;
    let hits13 = 0;
    let hits12 = 0;

    for (const col of coupon.columns) {
      const matchCount = countMatches(col, liveOutcomes as Outcome[]);
      if (matchCount === 15) hits15++;
      else if (matchCount === 14) hits14++;
      else if (matchCount === 13) hits13++;
      else if (matchCount === 12) hits12++;
    }

    return { hits15, hits14, hits13, hits12 };
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-sm">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
            <h2 className="text-base font-bold text-white tracking-tight">Kuponlarım & Kupon Yükle</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 font-mono tabular-nums">
              {savedCoupons.length} Kayıtlı Kupon
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Oluşturduğunuz formülleri kaydedin, Extra1X2 TXT / Excel kuponlarınızı yükleyin ve canlı derecelerini takip edin.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSaveModalOpen(true)}
            disabled={currentColumns.length === 0}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <BookmarkPlus className="w-4 h-4 shrink-0" />
            <span>Mevcut Kuponu Kaydet</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold border border-gray-700 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Upload className="w-4 h-4 text-blue-400 shrink-0" />
            <span>📂 Kupon Yükle (TXT / Excel)</span>
          </button>
        </div>
      </div>

      {/* Saved Coupons List */}
      {savedCoupons.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#0B0F19] border border-gray-800/80 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-gray-800/60 text-gray-500 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-300">Henüz Kayıtlı Kuponunuz Bulunmuyor</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
            Kupon & Formül sayfasında oluşturduğunuz kolonları "Mevcut Kuponu Kaydet" ile buraya ekleyebilir veya Extra1X2 TXT dosyalarınızı yükleyebilirsiniz.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setIsSaveModalOpen(true)}
              disabled={currentColumns.length === 0}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Mevcut Kuponu Kaydet ({currentColumns.length} Kolon)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {savedCoupons.map((coupon) => {
            const liveEval = evaluateCouponLiveHits(coupon);

            return (
              <div
                key={coupon.id}
                className="bg-[#0B0F19] border border-gray-800 hover:border-gray-700 rounded-2xl p-4 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
              >
                {/* Left Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-sm font-bold text-white tracking-wide truncate">
                      {coupon.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 uppercase">
                      {coupon.formulaType}
                    </span>
                    {coupon.guaranteeTier && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                        {coupon.guaranteeTier} Garanti
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap font-mono tabular-nums">
                    <span className="text-emerald-400 font-bold">{coupon.columnCount.toLocaleString()} Kolon</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-white font-bold">{coupon.totalCostTL.toLocaleString()} TL</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {coupon.createdAt}
                    </span>
                  </div>

                  {coupon.notes && (
                    <p className="text-[11px] text-gray-500 mt-1 italic line-clamp-1">
                      {coupon.notes}
                    </p>
                  )}
                </div>

                {/* Center Live Evaluation Stats (if live match outcomes exist) */}
                {liveEval && (
                  <div className="flex items-center gap-2 bg-gray-900/90 border border-gray-800 px-3 py-2 rounded-xl shrink-0 font-mono text-xs tabular-nums">
                    <div className="text-center px-1.5">
                      <div className="text-[9px] text-gray-500">15'te</div>
                      <div className={`font-black ${liveEval.hits15 > 0 ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`}>
                        {liveEval.hits15}
                      </div>
                    </div>
                    <div className="text-center px-1.5 border-l border-gray-800">
                      <div className="text-[9px] text-gray-500">14'te</div>
                      <div className={`font-black ${liveEval.hits14 > 0 ? 'text-teal-400' : 'text-gray-500'}`}>
                        {liveEval.hits14}
                      </div>
                    </div>
                    <div className="text-center px-1.5 border-l border-gray-800">
                      <div className="text-[9px] text-gray-500">13'te</div>
                      <div className={`font-black ${liveEval.hits13 > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                        {liveEval.hits13}
                      </div>
                    </div>
                    <div className="text-center px-1.5 border-l border-gray-800">
                      <div className="text-[9px] text-gray-500">12'de</div>
                      <div className={`font-black ${liveEval.hits12 > 0 ? 'text-purple-400' : 'text-gray-500'}`}>
                        {liveEval.hits12}
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button
                    onClick={() => onLoadCouponIntoEditor(coupon)}
                    title="Kuponu editöre aktar ve çalıştır"
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white rounded-xl text-xs font-bold border border-emerald-500/30 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Yükle & Oyna</span>
                  </button>

                  <button
                    onClick={() => onOpenAutoPlayWithColumns(coupon.columns)}
                    title="Yasal sitelere otomatik doldur"
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-amber-400 rounded-xl border border-gray-700 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const text = exportToExtra1X2(coupon.columns);
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${coupon.name.replace(/\s+/g, '_')}.txt`;
                      a.click();
                    }}
                    title="Extra1X2 TXT İndir"
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setInspectingCoupon(coupon)}
                    title="Kolonları Görüntüle"
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    title="Kuponu Sil"
                    className="p-2 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl border border-gray-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Coupon Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-emerald-400" />
                Mevcut Kuponu Kaydet
              </h3>
              <button onClick={() => setIsSaveModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Kupon Adı:</label>
                <input
                  type="text"
                  placeholder="Örn: 1. Hafta 14 Garanti 300 TL"
                  value={newCouponName}
                  onChange={(e) => setNewCouponName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Not / Strateji (İsteğe Bağlı):</label>
                <textarea
                  placeholder="Örn: 4 sürpriz maçı kapattık, 14 garanti Hamming indirgemesi uygulandı."
                  value={newCouponNotes}
                  onChange={(e) => setNewCouponNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 text-xs space-y-1 font-mono tabular-nums">
                <div className="flex justify-between text-gray-400">
                  <span>Kolon Sayısı:</span>
                  <span className="text-emerald-400 font-bold">{currentColumns.length} Kolon</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Toplam Maliyet:</span>
                  <span className="text-white font-bold">{currentCostTL} TL</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Formül / Garanti:</span>
                  <span className="text-blue-400 font-bold">{currentFormulaType} ({currentGuaranteeTier} Garanti)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-gray-800">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold"
              >
                Vazgeç
              </button>
              <button
                onClick={handleSaveCurrentCoupon}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Extra1X2 TXT / Excel Kuponu Yükle
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Kupon İsmi:</label>
                <input
                  type="text"
                  placeholder="Örn: Extra1X2 90 Kolonluk Sistem"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  15 Karakterlik Kolonları Yapıştırın (Her satıra 1 kolon):
                </label>
                <textarea
                  placeholder="11X21X1211X1221&#10;1X121X1211X1221&#10;..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={8}
                  className="w-full bg-[#05070D] border border-gray-800 focus:border-emerald-500 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:outline-none"
                />
              </div>

              {importError && (
                <div className="text-xs text-red-400 bg-red-950/20 border border-red-500/30 p-2.5 rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-gray-800">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold"
              >
                İptal
              </button>
              <button
                onClick={handleImportText}
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
              >
                Kuponu Yükle ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspecting Coupon Columns Modal */}
      {inspectingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{inspectingCoupon.name}</h3>
                <p className="text-xs text-gray-400 font-mono">{inspectingCoupon.columns.length} Kolon • {inspectingCoupon.totalCostTL} TL</p>
              </div>
              <button onClick={() => setInspectingCoupon(null)} className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {inspectingCoupon.columns.map((col, idx) => (
                  <div key={idx} className="bg-gray-900/80 border border-gray-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-500">#{idx + 1}</span>
                    <span className="font-mono font-bold text-emerald-400 tracking-wider">{col.join('')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setInspectingCoupon(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

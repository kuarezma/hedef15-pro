import React, { useState } from 'react';
import { Column, Match, ReductionSummary } from '../core/types';
import { exportToCSV, exportToExtra1X2, exportToNesineFormat } from '../core/exporters';
import { Download, Copy, Check, FileText, Zap, ChevronLeft, ChevronRight, CheckCircle2, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ColumnViewerProps {
  columns: Column[];
  matches: Match[];
  summary: ReductionSummary;
  onOpenAutoPlay: () => void;
}

export const ColumnViewer: React.FC<ColumnViewerProps> = ({
  columns,
  matches,
  summary,
  onOpenAutoPlay
}) => {
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const totalPages = Math.max(1, Math.ceil(columns.length / pageSize));
  const paginatedColumns = columns.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDownloadExtra1X2 = () => {
    const text = exportToExtra1X2(columns);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hedef15_kolonlar_${columns.length}kolon.txt`;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleDownloadCSV = () => {
    const csv = exportToCSV(columns, matches);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hedef15_kolonlar_${columns.length}kolon.csv`;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleCopyNesine = () => {
    const text = exportToExtra1X2(columns);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      {/* Top Reduction Summary Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500 font-semibold uppercase">Ham Kombinasyon</div>
          <div className="text-base font-extrabold text-gray-300 font-mono mt-0.5">
            {summary.rawCombinations.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500 font-semibold uppercase">Filtreli Kombinasyon</div>
          <div className="text-base font-extrabold text-blue-400 font-mono mt-0.5">
            {summary.filteredCombinations.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#0B0F19] border border-emerald-500/30 bg-emerald-950/10 rounded-xl p-3 text-center">
          <div className="text-[10px] text-emerald-400 font-semibold uppercase">Nihai Kolon Sayısı</div>
          <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
            {summary.reducedColumns.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#0B0F19] border border-emerald-500/30 bg-emerald-950/10 rounded-xl p-3 text-center">
          <div className="text-[10px] text-emerald-400 font-semibold uppercase">Toplam Kupon Tutarı</div>
          <div className="text-xl font-black text-white font-mono mt-0.5">
            {summary.totalCostTL.toLocaleString()} TL
          </div>
        </div>
      </div>

      {/* Guarantee Coverage Bar */}
      <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5 mb-5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-gray-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            Matematiksel Garanti Kapsama Oranları
          </span>
          <span className="text-[10px] text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Hesaplama süresi: {summary.durationMs}ms
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-2">
            <div className="text-[10px] text-gray-400">15 İhtimali</div>
            <div className="font-bold text-emerald-400 text-sm">%{summary.estimatedGuaranteeRatio['15']}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-2">
            <div className="text-[10px] text-gray-400">14 Garantisi</div>
            <div className="font-bold text-teal-400 text-sm">%{summary.estimatedGuaranteeRatio['14']}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-2">
            <div className="text-[10px] text-gray-400">13 Garantisi</div>
            <div className="font-bold text-blue-400 text-sm">%{summary.estimatedGuaranteeRatio['13']}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-2">
            <div className="text-[10px] text-gray-400">12 Garantisi</div>
            <div className="font-bold text-purple-400 text-sm">%{summary.estimatedGuaranteeRatio['12']}</div>
          </div>
        </div>
      </div>

      {/* Action Bar (Export Buttons & Pagination) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">Kolon Listesi</span>
          <span className="text-[11px] text-gray-400">({columns.length} Kolon Hazır)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyNesine}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kopyalandı!' : 'Kolonları Kopyala'}</span>
          </button>

          <button
            onClick={handleDownloadExtra1X2}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Extra1X2 (.txt) İndir</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={onOpenAutoPlay}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Otomatik Oyna</span>
          </button>
        </div>
      </div>

      {/* Columns Grid Display */}
      {columns.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-xs">
          Henüz oluşturulmuş kolon yok. Yukarıdan tercihlerinizi yapıp formülü çalıştırın.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
            {paginatedColumns.map((col, idx) => {
              const globalIdx = (currentPage - 1) * pageSize + idx + 1;
              return (
                <div
                  key={globalIdx}
                  className="bg-[#0B0F19] border border-gray-800 hover:border-gray-700 rounded-xl p-2.5 flex flex-col justify-between transition-all"
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5 font-mono">
                    <span className="font-bold text-gray-400">Kolon #{globalIdx}</span>
                    <span>15 Maç</span>
                  </div>

                  <div className="grid grid-cols-5 gap-1 text-center font-mono font-bold text-xs">
                    {col.map((out, mIdx) => {
                      const color = out === '1'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : out === 'X'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';

                      return (
                        <div
                          key={mIdx}
                          title={`Maç ${mIdx + 1}: ${matches[mIdx]?.homeTeam} vs ${matches[mIdx]?.awayTeam} -> ${out}`}
                          className={`rounded py-1 ${color}`}
                        >
                          {out}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400">
              <div>
                Sayfa {currentPage} / {totalPages} (Gösterilen: {paginatedColumns.length} / {columns.length})
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

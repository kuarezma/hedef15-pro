import React, { useState } from 'react';
import { Column, Match, FormulaType, GuaranteeTier } from '../core/types';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  QrCode,
  Printer,
  Copy,
  Check,
  Zap,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdvancedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  columns: Column[];
  formulaType: FormulaType;
  guaranteeTier: GuaranteeTier;
  totalCostTL: number;
}

export const AdvancedExportModal: React.FC<AdvancedExportModalProps> = ({
  isOpen,
  onClose,
  matches,
  columns,
  formulaType,
  guaranteeTier,
  totalCostTL
}) => {
  const [activeFormat, setActiveFormat] = useState<'excel' | 'txt' | 'qr' | 'print'>('excel');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  // Generate Extra1X2 TXT string
  const generateTxtContent = () => {
    return columns.map(c => c.join('')).join('\r\n');
  };

  // Generate CSV / Excel format
  const generateCsvContent = () => {
    let csv = `Kolon No;${matches.map(m => `"${m.order}. ${m.homeTeam}-${m.awayTeam}"`).join(';')}\r\n`;
    columns.forEach((col, idx) => {
      csv += `${idx + 1};${col.join(';')}\r\n`;
    });
    return csv;
  };

  const handleDownloadTxt = () => {
    const text = generateTxtContent();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hedef15_kupon_${columns.length}_kolon.txt`;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 40, spread: 60 });
  };

  const handleDownloadCsv = () => {
    const csv = generateCsvContent();
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hedef15_sportoto_kolonlar_${columns.length}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 40, spread: 60 });
  };

  const handleCopyTxt = () => {
    navigator.clipboard.writeText(generateTxtContent());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Simulated QR Code Payload String
  const qrPayload = `TOTO_2026_W1_${columns.length}COLS_${totalCostTL}TL_${Date.now()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B0F19] border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Gelişmiş Kupon Dışa Aktarma & Bayi QR</h3>
              <p className="text-xs text-gray-400">Excel, CSV, Extra1X2 TXT ve Bayi Barkod formatları</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Select Tabs */}
        <div className="flex items-center gap-1.5 p-3 bg-gray-900/60 border-b border-gray-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveFormat('excel')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeFormat === 'excel' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel / CSV Tablosu</span>
          </button>
          <button
            onClick={() => setActiveFormat('txt')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeFormat === 'txt' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Extra1X2 TXT (Nesine / Misli)</span>
          </button>
          <button
            onClick={() => setActiveFormat('qr')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeFormat === 'qr' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Bayi QR Kod & Barkod</span>
          </button>
        </div>

        {/* Format Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeFormat === 'excel' && (
            <div className="space-y-4">
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-white mb-1">📊 Microsoft Excel (.xlsx / .csv)</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tüm {columns.length} kolonu maç isimleri ve sıra numaralarıyla ayrılmış formatta Excel tablosu olarak indirir.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={handleDownloadCsv}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Excel CSV İndir ({columns.length} Kolon)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeFormat === 'txt' && (
            <div className="space-y-4">
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white">📄 Extra1X2 TXT Formatı</h4>
                  <button
                    onClick={handleCopyTxt}
                    className="text-xs text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Kopyalandı' : 'Metni Kopyala'}</span>
                  </button>
                </div>

                <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 max-h-40 overflow-y-auto font-mono text-[11px] text-gray-300">
                  {columns.slice(0, 15).map((c, i) => (
                    <div key={i}>{c.join('')}</div>
                  ))}
                  {columns.length > 15 && <div className="text-gray-500 italic mt-1">...ve {columns.length - 15} kolon daha</div>}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={handleDownloadTxt}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>TXT Dosyası Olarak İndir</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeFormat === 'qr' && (
            <div className="text-center space-y-4">
              <div className="bg-white p-6 rounded-2xl inline-block shadow-2xl border-4 border-emerald-500">
                {/* SVG QR Code Simulation */}
                <svg className="w-44 h-44 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                  <rect width="100" height="100" fill="white" />
                  {/* Corner Targets */}
                  <rect x="5" y="5" width="25" height="25" fill="#0B0F19" />
                  <rect x="10" y="10" width="15" height="15" fill="white" />
                  <rect x="13" y="13" width="9" height="9" fill="#10B981" />

                  <rect x="70" y="5" width="25" height="25" fill="#0B0F19" />
                  <rect x="75" y="10" width="15" height="15" fill="white" />
                  <rect x="78" y="13" width="9" height="9" fill="#10B981" />

                  <rect x="5" y="70" width="25" height="25" fill="#0B0F19" />
                  <rect x="10" y="75" width="15" height="15" fill="white" />
                  <rect x="13" y="78" width="9" height="9" fill="#10B981" />

                  {/* Data grid points */}
                  <rect x="35" y="10" width="6" height="6" fill="#0B0F19" />
                  <rect x="45" y="15" width="6" height="6" fill="#0B0F19" />
                  <rect x="55" y="10" width="6" height="6" fill="#0B0F19" />
                  <rect x="35" y="35" width="30" height="30" fill="#10B981" rx="4" />
                  <rect x="40" y="40" width="20" height="20" fill="#0B0F19" rx="2" />
                  <rect x="45" y="45" width="10" height="10" fill="white" />
                  <rect x="35" y="75" width="6" height="6" fill="#0B0F19" />
                  <rect x="50" y="80" width="6" height="6" fill="#0B0F19" />
                  <rect x="75" y="40" width="6" height="6" fill="#0B0F19" />
                  <rect x="85" y="55" width="6" height="6" fill="#0B0F19" />
                  <rect x="75" y="70" width="6" height="6" fill="#0B0F19" />
                  <rect x="85" y="80" width="6" height="6" fill="#0B0F19" />
                </svg>
                <div className="mt-2 text-black font-mono font-black text-xs">
                  HEDEF15 PRO #{columns.length}K
                </div>
                <div className="text-gray-500 font-mono text-[9px]">
                  Tutar: {totalCostTL} TL • 2026/27 1. Hafta
                </div>
              </div>

              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Bu QR kod, oluşturduğunuz {columns.length} kolonu ve kupon şifrelemesini içerir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

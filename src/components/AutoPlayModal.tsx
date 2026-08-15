import React, { useState } from 'react';
import { Column } from '../core/types';
import { generateAutoPlayScript, exportToExtra1X2 } from '../core/exporters';
import { X, Copy, Check, Download, Zap, ExternalLink, ShieldCheck, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AutoPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
}

export const AutoPlayModal: React.FC<AutoPlayModalProps> = ({
  isOpen,
  onClose,
  columns
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'nesine' | 'misli' | 'bilyoner' | 'tuttur'>('nesine');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!isOpen) return null;

  const script = generateAutoPlayScript(columns, selectedPlatform);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(script);
    setCopiedCode(true);
    confetti({ particleCount: 40, spread: 50 });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = exportToExtra1X2(columns);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hedef15_${selectedPlatform}_${columns.length}kolon.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Yasal Bahis Sitelerine Otomatik Oynama</h3>
              <p className="text-xs text-gray-400">Tek tıkla yüzlerce kolonu saniyeler içinde kuponunuza aktarın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Platform Tabs */}
          <div>
            <label className="text-xs text-gray-400 block mb-1.5 font-medium">Hedef Yasal Platform:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['nesine', 'misli', 'bilyoner', 'tuttur'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    selectedPlatform === p
                      ? 'bg-emerald-500 text-white border border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Step by Step Instructions */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 space-y-2 text-xs text-gray-300">
            <div className="font-bold text-white flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Nasıl Çalışır? (3 Kolay Adım):
            </div>
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
              <span><strong>{selectedPlatform.toUpperCase()}.com</strong> sitesine gidip Spor Toto sayfasını açınız.</span>
            </div>
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
              <span>Klavyenizden <strong>F12</strong> (veya Sağ Tık &gt; İncele) tuşuna basıp <strong>Console (Konsol)</strong> sekmesine geçiniz.</span>
            </div>
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
              <span>Aşağıdaki otomatik betiği kopyalayıp konsola yapıştırın ve <strong>ENTER</strong> tuşuna basınız.</span>
            </div>
          </div>

          {/* Script Code Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Otomatik Oynatma Konsol Kodu ({columns.length} Kolon)
              </span>
              <button
                onClick={handleCopyScript}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
              </button>
            </div>
            <div className="bg-[#05070D] border border-gray-800 rounded-xl p-3 font-mono text-[11px] text-emerald-400/90 max-h-36 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{script}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#0B0F19] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleDownloadTxt}
            className="w-full sm:w-auto px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold border border-gray-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Extra1X2 TXT Olarak İndir</span>
          </button>

          <button
            onClick={handleCopyScript}
            className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            <span>{copiedCode ? 'Kopyalandı!' : 'Otomatik Oynatma Kodunu Kopyala'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Column, Match, FormulaType, GuaranteeTier } from '../core/types';
import { X, Share2, Copy, Printer, Check, Target, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CouponShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  columns: Column[];
  formulaType: FormulaType;
  guaranteeTier: GuaranteeTier;
  totalCostTL: number;
}

export const CouponShareCardModal: React.FC<CouponShareCardModalProps> = ({
  isOpen,
  onClose,
  matches,
  columns,
  formulaType,
  guaranteeTier,
  totalCostTL
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  if (!isOpen) return null;

  const shareText = `🎯 Hedef15 Pro Spor Toto Kuponum:\n📊 Kolon: ${columns.length} | Tutar: ${totalCostTL} TL | Formül: ${formulaType} (${guaranteeTier} Garanti)\n🌐 kuarezma.github.io/hedef15-pro/`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    confetti({ particleCount: 40, spread: 60 });
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://kuarezma.github.io/hedef15-pro/')}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B0F19] border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" />
            Kupon Kartı & Paylaşım
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aesthetic Share Card Body */}
        <div className="p-5 overflow-y-auto max-h-[65vh]">
          <div id="printable-coupon-card" className="bg-gradient-to-br from-gray-900 via-[#070A12] to-gray-900 border border-emerald-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Card Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                  🎯
                </div>
                <div>
                  <div className="text-xs font-black text-white tracking-wide">HEDEF15 PRO</div>
                  <div className="text-[9px] text-emerald-400">Akıllı Spor Toto Platformu</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400">2026/27 1. Hafta</span>
            </div>

            {/* Summary Banner */}
            <div className="grid grid-cols-3 gap-2 bg-gray-900/90 rounded-xl p-2.5 mb-4 border border-gray-800 text-center font-mono text-xs">
              <div>
                <div className="text-[9px] text-gray-500 font-sans">Kolon</div>
                <div className="font-bold text-emerald-400">{columns.length}</div>
              </div>
              <div className="border-x border-gray-800">
                <div className="text-[9px] text-gray-500 font-sans">Maliyet</div>
                <div className="font-bold text-white">{totalCostTL} TL</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 font-sans">Garanti</div>
                <div className="font-bold text-blue-400">{guaranteeTier} Garanti</div>
              </div>
            </div>

            {/* 15 Matches Picks Table */}
            <div className="space-y-1 text-xs">
              {matches.map((m) => {
                const picks = [];
                if (m.userPicks['1']) picks.push('1');
                if (m.userPicks['X']) picks.push('X');
                if (m.userPicks['2']) picks.push('2');
                const pickStr = picks.join('-');

                return (
                  <div key={m.id} className="flex items-center justify-between py-1 border-b border-gray-800/50">
                    <span className="text-gray-400 text-[11px] truncate flex-1 pr-2">
                      <strong className="text-gray-500 font-mono mr-1">#{m.order}</strong>
                      {m.homeTeam} - {m.awayTeam}
                    </span>
                    <span className="font-mono font-black text-emerald-400 bg-gray-800/80 px-2 py-0.5 rounded text-[11px] shrink-0">
                      {pickStr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleTelegramShare}
              className="px-3 py-2 bg-[#229ED9] hover:bg-[#1e8bc0] text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Telegram</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 transition-colors"
              title="Yazdır"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              {isCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

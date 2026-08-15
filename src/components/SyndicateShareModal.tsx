import React, { useState } from 'react';
import { Column, SyndicateShare } from '../core/types';
import { Users, Share2, Copy, Check, ShieldCheck, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SyndicateShareModalProps {
  columns: Column[];
  totalCostTL: number;
}

export const SyndicateShareModal: React.FC<SyndicateShareModalProps> = ({
  columns,
  totalCostTL
}) => {
  const [totalShares, setTotalShares] = useState<number>(10);
  const [poolTitle, setPoolTitle] = useState<string>('Hedef 15 Şampiyonluk Havuzu');
  const [creatorName, setCreatorName] = useState<string>('Uğur Hoca');
  const [copied, setCopied] = useState<boolean>(false);

  const pricePerShare = Math.max(1, Math.round(totalCostTL / totalShares));
  const shareUrl = `https://hedef15pro.app/havuz?id=${encodeURIComponent(poolTitle.toLowerCase().replace(/\s+/g, '-'))}&shares=${totalShares}&cost=${totalCostTL}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Ortak Kupon (Havuz & Syndicate) Sistemi</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Geniş bütçeli formülleri arkadaşlarınız veya topluluğunuzla paylara bölerek birlikte oynayın ve canlı takip edin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-4 bg-[#0B0F19] border border-gray-800 rounded-xl p-4">
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Havuz Yapılandırması</h3>
          
          <div>
            <label className="text-xs text-gray-400 block mb-1">Havuz Başlığı:</label>
            <input
              type="text"
              value={poolTitle}
              onChange={(e) => setPoolTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Havuz Yöneticisi:</label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Toplam Pay Sayısı (Hisse):</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="2"
                max="100"
                value={totalShares}
                onChange={(e) => setTotalShares(Math.max(2, Number(e.target.value)))}
                className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-gray-500">Eşit Hisse</span>
            </div>
          </div>
        </div>

        {/* Live Pool Card Preview */}
        <div className="bg-gradient-to-br from-emerald-950/20 to-[#0B0F19] border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wide">
                Ortak Kupon Özeti
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Canlı Paylaşım
              </span>
            </div>

            <h4 className="text-lg font-black text-white">{poolTitle}</h4>
            <p className="text-xs text-gray-400 mt-0.5">Yönetici: {creatorName}</p>

            <div className="grid grid-cols-3 gap-2 my-4 text-center">
              <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-2.5">
                <div className="text-[10px] text-gray-500">Toplam Kolon</div>
                <div className="font-mono font-bold text-white text-sm mt-0.5">{columns.length} Kolon</div>
              </div>
              <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-2.5">
                <div className="text-[10px] text-gray-500">Toplam Tutar</div>
                <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">{totalCostTL} TL</div>
              </div>
              <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-2.5">
                <div className="text-[10px] text-gray-500">Pay Başına</div>
                <div className="font-mono font-black text-cyan-400 text-sm mt-0.5">{pricePerShare} TL</div>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Havuz Linki Kopyalandı!' : 'Ortak Kupon Davet Linkini Kopyala'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

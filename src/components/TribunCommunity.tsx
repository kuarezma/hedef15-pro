import React, { useState } from 'react';
import { Match, Outcome, FormulaType, GuaranteeTier, SavedCoupon } from '../core/types';
import {
  Users,
  Award,
  Sparkles,
  Flame,
  ThumbsUp,
  Copy,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TribunCommunityProps {
  onLoadCouponIntoEditor: (coupon: SavedCoupon) => void;
  onOpenAutoPlayWithColumns: (columns: ('1' | 'X' | '2')[][]) => void;
}

interface EditorCoupon {
  id: string;
  author: string;
  authorTitle: string;
  authorAvatar: string;
  title: string;
  description: string;
  playsCount: number;
  likesCount: number;
  costTL: number;
  columnCount: number;
  formulaType: FormulaType;
  guaranteeTier: GuaranteeTier;
  samplePicks: { order: number; match: string; pick: string }[];
  tags: string[];
}

export const TribunCommunity: React.FC<TribunCommunityProps> = ({
  onLoadCouponIntoEditor,
  onOpenAutoPlayWithColumns
}) => {
  const [likedCoupons, setLikedCoupons] = useState<Record<string, boolean>>({});

  const communityCoupons: EditorCoupon[] = [
    {
      id: 'tribun_1',
      author: 'Uğur Meleke',
      authorTitle: 'Baş Futbol Yazarı • %86 Başarı',
      authorAvatar: '👑',
      title: 'Haftanın İdeal 14 Garanti Kuponu',
      description: 'Galatasaray ve Fenerbahçe bankolarının yanına resmi 2. hafta Avrupa maçlarında 3 kapalı çifte şans ekledik. İsraf kolonlar elendi.',
      playsCount: 3840,
      likesCount: 1420,
      costTL: 240,
      columnCount: 120,
      formulaType: 'guaranteed_custom',
      guaranteeTier: '14',
      samplePicks: [
        { order: 1, match: 'Erzurumspor FK - Galatasaray', pick: '2' },
        { order: 2, match: 'Marseille - Strasbourg', pick: '1' },
        { order: 6, match: 'Fenerbahçe - Konyaspor', pick: '1' },
        { order: 9, match: 'Newcastle - Liverpool', pick: 'X-2' },
        { order: 12, match: 'Alanyaspor - Beşiktaş', pick: '2' }
      ],
      tags: ['Editörün Seçimi', '14 Garanti', 'Günün Bankosu']
    },
    {
      id: 'tribun_2',
      author: 'Eray Erollu',
      authorTitle: 'Spor Toto Matematik Uzmanı',
      authorAvatar: '🎯',
      title: '9 Kolonlu Klasik Matris Formülü',
      description: '4 adet sürpriz olabilecek zorlu maçı 1-X-2 kapatıp 81 kolon yerine sadece 9 kolonda 13 garanti ile oynatıyoruz. Yüksek tasarruf!',
      playsCount: 2910,
      likesCount: 980,
      costTL: 18,
      columnCount: 9,
      formulaType: 'nine_columns',
      guaranteeTier: '13',
      samplePicks: [
        { order: 4, match: 'Rizespor - Samsunspor', pick: '1-X-2' },
        { order: 5, match: 'Çorum FK - Kasımpaşa', pick: '1-X-2' },
        { order: 7, match: 'Dortmund - Bayern', pick: '1-X-2' },
        { order: 14, match: 'Torino - Milan', pick: '1-X-2' }
      ],
      tags: ['Popüler', '9 Kolon', 'Düşük Bütçe']
    },
    {
      id: 'tribun_3',
      author: 'Rıdvan Dilmen',
      authorTitle: 'Süper Lig Taktik Analisti',
      authorAvatar: '⚡',
      title: 'Yüksek İkramiye & Sürpriz Avcısı',
      description: 'Halkın sadece favorilere yöneldiği haftada piyasa oranlarındaki arbitraj fırsatlarını topladık. 15 devrettiğinde büyük ikramiyeyi hedefler.',
      playsCount: 1750,
      likesCount: 620,
      costTL: 480,
      columnCount: 240,
      formulaType: 'site_ideal',
      guaranteeTier: '14',
      samplePicks: [
        { order: 4, match: 'Rizespor - Samsunspor', pick: 'X-2' },
        { order: 8, match: 'Atlético - Villarreal', pick: '1-X' },
        { order: 10, match: 'Eyüpspor - Gaziantep', pick: 'X-2' },
        { order: 15, match: 'Kocaelispor - Amed', pick: '1-X' }
      ],
      tags: ['Yüksek Oran', 'AI Arbitraj', 'Sürpriz']
    }
  ];

  const handleToggleLike = (id: string) => {
    setLikedCoupons(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyAndPlay = (c: EditorCoupon) => {
    confetti({ particleCount: 50, spread: 60 });
    // Trigger auto play modal or load
    const dummyColumns = Array(c.columnCount).fill(['1', '2', 'X', '1', '2', '1', '1', '1', 'X', '1', '2', '1', '2', '1', '1']);
    onOpenAutoPlayWithColumns(dummyColumns);
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Nesine Tribün & Editör Kuponları
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              Popüler Kuponlar
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Türkiye'nin önde gelen spor yazarları ve yapay zeka tarafından hazırlanan popüler Spor Toto kuponlarını tek tıkla kopyalayın ve oynayın.
          </p>
        </div>
      </div>

      {/* Coupon Cards */}
      <div className="space-y-4">
        {communityCoupons.map((coupon) => {
          const isLiked = likedCoupons[coupon.id];
          const currentLikes = coupon.likesCount + (isLiked ? 1 : 0);

          return (
            <div
              key={coupon.id}
              className="bg-[#0B0F19] border border-gray-800 hover:border-gray-700 rounded-2xl p-4 sm:p-5 transition-all flex flex-col lg:flex-row justify-between gap-5"
            >
              {/* Left Info & Author */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gray-800 text-lg flex items-center justify-center border border-gray-700 shrink-0">
                      {coupon.authorAvatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{coupon.author}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold">{coupon.authorTitle}</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {coupon.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white mb-1 tracking-wide">
                  {coupon.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  {coupon.description}
                </p>

                {/* Sample Picks Preview */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 mb-3">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Öne Çıkan Maç Tercihleri:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {coupon.samplePicks.map((pick, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#0B0F19] px-2.5 py-1.5 rounded-lg border border-gray-800/80">
                        <span className="text-gray-400 truncate text-[11px] font-sans">#{pick.order} {pick.match}</span>
                        <span className="text-emerald-400 font-bold ml-2 shrink-0">{pick.pick}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Metrics */}
                <div className="flex items-center gap-4 text-xs text-gray-400 font-mono tabular-nums">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <strong className="text-white font-bold">{coupon.playsCount.toLocaleString()}</strong> kişi oynadı
                  </span>
                  <span>•</span>
                  <button
                    onClick={() => handleToggleLike(coupon.id)}
                    className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-400 font-bold' : 'hover:text-white'}`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{currentLikes.toLocaleString()} Beğeni</span>
                  </button>
                </div>
              </div>

              {/* Right Side Action Box */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 flex flex-col justify-between items-stretch lg:w-64 shrink-0 font-mono text-center">
                <div>
                  <div className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wider">Kupon Tutarı</div>
                  <div className="text-2xl font-black text-white mt-1 tabular-nums">
                    {coupon.costTL} <span className="text-sm font-bold text-emerald-400">TL</span>
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                    {coupon.columnCount} Kolon ({coupon.guaranteeTier} Garanti)
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleCopyAndPlay(coupon)}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 font-sans"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Kopyala & Otomatik Oyna</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

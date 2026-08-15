import React from 'react';
import { Target, Zap, TrendingUp, DollarSign, Radio, Users, Sparkles, HelpCircle } from 'lucide-react';

export type ActiveTab = 'coupon' | 'filters' | 'ai_radar' | 'prize' | 'live' | 'syndicate';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  columnCount: number;
  totalCostTL: number;
  onOpenAutoPlay: () => void;
  onOpenStats: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  columnCount,
  totalCostTL,
  onOpenAutoPlay,
  onOpenStats
}) => {
  const tabs = [
    { id: 'coupon', label: '🎯 Kupon & Formül', icon: Target },
    { id: 'filters', label: '⚙️ Akıllı Filtreler', icon: Zap },
    { id: 'ai_radar', label: '🤖 AI Değer Radarı', icon: TrendingUp },
    { id: 'prize', label: '💰 İkramiye Havuzu', icon: DollarSign },
    { id: 'live', label: '📡 Canlı Maç Radarı', icon: Radio },
    { id: 'syndicate', label: '👥 Ortak Kupon (Havuz)', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('coupon')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                  HEDEF15
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Akıllı Spor Toto Formül & Analiz</p>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-gray-900/60 p-1 rounded-xl border border-gray-800">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center space-x-3">
            {/* Quick Stat Pill */}
            <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-gray-900/80 border border-gray-800 rounded-lg">
              <span className="text-[10px] text-gray-400 font-medium">Toplam Kolon / Tutar</span>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="text-emerald-400">{columnCount.toLocaleString()} Kolon</span>
                <span className="text-gray-500">•</span>
                <span className="text-white">{totalCostTL.toLocaleString()} TL</span>
              </div>
            </div>

            {/* Quick Auto-Play Button */}
            <button
              onClick={onOpenAutoPlay}
              className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Otomatik Oyna</span>
            </button>

            {/* Stats / Help Button */}
            <button
              onClick={onOpenStats}
              title="İstatistikler & Gurur Kuponları"
              className="p-2 text-gray-400 hover:text-white bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Scroller */}
      <div className="md:hidden flex overflow-x-auto py-2 px-3 border-t border-gray-800 gap-1 bg-[#0B0F19] scrollbar-none">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'text-gray-400 bg-gray-900 border border-gray-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { FormulaSelector } from './components/FormulaSelector';
import { MatchList } from './components/MatchList';
import { FilterPanel } from './components/FilterPanel';
import { ColumnViewer } from './components/ColumnViewer';
import { MyCoupons } from './components/MyCoupons';
import { AIValueRadar } from './components/AIValueRadar';
import { PrizeCalculator } from './components/PrizeCalculator';
import { LiveRadar } from './components/LiveRadar';
import { SyndicateShareModal } from './components/SyndicateShareModal';
import { AutoPlayModal } from './components/AutoPlayModal';
import { StatsModal } from './components/StatsModal';
import { useTotoEngine } from './hooks/useTotoEngine';
import { useLiveSimulator } from './hooks/useLiveSimulator';
import { Column, Outcome, SavedCoupon } from './core/types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('coupon');
  const [isAutoPlayOpen, setIsAutoPlayOpen] = useState<boolean>(false);
  const [autoPlayColumns, setAutoPlayColumns] = useState<Column[]>([]);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);

  const {
    matches,
    setMatches,
    toggleMatchPick,
    setSinglePick,
    updateMatchPercent,
    applyPreset,
    formulaType,
    setFormulaType,
    guaranteeTier,
    setGuaranteeTier,
    filters,
    setFilters,
    targetBudgetTL,
    setTargetBudgetTL,
    unitPriceTL,
    setUnitPriceTL,
    generatedColumns,
    calcSummary,
    isCalculating,
    runCalculation
  } = useTotoEngine();

  // Unified Live Simulator & Mackolik Engine
  const liveSimulator = useLiveSimulator(matches, generatedColumns);

  const handleApplyValueSelections = (selections: { matchId: number; outcome: Outcome }[]) => {
    setMatches(prev => prev.map(m => {
      const found = selections.find(s => s.matchId === m.id);
      if (found) {
        return {
          ...m,
          userPicks: {
            '1': found.outcome === '1',
            'X': found.outcome === 'X',
            '2': found.outcome === '2'
          }
        };
      }
      return m;
    }));
    setActiveTab('coupon');
  };

  const handleLoadCouponIntoEditor = (coupon: SavedCoupon) => {
    if (coupon.matches && coupon.matches.length === 15) {
      setMatches(coupon.matches);
    }
    setFormulaType(coupon.formulaType);
    if (coupon.guaranteeTier) {
      setGuaranteeTier(coupon.guaranteeTier);
    }
    setActiveTab('coupon');
  };

  const handleOpenAutoPlayWithColumns = (cols: Column[]) => {
    setAutoPlayColumns(cols);
    setIsAutoPlayOpen(true);
  };

  const currentAutoPlayCols = autoPlayColumns.length > 0 ? autoPlayColumns : generatedColumns;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        columnCount={generatedColumns.length}
        totalCostTL={calcSummary.totalCostTL}
        onOpenAutoPlay={() => {
          setAutoPlayColumns(generatedColumns);
          setIsAutoPlayOpen(true);
        }}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Kupon & Formül (Primary Workspace) */}
        {activeTab === 'coupon' && (
          <div className="space-y-6">
            <FormulaSelector
              formulaType={formulaType}
              setFormulaType={setFormulaType}
              guaranteeTier={guaranteeTier}
              setGuaranteeTier={setGuaranteeTier}
              targetBudgetTL={targetBudgetTL}
              setTargetBudgetTL={setTargetBudgetTL}
              unitPriceTL={unitPriceTL}
              setUnitPriceTL={setUnitPriceTL}
              onRecalculate={runCalculation}
              isCalculating={isCalculating}
            />

            <MatchList
              matches={matches}
              formulaType={formulaType}
              matchStatuses={liveSimulator.matchStatuses}
              toggleMatchPick={toggleMatchPick}
              setSinglePick={setSinglePick}
              updateMatchPercent={updateMatchPercent}
              applyPreset={applyPreset}
            />

            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              onApplyFilters={runCalculation}
            />

            <ColumnViewer
              columns={generatedColumns}
              matches={matches}
              summary={calcSummary}
              onOpenAutoPlay={() => {
                setAutoPlayColumns(generatedColumns);
                setIsAutoPlayOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 2: Akıllı Filtreler */}
        {activeTab === 'filters' && (
          <div className="space-y-6">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              onApplyFilters={runCalculation}
            />
            <ColumnViewer
              columns={generatedColumns}
              matches={matches}
              summary={calcSummary}
              onOpenAutoPlay={() => {
                setAutoPlayColumns(generatedColumns);
                setIsAutoPlayOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 3: Kuponlarım & Kupon Yükle */}
        {activeTab === 'my_coupons' && (
          <div className="space-y-6">
            <MyCoupons
              currentColumns={generatedColumns}
              currentMatches={matches}
              currentFormulaType={formulaType}
              currentGuaranteeTier={guaranteeTier}
              currentCostTL={calcSummary.totalCostTL}
              onLoadCouponIntoEditor={handleLoadCouponIntoEditor}
              onOpenAutoPlayWithColumns={handleOpenAutoPlayWithColumns}
              liveOutcomes={liveSimulator.currentOutcomes}
            />
          </div>
        )}

        {/* Tab 4: AI Değer Radarı */}
        {activeTab === 'ai_radar' && (
          <div className="space-y-6">
            <AIValueRadar
              matches={matches}
              onApplyValueSelections={handleApplyValueSelections}
            />
            <ColumnViewer
              columns={generatedColumns}
              matches={matches}
              summary={calcSummary}
              onOpenAutoPlay={() => {
                setAutoPlayColumns(generatedColumns);
                setIsAutoPlayOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 5: İkramiye Havuzu */}
        {activeTab === 'prize' && (
          <div className="space-y-6">
            <PrizeCalculator matches={matches} />
          </div>
        )}

        {/* Tab 6: Canlı Maç Radarı */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <LiveRadar
              matches={matches}
              simulator={liveSimulator}
            />
          </div>
        )}

        {/* Tab 7: Ortak Kupon (Havuz) */}
        {activeTab === 'syndicate' && (
          <div className="space-y-6">
            <SyndicateShareModal
              columns={generatedColumns}
              totalCostTL={calcSummary.totalCostTL}
            />
          </div>
        )}
      </main>

      {/* Global Modals */}
      <AutoPlayModal
        isOpen={isAutoPlayOpen}
        onClose={() => setIsAutoPlayOpen(false)}
        columns={currentAutoPlayCols}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#070A12] py-8 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-wider">HEDEF15 PRO</span>
            <span>•</span>
            <span>Yapay Zeka & Kombinatoryal Spor Toto Platformu</span>
          </div>
          <div className="text-gray-400">
            Nesine, Misli, Bilyoner, Tuttur ile tam uyumlu Extra1X2 formatı
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

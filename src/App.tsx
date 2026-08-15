import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { FormulaSelector } from './components/FormulaSelector';
import { MatchList } from './components/MatchList';
import { FilterPanel } from './components/FilterPanel';
import { ColumnViewer } from './components/ColumnViewer';
import { AIValueRadar } from './components/AIValueRadar';
import { PrizeCalculator } from './components/PrizeCalculator';
import { LiveRadar } from './components/LiveRadar';
import { SyndicateShareModal } from './components/SyndicateShareModal';
import { AutoPlayModal } from './components/AutoPlayModal';
import { StatsModal } from './components/StatsModal';
import { useTotoEngine } from './hooks/useTotoEngine';
import { Outcome } from './core/types';
import { decodePoolFromUrl } from './services/syndicateService';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('coupon');
  const [isAutoPlayOpen, setIsAutoPlayOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [importedPoolTitle, setImportedPoolTitle] = useState<string | null>(null);

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
    runCalculation,
    refreshBulletin,
    bulletinMeta,
    isBulletinLoading
  } = useTotoEngine();

  // Load shared syndicate pool from URL
  useEffect(() => {
    const pool = decodePoolFromUrl();
    if (pool && pool.columns.length > 0) {
      setImportedPoolTitle(pool.title);
      setActiveTab('syndicate');
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        columnCount={generatedColumns.length}
        totalCostTL={calcSummary.totalCostTL}
        onOpenAutoPlay={() => setIsAutoPlayOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onRefreshBulletin={() => refreshBulletin(true)}
        isBulletinLoading={isBulletinLoading}
        bulletinMeta={bulletinMeta}
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
              toggleMatchPick={toggleMatchPick}
              setSinglePick={setSinglePick}
              updateMatchPercent={updateMatchPercent}
              applyPreset={applyPreset}
            />

            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              onApplyFilters={runCalculation}
              generatedColumns={generatedColumns}
            />

            <ColumnViewer
              columns={generatedColumns}
              matches={matches}
              summary={calcSummary}
              onOpenAutoPlay={() => setIsAutoPlayOpen(true)}
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
              generatedColumns={generatedColumns}
            />
            <ColumnViewer
              columns={generatedColumns}
              matches={matches}
              summary={calcSummary}
              onOpenAutoPlay={() => setIsAutoPlayOpen(true)}
            />
          </div>
        )}

        {/* Tab 3: AI Değer Radarı */}
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
              onOpenAutoPlay={() => setIsAutoPlayOpen(true)}
            />
          </div>
        )}

        {/* Tab 4: İkramiye Havuzu */}
        {activeTab === 'prize' && (
          <div className="space-y-6">
            <PrizeCalculator matches={matches} />
          </div>
        )}

        {/* Tab 5: Canlı Maç Radarı */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <LiveRadar matches={matches} columns={generatedColumns} />
          </div>
        )}

        {/* Tab 6: Ortak Kupon (Havuz) */}
        {activeTab === 'syndicate' && (
          <div className="space-y-6">
            <SyndicateShareModal
              columns={generatedColumns}
              totalCostTL={calcSummary.totalCostTL}
              importedTitle={importedPoolTitle}
            />
          </div>
        )}
      </main>

      {/* Global Modals */}
      <AutoPlayModal
        isOpen={isAutoPlayOpen}
        onClose={() => setIsAutoPlayOpen(false)}
        columns={generatedColumns}
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

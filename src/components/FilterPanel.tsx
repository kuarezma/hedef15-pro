import React from 'react';
import { Column, FilterConfig, Outcome } from '../core/types';
import { Zap, Hash, AlertTriangle, Repeat, Layers, GitCompare, RefreshCw } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterConfig;
  setFilters: React.Dispatch<React.SetStateAction<FilterConfig>>;
  onApplyFilters?: () => void;
  generatedColumns?: Column[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  onApplyFilters,
  generatedColumns = []
}) => {
  const updateRange = (key: 'count1' | 'countX' | 'count2' | 'surpriseCount' | 'signChanges', index: 0 | 1, value: number) => {
    setFilters(prev => {
      const current = [...prev[key]] as [number, number];
      current[index] = value;
      if (index === 0 && current[0] > current[1]) current[1] = current[0];
      if (index === 1 && current[1] < current[0]) current[0] = current[1];
      return { ...prev, [key]: current };
    });
  };

  const updateConsecutive = (key: 'maxConsecutive1' | 'maxConsecutiveX' | 'maxConsecutive2', value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleGroupFilter = (groupId: string) => {
    setFilters(prev => ({
      ...prev,
      groupFilters: prev.groupFilters.map(g => g.groupId === groupId ? { ...g, enabled: !g.enabled } : g)
    }));
  };

  type GroupRangeKey = 'min1' | 'max1' | 'minX' | 'maxX' | 'min2' | 'max2' | 'minSurprise' | 'maxSurprise';

  const updateGroupRange = (groupId: string, key: GroupRangeKey, value: number) => {
    setFilters(prev => ({
      ...prev,
      groupFilters: prev.groupFilters.map(g =>
        g.groupId === groupId ? { ...g, [key]: Math.max(0, Math.min(15, value)) } : g
      )
    }));
  };

  const setReferenceFromColumn = (colIndex: number) => {
    const col = generatedColumns[colIndex];
    if (!col) return;
    setFilters(prev => ({
      ...prev,
      referenceColumn: [...col] as Outcome[],
      minMatchWithRef: prev.minMatchWithRef ?? 10,
      maxMatchWithRef: prev.maxMatchWithRef ?? 15
    }));
  };

  const clearReferenceColumn = () => {
    setFilters(prev => ({ ...prev, referenceColumn: undefined }));
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-sm">
      {/* Header with Enable Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <h2 className="text-base font-bold text-white tracking-tight">Gelişmiş Spor Toto Filtreleme Motoru</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Gerçekleşme ihtimali düşük veya israf kolonları eleyerek bütçenizi en verimli şekilde kullanın.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onApplyFilters && (
            <button
              onClick={onApplyFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/30 transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hemen Uygula</span>
            </button>
          )}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-semibold text-gray-300">
              {filters.enabled ? 'Filtreler Aktif' : 'Filtreler Kapalı'}
            </span>
            <div
              onClick={() => setFilters(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                filters.enabled ? 'bg-emerald-500 justify-end' : 'bg-gray-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
            </div>
          </label>
        </div>
      </div>

      <div className={`space-y-5 transition-opacity ${filters.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        {/* Section 1: Total Sign Counts (1, X, 2) */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Hash className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">1. Toplam Sonuç Sayısı Filtreleri (1 - X - 2)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1 Count */}
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-400">Toplam "1" Sayısı</span>
                <span className="text-xs font-mono font-bold text-white bg-gray-800 px-2 py-0.5 rounded tabular-nums min-w-[52px] text-center">
                  {filters.count1[0]} - {filters.count1[1]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-6 text-[10px]">Min:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.count1[0]}
                  onChange={(e) => updateRange('count1', 0, Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span className="w-6 text-[10px] text-right">Max:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.count1[1]}
                  onChange={(e) => updateRange('count1', 1, Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* X Count */}
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-amber-400">Toplam "X" (Beraberlik)</span>
                <span className="text-xs font-mono font-bold text-white bg-gray-800 px-2 py-0.5 rounded tabular-nums min-w-[52px] text-center">
                  {filters.countX[0]} - {filters.countX[1]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-6 text-[10px]">Min:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.countX[0]}
                  onChange={(e) => updateRange('countX', 0, Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span className="w-6 text-[10px] text-right">Max:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.countX[1]}
                  onChange={(e) => updateRange('countX', 1, Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* 2 Count */}
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-cyan-400">Toplam "2" (Deplasman)</span>
                <span className="text-xs font-mono font-bold text-white bg-gray-800 px-2 py-0.5 rounded tabular-nums min-w-[52px] text-center">
                  {filters.count2[0]} - {filters.count2[1]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-6 text-[10px]">Min:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.count2[0]}
                  onChange={(e) => updateRange('count2', 0, Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span className="w-6 text-[10px] text-right">Max:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.count2[1]}
                  onChange={(e) => updateRange('count2', 1, Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Surprise & Fluctuation */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">2. Sürpriz & Dalgalanma Filtreleri</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Surprise Count */}
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-xs font-bold text-purple-400">Toplam Sürpriz Sayısı</span>
                  <p className="text-[10px] text-gray-500">Yüksek oranlı sonuç adedi</p>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-gray-800 px-2 py-0.5 rounded tabular-nums min-w-[52px] text-center">
                  {filters.surpriseCount[0]} - {filters.surpriseCount[1]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                <span className="w-6 text-[10px]">Min:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.surpriseCount[0]}
                  onChange={(e) => updateRange('surpriseCount', 0, Number(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span className="w-6 text-[10px] text-right">Max:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.surpriseCount[1]}
                  onChange={(e) => updateRange('surpriseCount', 1, Number(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Sign Changes / Fluctuation */}
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-xs font-bold text-teal-400">Dalgalanma (Sonuç Değişimi)</span>
                  <p className="text-[10px] text-gray-500">Peş peşe maçlar arası sonuç değişim adedi</p>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-gray-800 px-2 py-0.5 rounded tabular-nums min-w-[52px] text-center">
                  {filters.signChanges[0]} - {filters.signChanges[1]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                <span className="w-6 text-[10px]">Min:</span>
                <input
                  type="range"
                  min="0"
                  max="14"
                  value={filters.signChanges[0]}
                  onChange={(e) => updateRange('signChanges', 0, Number(e.target.value))}
                  className="w-full accent-teal-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span className="w-6 text-[10px] text-right">Max:</span>
                <input
                  type="range"
                  min="0"
                  max="14"
                  value={filters.signChanges[1]}
                  onChange={(e) => updateRange('signChanges', 1, Number(e.target.value))}
                  className="w-full accent-teal-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Consecutives */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Repeat className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">3. Peş Peşe Tekrar Sınırları</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-400">Max Peş Peşe "1"</div>
                <div className="text-[10px] text-gray-500">Üst üste ev sahibi</div>
              </div>
              <select
                value={filters.maxConsecutive1}
                onChange={(e) => updateConsecutive('maxConsecutive1', Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-xs font-bold text-white rounded-lg px-2.5 py-1 focus:outline-none shrink-0"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} Maç</option>)}
              </select>
            </div>

            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-400">Max Peş Peşe "X"</div>
                <div className="text-[10px] text-gray-500">Üst üste beraberlik</div>
              </div>
              <select
                value={filters.maxConsecutiveX}
                onChange={(e) => updateConsecutive('maxConsecutiveX', Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-xs font-bold text-white rounded-lg px-2.5 py-1 focus:outline-none shrink-0"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Maç</option>)}
              </select>
            </div>

            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-cyan-400">Max Peş Peşe "2"</div>
                <div className="text-[10px] text-gray-500">Üst üste deplasman</div>
              </div>
              <select
                value={filters.maxConsecutive2}
                onChange={(e) => updateConsecutive('maxConsecutive2', Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-xs font-bold text-white rounded-lg px-2.5 py-1 focus:outline-none shrink-0"
              >
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Maç</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Group / Block Filters */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">4. Lig & Özel Grup Blok Filtreleri</h3>
          </div>
          <div className="space-y-2.5">
            {filters.groupFilters.map(group => (
              <div
                key={group.groupId}
                className={`bg-[#0B0F19] border rounded-xl p-3 transition-all ${
                  group.enabled ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={group.enabled}
                      onChange={() => toggleGroupFilter(group.groupId)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-bold text-white">{group.groupName}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${group.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                    {group.enabled ? 'Aktif' : 'Devre Dışı'}
                  </span>
                </div>
                {group.enabled && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-gray-300">
                    {([
                      ['min1', 'max1', '1 Sayısı', group.min1, group.max1],
                      ['minX', 'maxX', 'X Sayısı', group.minX, group.maxX],
                      ['min2', 'max2', '2 Sayısı', group.min2, group.max2],
                      ['minSurprise', 'maxSurprise', 'Sürpriz', group.minSurprise, group.maxSurprise]
                    ] as const).map(([minKey, maxKey, label, minVal, maxVal]) => (
                      <div key={minKey} className="bg-gray-900/60 border border-gray-800 rounded-lg p-2">
                        <div className="text-[10px] text-gray-500 mb-1">{label}</div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={15}
                            value={minVal}
                            onChange={(e) => updateGroupRange(group.groupId, minKey, Number(e.target.value))}
                            className="w-10 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-[10px] font-mono text-white text-center"
                          />
                          <span className="text-gray-600">-</span>
                          <input
                            type="number"
                            min={0}
                            max={15}
                            value={maxVal}
                            onChange={(e) => updateGroupRange(group.groupId, maxKey, Number(e.target.value))}
                            className="w-10 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-[10px] font-mono text-white text-center"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Reference Column Filter */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <GitCompare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">5. Ortak Kolon Eleme (Referans Kolon)</h3>
          </div>
          <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5 space-y-3">
            <p className="text-[11px] text-gray-400">
              Seçilen referans kolona göre minimum/maksimum eşleşme sayısı ile kolonları eleyin.
            </p>
            {filters.referenceColumn ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                  {filters.referenceColumn.join('')}
                </span>
                <button
                  onClick={clearReferenceColumn}
                  className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                >
                  Referansı Kaldır
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-gray-500">Henüz referans kolon seçilmedi.</span>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-[11px] text-gray-400">Min eşleşme:</label>
              <input
                type="number"
                min={0}
                max={15}
                value={filters.minMatchWithRef ?? 10}
                onChange={(e) => setFilters(prev => ({ ...prev, minMatchWithRef: Number(e.target.value) }))}
                className="w-14 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs font-mono text-white"
              />
              <label className="text-[11px] text-gray-400">Max eşleşme:</label>
              <input
                type="number"
                min={0}
                max={15}
                value={filters.maxMatchWithRef ?? 15}
                onChange={(e) => setFilters(prev => ({ ...prev, maxMatchWithRef: Number(e.target.value) }))}
                className="w-14 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs font-mono text-white"
              />
            </div>
            {generatedColumns.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {generatedColumns.slice(0, 8).map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReferenceFromColumn(idx)}
                    className="text-[10px] font-mono px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700"
                  >
                    #{idx + 1}: {col.join('').slice(0, 8)}…
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

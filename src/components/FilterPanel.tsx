import React from 'react';
import { FilterConfig } from '../core/types';
import { Zap, Sliders, Hash, AlertTriangle, Repeat, Activity, Layers, CheckCircle2 } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterConfig;
  setFilters: React.Dispatch<React.SetStateAction<FilterConfig>>;
  onApplyFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  onApplyFilters
}) => {
  const updateRange = (key: 'count1' | 'countX' | 'count2' | 'surpriseCount' | 'signChanges', index: 0 | 1, value: number) => {
    setFilters(prev => {
      const current = [...prev[key]] as [number, number];
      current[index] = value;
      // Keep min <= max
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

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
      {/* Header with Enable Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Gelişmiş Spor Toto Filtreleme Motoru</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Gerçekleşme ihtimali düşük veya israf kolonları eleyerek bütçenizi en verimli şekilde kullanın.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </div>
          </label>
        </div>
      </div>

      <div className={`space-y-6 transition-opacity ${filters.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        {/* Section 1: Total Sign Counts (1, X, 2) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">1. Toplam Sonuç Sayısı Filtreleri (1 - X - 2)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1 Count */}
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-400">Toplam "1" Sayısı</span>
                <span className="text-xs font-mono font-bold text-white bg-gray-800 px-2 py-0.5 rounded">
                  {filters.count1[0]} - {filters.count1[1]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Min:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.count1[0]}
                  onChange={(e) => updateRange('count1', 0, Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span>Max:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.count1[1]}
                  onChange={(e) => updateRange('count1', 1, Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* X Count */}
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-amber-400">Toplam "X" (Beraberlik)</span>
                <span className="text-xs font-mono font-bold text-white bg-gray-800 px-2 py-0.5 rounded">
                  {filters.countX[0]} - {filters.countX[1]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Min:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.countX[0]}
                  onChange={(e) => updateRange('countX', 0, Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span>Max:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.countX[1]}
                  onChange={(e) => updateRange('countX', 1, Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* 2 Count */}
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-cyan-400">Toplam "2" (Deplasman)</span>
                <span className="text-xs font-mono font-bold text-white bg-gray-800 px-2 py-0.5 rounded">
                  {filters.count2[0]} - {filters.count2[1]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Min:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.count2[0]}
                  onChange={(e) => updateRange('count2', 0, Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span>Max:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.count2[1]}
                  onChange={(e) => updateRange('count2', 1, Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Surprise & Fluctuation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">2. Sürpriz & Dalgalanma Filtreleri</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Surprise Count */}
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-xs font-bold text-purple-400">Toplam Sürpriz Sayısı</span>
                  <p className="text-[10px] text-gray-500">Yüksek oranlı / az oynanan sonuç sayısı</p>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-gray-800 px-2 py-0.5 rounded">
                  {filters.surpriseCount[0]} - {filters.surpriseCount[1]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                <span>Min:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.surpriseCount[0]}
                  onChange={(e) => updateRange('surpriseCount', 0, Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span>Max:</span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={filters.surpriseCount[1]}
                  onChange={(e) => updateRange('surpriseCount', 1, Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Sign Changes / Fluctuation */}
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-xs font-bold text-teal-400">Dalgalanma (Sonuç Değişimi)</span>
                  <p className="text-[10px] text-gray-500">Peş peşe maçlar arasındaki sonuç değişim adedi</p>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-gray-800 px-2 py-0.5 rounded">
                  {filters.signChanges[0]} - {filters.signChanges[1]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                <span>Min:</span>
                <input
                  type="range"
                  min="0"
                  max="14"
                  value={filters.signChanges[0]}
                  onChange={(e) => updateRange('signChanges', 0, Number(e.target.value))}
                  className="w-full accent-teal-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                />
                <span>Max:</span>
                <input
                  type="range"
                  min="0"
                  max="14"
                  value={filters.signChanges[1]}
                  onChange={(e) => updateRange('signChanges', 1, Number(e.target.value))}
                  className="w-full accent-teal-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Consecutives (Peş Peşe Tekrarlar) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Repeat className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">3. Peş Peşe Tekrar Sınırları</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-400">Max Peş Peşe "1"</div>
                <div className="text-[10px] text-gray-500">Üst üste ev sahibi</div>
              </div>
              <select
                value={filters.maxConsecutive1}
                onChange={(e) => updateConsecutive('maxConsecutive1', Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-xs font-bold text-white rounded px-2.5 py-1 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} Maç</option>)}
              </select>
            </div>

            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-400">Max Peş Peşe "X"</div>
                <div className="text-[10px] text-gray-500">Üst üste beraberlik</div>
              </div>
              <select
                value={filters.maxConsecutiveX}
                onChange={(e) => updateConsecutive('maxConsecutiveX', Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-xs font-bold text-white rounded px-2.5 py-1 focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Maç</option>)}
              </select>
            </div>

            <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-cyan-400">Max Peş Peşe "2"</div>
                <div className="text-[10px] text-gray-500">Üst üste deplasman</div>
              </div>
              <select
                value={filters.maxConsecutive2}
                onChange={(e) => updateConsecutive('maxConsecutive2', Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 text-xs font-bold text-white rounded px-2.5 py-1 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Maç</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Group / Block Filters */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">4. Lig & Özel Grup Blok Filtreleri</h3>
          </div>
          <div className="space-y-3">
            {filters.groupFilters.map(group => (
              <div
                key={group.groupId}
                className={`bg-[#0B0F19] border rounded-xl p-3.5 transition-all ${
                  group.enabled ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={group.enabled}
                      onChange={() => toggleGroupFilter(group.groupId)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">{group.groupName}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${group.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                    {group.enabled ? 'Aktif' : 'Devre Dışı'}
                  </span>
                </div>
                {group.enabled && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-gray-300">
                    <div>1 Sayısı: {group.min1} - {group.max1}</div>
                    <div>X Sayısı: {group.minX} - {group.maxX}</div>
                    <div>2 Sayısı: {group.min2} - {group.max2}</div>
                    <div>Sürpriz: {group.minSurprise} - {group.maxSurprise}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

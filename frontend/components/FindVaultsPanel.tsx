'use client';

import { useState } from 'react';

interface FindVaultsPanelProps {
  onFindVaults: (preferences: VaultPreferences) => void;
}

export interface VaultPreferences {
  categories: string[];
  riskLevel: number;
  capitalAmount: string;
  timePeriod: string;
}

const INVESTMENT_CATEGORIES = [
  { id: 'tbill', name: 'T-Bill', description: 'Short-term US Gov debt' },
  { id: 'mutual-funds', name: 'Mutual Funds', description: 'Professionally managed pools' },
  { id: 'etf', name: 'Vanilla ETF', description: 'Track major market indices' },
  { id: 'gov-bonds', name: 'Gov Bonds', description: 'Long-term sovereign debt' },
  { id: 'obligations', name: 'Obligations', description: 'Corporate debt securities' },
  { id: 'reits', name: 'REITS', description: 'Real estate income trusts' },
  { id: 'growing-sectors', name: 'Growing Sectors', description: 'High-growth industries' },
  { id: 'emerging-markets', name: 'Emerging Markets', description: 'Developing economy assets' },
  { id: 'vc-pe', name: 'VC/PE Funds', description: 'Private equity & startups' },
];

export function FindVaultsPanel({ onFindVaults }: FindVaultsPanelProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['mutual-funds', 'etf', 'gov-bonds']);
  const [riskLevel, setRiskLevel] = useState(2); // 0-4 (Low, Avg, Med, High, Degen)
  const [capitalAmount, setCapitalAmount] = useState('1000');
  const [timePeriod, setTimePeriod] = useState('6 Months');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === INVESTMENT_CATEGORIES.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(INVESTMENT_CATEGORIES.map(c => c.id));
    }
  };

  const handleFindVaults = () => {
    onFindVaults({
      categories: selectedCategories,
      riskLevel,
      capitalAmount,
      timePeriod,
    });
  };

  const filteredCategories = INVESTMENT_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Find Strategy Vaults</h2>
        </div>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
          AI Powered
        </span>
      </div>

      <p className="text-slate-400 text-sm mb-6">
        Configure your preferences to find the best TradFi opportunities.
      </p>

      <div className="space-y-6">
        {/* Preferred TradFi Investments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-300">Preferred TradFi Investments</label>
            <button
              onClick={handleSelectAll}
              className="text-xs text-green-400 hover:text-green-300"
            >
              Select All
            </button>
          </div>
          
          <div className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Q Search categories..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {filteredCategories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-green-400' : 'text-white'}`}>
                      {category.name}
                    </span>
                    {isSelected && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{category.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Risk Level
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="4"
              value={riskLevel}
              onChange={(e) => setRiskLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>Low</span>
              <span>Avg</span>
              <span>Med</span>
              <span>High</span>
              <span>Degen</span>
            </div>
            <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-1 h-2 rounded ${
                    i === riskLevel ? 'bg-green-500' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Capital Committed */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Capital Committed
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">USDC</span>
              <input
                type="number"
                value={capitalAmount}
                onChange={(e) => setCapitalAmount(e.target.value)}
                className="w-full pl-16 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option>1 Month</option>
              <option>3 Months</option>
              <option>6 Months</option>
              <option>1 Year</option>
              <option>2 Years</option>
            </select>
          </div>
        </div>

        {/* Find Vaults Button */}
        <button
          onClick={handleFindVaults}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-green-500/50"
        >
          Find Vaults
        </button>

        {/* Accuracy Mode */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-slate-400">Accuracy Mode Active</span>
        </div>
      </div>
    </div>
  );
}


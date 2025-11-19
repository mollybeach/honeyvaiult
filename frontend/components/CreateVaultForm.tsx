'use client';

import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { ethers } from 'ethers';

interface CreateVaultFormProps {
  factoryAddress: string;
  onVaultCreated?: () => void;
  defaultBaseAsset?: string; // Default USDC address
  defaultAssets?: string[]; // Default asset addresses (bonds, REITs, etc.)
}

// Factory ABI for createVault
const FACTORY_ABI = [
  'function createVault(tuple(address baseAsset, string name, string symbol, string strategy, uint8 riskTier, uint256 targetDuration, address[] assets, uint256[] weights)) returns (address)',
];

export function CreateVaultForm({ 
  factoryAddress, 
  onVaultCreated,
  defaultBaseAsset = '',
  defaultAssets = []
}: CreateVaultFormProps) {
  const { signer, isConnected, provider } = useWeb3();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [vaultName, setVaultName] = useState('');
  const [vaultSymbol, setVaultSymbol] = useState('');
  const [strategy, setStrategy] = useState('');
  const [riskTier, setRiskTier] = useState('2');
  const [targetDuration, setTargetDuration] = useState('365'); // days
  const [baseAsset, setBaseAsset] = useState(defaultBaseAsset); // USDC address
  const [assets, setAssets] = useState<string[]>(defaultAssets.length > 0 ? defaultAssets : ['']);
  const [weights, setWeights] = useState<string[]>(defaultAssets.length > 0 ? Array(defaultAssets.length).fill('') : ['']);

  const handleAddAsset = () => {
    setAssets([...assets, '']);
    setWeights([...weights, '']);
  };

  const handleRemoveAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
    setWeights(weights.filter((_, i) => i !== index));
  };

  const handleAssetChange = (index: number, value: string) => {
    const newAssets = [...assets];
    newAssets[index] = value;
    setAssets(newAssets);
  };

  const handleWeightChange = (index: number, value: string) => {
    const newWeights = [...weights];
    newWeights[index] = value;
    setWeights(newWeights);
  };

  const handleCreateVault = async () => {
    if (!signer || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!vaultName || !vaultSymbol || !strategy || !baseAsset) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate assets and weights
    const validAssets = assets.filter(a => a.trim() !== '');
    const validWeights = weights
      .filter((_, i) => assets[i]?.trim() !== '')
      .map(w => parseFloat(w));

    if (validAssets.length === 0) {
      setError('Please add at least one asset');
      return;
    }

    if (validAssets.length !== validWeights.length) {
      setError('Number of assets and weights must match');
      return;
    }

    // Validate weights sum to 100
    const totalWeight = validWeights.reduce((sum, w) => sum + w, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError(`Weights must sum to 100% (currently ${totalWeight}%)`);
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);

      // Convert weights to basis points (10000 = 100%)
      const weightsBps = validWeights.map(w => BigInt(Math.round(w * 100)));

      const vaultConfig = {
        baseAsset,
        name: vaultName,
        symbol: vaultSymbol,
        strategy,
        riskTier: parseInt(riskTier),
        targetDuration: BigInt(parseInt(targetDuration) * 24 * 60 * 60), // Convert days to seconds
        assets: validAssets,
        weights: weightsBps,
      };

      const tx = await factory.createVault(vaultConfig);
      const receipt = await tx.wait();

      // Reset form
      setVaultName('');
      setVaultSymbol('');
      setStrategy('');
      setRiskTier('2');
      setTargetDuration('365');
      setBaseAsset(defaultBaseAsset);
      setAssets(defaultAssets.length > 0 ? defaultAssets : ['']);
      setWeights(defaultAssets.length > 0 ? Array(defaultAssets.length).fill('') : ['']);

      // Call the callback to refresh vault list
      if (onVaultCreated) {
        onVaultCreated();
      } else {
        // Default: reload page to refresh vault list
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to create vault');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
        <p className="text-purple-300 text-center">Please connect your wallet to create a vault</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
      <h3 className="text-2xl font-bold text-white mb-6">Create New Vault</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            Vault Name *
          </label>
          <input
            type="text"
            value={vaultName}
            onChange={(e) => setVaultName(e.target.value)}
            placeholder="e.g., Conservative Income Fund"
            className="w-full px-4 py-2 rounded-lg bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            Vault Symbol *
          </label>
          <input
            type="text"
            value={vaultSymbol}
            onChange={(e) => setVaultSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., CIF"
            maxLength={10}
            className="w-full px-4 py-2 rounded-lg bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            Strategy Description *
          </label>
          <textarea
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            placeholder="e.g., Diversified portfolio of corporate bonds and real estate"
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              Risk Tier *
            </label>
            <select
              value={riskTier}
              onChange={(e) => setRiskTier(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-900/80 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1">1 - Very Low</option>
              <option value="2">2 - Low</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - High</option>
              <option value="5">5 - Very High</option>
            </select>
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              Target Duration (days) *
            </label>
            <input
              type="number"
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
              placeholder="365"
              min="1"
              className="w-full px-4 py-2 rounded-lg bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            Base Asset Address (USDC) *
          </label>
          <input
            type="text"
            value={baseAsset}
            onChange={(e) => setBaseAsset(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 rounded-lg bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-purple-200 text-sm font-semibold">
              Assets & Weights *
            </label>
            <button
              onClick={handleAddAsset}
              className="text-purple-400 hover:text-purple-300 text-sm font-semibold"
            >
              + Add Asset
            </button>
          </div>
          <div className="space-y-2">
            {assets.map((asset, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={asset}
                  onChange={(e) => handleAssetChange(index, e.target.value)}
                  placeholder="Asset address (0x...)"
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />
                <input
                  type="number"
                  value={weights[index]}
                  onChange={(e) => handleWeightChange(index, e.target.value)}
                  placeholder="%"
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-24 px-4 py-2 rounded-lg bg-slate-900/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {assets.length > 1 && (
                  <button
                    onClick={() => handleRemoveAsset(index)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-500/30"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-purple-400 mt-2">
            Weights must sum to 100%
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleCreateVault}
          disabled={isCreating}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/50"
        >
          {isCreating ? 'Creating Vault...' : 'Create Vault'}
        </button>
      </div>
    </div>
  );
}


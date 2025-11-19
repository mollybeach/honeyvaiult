'use client';

import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { depositToVault } from '@/lib/web3';
import type { Vault } from '@/types';

interface RecommendedVaultCardProps {
  vault: Vault;
  onDepositSuccess?: () => void;
}

export function RecommendedVaultCard({ vault, onDepositSuccess }: RecommendedVaultCardProps) {
  const { signer, isConnected } = useWeb3();
  const [isDepositing, setIsDepositing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvest = async () => {
    if (!signer || !isConnected || !vault.address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsDepositing(true);
      setError(null);
      const tx = await depositToVault(signer, vault.address, '100');
      await tx.wait();
      onDepositSuccess?.();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  // Get asset colors based on name - matching the image
  const getAssetColor = (name: string) => {
    const colorMap: Record<string, string> = {
      'BL': 'bg-slate-800 text-white border-slate-700', // Black/dark
      'VA': 'bg-red-500/20 text-red-400 border-red-500/30', // Red
      'IN': 'bg-blue-500/20 text-blue-400 border-blue-500/30', // Blue
      'J': 'bg-blue-500/20 text-blue-400 border-blue-500/30', // Blue
      'E': 'bg-green-500/20 text-green-400 border-green-500/30', // Green
      'ST': 'bg-blue-500/20 text-blue-400 border-blue-500/30', // Blue (shown as blue circle with white text in image)
      'EM': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return colorMap[name] || 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-green-500/30 transition-all">
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Content */}
        <div className="flex-1 min-w-0">
          {/* Title and New badge */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">{vault.name}</h3>
            {vault.isNew && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                New
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 mb-4">{vault.description}</p>

          {/* Underlying Assets */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-400">Underlying Assets</span>
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Building icons - show one for each bond/reit asset */}
            <div className="flex items-end gap-1 mb-3">
              {vault.assets.filter(a => a.type === 'bond' || a.type === 'reit').map((asset, index) => (
                <div key={`building-${index}`} className="flex flex-col items-center gap-1">
                  {/* Classical building icon with columns */}
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-full h-full text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                      {/* Building with columns */}
                      <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-4h18V3H3v2z" />
                      {/* Columns */}
                      <path d="M5 3v18M9 3v18M15 3v18M19 3v18" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  {/* Asset label below building - only show for first few */}
                  {index < 2 && (
                    <span className="text-xs text-slate-500 font-semibold">{asset.name}</span>
                  )}
                </div>
              ))}
              {/* Show gear/globe for tech funds */}
              {vault.assets.filter(a => a.type === 'fund').map((asset, index) => (
                <div key={`gear-${index}`} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {/* Gear icon */}
                    <svg className="w-full h-full text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{asset.name}</span>
                </div>
              ))}
            </div>

            {/* Asset badges in a row - show all assets */}
            <div className="flex items-center gap-2 flex-wrap">
              {vault.assets.map((asset, index) => {
                // For Real Estate Income Plus, show specific colors matching image
                if (vault.id === '2') {
                  const colors = ['bg-red-500/20 text-red-400 border-red-500/30', 'bg-blue-500/20 text-blue-400 border-blue-500/30', 'bg-slate-800 text-white border-slate-700', 'bg-green-500/20 text-green-400 border-green-500/30', 'bg-blue-500/20 text-blue-400 border-blue-500/30'];
                  return (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-semibold ${colors[index] || 'bg-slate-800 text-slate-400 border-slate-700'}`}
                      title={`${asset.name} - ${asset.provider}`}
                    >
                      {asset.name}
                    </div>
                  );
                }
                // For other vaults
                return (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-semibold ${getAssetColor(asset.name)}`}
                    title={`${asset.name} - ${asset.provider}`}
                  >
                    {asset.name}
                  </div>
                );
              })}
              {/* Show +1 badge for Real Estate Income Plus */}
              {vault.id === '2' && vault.assets.length >= 4 && (
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex flex-col items-center justify-center border border-blue-500/30">
                  <span className="text-xs text-white font-semibold">+1</span>
                  <span className="text-[10px] text-white font-semibold">ST</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Match, APR, and Button */}
        <div className="flex flex-col items-end gap-4 flex-shrink-0">
          {/* Match and APR */}
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 font-semibold text-sm">{vault.matchPercentage}% Match</span>
            </div>
            <div className="text-green-400 text-2xl font-bold">{vault.apr}% APR</div>
          </div>

          {/* Invest Now Button */}
          <button
            onClick={handleInvest}
            disabled={isDepositing || !isConnected || !vault.address}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-green-500/50 flex items-center gap-2 whitespace-nowrap"
          >
            {isDepositing ? 'Processing...' : 'Invest Now'}
            <span>→</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

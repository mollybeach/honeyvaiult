'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { loadVaults, getReadOnlyProvider } from '@/lib/web3';
import { VaultCard } from './VaultCard';
import type { VaultInfo } from '@/types';

interface VaultListProps {
  factoryAddress: string;
  refreshTrigger?: number; // Trigger refresh when this changes
}

export function VaultList({ factoryAddress, refreshTrigger }: VaultListProps) {
  const { provider, address, isConnected } = useWeb3();
  const [vaults, setVaults] = useState<VaultInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVaults = async () => {
    if (!factoryAddress) return;

    try {
      setLoading(true);
      setError(null);
      
      // Use connected provider if available, otherwise use read-only provider
      const activeProvider = provider || getReadOnlyProvider();
      const loadedVaults = await loadVaults(activeProvider, factoryAddress, address || undefined);
      setVaults(loadedVaults);
    } catch (err: any) {
      console.error('Error loading vaults:', err);
      setError(err.message || 'Failed to load vaults');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (factoryAddress) {
      fetchVaults();
    }
  }, [provider, factoryAddress, address, refreshTrigger]);

  if (!factoryAddress) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-2xl border border-purple-500/20 shadow-2xl p-8 text-center">
        <p className="text-purple-300">Factory not deployed. Please deploy contracts first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-2xl border border-purple-500/20 shadow-2xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-purple-300">Loading vaults...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-2xl border border-red-500/30 shadow-2xl p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchVaults}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (vaults.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-2xl border border-purple-500/20 shadow-2xl p-8 text-center">
        <p className="text-purple-300">No vaults available yet. Deploy some vaults first!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vaults.map((vault) => (
        <VaultCard key={vault.address} vault={vault} onDepositSuccess={fetchVaults} />
      ))}
    </div>
  );
}


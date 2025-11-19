'use client';

import { RecommendedVaultCard } from './RecommendedVaultCard';
import type { Vault } from '@/types';

interface RecommendedVaultsPanelProps {
  vaults: Vault[];
  onDepositSuccess?: () => void;
}

export function RecommendedVaultsPanel({ vaults, onDepositSuccess }: RecommendedVaultsPanelProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <h2 className="text-xl font-bold text-white mb-2">Recommended Vaults</h2>
      <p className="text-sm text-slate-400 mb-6">Found {vaults.length} matches</p>

      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {vaults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No vaults found. Adjust your preferences and search again.</p>
          </div>
        ) : (
          vaults.map((vault) => (
            <RecommendedVaultCard
              key={vault.id}
              vault={vault}
              onDepositSuccess={onDepositSuccess}
            />
          ))
        )}
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sidebar } from '@/components/Sidebar';
import { FindVaultsPanel, type VaultPreferences } from '@/components/FindVaultsPanel';
import { RecommendedVaultsPanel } from '@/components/RecommendedVaultsPanel';
import { WalletButton } from '@/components/WalletButton';
import type { Vault } from '@/types';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [recommendedVaults, setRecommendedVaults] = useState<Vault[]>([]);

  // Mock function to find vaults based on preferences
  // In a real app, this would call your backend API
  const handleFindVaults = async (_preferences: VaultPreferences) => {
    // TODO: Replace with actual API call
    // For now, return mock data matching the image
    const mockVaults: Vault[] = [
      {
        id: '1',
        name: 'Global Sovereign Yield Alpha',
        description: 'Diversified exposure to short-term government bonds across G7 nations, optimized for yield and currency stability.',
        apr: 5.42,
        matchPercentage: 98,
        isNew: true,
        assets: [
          { name: 'BL', type: 'bond', provider: 'BlackRock', country: 'US', rating: 'AAA', description: 'US Treasury' },
          { name: 'VA', type: 'bond', provider: 'Vanguard', country: 'UK', rating: 'AA', description: 'UK Gilts' },
          { name: 'IN', type: 'bond', provider: 'Invesco', country: 'DE', rating: 'AAA', description: 'German Bunds' },
        ],
        riskTier: 1,
      },
      {
        id: '2',
        name: 'Real Estate Income Plus',
        description: 'High-yield REIT strategy focusing on commercial and industrial properties in emerging tech hubs.',
        apr: 8.15,
        matchPercentage: 94,
        assets: [
          { name: 'VA', type: 'reit', provider: 'Vanguard', country: 'US', rating: 'A', description: 'Commercial REIT' },
          { name: 'BL', type: 'reit', provider: 'BlackRock', country: 'US', rating: 'A+', description: 'Industrial REIT' },
          { name: 'ST', type: 'reit', provider: 'State Street', country: 'US', rating: 'A-', description: 'Office REIT' },
        ],
        riskTier: 2,
      },
      {
        id: '3',
        name: 'Tech Innovation Debt Fund',
        description: 'Senior secured lending to late-stage venture-backed technology companies with strong recurring revenue.',
        apr: 11.2,
        matchPercentage: 88,
        assets: [
          { name: 'BL', type: 'fund', provider: 'BlackRock', country: 'US', rating: 'BBB', description: 'Tech Debt' },
        ],
        riskTier: 3,
      },
      {
        id: '4',
        name: 'Emerging Markets Green Bond',
        description: 'ESG-focused sovereign and corporate debt from high-growth developing economies.',
        apr: 6.85,
        matchPercentage: 82,
        assets: [
          { name: 'EM', type: 'bond', provider: 'Emerging Markets', country: 'BR', rating: 'BBB+', description: 'Brazilian Bonds' },
        ],
        riskTier: 3,
      },
    ];

    setRecommendedVaults(mockVaults);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Top Bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 md:hidden relative">
                <Image
                  src="/praxos_favicon.jpeg"
                  alt="Praxos Logo"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-400">
                <span className="text-white">0</span> USDgas
              </div>
              <WalletButton />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-7xl mx-auto">
            {/* Left Panel - Find Vaults */}
            <div>
              <FindVaultsPanel onFindVaults={handleFindVaults} />
            </div>

            {/* Right Panel - Recommended Vaults */}
            <div>
              <RecommendedVaultsPanel
                vaults={recommendedVaults}
                onDepositSuccess={() => {
                  // Refresh vault list after deposit
                  console.log('Deposit successful');
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

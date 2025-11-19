'use client';

import { useState } from 'react';
import { WalletButton } from '@/components/WalletButton';
import { VaultList } from '@/components/VaultList';
import { DEFAULT_FACTORY_ADDRESS } from '@/lib/config';

export default function Home() {
  const [factoryAddress, setFactoryAddress] = useState(DEFAULT_FACTORY_ADDRESS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Praxos</h1>
          <p className="text-xl opacity-90">AI-Generated ERC-4626 Vaults for Real-World Assets</p>
        </header>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <WalletButton />
            <div className="flex-1 max-w-md">
              <label className="block text-white text-sm font-semibold mb-2">
                Factory Address
              </label>
              <input
                type="text"
                value={factoryAddress}
                onChange={(e) => setFactoryAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>

        <VaultList factoryAddress={factoryAddress} />
      </div>
    </div>
  );
}

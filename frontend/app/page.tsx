'use client';

import { useState } from 'react';
import { WalletButton } from '@/components/WalletButton';
import { VaultList } from '@/components/VaultList';
import { CreateVaultForm } from '@/components/CreateVaultForm';
import { DEFAULT_FACTORY_ADDRESS } from '@/lib/config';

export default function Home() {
  const [factoryAddress, setFactoryAddress] = useState(DEFAULT_FACTORY_ADDRESS);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Praxos</h1>
                <p className="text-xs text-purple-300">AI-Powered Vaults</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#vaults" className="text-purple-300 hover:text-white transition-colors">Vaults</a>
              <a href="#about" className="text-purple-300 hover:text-white transition-colors">About</a>
              <a href="https://devnet-explorer.rayls.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white transition-colors">
                Explorer
              </a>
            </nav>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Real-World Asset Vaults
            </h2>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              AI-Generated ERC-4626 Vaults for Diversified Real-World Asset Tokenization
            </p>
          </div>

          {/* Factory Address Input */}
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-purple-500/30 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full">
                <label className="block text-purple-200 text-sm font-semibold mb-2">
                  Factory Contract Address
                </label>
                <input
                  type="text"
                  value={factoryAddress}
                  onChange={(e) => setFactoryAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Create Vault Section */}
          <section id="create" className="mb-12">
            <h3 className="text-3xl font-bold text-white mb-6">Create New Vault</h3>
            <CreateVaultForm 
              factoryAddress={factoryAddress}
              onVaultCreated={() => {
                // Trigger refresh of vault list
                setRefreshTrigger(prev => prev + 1);
              }}
            />
          </section>

          {/* Vaults Section */}
          <section id="vaults">
            <h3 className="text-3xl font-bold text-white mb-6">Available Vaults</h3>
            <VaultList factoryAddress={factoryAddress} refreshTrigger={refreshTrigger} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/90 backdrop-blur-md border-t border-purple-500/20 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h4 className="text-white font-bold mb-3">Praxos</h4>
              <p className="text-purple-300 text-sm">
                AI-powered vault generation for Real-World Asset tokenization on Rayls Devnet.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://devnet-explorer.rayls.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white transition-colors">
                    Block Explorer
                  </a>
                </li>
                <li>
                  <a href="https://devnet-rpc.rayls.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white transition-colors">
                    RPC Endpoint
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-300 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Network</h4>
              <ul className="space-y-2 text-sm text-purple-300">
                <li>Rayls Devnet</li>
                <li>Chain ID: 123123</li>
                <li>Currency: USDr</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-500/20 pt-6 text-center">
            <p className="text-purple-400 text-sm">
              © 2025 Praxos. Built for Real-World Asset tokenization.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

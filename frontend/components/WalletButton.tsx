'use client';

import { useWeb3 } from '@/contexts/Web3Context';

export function WalletButton() {
  const { address, isConnected, connect, disconnect, loading } = useWeb3();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono bg-slate-800/80 border border-purple-500/30 px-4 py-2 rounded-lg text-purple-200">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-red-500/50"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={loading}
      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/50"
    >
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}


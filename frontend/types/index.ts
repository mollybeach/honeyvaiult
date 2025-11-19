// Type definitions for Praxos frontend

export interface RaylsNetwork {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export interface VaultInfo {
  address: string;
  name: string;
  symbol: string;
  strategy: string;
  riskTier: number;
  targetDuration: bigint;
  totalAssets: bigint;
  userBalance: bigint;
  assetCount: number;
  allocations: {
    assets: string[];
    weights: bigint[];
  };
}

// New enhanced Vault interface
export type AssetType = 'bond' | 'reit' | 'fund' | 'commodity' | 'equity' | 'other';

export interface Asset {
  name: string;
  type: AssetType;
  provider: string;
  country: string;
  rating: string;
  description: string;
  address?: string; // Optional: on-chain address if available
}

export interface Vault {
  id: string;                    // Unique identifier (can be vault address)
  name: string;                  // Vault name (displayed as heading)
  description: string;           // Vault description
  apr: number;                   // Annual Percentage Rate (displayed prominently)
  matchPercentage: number;       // Match percentage (0-100, shown with green dot)
  isNew?: boolean;               // Optional flag to show "New" badge
  assets: Asset[];              // Array of underlying assets
  // Additional blockchain data
  address?: string;              // On-chain vault address
  totalAssets?: bigint;          // Total assets in vault
  userBalance?: bigint;          // User's balance in vault
  riskTier?: number;             // Risk tier (1-5)
}

export interface DeploymentContract {
  name: string;
  address: string;
  explorerUrl: string;
  abiRaw: any[];
}

export interface DeploymentData {
  deploymentId: string;
  deployedBy: string;
  networkName: string;
  chainId: string;
  explorerUrl: string;
  deployedAt: string;
  deploymentType: string;
  contracts: {
    PraxosFactory: DeploymentContract;
    MockUSDC: DeploymentContract;
    [key: string]: DeploymentContract;
  };
}

// API Types
export interface RwaToken {
  address: string;
  asset_type: string;
  annual_yield: number;
  maturity_timestamp: number;
  risk_tier: number;
}

export interface VaultStrategy {
  strategy_id: string;
  name: string;
  risk_tier: number;
  target_duration: number;
  assets: string[];
  weights: number[];
  expected_yield: number;
  diversification_score: number;
}

export interface VaultRecommendation {
  vault_address: string;
  vault_name: string;
  match_score: number;
  risk_tier: number;
  expected_yield: number;
  timeframe_match: boolean;
  reasoning: string;
}

export interface UserPreferences {
  user_risk_tolerance: number;
  investment_horizon_days: number;
  target_yield_bps: number;
  available_rwa_tokens: RwaToken[];
}


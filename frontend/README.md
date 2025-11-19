# Praxos Frontend

Praxos is a liquidity investment layer for TradFi (Traditional Finance), operated on the Rayls network. This frontend application provides a modern, user-friendly interface for interacting with Praxos vaults, managing investments, and exploring TradFi opportunities.

## Overview

The Praxos frontend is built with **Next.js 16** using the **App Router**, **React 19**, **TypeScript**, and **Tailwind CSS**. It integrates with Web3 through **Wagmi** and **RainbowKit** for wallet connectivity, enabling users to interact with smart contracts on the Rayls testnet.

## Architecture

### Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9 with custom dark theme
- **Web3**: Wagmi 2.14.15, RainbowKit 2.2.4, Viem 2.23.14
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: React Query (TanStack Query) 5.69.0
- **Form Handling**: React Hook Form 7.60.0 with Zod validation
- **Icons**: Lucide React

### Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Dashboard home page
│   ├── globals.css        # Global styles and theme variables
│   ├── portfolio/         # Portfolio page
│   ├── trading/           # Trading page
│   ├── watchlist/         # Watchlist page
│   ├── academy/           # Academy/education page
│   ├── profile/           # User profile page
│   └── wallet/            # Wallet management page
│
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── app-header.tsx      # Top header with wallet connect
│   │   ├── app-sidebar.tsx     # Left navigation sidebar
│   │   ├── praxos-dashboard.tsx # Main dashboard with vault finder
│   │   ├── vault-card.tsx      # Individual vault display card
│   │   └── asset-icon.tsx      # Asset type icons
│   │
│   ├── pages/            # Page-level components
│   │   ├── DashboardPage.tsx
│   │   ├── PortfolioPage.tsx
│   │   ├── TradingPage.tsx
│   │   ├── WatchlistPage.tsx
│   │   ├── AcademyPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── WalletPage.tsx
│   │
│   ├── ui/               # shadcn/ui component library
│   │   └── [60+ UI components]
│   │
│   ├── web3-providers.tsx  # Web3 context providers
│   └── theme-provider.tsx  # Dark/light theme provider
│
├── lib/                  # Core utilities and hooks
│   ├── contracts.ts      # Contract address/ABI utilities
│   ├── wagmi.ts          # Wagmi configuration
│   ├── utils.ts          # Utility functions
│   ├── mock-data.ts      # Mock vault data
│   ├── hooks/            # Custom React hooks
│   │   ├── use-vault-actions.ts  # Vault transaction hooks
│   │   └── use-vaults.ts         # Vault data fetching hooks
│   └── data/            # Static data files
│       └── contracts_data.json  # Deployed contract addresses
│
├── hooks/                # Shared hooks
│   ├── use-toast.ts      # Toast notification hook
│   └── use-mobile.ts     # Mobile detection hook
│
├── public/               # Static assets
│   └── [icons, logos, images]
│
└── styles/               # Additional stylesheets
    └── globals.css
```

## Key Features

### 1. **Dashboard & Vault Discovery**
- **AI-Powered Vault Finder**: Configure investment preferences (categories, risk level, capital, timeframe) to discover personalized vault strategies
- **Category Selection**: Choose from 9 TradFi categories (T-Bills, Mutual Funds, ETFs, Gov Bonds, REITs, etc.)
- **Risk Level Slider**: Adjust risk tolerance from Low to Degen (1-5 scale)
- **Real-time Balance Display**: Shows USDC balance from connected wallet
- **Vault Recommendations**: Displays recommended vaults based on preferences

### 2. **Vault Interaction**
- **Deposit Flow**: 
  - Connect wallet → Approve USDC spending → Deposit to vault
  - Real-time balance checking
  - Transaction status tracking
- **USDC Minting**: Development feature to mint test USDC directly from the header
- **Transaction Logging**: Comprehensive console logging for debugging

### 3. **Navigation & Layout**
- **Responsive Sidebar**: Collapsible sidebar with navigation to all pages
- **Active Route Highlighting**: Visual indication of current page
- **Dark Theme**: Custom dark theme optimized for financial data visualization

### 4. **Web3 Integration**
- **Multi-Wallet Support**: MetaMask, Rainbow, WalletConnect, Ledger, Rabby, Coinbase, Argent, Safe
- **Network Configuration**: Pre-configured for Rayls Testnet (Chain ID: 123123)
- **Smart Contract Interaction**: Direct interaction with Praxos vault contracts
- **Transaction Management**: Automatic transaction status tracking and error handling

## How It Works

### 1. **Application Initialization**

The app starts in `app/layout.tsx`, which sets up:
- **Theme Provider**: Dark theme by default
- **Web3 Providers**: Wagmi + RainbowKit + React Query
- **Toast Notifications**: For user feedback
- **Analytics**: Vercel Analytics integration

```tsx
<ThemeProvider defaultTheme="dark">
  <Web3Providers>
    {children}
  </Web3Providers>
</ThemeProvider>
```

### 2. **Web3 Connection Flow**

1. User clicks "Connect Wallet" button (RainbowKit ConnectButton)
2. Wallet selection modal appears
3. User selects wallet and approves connection
4. Wagmi config initializes with Rayls Testnet
5. User's address and balance are available throughout the app

### 3. **Vault Discovery Process**

Located in `components/dashboard/praxos-dashboard.tsx`:

1. **User Configures Preferences**:
   - Selects TradFi categories (T-Bills, REITs, etc.)
   - Sets risk level (1-5)
   - Enters capital amount (USDC)
   - Chooses timeframe (1m, 3m, 6m, 1y, 3y)

2. **API Request** (when `NEXT_PUBLIC_API_URL` is configured):
   - Sends POST request with preferences to backend
   - Backend returns personalized vault recommendations
   - Vaults displayed with match percentage and APR

3. **Fallback to Mock Data**:
   - If API unavailable, shows mock vaults
   - Mock data includes: Global Sovereign Yield Alpha, Real Estate Income Plus, etc.

### 4. **Investment Flow**

Located in `components/dashboard/vault-card.tsx`:

1. **User Clicks "Invest"** on a vault card
2. **Deposit Dialog Opens**:
   - Shows vault details (APR, match percentage, assets)
   - Input field for deposit amount
   - Displays current USDC balance
3. **USDC Approval** (if needed):
   - Checks current allowance
   - If insufficient, prompts approval transaction
   - User approves in wallet
4. **Deposit Transaction**:
   - Calls `deposit()` function on vault contract
   - User confirms in wallet
   - Transaction status tracked (pending → success/error)
5. **Success Feedback**:
   - Toast notification
   - Dialog closes
   - Balance updates

### 5. **Smart Contract Interaction**

The app uses custom hooks in `lib/hooks/use-vault-actions.ts`:

- **`useDeposit(vaultAddress)`**: Deposits USDC to vault
- **`useWithdraw(vaultAddress)`**: Withdraws shares from vault
- **`useApproveUSDC(vaultAddress)`**: Approves USDC spending
- **`useUSDCAllowance(userAddress, vaultAddress)`**: Checks allowance
- **`useMintUSDC(recipient)`**: Mints test USDC (dev only)

All hooks use Wagmi's `useWriteContract` and `useWaitForTransactionReceipt` for transaction management.

### 6. **Contract Data Management**

Contract addresses are stored in `lib/data/contracts_data.json`, which is:
- Generated automatically by the deployment script
- Contains all deployed contract addresses and ABIs
- Loaded at runtime via `lib/contracts.ts` utilities

Key functions:
- `getContractsData()`: Loads all contract data
- `getVaultAddresses()`: Gets all vault addresses
- `getUSDCAddress()`: Gets MockUSDC address
- `getTransactionExplorerUrl(txHash)`: Generates explorer links

## Configuration

### Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# WalletConnect (optional - app works without it)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Backend API (optional - uses mock data if not set)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/vaults
```

### Network Configuration

The app is pre-configured for **Rayls Testnet**:
- **Chain ID**: 123123
- **RPC URL**: https://devnet-rpc.rayls.com
- **Explorer**: https://devnet-explorer.rayls.com

Configuration is in `lib/wagmi.ts`.

## Development

### Prerequisites

- Node.js 18+ 
- npm (or pnpm/yarn)

### Installation

```bash
cd frontend
npm install
```

### Running Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Key Components Explained

### `PraxosDashboard`
The main dashboard component that:
- Renders the vault finder form (left panel)
- Displays recommended vaults (right panel)
- Handles API calls to backend
- Manages USDC balance display
- Shows loading states and error messages

### `VaultCard`
Individual vault display component that:
- Shows vault details (name, APR, match %, assets)
- Handles deposit flow (approval → deposit)
- Displays USDC balance
- Manages transaction states
- Provides mint USDC option if balance is low

### `AppHeader`
Top navigation bar with:
- Sidebar toggle
- Page title
- Mint USDC button (when connected)
- Wallet connect button

### `AppSidebar`
Left navigation sidebar with:
- Praxos logo
- Navigation links (Dashboard, Portfolio, Trading, etc.)
- Active route highlighting
- Settings link

## Styling

The app uses a custom dark theme defined in `app/globals.css`:
- **Background**: `#0d0d0d` (deep black)
- **Cards**: `#151719` (slightly lighter)
- **Primary Color**: Neon green/cyan (`oklch(0.85 0.18 150)`)
- **Sidebar**: `#151719` with white text

All UI components use Tailwind CSS with CSS variables for theming.

## Error Handling

- **WalletConnect Errors**: Suppressed when project ID not configured
- **Transaction Errors**: Displayed via toast notifications
- **API Errors**: Shown with retry option
- **Network Errors**: Detected and displayed to user

## Future Enhancements

- Portfolio tracking and analytics
- Trading interface for vault shares
- Watchlist functionality
- Academy/education content
- User profile management
- Advanced filtering and sorting

## License

See `LICENSE` file for details.

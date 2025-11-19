# Praxos Frontend

Modern Next.js React TypeScript frontend for the Praxos vault system.

## Features

- 🚀 Next.js 15 with App Router
- ⚛️ React 19 with TypeScript
- 🎨 Tailwind CSS for styling
- 🔗 Web3 integration with ethers.js v6
- 🌐 API integration with Python backend server
- 📱 Responsive design
- 🎯 Type-safe with TypeScript

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FACTORY_ADDRESS=0x... # Your deployed factory address
```

3. **Start the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── providers.tsx   # React Query & Web3 providers
├── components/         # React components
│   ├── WalletButton.tsx
│   ├── VaultCard.tsx
│   └── VaultList.tsx
├── contexts/          # React contexts
│   └── Web3Context.tsx
├── lib/               # Utilities
│   ├── api.ts         # Backend API client
│   ├── config.ts      # Configuration
│   └── web3.ts        # Web3 utilities
└── types/             # TypeScript types
    └── index.ts
```

## Features

### Wallet Connection
- Connect MetaMask or other Web3 wallets
- Automatic network switching to Rayls Devnet
- Account change detection

### Vault Management
- View all deployed vaults
- See vault details (strategy, risk tier, assets)
- Deposit assets into vaults
- View your balance in each vault

### Backend Integration
- Generate vault strategies from RWA tokens
- Get AI-powered vault recommendations
- Analyze risk for RWA tokens

## API Integration

The frontend communicates with the Python backend server for AI features:

- `POST /api/vaults/generate` - Generate vault strategies
- `POST /api/vaults/recommend` - Get vault recommendations
- `POST /api/risk/analyze` - Analyze RWA token risk

See `lib/api.ts` for the API client implementation.

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend server URL (default: http://localhost:5000)
- `NEXT_PUBLIC_FACTORY_ADDRESS` - Default factory contract address

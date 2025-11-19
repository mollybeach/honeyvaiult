# Getting Testnet Tokens (USDr) for Rayls Devnet

## Overview

Rayls Devnet uses **USDgas (USDr)** as the native gas token. You'll need USDr tokens to deploy contracts and interact with the network.

## Method 1: Rayls Faucet (If Available)

### Step 1: Add Rayls Devnet to MetaMask

1. Open MetaMask
2. Click the network dropdown (top of MetaMask)
3. Click "Add Network" or "Add a network manually"
4. Enter the following details:
   - **Network Name**: `Rayls Devnet`
   - **RPC URL**: `https://devnet-rpc.rayls.com`
   - **Chain ID**: `123123`
   - **Currency Symbol**: `USDr`
   - **Block Explorer URL**: `https://devnet-explorer.rayls.com`

### Step 2: Get Your Wallet Address

1. In MetaMask, click on your account name to copy your address
2. Your address should look like: `0x1234...5678`

### Step 3: Request Tokens from Faucet

**Option A: Official Rayls Faucet (if available)**
- Visit: `https://devnet-faucet.rayls.com` (or check Rayls documentation)
- Enter your wallet address
- Request testnet tokens
- Wait for confirmation

**Option B: Discord/Telegram Faucet**
- Join the Rayls community Discord or Telegram
- Look for a `#faucet` or `#testnet` channel
- Post your wallet address with a request
- Format: `!faucet 0xYourWalletAddress`

**Option C: Contact Rayls Team**
- Reach out to Rayls hackathon organizers
- Ask for testnet tokens for your wallet address
- They may have a dedicated faucet or can send tokens directly

## Method 2: Using Hardhat Console (If You Have Some Tokens)

If you already have a small amount of USDr, you can use Hardhat to interact with contracts:

```bash
npx hardhat console --network rayls_devnet
```

## Method 3: Check Your Balance

After receiving tokens, verify your balance:

```bash
# Using Hardhat console
npx hardhat console --network rayls_devnet
> const [signer] = await ethers.getSigners()
> const balance = await ethers.provider.getBalance(signer.address)
> console.log("Balance:", ethers.formatEther(balance), "USDr")
```

Or check on the explorer:
- Visit: `https://devnet-explorer.rayls.com`
- Search for your wallet address
- View your USDr balance

## Troubleshooting

### "Insufficient funds" error
- Make sure you have USDr tokens (not ETH)
- Check that you're on the correct network (Chain ID: 123123)
- Verify your balance on the explorer

### "Network not found" error
- Ensure MetaMask has Rayls Devnet added correctly
- Check that the RPC URL is correct: `https://devnet-rpc.rayls.com`
- Verify Chain ID is `123123`

### Can't find the faucet
- Check Rayls hackathon documentation
- Ask in Rayls Discord/Telegram channels
- Contact hackathon organizers directly

## Important Notes

- **USDr is the gas token** - you need it for all transactions
- **Testnet tokens have no real value** - they're for testing only
- **Keep your private key secure** - never share it or commit it to git
- **Use a separate wallet** for testing if possible

## Estimated Gas Costs

For deploying Praxos contracts, you'll need approximately:
- Factory deployment: ~2-3 USDr
- Mock tokens: ~1-2 USDr each
- Vault creation: ~0.5-1 USDr
- **Total estimate: 5-10 USDr** for full deployment

Request at least **20-50 USDr** from the faucet to have enough for testing and multiple deployments.


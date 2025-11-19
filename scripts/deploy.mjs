//path: scripts/deploy.mjs
import hre from "hardhat";
const {
    network,
    ethers
} = hre;
import fs from "fs";
import path from "path";
import {
    fileURLToPath
} from "url";

// -------------------- ABI & Contract Utilities --------------------
import {
    saveAbi
} from './abi/saveAbi.mjs';
import {
    cleanAbis
} from './abi/cleanAbi.mjs';

// -------------------- Print Deployment Info To Console --------------------
import {
    printDeployingContract,
    printExplorerContractLink,
    printSectionHeader,
    printStepHeader,
    printAddress,
    printSuccess,
    printInfo
} from './logs/console_logger.mjs';

// -------------------- Deployment History Logging --------------------
import {
    logDeploymentsHistory
} from './logs/data/data_logger.mjs';

/**
 * Deploy Praxos Smart Contracts
 * 
 * This script deploys the complete Praxos system:
 * 1. Deploy PraxosFactory contract
 * 2. Deploy MockUSDC base asset
 * 3. Deploy MockERC3643 RWA tokens (Bond, Real Estate, Startup Fund)
 * 4. Create a demo vault with diversified allocations
 * 5. Save ABIs and log deployment data
 */

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    // Get ethers from hardhat runtime environment
    const {
        ethers
    } = hre;

    // Configuration
    const CONFIG = {
        // RWA Token Configuration
        bondYield: 500, // 5% yield in basis points
        bondRiskTier: 2,
        realEstateYield: 700, // 7% yield in basis points
        realEstateRiskTier: 3,
        startupYield: 1500, // 15% yield in basis points
        startupRiskTier: 5,

        // Vault Configuration
        vaultName: "Balanced Diversified Vault",
        vaultSymbol: "BAL-VAULT",
        vaultStrategy: "balanced-diversified",
        vaultRiskTier: 3,
        vaultTargetDuration: 1095 * 24 * 60 * 60, // 3 years in seconds
        vaultWeights: [4000, 4000, 2000], // 40%, 40%, 20%
    };

    printSectionHeader("Deploying Praxos System");
    printInfo("🚀 Deploying Complete Praxos Vault System");

    // Get deployer
    const [deployer] = await ethers.getSigners();

    // Get network info
    const networkName = network.name;
    const chainId = (await ethers.provider.getNetwork()).chainId;
    printInfo(`📡 Deploying to network: ${networkName} (chainId: ${chainId})`);

    // Get explorer URL - default for Rayls devnet
    const explorerUrl = 'https://devnet-explorer.rayls.com';

    printAddress("👤 Deployer", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`🔗 Explorer: ${explorerUrl}\n`);

    printInfo("📋 Deployment Configuration:");
    console.log(`   Bond Yield: ${CONFIG.bondYield / 100}%`);
    console.log(`   Real Estate Yield: ${CONFIG.realEstateYield / 100}%`);
    console.log(`   Startup Yield: ${CONFIG.startupYield / 100}%`);
    console.log(`   Vault Strategy: ${CONFIG.vaultStrategy}`);
    console.log(`   Vault Risk Tier: ${CONFIG.vaultRiskTier}`);
    console.log("");

    // Clean old ABIs
    try {
        cleanAbis();
    } catch (error) {
        console.warn("⚠️ Failed to clean ABIs:", error.message);
    }

    const deploymentResults = {};

    // ==================== STEP 1: Deploy Factory ====================
    printStepHeader("1️⃣ Deploying PraxosFactory");

    printDeployingContract("PraxosFactory");
    const PraxosFactory = await ethers.getContractFactory("PraxosFactory", deployer);
    const factory = await PraxosFactory.deploy();
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    printExplorerContractLink("PraxosFactory", factoryAddress, explorerUrl);

    // Save Factory ABI
    try {
        saveAbi("PraxosFactory", PraxosFactory);
    } catch (error) {
        console.warn("⚠️ Failed to save Factory ABI:", error.message);
    }

    deploymentResults.factory = factoryAddress;
    console.log("");

    // ==================== STEP 2: Deploy Base Asset ====================
    printStepHeader("2️⃣ Deploying MockUSDC Base Asset");

    printDeployingContract("MockUSDC");
    const MockUSDC = await ethers.getContractFactory("MockUSDC", deployer);
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    printExplorerContractLink("MockUSDC", usdcAddress, explorerUrl);

    // Save MockUSDC ABI
    try {
        saveAbi("MockUSDC", MockUSDC);
    } catch (error) {
        console.warn("⚠️ Failed to save MockUSDC ABI:", error.message);
    }

    deploymentResults.baseAsset = usdcAddress;
    console.log("");

    // ==================== STEP 3: Deploy RWA Tokens ====================
    printStepHeader("3️⃣ Deploying MockERC3643 RWA Tokens");

    const MockERC3643 = await ethers.getContractFactory("MockERC3643", deployer);
    const rwaTokens = {};

    // Deploy Bond RWA
    printDeployingContract("Corporate Bond Alpha");
    const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
    const bond = await MockERC3643.deploy(
        "Corporate Bond Alpha",
        "BOND-ALPHA",
        "corporate-bond",
        oneYearFromNow,
        CONFIG.bondYield,
        CONFIG.bondRiskTier,
        ethers.parseEther("1000000")
    );
    await bond.waitForDeployment();
    const bondAddress = await bond.getAddress();
    printExplorerContractLink("Corporate Bond Alpha", bondAddress, explorerUrl);
    rwaTokens.bond = bondAddress;

    // Deploy Real Estate RWA
    printDeployingContract("Real Estate Fund Beta");
    const fiveYearsFromNow = Math.floor(Date.now() / 1000) + 1825 * 24 * 60 * 60;
    const realEstate = await MockERC3643.deploy(
        "Real Estate Fund Beta",
        "RE-BETA",
        "real-estate",
        fiveYearsFromNow,
        CONFIG.realEstateYield,
        CONFIG.realEstateRiskTier,
        ethers.parseEther("1000000")
    );
    await realEstate.waitForDeployment();
    const realEstateAddress = await realEstate.getAddress();
    printExplorerContractLink("Real Estate Fund Beta", realEstateAddress, explorerUrl);
    rwaTokens.realEstate = realEstateAddress;

    // Deploy Startup Fund RWA
    printDeployingContract("Startup Fund Gamma");
    const startup = await MockERC3643.deploy(
        "Startup Fund Gamma",
        "STARTUP-GAMMA",
        "startup-fund",
        0, // No maturity
        CONFIG.startupYield,
        CONFIG.startupRiskTier,
        ethers.parseEther("1000000")
    );
    await startup.waitForDeployment();
    const startupAddress = await startup.getAddress();
    printExplorerContractLink("Startup Fund Gamma", startupAddress, explorerUrl);
    rwaTokens.startup = startupAddress;

    // Save MockERC3643 ABI
    try {
        saveAbi("MockERC3643", MockERC3643);
    } catch (error) {
        console.warn("⚠️ Failed to save MockERC3643 ABI:", error.message);
    }

    deploymentResults.rwaTokens = rwaTokens;
    console.log("");

    // ==================== STEP 4: Create Demo Vault ====================
    printStepHeader("4️⃣ Creating Demo Vault");

    const assets = [bondAddress, realEstateAddress, startupAddress];
    const weights = CONFIG.vaultWeights;

    const vaultConfig = {
        baseAsset: usdcAddress,
        name: CONFIG.vaultName,
        symbol: CONFIG.vaultSymbol,
        strategy: CONFIG.vaultStrategy,
        riskTier: CONFIG.vaultRiskTier,
        targetDuration: CONFIG.vaultTargetDuration,
        assets: assets,
        weights: weights,
    };

    console.log("📋 Vault Configuration:");
    console.log(`   Name: ${CONFIG.vaultName}`);
    console.log(`   Strategy: ${CONFIG.vaultStrategy}`);
    console.log(`   Risk Tier: ${CONFIG.vaultRiskTier}`);
    console.log(`   Assets: ${assets.length}`);
    console.log(`   Weights: ${weights.map(w => w/100 + '%').join(', ')}`);

    printDeployingContract("Demo Vault");
    const tx = await factory.createVault(vaultConfig);
    const receipt = await tx.wait();

    // Get vault address from event
    const event = receipt.logs.find(
        (log) => log.topics[0] === ethers.id("VaultCreated(address,address,string,uint8)")
    );

    if (!event) {
        throw new Error("VaultCreated event not found in transaction receipt");
    }

    const vaultAddress = ethers.getAddress("0x" + event.topics[1].slice(-40));
    printExplorerContractLink("Demo Vault", vaultAddress, explorerUrl);

    // Get vault contract to save ABI
    const PraxosVault = await ethers.getContractFactory("PraxosVault", deployer);
    try {
        saveAbi("PraxosVault", PraxosVault);
    } catch (error) {
        console.warn("⚠️ Failed to save PraxosVault ABI:", error.message);
    }

    deploymentResults.vault = vaultAddress;
    console.log("");

    // ==================== STEP 5: Log Deployment Data ====================
    printStepHeader("5️⃣ Logging Deployment Data");

    const deploymentData = {
        deploymentId: Date.now().toString(),
        deployedBy: deployer.address,
        networkName,
        chainId: chainId.toString(),
        explorerUrl,
        deployedAt: new Date().toISOString(),
        deploymentType: 'PRAXOS_VAULT_SYSTEM',
        contracts: {
            PraxosFactory: {
                name: 'PraxosFactory',
                address: factoryAddress,
                explorerUrl: `${explorerUrl}/address/${factoryAddress}`,
            },
            MockUSDC: {
                name: 'MockUSDC',
                address: usdcAddress,
                explorerUrl: `${explorerUrl}/address/${usdcAddress}`,
            },
            CorporateBondAlpha: {
                name: 'Corporate Bond Alpha',
                address: bondAddress,
                explorerUrl: `${explorerUrl}/address/${bondAddress}`,
            },
            RealEstateFundBeta: {
                name: 'Real Estate Fund Beta',
                address: realEstateAddress,
                explorerUrl: `${explorerUrl}/address/${realEstateAddress}`,
            },
            StartupFundGamma: {
                name: 'Startup Fund Gamma',
                address: startupAddress,
                explorerUrl: `${explorerUrl}/address/${startupAddress}`,
            },
            DemoVault: {
                name: CONFIG.vaultName,
                address: vaultAddress,
                explorerUrl: `${explorerUrl}/address/${vaultAddress}`,
            },
        },
        configuration: {
            vaultStrategy: CONFIG.vaultStrategy,
            vaultRiskTier: CONFIG.vaultRiskTier,
            vaultTargetDuration: CONFIG.vaultTargetDuration,
            vaultWeights: CONFIG.vaultWeights,
            bondYield: CONFIG.bondYield,
            realEstateYield: CONFIG.realEstateYield,
            startupYield: CONFIG.startupYield,
        },
    };

    // Log deployment data
    try {
        logDeploymentsHistory(deploymentData);
        console.log("📊 Deployment data logged successfully");
    } catch (error) {
        console.warn("⚠️ Failed to log deployment data:", error.message);
    }

    console.log("");

    // ==================== STEP 6: Print Summary ====================
    printSectionHeader("🎉 Deployment Complete!");

    console.log("📋 Contract Addresses:");
    console.log("=====================");
    printAddress("🏭 PraxosFactory", factoryAddress);
    printAddress("💵 MockUSDC", usdcAddress);
    printAddress("📈 Corporate Bond Alpha", bondAddress);
    printAddress("🏘️  Real Estate Fund Beta", realEstateAddress);
    printAddress("🚀 Startup Fund Gamma", startupAddress);
    printAddress("🏦 Demo Vault", vaultAddress);
    console.log("");

    console.log("🔗 Explorer Links:");
    console.log("=================");
    console.log(`   PraxosFactory: ${explorerUrl}/address/${factoryAddress}`);
    console.log(`   MockUSDC: ${explorerUrl}/address/${usdcAddress}`);
    console.log(`   Corporate Bond Alpha: ${explorerUrl}/address/${bondAddress}`);
    console.log(`   Real Estate Fund Beta: ${explorerUrl}/address/${realEstateAddress}`);
    console.log(`   Startup Fund Gamma: ${explorerUrl}/address/${startupAddress}`);
    console.log(`   Demo Vault: ${explorerUrl}/address/${vaultAddress}`);
    console.log("");

    console.log("📋 Next Steps:");
    console.log("==============");
    console.log("1. Verify contracts on block explorer");
    console.log("2. Test vault creation and deposits");
    console.log("3. Test RWA token interactions");
    console.log("4. Update frontend with new contract addresses");
    console.log("");

    printSuccess("Complete Praxos Vault System deployed successfully!");

    return deploymentResults;
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Deployment failed:", error);
        process.exit(1);
    });

export default main;
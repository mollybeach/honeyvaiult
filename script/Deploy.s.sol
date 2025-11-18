// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {HoneyVaultFactory} from "../src/HoneyVaultFactory.sol";
import {MockERC3643} from "../src/mocks/MockERC3643.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock base asset for demo
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 10000000 * 10**18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying HoneyVaiult to Rayls Devnet...");
        console.log("Deployer:", msg.sender);

        // Deploy factory
        HoneyVaultFactory factory = new HoneyVaultFactory();
        console.log("Factory deployed at:", address(factory));

        // Deploy base asset
        MockUSDC usdc = new MockUSDC();
        console.log("Base asset (USDC) deployed at:", address(usdc));

        // Deploy mock RWA tokens for demo
        MockERC3643 bond = new MockERC3643(
            "Corporate Bond Alpha",
            "BOND-ALPHA",
            "corporate-bond",
            block.timestamp + 365 days,
            500, // 5% yield
            2, // Risk tier 2
            1000000 * 10**18
        );
        console.log("Bond RWA deployed at:", address(bond));

        MockERC3643 realEstate = new MockERC3643(
            "Real Estate Fund Beta",
            "RE-BETA",
            "real-estate",
            block.timestamp + 1825 days, // 5 years
            700, // 7% yield
            3, // Risk tier 3
            1000000 * 10**18
        );
        console.log("Real Estate RWA deployed at:", address(realEstate));

        MockERC3643 startup = new MockERC3643(
            "Startup Fund Gamma",
            "STARTUP-GAMMA",
            "startup-fund",
            0, // No maturity
            1500, // 15% yield
            5, // Risk tier 5
            1000000 * 10**18
        );
        console.log("Startup Fund RWA deployed at:", address(startup));

        // Create a demo vault
        address[] memory assets = new address[](3);
        assets[0] = address(bond);
        assets[1] = address(realEstate);
        assets[2] = address(startup);

        uint256[] memory weights = new uint256[](3);
        weights[0] = 4000; // 40%
        weights[1] = 4000; // 40%
        weights[2] = 2000; // 20%

        HoneyVaultFactory.VaultConfig memory config = HoneyVaultFactory.VaultConfig({
            baseAsset: address(usdc),
            name: "Balanced Diversified Vault",
            symbol: "BAL-VAULT",
            strategy: "balanced-diversified",
            riskTier: 3,
            targetDuration: 1095 days, // 3 years
            assets: assets,
            weights: weights
        });

        address vault = factory.createVault(config);
        console.log("Demo vault deployed at:", address(vault));

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("Factory:", address(factory));
        console.log("Base Asset:", address(usdc));
        console.log("Bond RWA:", address(bond));
        console.log("Real Estate RWA:", address(realEstate));
        console.log("Startup Fund RWA:", address(startup));
        console.log("Demo Vault:", address(vault));
    }
}


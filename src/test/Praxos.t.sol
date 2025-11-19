// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {PraxosVault} from "../PraxosVault.sol";
import {PraxosFactory} from "../PraxosFactory.sol";
import {MockERC3643} from "../mocks/MockERC3643.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract PraxosTest is Test {
    PraxosFactory factory;
    MockERC20 baseAsset;
    MockERC3643 bond1;
    MockERC3643 realEstate;
    MockERC3643 startupFund;

    address user = address(0x1);
    address deployer = address(this);

    function setUp() public {
        // Deploy factory
        factory = new PraxosFactory();

        // Deploy base asset (stablecoin)
        baseAsset = new MockERC20("USD Stablecoin", "USDS");

        // Deploy mock RWA tokens
        bond1 = new MockERC3643(
            "Corporate Bond A",
            "BOND-A",
            "corporate-bond",
            block.timestamp + 365 days,
            500, // 5% yield
            2, // Risk tier 2
            1000000 * 10**18
        );

        realEstate = new MockERC3643(
            "Real Estate Fund B",
            "RE-B",
            "real-estate",
            block.timestamp + 1825 days, // 5 years
            700, // 7% yield
            3, // Risk tier 3
            1000000 * 10**18
        );

        startupFund = new MockERC3643(
            "Startup Fund C",
            "STARTUP-C",
            "startup-fund",
            0, // No maturity
            1500, // 15% yield
            5, // Risk tier 5 (highest)
            1000000 * 10**18
        );
    }

    function testCreateVault() public {
        address[] memory assets = new address[](2);
        assets[0] = address(bond1);
        assets[1] = address(realEstate);

        uint256[] memory weights = new uint256[](2);
        weights[0] = 6000; // 60%
        weights[1] = 4000; // 40%

        PraxosFactory.VaultConfig memory config = PraxosFactory.VaultConfig({
            baseAsset: address(baseAsset),
            name: "Conservative Vault",
            symbol: "CONS-VAULT",
            strategy: "conservative-short-term",
            riskTier: 2,
            targetDuration: 365 days,
            assets: assets,
            weights: weights
        });

        address vault = factory.createVault(config);
        assertTrue(factory.isVault(vault));
        assertEq(factory.getVaultCount(), 1);
    }

    function testDepositAndAllocate() public {
        // Create vault
        address[] memory assets = new address[](1);
        assets[0] = address(bond1);
        uint256[] memory weights = new uint256[](1);
        weights[0] = 10000;

        PraxosFactory.VaultConfig memory config = PraxosFactory.VaultConfig({
            baseAsset: address(baseAsset),
            name: "Test Vault",
            symbol: "TEST",
            strategy: "test",
            riskTier: 1,
            targetDuration: 365 days,
            assets: assets,
            weights: weights
        });

        address vaultAddr = factory.createVault(config);
        PraxosVault vault = PraxosVault(vaultAddr);
        
        // The vault is owned by the factory, which is owned by this test contract
        // So we can use the factory to transfer ownership, or just use the factory as owner
        // For simplicity, we'll transfer ownership from factory to this contract
        vm.prank(address(factory));
        vault.transferOwnership(address(this));

        // Deposit assets
        baseAsset.approve(vaultAddr, 1000 * 10**18);
        vault.deposit(1000 * 10**18, user);

        assertGt(vault.balanceOf(user), 0);
        assertEq(vault.totalAssets(), 1000 * 10**18);
    }

    function testMultipleVaults() public {
        // Create first vault
        address[] memory assets1 = new address[](1);
        assets1[0] = address(bond1);
        uint256[] memory weights1 = new uint256[](1);
        weights1[0] = 10000;

        PraxosFactory.VaultConfig memory config1 = PraxosFactory.VaultConfig({
            baseAsset: address(baseAsset),
            name: "Vault 1",
            symbol: "V1",
            strategy: "conservative",
            riskTier: 1,
            targetDuration: 365 days,
            assets: assets1,
            weights: weights1
        });

        factory.createVault(config1);

        // Create second vault
        address[] memory assets2 = new address[](1);
        assets2[0] = address(startupFund);
        uint256[] memory weights2 = new uint256[](1);
        weights2[0] = 10000;

        PraxosFactory.VaultConfig memory config2 = PraxosFactory.VaultConfig({
            baseAsset: address(baseAsset),
            name: "Vault 2",
            symbol: "V2",
            strategy: "high-yield",
            riskTier: 5,
            targetDuration: 0,
            assets: assets2,
            weights: weights2
        });

        factory.createVault(config2);

        assertEq(factory.getVaultCount(), 2);
    }
}


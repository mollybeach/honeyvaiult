const {
    expect
} = require("chai");
const {
    ethers
} = require("hardhat");

describe("Praxos", function() {
    let factory;
    let baseAsset;
    let bond1;
    let realEstate;
    let startupFund;
    let owner;
    let user;
    let anotherUser;

    beforeEach(async function() {
        [owner, user, anotherUser] = await ethers.getSigners();

        // Deploy factory
        const PraxosFactory = await ethers.getContractFactory("PraxosFactory");
        factory = await PraxosFactory.deploy();
        await factory.waitForDeployment();

        // Deploy base asset (stablecoin)
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        baseAsset = await MockERC20.deploy("USD Stablecoin", "USDS");
        await baseAsset.waitForDeployment();

        // Deploy mock RWA tokens
        const MockERC3643 = await ethers.getContractFactory("MockERC3643");

        const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
        bond1 = await MockERC3643.deploy(
            "Corporate Bond A",
            "BOND-A",
            "corporate-bond",
            oneYearFromNow,
            500, // 5% yield
            2, // Risk tier 2
            ethers.parseEther("1000000")
        );
        await bond1.waitForDeployment();

        const fiveYearsFromNow = Math.floor(Date.now() / 1000) + 1825 * 24 * 60 * 60;
        realEstate = await MockERC3643.deploy(
            "Real Estate Fund B",
            "RE-B",
            "real-estate",
            fiveYearsFromNow,
            700, // 7% yield
            3, // Risk tier 3
            ethers.parseEther("1000000")
        );
        await realEstate.waitForDeployment();

        startupFund = await MockERC3643.deploy(
            "Startup Fund C",
            "STARTUP-C",
            "startup-fund",
            0, // No maturity
            1500, // 15% yield
            5, // Risk tier 5 (highest)
            ethers.parseEther("1000000")
        );
        await startupFund.waitForDeployment();
    });

    describe("PraxosFactory", function() {
        describe("Deployment", function() {
            it("Should deploy factory successfully", async function() {
                expect(await factory.getAddress()).to.be.properAddress;
                expect(await factory.getVaultCount()).to.equal(0);
            });

            it("Should set deployer as owner", async function() {
                expect(await factory.owner()).to.equal(owner.address);
            });
        });

        describe("Vault Creation", function() {
            it("Should create a vault successfully", async function() {
                const assets = [await bond1.getAddress(), await realEstate.getAddress()];
                const weights = [6000, 4000]; // 60%, 40%

                const config = {
                    baseAsset: await baseAsset.getAddress(),
                    name: "Conservative Vault",
                    symbol: "CONS-VAULT",
                    strategy: "conservative-short-term",
                    riskTier: 2,
                    targetDuration: 365 * 24 * 60 * 60, // 365 days in seconds
                    assets: assets,
                    weights: weights,
                };

                const tx = await factory.createVault(config);
                const receipt = await tx.wait();

                // Get vault address from event
                const event = receipt.logs.find(
                    (log) => log.topics[0] === ethers.id("VaultCreated(address,address,string,uint8)")
                );
                expect(event).to.not.be.undefined;

                const vaultAddress = ethers.getAddress("0x" + event.topics[1].slice(-40));
                expect(await factory.isVault(vaultAddress)).to.be.true;
                expect(await factory.getVaultCount()).to.equal(1);
            });

            it("Should emit VaultCreated event", async function() {
                const assets = [await bond1.getAddress()];
                const weights = [10000];

                const config = {
                    baseAsset: await baseAsset.getAddress(),
                    name: "Test Vault",
                    symbol: "TEST",
                    strategy: "test",
                    riskTier: 1,
                    targetDuration: 365 * 24 * 60 * 60,
                    assets: assets,
                    weights: weights,
                };

                await expect(factory.createVault(config))
                    .to.emit(factory, "VaultCreated")
                    .withArgs(
                        (vaultAddress) => {
                            expect(vaultAddress).to.be.properAddress;
                            return true;
                        },
                        owner.address,
                        "test",
                        1
                    );
            });

            it("Should reject vault creation with invalid base asset", async function() {
                const assets = [await bond1.getAddress()];
                const weights = [10000];

                const config = {
                    baseAsset: ethers.ZeroAddress,
                    name: "Test Vault",
                    symbol: "TEST",
                    strategy: "test",
                    riskTier: 1,
                    targetDuration: 365 * 24 * 60 * 60,
                    assets: assets,
                    weights: weights,
                };

                await expect(factory.createVault(config))
                    .to.be.revertedWith("Invalid base asset");
            });

            it("Should reject vault creation with mismatched arrays", async function() {
                const assets = [await bond1.getAddress(), await realEstate.getAddress()];
                const weights = [10000]; // Only one weight for two assets

                const config = {
                    baseAsset: await baseAsset.getAddress(),
                    name: "Test Vault",
                    symbol: "TEST",
                    strategy: "test",
                    riskTier: 1,
                    targetDuration: 365 * 24 * 60 * 60,
                    assets: assets,
                    weights: weights,
                };

                await expect(factory.createVault(config))
                    .to.be.revertedWith("Mismatched arrays");
            });

            it("Should reject vault creation with no assets", async function() {
                const config = {
                    baseAsset: await baseAsset.getAddress(),
                    name: "Test Vault",
                    symbol: "TEST",
                    strategy: "test",
                    riskTier: 1,
                    targetDuration: 365 * 24 * 60 * 60,
                    assets: [],
                    weights: [],
                };

                await expect(factory.createVault(config))
                    .to.be.revertedWith("No assets provided");
            });

            it("Should reject vault creation with weights not summing to 10000", async function() {
                const assets = [await bond1.getAddress()];
                const weights = [5000]; // 50% instead of 100%

                const config = {
                    baseAsset: await baseAsset.getAddress(),
                    name: "Test Vault",
                    symbol: "TEST",
                    strategy: "test",
                    riskTier: 1,
                    targetDuration: 365 * 24 * 60 * 60,
                    assets: assets,
                    weights: weights,
                };

                await expect(factory.createVault(config))
                    .to.be.revertedWith("Weights must sum to 10000");
            });

            it("Should create multiple vaults", async function() {
                // Create first vault
                const assets1 = [await bond1.getAddress()];
                const weights1 = [10000];

                const config1 = {
                    baseAsset: await baseAsset.getAddress(),
                    name: "Vault 1",
                    symbol: "V1",
                    strategy: "conservative",
                    riskTier: 1,
                    targetDuration: 365 * 24 * 60 * 60,
                    assets: assets1,
                    weights: weights1,
                };

                await factory.createVault(config1);

                // Create second vault
                const assets2 = [await startupFund.getAddress()];
                const weights2 = [10000];

                const config2 = {
                    baseAsset: await baseAsset.getAddress(),
                    name: "Vault 2",
                    symbol: "V2",
                    strategy: "high-yield",
                    riskTier: 5,
                    targetDuration: 0,
                    assets: assets2,
                    weights: weights2,
                };

                await factory.createVault(config2);

                expect(await factory.getVaultCount()).to.equal(2);
                const allVaults = await factory.getAllVaults();
                expect(allVaults.length).to.equal(2);
            });

            it("Should transfer vault ownership to creator when different from factory owner", async function() {
                const assets = [await bond1.getAddress()];
                const weights = [10000];

                const config = {
                    baseAsset: await baseAsset.getAddress(),
                    name: "User Vault",
                    symbol: "USER",
                    strategy: "user-strategy",
                    riskTier: 2,
                    targetDuration: 365 * 24 * 60 * 60,
                    assets: assets,
                    weights: weights,
                };

                const tx = await factory.connect(user).createVault(config);
                const receipt = await tx.wait();

                const event = receipt.logs.find(
                    (log) => log.topics[0] === ethers.id("VaultCreated(address,address,string,uint8)")
                );
                const vaultAddress = ethers.getAddress("0x" + event.topics[1].slice(-40));

                const PraxosVault = await ethers.getContractFactory("PraxosVault");
                const vault = PraxosVault.attach(vaultAddress);

                // Since user is now factory owner (after transfer), ownership should stay with factory
                // But if we create with another user, it should transfer
                const config2 = {
                    baseAsset: await baseAsset.getAddress(),
                    name: "Another User Vault",
                    symbol: "AUSER",
                    strategy: "another-strategy",
                    riskTier: 2,
                    targetDuration: 365 * 24 * 60 * 60,
                    assets: assets,
                    weights: weights,
                };

                const tx2 = await factory.connect(anotherUser).createVault(config2);
                const receipt2 = await tx2.wait();
                const event2 = receipt2.logs.find(
                    (log) => log.topics[0] === ethers.id("VaultCreated(address,address,string,uint8)")
                );
                const vaultAddress2 = ethers.getAddress("0x" + event2.topics[1].slice(-40));
                const PraxosVault2 = await ethers.getContractFactory("PraxosVault");
                const vault2 = PraxosVault2.attach(vaultAddress2);

                expect(await vault2.owner()).to.equal(anotherUser.address);
            });
        });
    });

    describe("PraxosVault", function() {
        let vault;
        let vaultAddress;

        beforeEach(async function() {
            // Create a vault for testing with owner (factory owner) so ownership stays with factory
            // Then we'll transfer to owner for consistent testing
            const assets = [await bond1.getAddress()];
            const weights = [10000];

            const config = {
                baseAsset: await baseAsset.getAddress(),
                name: "Test Vault",
                symbol: "TEST",
                strategy: "test",
                riskTier: 1,
                targetDuration: 365 * 24 * 60 * 60,
                assets: assets,
                weights: weights,
            };

            // Create with user so ownership transfers to user, then transfer to owner for testing
            const tx = await factory.connect(user).createVault(config);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                (log) => log.topics[0] === ethers.id("VaultCreated(address,address,string,uint8)")
            );
            vaultAddress = ethers.getAddress("0x" + event.topics[1].slice(-40));

            const PraxosVault = await ethers.getContractFactory("PraxosVault");
            vault = PraxosVault.attach(vaultAddress);

            // Transfer ownership to owner for consistent testing
            await vault.connect(user).transferOwnership(owner.address);
        });

        describe("Initialization", function() {
            it("Should initialize vault with correct parameters", async function() {
                expect(await vault.name()).to.equal("Test Vault");
                expect(await vault.symbol()).to.equal("TEST");
                expect(await vault.vaultStrategy()).to.equal("test");
                expect(await vault.riskTier()).to.equal(1);
                expect(await vault.targetDuration()).to.equal(365 * 24 * 60 * 60);
            });

            it("Should have assets added during creation", async function() {
                expect(await vault.getAssetCount()).to.equal(1);
                const [assets, weights] = await vault.getAllocations();
                expect(assets[0]).to.equal(await bond1.getAddress());
                expect(weights[0]).to.equal(10000);
            });
        });

        describe("Asset Management", function() {
            it("Should add new asset", async function() {
                await vault.connect(owner).addAsset(await realEstate.getAddress(), 5000);
                expect(await vault.getAssetCount()).to.equal(2);
                expect(await vault.isSupportedAsset(await realEstate.getAddress())).to.be.true;
            });

            it("Should reject adding duplicate asset", async function() {
                await expect(
                    vault.connect(owner).addAsset(await bond1.getAddress(), 5000)
                ).to.be.revertedWith("Asset already added");
            });

            it("Should reject adding asset by non-owner", async function() {
                await expect(
                    vault.connect(user).addAsset(await realEstate.getAddress(), 5000)
                ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
            });

            it("Should reject adding zero address asset", async function() {
                await expect(
                    vault.connect(owner).addAsset(ethers.ZeroAddress, 5000)
                ).to.be.revertedWith("Invalid asset");
            });

            it("Should reject adding asset with zero weight", async function() {
                await expect(
                    vault.connect(owner).addAsset(await realEstate.getAddress(), 0)
                ).to.be.revertedWith("Weight must be > 0");
            });

            it("Should update allocation weight", async function() {
                await expect(
                        vault.connect(owner).updateAllocation(await bond1.getAddress(), 8000)
                    ).to.emit(vault, "AllocationUpdated")
                    .withArgs(await bond1.getAddress(), 10000, 8000);

                const [assets, weights] = await vault.getAllocations();
                expect(weights[0]).to.equal(8000);
            });

            it("Should reject updating non-existent asset", async function() {
                await expect(
                    vault.connect(owner).updateAllocation(await realEstate.getAddress(), 5000)
                ).to.be.revertedWith("Asset not found");
            });

            it("Should remove asset", async function() {
                await expect(
                        vault.connect(owner).removeAsset(await bond1.getAddress())
                    ).to.emit(vault, "AssetRemoved")
                    .withArgs(await bond1.getAddress());

                expect(await vault.getAssetCount()).to.equal(0);
                expect(await vault.isSupportedAsset(await bond1.getAddress())).to.be.false;
            });

            it("Should reject removing non-existent asset", async function() {
                await expect(
                    vault.connect(owner).removeAsset(await realEstate.getAddress())
                ).to.be.revertedWith("Asset not found");
            });
        });

        describe("Deposits", function() {
            beforeEach(async function() {
                // Mint base asset to users
                await baseAsset.mint(user.address, ethers.parseEther("10000"));
                await baseAsset.mint(anotherUser.address, ethers.parseEther("5000"));
            });

            it("Should allow deposits and allocate assets", async function() {
                // Approve and deposit
                await baseAsset.connect(user).approve(vaultAddress, ethers.parseEther("1000"));
                const tx = await vault.connect(user).deposit(ethers.parseEther("1000"), user.address);

                await expect(tx).to.emit(vault, "Deposit")
                    .withArgs(user.address, user.address, ethers.parseEther("1000"), anyValue);

                expect(await vault.balanceOf(user.address)).to.be.gt(0);
                expect(await vault.totalAssets()).to.equal(ethers.parseEther("1000"));
            });

            it("Should mint shares on deposit", async function() {
                await baseAsset.connect(user).approve(vaultAddress, ethers.parseEther("1000"));
                await vault.connect(user).deposit(ethers.parseEther("1000"), user.address);

                const shares = await vault.balanceOf(user.address);
                expect(shares).to.be.gt(0);
                expect(shares).to.be.lte(ethers.parseEther("1000")); // Shares should be <= assets initially
            });

            it("Should allow multiple users to deposit", async function() {
                // User 1 deposit
                await baseAsset.connect(user).approve(vaultAddress, ethers.parseEther("1000"));
                await vault.connect(user).deposit(ethers.parseEther("1000"), user.address);

                // User 2 deposit
                await baseAsset.connect(anotherUser).approve(vaultAddress, ethers.parseEther("500"));
                await vault.connect(anotherUser).deposit(ethers.parseEther("500"), anotherUser.address);

                expect(await vault.balanceOf(user.address)).to.be.gt(0);
                expect(await vault.balanceOf(anotherUser.address)).to.be.gt(0);
                expect(await vault.totalAssets()).to.equal(ethers.parseEther("1500"));
            });

            it("Should reject deposit without approval", async function() {
                await expect(
                    vault.connect(user).deposit(ethers.parseEther("1000"), user.address)
                ).to.be.revertedWithCustomError(baseAsset, "ERC20InsufficientAllowance");
            });

            it("Should reject deposit with insufficient balance", async function() {
                await baseAsset.connect(user).approve(vaultAddress, ethers.parseEther("20000"));
                await expect(
                    vault.connect(user).deposit(ethers.parseEther("20000"), user.address)
                ).to.be.revertedWithCustomError(baseAsset, "ERC20InsufficientBalance");
            });
        });

        describe("Vault Info", function() {
            it("Should return correct vault info", async function() {
                const [strategy, risk, duration, assetCount] = await vault.getVaultInfo();
                expect(strategy).to.equal("test");
                expect(risk).to.equal(1);
                expect(duration).to.equal(365 * 24 * 60 * 60);
                expect(assetCount).to.equal(1);
            });

            it("Should return all allocations", async function() {
                const [assets, weights] = await vault.getAllocations();
                expect(assets.length).to.equal(1);
                expect(weights.length).to.equal(1);
                expect(assets[0]).to.equal(await bond1.getAddress());
                expect(weights[0]).to.equal(10000);
            });
        });

        describe("Total Assets", function() {
            it("Should return base asset balance initially", async function() {
                expect(await vault.totalAssets()).to.equal(0);
            });

            it("Should include base asset in total assets after deposit", async function() {
                await baseAsset.mint(user.address, ethers.parseEther("1000"));
                await baseAsset.connect(user).approve(vaultAddress, ethers.parseEther("1000"));
                await vault.connect(user).deposit(ethers.parseEther("1000"), user.address);

                expect(await vault.totalAssets()).to.equal(ethers.parseEther("1000"));
            });
        });
    });

    describe("Integration Tests", function() {
        it("Should create vault and allow multiple deposits", async function() {
            // Create vault with multiple assets
            const assets = [await bond1.getAddress(), await realEstate.getAddress()];
            const weights = [6000, 4000];

            const config = {
                baseAsset: await baseAsset.getAddress(),
                name: "Integration Vault",
                symbol: "INT",
                strategy: "integration-test",
                riskTier: 3,
                targetDuration: 1095 * 24 * 60 * 60,
                assets: assets,
                weights: weights,
            };

            const tx = await factory.createVault(config);
            const receipt = await tx.wait();

            const event = receipt.logs.find(
                (log) => log.topics[0] === ethers.id("VaultCreated(address,address,string,uint8)")
            );
            const vaultAddress = ethers.getAddress("0x" + event.topics[1].slice(-40));

            const PraxosVault = await ethers.getContractFactory("PraxosVault");
            const vault = PraxosVault.attach(vaultAddress);

            // Verify vault has both assets
            expect(await vault.getAssetCount()).to.equal(2);

            // Multiple users deposit
            await baseAsset.mint(user.address, ethers.parseEther("5000"));
            await baseAsset.mint(anotherUser.address, ethers.parseEther("3000"));

            await baseAsset.connect(user).approve(vaultAddress, ethers.parseEther("2000"));
            await vault.connect(user).deposit(ethers.parseEther("2000"), user.address);

            await baseAsset.connect(anotherUser).approve(vaultAddress, ethers.parseEther("1500"));
            await vault.connect(anotherUser).deposit(ethers.parseEther("1500"), anotherUser.address);

            expect(await vault.totalAssets()).to.equal(ethers.parseEther("3500"));
            expect(await vault.balanceOf(user.address)).to.be.gt(0);
            expect(await vault.balanceOf(anotherUser.address)).to.be.gt(0);
        });
    });
});

// Helper for anyValue matcher
const anyValue = () => true;
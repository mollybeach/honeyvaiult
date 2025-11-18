.PHONY: install build test deploy clean

install:
	forge install OpenZeppelin/openzeppelin-contracts
	forge install transmissions11/solmate

build:
	forge build

test:
	forge test -vvv

deploy:
	forge script script/Deploy.s.sol:DeployScript --rpc-url rayls_devnet --broadcast --verify

clean:
	forge clean


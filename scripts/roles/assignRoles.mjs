//path: scripts/roles/assignRoles.mjs
import {
    ethers
} from 'ethers';
import {
    cleanAbis
} from '../abi/cleanAbi.mjs';
import {
    saveAbi
} from '../abi/saveAbi.mjs';
import {
    printExplorerContractLink
} from '../logs/console_logger.mjs';

export function assignRoles(factoryAddress, baseAssetAddress, rwaTokenAddresses, vaultAddress) {
    const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);
    const baseAsset = new ethers.Contract(baseAssetAddress, baseAssetAbi, provider);
    const rwaToken = new ethers.Contract(rwaTokenAddresses[0], rwaTokenAbi, provider);
    const vault = new ethers.Contract(vaultAddress, vaultAbi, provider);
}
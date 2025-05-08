// Script to deploy the region verifier contract to Starknet using Bravo wallet
// Usage: ts-node deployRegionVerifier.ts
// Requires: npm install @argent/get-starknet starknet

import { connect } from '@argent/get-starknet';
import { RpcProvider } from 'starknet';
import * as fs from 'fs';
import path from 'path';

// Path to the contract class artifact (Sierra)
const CONTRACT_CLASS_PATH = path.join(__dirname, '../contracts/target/dev/region_verifier_UltraKeccakZKHonkVerifier.contract_class.json');

async function main() {
  try {
    // 1. Load contract class artifact
    const contractClass = JSON.parse(fs.readFileSync(CONTRACT_CLASS_PATH, 'utf-8'));

    // 2. Connect to Bravo wallet (user interaction required)
    const starknet = await connect({ modalMode: 'alwaysAsk' });
    if (!starknet) throw new Error('Bravo wallet not found or connection rejected.');
    await starknet.enable();
    const account = starknet.account;
    const address = starknet.selectedAddress;
    console.log('Connected to Bravo wallet:', address);

    // 3. Prepare provider (adjust nodeUrl as needed)
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.public.blastapi.io/rpc/v0_6' });

    // 4. Declare the contract (if not already declared)
    const declareTx = await account.declare({ contract: contractClass });
    await provider.waitForTransaction(declareTx.transaction_hash);
    const classHash = declareTx.class_hash;
    console.log('Contract declared. Class hash:', classHash);

    // 5. Deploy the contract
    const deployTx = await account.deploy({ classHash, constructorCalldata: [] });
    await provider.waitForTransaction(deployTx.transaction_hash);
    console.log('Contract deployed at address:', deployTx.contract_address);
  } catch (err) {
    console.error('Deployment failed:', err);
  }
}

main(); 
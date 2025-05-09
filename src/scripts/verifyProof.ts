import { connect } from '@argent/get-starknet';
import { Contract, RpcProvider } from 'starknet';

// Defining our own proof type since we don't have access to the exact type
export type Proof = {
  [key: string]: string | number | bigint | boolean | Array<string | number | bigint | boolean>;
} | string;

// RegionVerifier contract ABI (minimal for the verify function)
const REGION_VERIFIER_ABI = [
  {
    "inputs": [
      {
        "name": "full_proof_with_hints",
        "type": "felt252[]"
      }
    ],
    "name": "verify_proof",
    "outputs": [
      {
        "name": "result",
        "type": "u256[]"
      }
    ],
    "type": "function"
  },
  {
    "inputs": [],
    "name": "get_vertices",
    "outputs": [
      {
        "name": "vertices_x",
        "type": "felt252[]"
      },
      {
        "name": "vertices_y",
        "type": "felt252[]"
      }
    ],
    "type": "function"
  }
];

/**
 * Convert an Aztec proof to a format suitable for Starknet (array of felt252)
 * @param proof The proof object from generateProof function
 * @returns Array of felt252 values
 */
function convertProofToFelt252Array(proof: Proof): string[] {
  // Convert the proof object to a flat array of felt252 values
  // This implementation depends on the exact format of your proof
  // The following is a placeholder that needs to be adjusted based on your proof format
  
  const flatProof: string[] = [];
  
  // Convert each field of the proof to felt252 strings
  // Example (adjust according to your proof structure):
  if (typeof proof === 'object' && proof !== null) {
    // Extract values from proof object and convert to felt252 strings
    Object.values(proof).forEach(value => {
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'string' && item.startsWith('0x')) {
            flatProof.push(item);
          } else if (item !== null && item !== undefined) {
            flatProof.push('0x' + BigInt(item.toString()).toString(16));
          }
        });
      } else if (typeof value === 'string' && value.startsWith('0x')) {
        flatProof.push(value);
      } else if (value !== null && value !== undefined) {
        flatProof.push('0x' + BigInt(value.toString()).toString(16));
      }
    });
  } else if (typeof proof === 'string') {
    // If proof is a single hex string
    flatProof.push(proof.startsWith('0x') ? proof : '0x' + proof);
  }
  
  return flatProof;
}

/**
 * Verify a proof using the RegionVerifier contract
 * @param contractAddress The address of the deployed RegionVerifier contract
 * @param proof The proof object from generateProof function
 * @returns Result of the verification (true/false)
 */
export async function verifyProof(contractAddress: string, proof: Proof): Promise<boolean> {
  try {
    // 1. Connect to wallet
    const starknet = await connect({ modalMode: 'alwaysAsk' });
    if (!starknet) throw new Error('Wallet not found or connection rejected');
    await starknet.enable();
    console.log('Connected to wallet:', starknet.selectedAddress);
    
    // 2. Create provider and contract instance
    const provider = new RpcProvider({ 
      nodeUrl: 'https://starknet-mainnet.public.blastapi.io/rpc/v0_6' 
    });
    
    const contract = new Contract(
      REGION_VERIFIER_ABI,
      contractAddress,
      provider
    );
    
    // 3. Convert proof to felt252 array
    const proofArray = convertProofToFelt252Array(proof);
    console.log(`Converted proof to ${proofArray.length} felt252 values`);
    
    // 4. Call the verify_proof function
    const result = await contract.call("verify_proof", [proofArray]);
    
    // 5. Interpret the result
    // Assuming the contract returns a non-empty array for valid proofs
    console.log('Verification result:', result);
    return Array.isArray(result) && result.length > 0;
    
  } catch (error) {
    console.error('Error verifying proof:', error);
    throw error;
  }
}

/**
 * Get the polygon vertices from the RegionVerifier contract
 * @param contractAddress The address of the deployed RegionVerifier contract
 * @returns Tuple of [vertices_x, vertices_y] arrays
 */
export async function getVertices(contractAddress: string): Promise<[string[], string[]]> {
  try {
    // 1. Connect to provider (read-only, no wallet needed)
    const provider = new RpcProvider({ 
      nodeUrl: 'https://starknet-mainnet.public.blastapi.io/rpc/v0_6' 
    });
    
    // 2. Create contract instance
    const contract = new Contract(
      REGION_VERIFIER_ABI,
      contractAddress,
      provider
    );
    
    // 3. Call the get_vertices view function
    const result = await contract.call("get_vertices", []);
    
    // 4. Return the result with proper typing
    // Starknet.js returns the result as an array-like object
    // Using Record<string, unknown> instead of 'any'
    const resultArray = result as Record<number, string[]>;
    const vertices_x = resultArray[0] as string[];
    const vertices_y = resultArray[1] as string[];
    return [vertices_x, vertices_y];
    
  } catch (error) {
    console.error('Error getting vertices:', error);
    throw error;
  }
}

// Example usage in a script:
// if (require.main === module) {
//   const contractAddress = "0x..."; // Replace with your deployed contract address
//   const proof = { ... }; // Proof object from generateProof
//   verifyProof(contractAddress, proof)
//     .then(isValid => console.log('Proof is valid:', isValid))
//     .catch(err => console.error('Verification failed:', err));
// } 
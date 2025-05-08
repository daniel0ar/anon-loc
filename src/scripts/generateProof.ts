import { UltraHonkBackend } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';
import circuit from '../circuits/target/circuit.json';
import type { InputMap } from '@noir-lang/types';
import type { CompiledCircuit } from '@noir-lang/types';

// Types for the circuit variables
export interface CircuitVariables extends InputMap {
  lat_point: number;
  lng_point: number;
  hdop: number;
  polygon_vertices_x: number[];
  polygon_vertices_y: number[];
  result: boolean;
}

const noir = new Noir(circuit as CompiledCircuit);
const backend = new UltraHonkBackend((circuit as CompiledCircuit).bytecode as string);

// Generate witness from circuit variables
export async function generateWitness(variables: CircuitVariables): Promise<Uint8Array> {
  // noir.execute expects variables to match the circuit ABI
  const { witness } = await noir.execute(variables);
  return witness;
}

// Generate proof from witness
export async function generateProof(witness: Uint8Array) {
  const proof = await backend.generateProof(witness);
  return proof;
} 
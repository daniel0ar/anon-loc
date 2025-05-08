import init, { execute } from "../../noir/gpr/location_proof.js";
import acir from "../../noir/gpr/location_proof.acir";
import type { NoirRegion, NoirPoint } from "../types";

type Input = {
  region: NoirRegion;
  point: NoirPoint;
};

export async function generateProof(region: NoirRegion, point: NoirPoint) {
  // Load Noir WASM runtime
  await init();

  const input: Input = {
    region,
    point,
  };

  const proofData = await execute({
    program: {
      abi: null,
      bytecode: acir.bytecode,
    },
    input,
  });

  return {
    proof: proofData.proof,
    publicInput: proofData.publicInputs,
  };
}

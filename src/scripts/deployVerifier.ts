import { ec, Account, Provider, json, ContractFactory } from "starknet";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const privateKey = process.env.VITE_STARKNET_PRIVATE_KEY!;
const provider = new Provider({ rpc: { nodeUrl: "https://starknet-sepolia.infura.io/v3/YOUR_INFURA_KEY" } }); // or use a public RPC

const starkKeyPair = ec.starkCurve(privateKey);

// Load compiled Sierra contract JSON
const compiled = json.parse(fs.readFileSync("./compiled_contract.json", "utf-8"));

// Deploy account if you already have one (use deployer address)
const accountAddress = "0x..."; // existing account address for the private key
const account = new Account(provider, accountAddress, starkKeyPair);

// Instantiate factory
const factory = new ContractFactory({abi: compiled.abi, compiledContract: compiled, account});

// Contract constructor args
const verticesX = [1n, 10n, 10n, 1n];
const verticesY = [1n, 1n, 10n, 10n];

(async () => {
  const contract = await factory.deploy({
    vertices_x: verticesX,
    vertices_y: verticesY,
  });
  console.log("Contract deployed at:", contract.address);
})();
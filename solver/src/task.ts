import 'dotenv/config';

import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/node';


// const RPC_URL = "https://sepolia.gateway.tenderly.co";
// const RPC_URL = "https://sepolia.drpc.org";
const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const CONTRACT_ADDRESS = '0xb452Ae94A20d618Ea8c86B1580B93D96CF0d1D10';


const ABI = parseAbi([
  'function setPerson(bytes32 age, bytes32 height, bytes inputProof) external',
]);

async function main() {
  if (!PRIVATE_KEY) {
    console.error('Please set PRIVATE_KEY in .env');
    process.exit(1);
  }

  // 1. Initialize Zama SDK (Not needed in Node.js)
  console.log('Setting up FHEVM instance...');

  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  // 2. Create FHEVM Instance
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });


  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(RPC_URL),
  });

  console.log(`Using account: ${account.address}`);

  // --- 1. Call setPerson ---
  console.log('\n[1] Encrypting inputs for setPerson...');

  // Use the SDK to create encrypted inputs
  const input = instance.createEncryptedInput(CONTRACT_ADDRESS, account.address);
  input.add32(36);  // Age
  input.add32(270); // Height

  const encrypted = await input.encrypt();
  console.log({
    handles: encrypted.handles, proof: encrypted.inputProof
  })


  const ageHandle = `0x${Buffer.from(encrypted.handles[0]).toString('hex')}` as `0x${string}`;
  const heightHandle = `0x${Buffer.from(encrypted.handles[1]).toString('hex')}` as `0x${string}`;
  const inputProof = `0x${Buffer.from(encrypted.inputProof).toString('hex')}` as `0x${string}`;
  console.log({ ageHandle, heightHandle, inputProof })


  // const ageHandle = encrypted.handles[0];
  // const heightHandle = encrypted.handles[1]
  // const inputProof = encrypted.inputProof;

  console.log('Calling setPerson on-chain...');
  try {
    const setPersonHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'setPerson',
      args: [ageHandle, heightHandle, inputProof],
    });
    console.log(`SetPerson Transaction: ${setPersonHash}`);

    // Wait for receipt
    await publicClient.waitForTransactionReceipt({ hash: setPersonHash });
    console.log('SetPerson confirmed!');
  } catch (error) {
    console.error('Error in setPerson:', error);
  }
}

main().catch(console.error);

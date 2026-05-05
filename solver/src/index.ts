import 'dotenv/config';

import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/node';

const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = '0xCf8B3FEAb3d90fbA7DFfc92CDdE3984eE91A8516';

const ABI = parseAbi([
  'event DecryptionRequested(uint256 requestId, bytes32 age, bytes32 height)',
  'function fulfillDecryption(uint256 requestId, uint32 decryptedAge, uint32 decryptedHeight) external',
  'function getPerson(address user) external view returns (bytes32,bytes32,uint32,uint32)',
  'function getPersonByRequestId(uint256 _requestId) external view returns (address)'
]);

async function main() {
  console.log('--- Dutch Auction Bot ---');

  if (!PRIVATE_KEY) {
    console.error('PRIVATE_KEY not found in .env');
    process.exit(1);
  }

  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

  const instance = await createInstance({
    ...SepoliaConfig,
    network: RPC_URL,
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

  console.log(`Bot started tracking: ${CONTRACT_ADDRESS}`);
  console.log(`Using account: ${account.address}`);

  // ✅ STATE MANAGEMENT
  let lastBlock = await publicClient.getBlockNumber();
  const processedLogs = new Set<string>();
  const fulfilledRequests = new Set<bigint>();
  const inProgress = new Set<bigint>();

  setInterval(async () => {
    try {
      const currentBlock = await publicClient.getBlockNumber();

      if (currentBlock <= lastBlock) return;

      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'DecryptionRequested',
          inputs: [
            { name: 'requestId', type: 'uint256', indexed: false },
            { name: 'age', type: 'bytes32', indexed: false },
            { name: 'height', type: 'bytes32', indexed: false },
          ],
        },
        fromBlock: lastBlock + 1n, // ✅ FIX
        toBlock: currentBlock,
      });

      lastBlock = currentBlock;

      for (const log of logs) {
        const requestId = log.args.requestId as bigint;

        // ✅ unique log id
        const logId = `${log.transactionHash}-${log.logIndex}`;

        if (processedLogs.has(logId)) continue;
        processedLogs.add(logId);

        if (fulfilledRequests.has(requestId)) {
          console.log(`Skipping fulfilled request ${requestId}`);
          continue;
        }

        if (inProgress.has(requestId)) continue;
        inProgress.add(requestId);

        console.log(`\n[EVENT] Request ID: ${requestId}`);

        try {
          const ageHex = (log.args as any).age as `0x${string}`;
          const heightHex = (log.args as any).height as `0x${string}`;

          console.log('Handles:', ageHex, heightHex);

          const keypair = instance.generateKeypair();

          const handleContractPairs = [
            { handle: ageHex, contractAddress: CONTRACT_ADDRESS },
            { handle: heightHex, contractAddress: CONTRACT_ADDRESS },
          ];

          const startTimeStamp = Math.floor(Date.now() / 1000);
          const durationDays = 1;
          const contractAddresses = [CONTRACT_ADDRESS];

          const eip712 = instance.createEIP712(
            keypair.publicKey,
            contractAddresses,
            startTimeStamp,
            durationDays
          );

          const signature = await walletClient.signTypedData({
            domain: eip712.domain as any,
            types: {
              UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
            } as any,
            primaryType: 'UserDecryptRequestVerification',
            message: eip712.message as any,
          });

          const cleanSig = signature.startsWith("0x")
            ? signature.slice(2)
            : signature;

          const results = await instance.userDecrypt(
            handleContractPairs,
            keypair.privateKey,
            keypair.publicKey,
            cleanSig,
            contractAddresses,
            account.address,
            Number(startTimeStamp),
            Number(durationDays),
          );

          console.log('Raw decrypt results:', results);

          if (!results[ageHex] || !results[heightHex]) {
            console.error('Decryption failed');
            continue;
          }

          const decryptedAge = Number(results[ageHex]);
          const decryptedHeight = Number(results[heightHex]);

          console.log(`[DATA] Decrypted: Age=${decryptedAge}, Height=${decryptedHeight}`);

          const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'fulfillDecryption',
            args: [requestId, decryptedAge, decryptedHeight],
          });

          console.log(`[SUCCESS] TX: ${hash}`);

          // ✅ mark fulfilled
          fulfilledRequests.add(requestId);

        } catch (error) {
          console.error(`[ERROR] Request ${requestId}:`, error);
        } finally {
          inProgress.delete(requestId);
        }
      }

    } catch (err) {
      console.error('Polling error:', err);
    }
  }, 4000);
}

// graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down bot...');
  process.exit();
});

main().catch((err) => {
  console.error('Fatal error in bot:', err);
  process.exit(1);
});
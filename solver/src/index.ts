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

const RPC_URL = "https://sepolia.infura.io/v3/f1f43d570185470aa39b07173b73d419";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = '0xb452Ae94A20d618Ea8c86B1580B93D96CF0d1D10';

const ABI = parseAbi([
  'event DecryptionRequested(uint256 indexed requestId, bytes32 indexed auctionId, address bidder)',
  'function fulfillDecryption(uint256 requestId, bool isWinning) external',
  'function decryptionRequests(uint256) external view returns (bytes32 isWinning, address bidder, bytes32 bidAmount, bytes32 auctionId)'
]);

async function main() {
  console.log('--- EmelBid Solver Bot ---');

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
            { name: 'requestId', type: 'uint256', indexed: true },
            { name: 'auctionId', type: 'bytes32', indexed: true },
            { name: 'bidder', type: 'address', indexed: false },
          ],
        },
        fromBlock: lastBlock + 1n,
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
          // Fetch the decryption request from the contract
          const [isWinningHandle] = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'decryptionRequests',
            args: [requestId],
          });

          console.log('Handle for isWinning:', isWinningHandle);

          const keypair = instance.generateKeypair();

          const handleContractPairs = [
            { handle: isWinningHandle, contractAddress: CONTRACT_ADDRESS },
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

          if (results[isWinningHandle] === undefined) {
            console.error('Decryption failed');
            continue;
          }

          const decryptedIsWinning = results[isWinningHandle] === 1n || results[isWinningHandle] === true;

          console.log(`[DATA] Decrypted: isWinning=${decryptedIsWinning}`);

          const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'fulfillDecryption',
            args: [requestId, decryptedIsWinning],
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

import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const client = createPublicClient({
  chain: sepolia,
  transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
});

async function check() {
  const hash = '0xef75aef81c3be12890d00bfea84e5827d4315bce135b04815b1d7cf372a71321';
  const receipt = await client.getTransactionReceipt({ hash });
  console.log('Status:', receipt.status);
  console.log('Number of logs:', receipt.logs.length);
  receipt.logs.forEach((log, index) => {
    console.log(`Log ${index} topics:`, log.topics);
  });
}

check();

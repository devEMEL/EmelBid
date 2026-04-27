
import { encodeEventTopics, parseAbi } from 'viem';

const abi = parseAbi([
  'event DecryptionRequested(uint256 requestId, bytes32 age, bytes32 height)'
]);

const topics = encodeEventTopics({
  abi,
  eventName: 'DecryptionRequested',
});

console.log('DecryptionRequested topic:', topics[0]);

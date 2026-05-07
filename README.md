# EmelBid: Encrypted Dutch Auction Marketplace

**EmelBid** is a decentralized, privacy-preserving marketplace for Dutch Auctions, powered by **Fully Homomorphic Encryption (FHE)** via [Zama's FHEVM](https://zama.ai/fhevm). It supports creating and participating in secure auctions across multiple asset classes without exposing bid amounts to the public until the auction is settled.

By leveraging FHE, EmelBid guarantees **zero slippage**, completely stops **front-running (MEV)**, and ensures absolute bid confidentiality. Bidders encrypt their inputs locally using the FHEVM SDK, and the contract computes the Dutch auction decay logic entirely in ciphertext.

---

## 🌟 Core Features

- **Confidential Bidding**: Bids are fully encrypted. No one (not even the RPC node, miner, or indexer) can read the true bid amount before settlement.
- **Multi-Asset Support**: Create auctions for:
  - standard **ERC20** tokens
  - Non-Fungible Tokens (**ERC721**)
  - Confidential **ERC7984** FHE tokens
- **Dutch Auction Decay in Ciphertext**: Auction prices decay automatically by a predefined encrypted rate per block. The mathematical logic determining if a bid exceeds the current price + reserve happens completely over encrypted data (`euint64`).
- **Verifiable Decryption Flow**: A trusted solver securely handles decryption requests to enforce the end of an auction. Once a winning bid is resolved, its key data (`bidAmount`, `isWinning`) is made explicitly `publiclyDecryptable` for completely transparent, trustless verification on the frontend.
- **Seamless UX**: Beautiful UI displaying encrypted token balances, FHE-enabled interactions, dynamic auction status fetching via subgraph, and encrypted wallet signature capabilities.

---

## 🏛️ System Architecture

EmelBid relies on 4 interconnected components communicating together:

1. **Smart Contracts (`/contract`)**
   - Built on Hardhat and deployed to the Sepolia testnet.
   - Powered by `fhevm/lib/TFHE.sol` for encrypted integer operations.
   - Core file: `EmelBid.sol` handling the entire marketplace engine.

2. **Frontend (`/frontend`)**
   - React + Vite + TailwindCSS application.
   - Leverages `wagmi` and `viem` for smart contract interactions.
   - Connects to FHE operations directly in the browser via `@zama-fhe/relayer-sdk/bundle`.

3. **Solver / Oracle Engine (`/solver`)**
   - A highly reliable Node.js background process/bot.
   - Tracks `DecryptionRequested` events emitting from the chain when interactions require FHE conditional revealing.
   - Triggers decentralized network decryption using Zama's FHE Relayer stack, passing the result seamlessly back to the EmelBid contract (`fulfillDecryption`).

4. **Indexer (`/indexer`)**
   - A TheGraph subgraph indexing platform events (`AuctionCreated`, `BidPlaced`).
   - Powers the marketplace explorer, user profile history, and historical auction states.

---

## 🛠️ Technology Stack

- **FHE Engine:** Zama FHEVM, `@zama-fhe/relayer-sdk`
- **Smart Contracts:** Solidity, Hardhat, Ethers, Chai (Testing)
- **Frontend Stack:** React, Vite, TypeScript, TailwindCSS, React Router, Wagmi v2
- **Backend / Solver:** Node.js, Viem, TypeScript
- **Data Indexing:** The Graph (Subgraph)
- **Network:** Ethereum Sepolia Testnet (FHEVM Coprocessor)

---

## 🔗 Deployed Contracts (Sepolia)

All functional contracts are actively deployed on the **Sepolia Testnet**.

| Contract | Address |
| --- | --- |
| **EmelBid** | `0xb452Ae94A20d618Ea8c86B1580B93D96CF0d1D10` |
| **CWETH (Confidential WETH)** | `0xe7eAF40bc2a8d8A42251ABe6BdeE34075715Ee7F` |
| **NBL (Mock ERC20)** | `0xff6acF51F397505bFc43B7E19329Fa8057B277E3` |
| **Mock ERC721 (NFTs)** | `0xE63Eb347601aBdD5bAc2476ba979baA24E3c23Fb` |
| **Mock ERC7984 (Confidential Tokens)** | `0xCcc0a189ba958B395f3676a11F2758C4EaEE2d0a` |

*Subgraph URL*: `https://api.studio.thegraph.com/query/1749160/emelbid-subgraph/version/latest`

---

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 18.x)
- npm or yarn
- MetaMask (or another Web3 provider) with Sepolia Testnet configured.

### 1. Smart Contracts
```bash
cd contract
npm install
# Compile contracts and generate typings
npx hardhat compile
# Run the test suite
npx hardhat test
```

### 2. Solver (Decryption Bot)
The solver must be running for auctions to settle properly.
```bash
cd solver
npm install
# Configure your .env file with PRIVATE_KEY and RPC endpoints
cp .env.example .env
# Run the solver script
npm run dev
```

### 3. Frontend App
Ensure the FHE configurations and ABI endpoints reflect the latest deployed contract (`CONTRACTS.EMEL_BID`).
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with EmelBid!

---

## 🔐 How the EmelBid Decryption Engine Works

1. **Placing a Bid:** A buyer locally encrypts `bidAmount` into an `euint64` FHE handle and pushes it on-chain via `placeBid`.
2. **On-chain Action:** `EmelBid.sol` links the encrypted bid to the current auction instance and fires a `DecryptionRequested` event.
3. **Bot Observation:** The `/solver` node service detects the event. It interacts with the decentralized Zama Relayer to attempt decryption.
4. **Resolution:** The solver posts the result back to `fulfillDecryption()`, finalizing whether the bid successfully crossed the decay price.
5. **Transparency Check:** Winning bids emit their `requestId` out to a global mapping. The platform exposes a `fhevm.publicDecrypt([isWinningHandle, bidAmountHandle])` process that viewers can use in the frontend to mathematically prove exactly who won and how much they paid.

---

## 📄 License
This project is open-source. Please see the associated LICENSE file for details.

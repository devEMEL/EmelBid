# EmelBid Smart Contracts 📜🔒

This directory contains the core smart contract infrastructure for **EmelBid**, a completely private, slippage-free Dutch Auction marketplace. The contract is built entirely around **Zama's Fully Homomorphic Encryption (FHEVM)** allowing the computational engine to run securely over encrypted data.

## 🏛️ The `EmelBid` Contract

At the heart of the marketplace is `EmelBid.sol`.

### Core Architecture

- **Dutch Auction Engine**: EmelBid utilizes a continuous Dutch Auction system. Prices decay by an encrypted `decayRate` linearly over block intervals until the `reservePrice` is hit or the designated auction duration completes.
  
- **Confidential Bidding**: During an active auction block, bidders encrypt their bids using the FHEVM SDK. When a user calls `placeBid()`, the user sends only a completely unrecognizable, mathematically encrypted FHE handle alongside a cryptographic zero-knowledge input proof.

- **Encrypted Comparisons (`ebool`)**: Instead of decrypting bids to compare them, EmelBid strictly uses Homomorphic operations (`FHE.gte`, `FHE.add`, `FHE.sub`) to generate an `ebool` (encrypted boolean). This variable calculates if `Bid ≥ (Decayed Price + Reserve)`.

- **Asynchronous Public Decryption Flow**:
  1. Bids emit a `DecryptionRequested(requestId, auctionId, bidder)` event upon submission.
  2. A secure, off-chain FHE relayer picks up this event and evaluates the decryption proof required for the `ebool`.
  3. The relayer callback resolves the state via `fulfillDecryption()`. If the bid crossed the decay threshold, the auction settles instantly, freezing the decay price and recording the winner.
  4. The platform makes the winning bid transparent on-chain via `FHE.makePubliclyDecryptable()`, preserving mathematically proven results with `winningRequestId`.

### Supported Asset Classes

The engine handles three major standards generically:
- **0 = Token (ERC20):** High-volume standard ERC20 collateral and bidding. 
- **1 = NFT (ERC721):** Users can securely dutch auction distinct non-fungible tokens.
- **2 = Confidential Tokens (ERC7984):** Natively built to integrate with confidential FHE token architectures.

---

## 🧪 The Test Suite

The test suite leverages `hardhat-fhevm` (the mocked dev-environment plugin provided by Zama) to accurately simulate homomorphic states and gas costs.

The tests are physically separated by the underlying Asset Type standard being auctioned off:

### 1. `EmelBid.erc20.test.ts`
Focuses entirely on ERC20 (mock NBL) functioning as the primary asset transfer.
- Validates the `decayRate` mechanics mathematically.
- Tests scenarios where users attempt to place bids below the reserve or bids that don't meet the heavily decayed price threshold.
- Ensures the "Loser" securely and flawlessly gets refunded immediately upon invalid/failed decryption outcomes.
- Checks the functionality of `winningRequestId` and verifies public decryption of winning bids using `fhevm.publicDecryptEbool` and `fhevm.publicDecryptEuint`.

### 2. `EmelBid.erc721.test.ts`
Tests integration against unique NFTs mapping to EmelBid.
- Ensures ownership transfers seamlessly inside the FHE environment when a bid crosses a `decayRate`.
- Verifies scenarios where an NFT auction is completely ignored (no bids) and forces an `expireAuction()` state, securely routing the NFT back to its rightful owner.

### 3. `EmelBid.erc7984.test.ts`
Tests extreme confidentiality routing. FHE to FHE natively.
- Evaluates scenarios where the asset itself is an encrypted token mapping (`MOCK_ERC7984`).
- Asserts that both the `CWETH` bid settlement AND the token handover maintain zero visibility to network validators/RPC nodes.

---

## ⚙️ Development Commands

To build and interact with the contract environment independently:

```bash
# Clean the contract build artifacts
npx hardhat clean

# Compile EmelBid out to ABI
npx hardhat compile

# Run the complete FHE simulation Test Suite
npx hardhat test

# Run a dedicated test script explicitly
npx hardhat test test/EmelBid.erc20.test.ts
```

## 📜 Deployment Setup
EmelBid is dynamically designed to deploy cleanly into the `fhevm` coprocessor configuration targeting the **Ethereum Sepolia** chain. See `deploy/deploy_EmelBid.ts` for deployment structures!

/**
 * @title  EmelBid — Encrypted Dutch Auction Hook
 * @notice Uniswap V4 hook that runs confidential Dutch auctions.
 *
 *  Supported asset types:
 *    • ERC-721   — single NFT, one winner takes it
 *    • ERC-20    — fungible token lot, one winner takes all
 *    • Confidential ERC-20 (ERC-7984) — encrypted token, one winner takes all
 *
 *  Payment currency: WETH (ERC-20) always.
 *
 *  How it works:
 *    1. Seller calls createAuction() — deploys a unique AuctionSlot ERC-20
 *       via CREATE2, initialises a pool (ETH / AuctionSlot) with this hook,
 *       and stores encrypted auction params in afterInitialize.
 *    2. Bidder calls PoolManager.swap() with amountSpecified = 0 and
 *       (encBid, proof) in hookData.  The hook operator-pulls WETH in
 *       beforeSwap, runs the FHE comparison, and requests gateway decryption.
 *    3. Zama gateway calls back decryptionCallback() in a separate tx —
 *       winner receives the asset, loser is refunded WETH.
 */
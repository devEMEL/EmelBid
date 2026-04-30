// ---------------------------------------------------------------------------
// EmelBid — Encrypted Dutch Auction Marketplace
//
// Design overview
// ---------------
// 1. Seller calls createAuction(), depositing the asset and supplying encrypted
//    price-curve parameters (start price, decay rate, reserve — all in cWETH
//    units with 6 decimals).
// 2. Bidders call placeBid() during the auction window, supplying an encrypted
//    cWETH bid amount. The hook pulls cWETH from the bidder, compares the bid
//    against the current encrypted price via FHE, and emits a DecryptionRequested
//    event for the off-chain decryptor bot.
// 3. The decryptor bot resolves each comparison, calls fulfillDecryption() with
//    the plaintext result. The first winning bid settles the auction:
//      - Asset is sent to the winner.
//      - Encrypted proceeds are held for the seller to claim.
//      - All subsequent losing bids are refunded.
// 4. If the auction window expires with no winner, anyone may call
//    expireAuction() to return the asset to the seller.
// ---------------------------------------------------------------------------
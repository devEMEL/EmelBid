// // SPDX-License-Identifier: UNLICENSED
// pragma solidity ^0.8.27;

// import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// import {FHE, externalEuint64, euint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
// import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";



// interface ICWETH {
//     function confidentialTransferFrom(address from, address to, euint64 amount) external returns (euint64);
//     function confidentialTransfer(address to, euint64 amount) external returns (euint64);
// }

// interface IERC7984 {
//     function confidentialTransferFrom(address from, address to, euint64 amount) external returns (euint64);
//     function confidentialTransfer(address to, euint64 amount) external returns (euint64);
// }


// contract EmelBid is
//     ReentrancyGuard,
//     ZamaEthereumConfig,
//     Ownable
// {
//     using SafeERC20 for IERC20;

//     // -----------------------------------------------------------------------
//     // Types
//     // -----------------------------------------------------------------------

//     enum AssetType { ERC20, ERC721, Confidential }

//     struct AuctionConfig {
//         address seller;

//         // Plaintext anchor exposed publicly (cWETH units, 6 decimals).
//         // Lets frontends show an approximate price without leaking the real curve.
//         uint256 publicStartPrice;

//         // Encrypted price curve — all values in cWETH token units (6 decimals).
//         euint64 encStartPrice;   // real starting price (hidden)
//         euint64 encDecayRate;    // cWETH drop per block (hidden)
//         euint64 encReserve;      // floor / reserve price (hidden)

//         uint256 startBlock;
//         uint256 duration;        // auction length in blocks

//         AssetType assetType;
//         address   asset;         // ERC20 / ERC721 / ConfidentialERC20 address
//         uint256   tokenIdOrAmount;

//         // Encrypted proceeds stored for the seller to claim post-settlement.
//         euint64 proceeds;
//         bool    proceedsClaimed;

//         bool settled;
//     }

//     /// @dev One entry per pending decryption.
//     ///      Off-chain bot reads requestId from the DecryptionRequested event,
//     ///      decrypts isWinning, then calls fulfillDecryption().
//     struct DecryptionRequest {
//         ebool   isWinning;   // encrypted comparison result
//         address bidder;
//         euint64 bidAmount;   // held until fulfillDecryption() resolves
//         bytes32 auctionId;
//     }

//     // -----------------------------------------------------------------------
//     // State
//     // -----------------------------------------------------------------------

//     /// @notice Auctions keyed by a seller-generated id (keccak256(seller, nonce)).
//     mapping(bytes32 => AuctionConfig) public auctions;

//     mapping(uint256  => DecryptionRequest) public decryptionRequests;
//     mapping(address  => uint256)           public sellerNonce;
//     mapping(bytes32  => address)           public auctionWinner;
//     mapping(bytes32  => address[])         public auctionBidders;

//     /// @notice Per-user per-auction encrypted bid (for refund bookkeeping).
//     mapping(address => mapping(bytes32 => euint64)) public userBid;

//     uint256 public requestId;
//     ICWETH  public CWETH;
//     address public decryptor;

//     // -----------------------------------------------------------------------
//     // Events
//     // -----------------------------------------------------------------------

//     event AuctionCreated(
//         bytes32 indexed auctionId,
//         address indexed seller,
//         uint256 publicStartPrice,
//         uint256 startBlock,
//         uint256 duration,
//         AssetType assetType,
//         address asset,
//         uint256 tokenIdOrAmount
//     );

//     /// @notice Emitted for every bid. Bot listens here, decrypts isWinning,
//     ///         then calls fulfillDecryption(requestId, result).
//     event DecryptionRequested(
//         uint256 indexed requestId,
//         ebool   isWinning,
//         bytes32 indexed auctionId,
//         address bidder
//     );

//     event DecryptionFulfilled(uint256 indexed requestId, bool isWinning);
//     event AuctionSettled(bytes32 indexed auctionId, address indexed winner);
//     event BidRefunded(bytes32 indexed auctionId, address indexed bidder);
//     event ProceedsClaimed(bytes32 indexed auctionId, address indexed seller);
//     event AuctionExpired(bytes32 indexed auctionId);

//     // -----------------------------------------------------------------------
//     // Errors
//     // -----------------------------------------------------------------------

//     error AuctionNotFound();
//     error AuctionNotStarted();
//     error AuctionEnded();
//     error AuctionAlreadySettled();
//     error InvalidDuration();
//     error InvalidPublicStartPrice();
//     error NotSeller();
//     error NotSettled();
//     error AlreadyClaimed();
//     error RequestNotFound();

//     // -----------------------------------------------------------------------
//     // Modifiers
//     // -----------------------------------------------------------------------

//     modifier onlyDecryptor() {
//         require(msg.sender == decryptor, "Not decryptor");
//         _;
//     }

//     // -----------------------------------------------------------------------
//     // Constructor
//     // -----------------------------------------------------------------------

//     constructor(address _cweth, address _decryptor) 
//     Ownable(msg.sender) {
//         CWETH     = ICWETH(_cweth);
//         decryptor = _decryptor;
//     }

//     // -----------------------------------------------------------------------
//     // Seller: create auction
//     // -----------------------------------------------------------------------

//     /**
//      * @notice List an asset for a confidential Dutch auction.
//      * @param publicStartPrice  Plaintext approximate start price (cWETH units).
//      *                          Purely informational — does not affect settlement.
//      * @param encStartPrice     Encrypted real start price.
//      * @param encDecayRate      Encrypted per-block price decay.
//      * @param encReserve        Encrypted reserve / floor price.
//      * @param inputProof        FHE input proof for all three encrypted values.
//      * @param duration          Auction window in blocks.
//      * @param assetType         ERC20 | ERC721 | Confidential.
//      * @param asset             Token contract address.
//      * @param tokenIdOrAmount   TokenId (ERC721) or amount (ERC20 / Confidential).
//      * @return auctionId        Unique id for this auction.
//      */
//     function createAuction(
//         uint256         publicStartPrice,
//         externalEuint64 encStartPrice,
//         externalEuint64 encDecayRate,
//         externalEuint64 encReserve,
//         bytes calldata  inputProof,
//         uint256         duration,
//         AssetType       assetType,
//         address         asset,
//         uint256         tokenIdOrAmount
//     ) external nonReentrant returns (bytes32 auctionId) {
//         if (publicStartPrice == 0) revert InvalidPublicStartPrice();
//         if (duration == 0)         revert InvalidDuration();

//         // Pull asset into contract custody (seller must approve/setOperator first).
//         _receiveAsset(assetType, asset, tokenIdOrAmount, msg.sender);

//         // Derive a unique, deterministic auction id.
//         auctionId = keccak256(abi.encodePacked(msg.sender, sellerNonce[msg.sender]++));

//         // Decrypt external encrypted inputs.
//         euint64 encStart   = FHE.fromExternal(encStartPrice,  inputProof);
//         euint64 encDecay   = FHE.fromExternal(encDecayRate,   inputProof);
//         euint64 encReserve_ = FHE.fromExternal(encReserve,    inputProof);

//         FHE.allowThis(encStart);
//         FHE.allowThis(encDecay);
//         FHE.allowThis(encReserve_);

//         euint64 zeroProceeds = FHE.asEuint64(0);
//         FHE.allowThis(zeroProceeds);

//         auctions[auctionId] = AuctionConfig({
//             seller:           msg.sender,
//             publicStartPrice: publicStartPrice,
//             encStartPrice:    encStart,
//             encDecayRate:     encDecay,
//             encReserve:       encReserve_,
//             startBlock:       block.number,
//             duration:         duration,
//             assetType:        assetType,
//             asset:            asset,
//             tokenIdOrAmount:  tokenIdOrAmount,
//             proceeds:         zeroProceeds,
//             proceedsClaimed:  false,
//             settled:          false
//         });

//         emit AuctionCreated(
//             auctionId,
//             msg.sender,
//             publicStartPrice,
//             block.number,
//             duration,
//             assetType,
//             asset,
//             tokenIdOrAmount
//         );
//     }

//     // -----------------------------------------------------------------------
//     // Bidder: place bid
//     // -----------------------------------------------------------------------

//     /**
//      * @notice Submit an encrypted bid for an active auction.
//      * @dev    Bidder must have called cWETH.setOperator(address(this), true) before bidding.
//      *         The bid amount is pulled immediately; settlement happens async via fulfillDecryption().
//      * @param auctionId   Target auction.
//      * @param encBidExt   Encrypted cWETH bid amount.
//      * @param proof       FHE input proof for encBidExt.
//      */
//     function placeBid(
//         bytes32         auctionId,
//         externalEuint64 encBidExt,
//         bytes calldata  proof
//     ) external nonReentrant {
//         AuctionConfig storage auction = auctions[auctionId];

//         if (auction.seller == address(0))                          revert AuctionNotFound();
//         if (block.number < auction.startBlock)                     revert AuctionNotStarted();
//         if (block.number > auction.startBlock + auction.duration)  revert AuctionEnded();
//         if (auction.settled)                                       revert AuctionAlreadySettled();

//         euint64 encBid = FHE.fromExternal(encBidExt, proof);

//         // Pull encrypted cWETH from bidder into this contract.
//         FHE.allowTransient(encBid, address(CWETH));
//         CWETH.confidentialTransferFrom(msg.sender, address(this), encBid);

//         // Store bid for refund bookkeeping.
//         userBid[msg.sender][auctionId] = encBid;
//         FHE.allowThis(encBid);
//         FHE.allow(encBid, msg.sender);
//         FHE.allow(encBid, address(CWETH));

//         auctionBidders[auctionId].push(msg.sender);

//         // FHE: compute current price and compare.
//         euint64 currentPrice = _currentEncPrice(auction);
//         ebool   isWinning    = FHE.ge(encBid, currentPrice);

//         FHE.allowThis(isWinning);
//         FHE.allow(isWinning, msg.sender);
//         FHE.allow(isWinning, decryptor);

//         uint256 currentRequestId = requestId++;

//         decryptionRequests[currentRequestId] = DecryptionRequest({
//             isWinning: isWinning,
//             bidder:    msg.sender,
//             bidAmount: encBid,
//             auctionId: auctionId
//         });

//         emit DecryptionRequested(currentRequestId, isWinning, auctionId, msg.sender);
//     }

//     // -----------------------------------------------------------------------
//     // Decryptor: settle bid
//     // -----------------------------------------------------------------------

//     /**
//      * @notice Called by the trusted off-chain decryptor bot with the plaintext
//      *         result of the isWinning FHE comparison.
//      * @param _requestId  Matches the DecryptionRequested event.
//      * @param _isWinning  True if the bid >= current price at bid time.
//      */
//     function fulfillDecryption(
//         uint256 _requestId,
//         bool    _isWinning
//     ) external nonReentrant onlyDecryptor {
//         DecryptionRequest storage req = decryptionRequests[_requestId];
//         if (req.bidder == address(0)) revert RequestNotFound();

//         address bidder    = req.bidder;
//         euint64 bidAmount = req.bidAmount;
//         bytes32 auctionId = req.auctionId;

//         // Delete first — guards against re-entrancy on the same requestId.
//         delete decryptionRequests[_requestId];

//         emit DecryptionFulfilled(_requestId, _isWinning);

//         AuctionConfig storage auction = auctions[auctionId];

//         if (_isWinning && !auction.settled) {
//             // ── Winner path ──────────────────────────────────────────────
//             auction.settled  = true;
//             auction.proceeds = bidAmount;
//             FHE.allowThis(auction.proceeds);
//             FHE.allow(auction.proceeds, auction.seller);

//             auctionWinner[auctionId] = bidder;

//             _sendAssetToWinner(auction, bidder);

//             emit AuctionSettled(auctionId, bidder);

//         } else {
//             // ── Loser / already-settled path — refund ────────────────────
//             FHE.allow(bidAmount, bidder);
//             CWETH.confidentialTransfer(bidder, bidAmount);

//             emit BidRefunded(auctionId, bidder);
//         }
//     }

//     // -----------------------------------------------------------------------
//     // Seller: claim proceeds
//     // -----------------------------------------------------------------------

//     /**
//      * @notice Seller withdraws encrypted cWETH proceeds after settlement.
//      */
//     function withdrawProceeds(bytes32 auctionId) external nonReentrant {
//         AuctionConfig storage auction = auctions[auctionId];

//         if (auction.seller != msg.sender) revert NotSeller();
//         if (!auction.settled)             revert NotSettled();
//         if (auction.proceedsClaimed)      revert AlreadyClaimed();

//         auction.proceedsClaimed = true;

//         FHE.allow(auction.proceeds, msg.sender);
//         CWETH.confidentialTransfer(msg.sender, auction.proceeds);

//         emit ProceedsClaimed(auctionId, msg.sender);
//     }

//     // -----------------------------------------------------------------------
//     // Anyone: expire unsettled auction
//     // -----------------------------------------------------------------------

//     /**
//      * @notice Callable by anyone once the auction window passes with no winner.
//      *         Returns the listed asset to the seller.
//      */
//     function expireAuction(bytes32 auctionId) external nonReentrant {
//         AuctionConfig storage auction = auctions[auctionId];

//         if (auction.seller == address(0)) revert AuctionNotFound();
//         if (auction.settled)              revert AuctionAlreadySettled();
//         require(
//             block.number > auction.startBlock + auction.duration,
//             "Auction still active"
//         );

//         auction.settled = true;
//         _sendAssetToWinner(auction, auction.seller);

//         emit AuctionExpired(auctionId);
//     }

//     // -----------------------------------------------------------------------
//     // Internal helpers
//     // -----------------------------------------------------------------------

//     /**
//      * @notice Compute the current encrypted price.
//      *
//      *   currentPrice = max(encStartPrice − encDecayRate × blocksElapsed, encReserve)
//      *
//      * All arithmetic is performed inside FHE encrypted space.
//      */
//     function _currentEncPrice(
//         AuctionConfig storage auction
//     ) internal returns (euint64) {
//         uint64  blocksElapsed = uint64(block.number - auction.startBlock);
//         euint64 decayed       = FHE.mul(auction.encDecayRate, FHE.asEuint64(blocksElapsed));
//         euint64 price         = FHE.sub(auction.encStartPrice, decayed);
//         return FHE.max(price, auction.encReserve);
//     }

//     /**
//      * @notice Transfer the auctioned asset to `recipient`.
//      *         Used for both settlement (winner) and expiry (seller).
//      */
//     function _sendAssetToWinner(
//         AuctionConfig storage auction,
//         address               recipient
//     ) internal {
//         if (auction.assetType == AssetType.ERC721) {
//             IERC721(auction.asset).transferFrom(
//                 address(this), recipient, auction.tokenIdOrAmount
//             );
//         } else if (auction.assetType == AssetType.ERC20) {
//             IERC20(auction.asset).safeTransfer(recipient, auction.tokenIdOrAmount);
//         } else {
//             // Confidential ERC-20 (ERC-7984 / euint64)
//             IERC7984(auction.asset).confidentialTransfer(
//                 recipient,
//                 FHE.asEuint64(uint64(auction.tokenIdOrAmount))
//             );
//         }
//     }

//     /**
//      * @notice Pull the auctioned asset from the seller into contract custody.
//      *         Seller must approve (ERC20/ERC721) or setOperator (ConfidentialERC20) first.
//      */
//     function _receiveAsset(
//         AssetType assetType,
//         address   asset,
//         uint256   tokenIdOrAmount,
//         address   seller
//     ) internal {
//         if (assetType == AssetType.ERC721) {
//             IERC721(asset).transferFrom(seller, address(this), tokenIdOrAmount);
//         } else if (assetType == AssetType.ERC20) {
//             IERC20(asset).safeTransferFrom(seller, address(this), tokenIdOrAmount);
//         } else {
//             IERC7984(asset).confidentialTransferFrom(
//                 seller,
//                 address(this),
//                 FHE.asEuint64(uint64(tokenIdOrAmount))
//             );
//         }
//     }

//     // -----------------------------------------------------------------------
//     // View helpers
//     // -----------------------------------------------------------------------

//     function getAuction(bytes32 auctionId)
//         external view
//         returns (AuctionConfig memory)
//     {
//         return auctions[auctionId];
//     }

//     function getAuctionBidders(bytes32 auctionId)
//         external view
//         returns (address[] memory)
//     {
//         return auctionBidders[auctionId];
//     }

//     function getBidCount(bytes32 auctionId)
//         external view
//         returns (uint256)
//     {
//         return auctionBidders[auctionId].length;
//     }

//     function getWinner(bytes32 auctionId)
//         external view
//         returns (address)
//     {
//         return auctionWinner[auctionId];
//     }

//     function getUserBid(address user, bytes32 auctionId)
//         external view
//         returns (euint64)
//     {
//         return userBid[user][auctionId];
//     }

//     function getDecryptionRequest(uint256 _requestId)
//         external view
//         returns (address bidder, bytes32 auctionId)
//     {
//         DecryptionRequest storage req = decryptionRequests[_requestId];
//         return (req.bidder, req.auctionId);
//     }

//     function isAuctionActive(bytes32 auctionId)
//         external view
//         returns (bool)
//     {
//         AuctionConfig storage a = auctions[auctionId];
//         return (
//             !a.settled &&
//             block.number >= a.startBlock &&
//             block.number <= a.startBlock + a.duration
//         );
//     }

//     function blocksRemaining(bytes32 auctionId)
//         external view
//         returns (uint256)
//     {
//         AuctionConfig storage a = auctions[auctionId];
//         uint256 endBlock = a.startBlock + a.duration;
//         if (block.number >= endBlock) return 0;
//         return endBlock - block.number;
//     }

//     // -----------------------------------------------------------------------
//     // Owner admin
//     // -----------------------------------------------------------------------

//     function setCWETH(address _cweth) external onlyOwner {
//         CWETH = ICWETH(_cweth);
//     }

//     function setDecryptor(address _decryptor) external onlyOwner {
//         decryptor = _decryptor;
//     }

//     receive() external payable {}
// }

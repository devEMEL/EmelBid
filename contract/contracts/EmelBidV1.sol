// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {FHE, externalEuint256, euint256, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface IConfidentialERC20 {
    function ConfidentialTransferFrom(address from, address to, euint64 amount) external returns (euint64);
    function ConfidentialTransfer(address to, euint64 amount) external returns (euint64);
}


contract EmelBid is
    BaseHook,
    ReentrancyGuard,
    ZamaEthereumConfig
{
    using SafeERC20 for IERC20;
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;



    enum AssetType { ERC20, ERC721, CONFIDENTIAL }

    struct AuctionConfig {
        address seller;
        uint256 publicStartPrice; // in wei
        euint256 encStartPrice; // real starting price (hidden), in wei
        euint256 encDecayRate; // ETH drop per block (hidden), in wei
        euint256 encReserve; // floor / reserve price (hidden), in wei

        uint256 startBlock;        
        uint256 duration; // auction length in blocks

        AssetType assetType;
        address asset; // ERC20 / ERC721 / ConfidentialERC20 address
        uint256 tokenIdOrAmount; // tokenId for ERC721, amount for ERC20 or confidential

        uint256 proceeds; // ETH locked after settlement for seller
        bool proceedsClaimed; // true once seller withdraws

        bool settled;
    }

    struct DecryptionRequest {
        ebool   isWinning;  // encrypted comparison result — bot decrypts this
        address bidder;
        uint256 ethAmount;  // ETH locked until fulfillDecryption() resolves it
        PoolId  poolId;
    }

    mapping(PoolId => AuctionConfig) public auctions;
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(address => uint256) public sellerNonce;
    uint256 public requestId;

    // sqrtPrice 1:1 — used for pool init (price irrelevant for auction design)
    uint160 private constant SQRT_PRICE_1_1 = 79228162514264337593543950336;

    event AuctionCreated(
        PoolId  indexed poolId,
        address indexed seller,

        address currency0,
        address currency1,
        uint24 fee,
        int24 tickSpacing,
        address hooks,
        uint256 publicStartPrice,
        uint256 startBlock,
        uint256 duration,
        AssetType assetType,
        address asset,
        uint256 tokenIdOrAmount
    );

    /// @notice Bot listens to this — decrypts isWinning, calls fulfillDecryption()
    event DecryptionRequested(
        uint256 indexed requestId,
        ebool   isWinning,      // encrypted bool — bot resolves this
        PoolId  poolId,
        address bidder,
        uint256 ethAmount
    );

    /// @notice Emitted by fulfillDecryption() after bot calls back
    event DecryptionFulfilled(
        uint256 indexed requestId,
        bool    isWinning
    );

    event AuctionSettled(
        PoolId  indexed poolId,
        address indexed winner,
        uint256 ethPaid
    );

    event BidRefunded(
        PoolId  indexed poolId,
        address indexed bidder,
        uint256 ethAmount
    );

    event ProceedsClaimed(
        PoolId  indexed poolId,
        address indexed seller,
        uint256 ethAmount
    );

    event AuctionExpired(PoolId indexed poolId);


    error AuctionNotFound();
    error AuctionNotStarted();
    error AuctionEnded();
    error AuctionAlreadySettled();
    error NoBidValue();
    error InvalidDuration();
    error InvalidPublicStartPrice();
    error NotSeller();
    error NotSettled();
    error AlreadyClaimed();
    error ETHTransferFailed();
    error RequestNotFound();

 
    constructor(IPoolManager _poolManager)
        BaseHook(_poolManager)
    {}


    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: true,   
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,   
            afterSwap: true,   
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }


    function createAuction(
        uint256 publicStartPrice,
        externalEuint256 encStartPrice,
        externalEuint256 encDecayRate,
        externalEuint256 encReserve,
        bytes calldata inputProof,
        uint256 duration,
        AssetType assetType,
        address asset,
        uint256 tokenIdOrAmount
    ) external nonReentrant {
        if (publicStartPrice == 0) revert InvalidPublicStartPrice();
        if (duration == 0) revert InvalidDuration();

        // approve or setoperator in the frontend
        // Pull asset into hook custody before pool creation
        _receiveAsset(assetType, asset, tokenIdOrAmount, msg.sender);

        // Deploy unique AuctionSlot via CREATE2 — becomes token1 in the pool
        address auctionSlot = _deployAuctionSlot(
            msg.sender,
            sellerNonce[msg.sender]++
        );

        // currency0 = address(0) native ETH — always less than any deployed address
        // currency1 = auctionSlot — unique per auction, ordering guaranteed
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(address(0)),
            currency1: Currency.wrap(auctionSlot),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(this))
        });

        // Encode all params — decoded inside afterInitialize
        bytes memory hookData = abi.encode(
            msg.sender,
            publicStartPrice,
            encStartPrice,
            encDecayRate,
            encReserve,
            inputProof,
            duration,
            assetType,
            asset,
            tokenIdOrAmount
        );

        // Initialize pool — afterInitialize fires immediately in the same call
        poolManager.initialize(key, SQRT_PRICE_1_1, hookData);
    }

    function _afterInitialize(
        address,
        PoolKey calldata key,
        uint160,
        int24,
        bytes calldata hookData
    ) internal override returns (bytes4) {

        (
            address seller,
            uint256 publicStartPrice,
            externalEuint256 encStartPriceExt,
            externalEuint256 encDecayRateExt,
            externalEuint256 encReserveExt,
            bytes memory inputProof,
            uint256 duration,
            AssetType assetType,
            address asset,
            uint256 tokenIdOrAmount
        ) = abi.decode(hookData, (
            address, uint256,
            externalEuint256, externalEuint256, externalEuint256,
            bytes,
            uint256, AssetType, address, uint256
        ));

        // Convert fhEVM external inputs → internal ciphertext handles
        euint256 encStart   = FHE.fromExternal(encStartPriceExt, inputProof);
        euint256 encDecay   = FHE.fromExternal(encDecayRateExt,  inputProof);
        euint256 encReserve = FHE.fromExternal(encReserveExt,    inputProof);

        // Grant this contract persistent ACL access to the three ciphertexts
        FHE.allowThis(encStart);
        FHE.allowThis(encDecay);
        FHE.allowThis(encReserve);

        PoolId id = key.toId();

        auctions[id] = AuctionConfig({
            seller:           seller,
            publicStartPrice: publicStartPrice,
            encStartPrice:    encStart,
            encDecayRate:     encDecay,
            encReserve:       encReserve,
            startBlock:       block.number,
            duration:         duration,
            assetType:        assetType,
            asset:            asset,
            tokenIdOrAmount:  tokenIdOrAmount,
            proceeds:         0,
            proceedsClaimed:  false,
            settled:          false
        });

        emit AuctionCreated(
            id,
            seller,
            Currency.unwrap(key.currency0),
            Currency.unwrap(key.currency1),
            key.fee,
            key.tickSpacing,
            address(key.hooks),  
            publicStartPrice,
            block.number,
            duration,
            assetType,
            asset,
            tokenIdOrAmount
        );

        return BaseHook.afterInitialize.selector;
    }

    // =========================================================================
    //                         HOOK: beforeSwap  (BID)
    // =========================================================================

    /**
     * @notice Intercepts every swap on an auction pool — the swap IS the bid.
     *
     *  Bidder sends ETH as msg.value alongside the swap call.
     *  amountSpecified = 0 — the pool moves nothing.
     *  hookData carries (encBid, proof).
     *
     *  After FHE comparison, emits DecryptionRequested — bot picks this up,
     *  decrypts isWinning offchain, and calls fulfillDecryption().
     */
    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata,
        bytes calldata hookData
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {

        PoolId id = key.toId();
        AuctionConfig storage auction = auctions[id];

        // ── auction guards ────────────────────────────────────────────────────
        if (auction.seller == address(0))                         revert AuctionNotFound();
        if (block.number < auction.startBlock)                    revert AuctionNotStarted();
        if (block.number > auction.startBlock + auction.duration) revert AuctionEnded();
        if (auction.settled)                                      revert AuctionAlreadySettled();

        // ── ETH bid must accompany the swap ───────────────────────────────────
        if (msg.value == 0) revert NoBidValue();

        // ── decode encrypted bid from hookData ────────────────────────────────
        (externalEuint256 encBidExt, bytes memory proof) =
            abi.decode(hookData, (externalEuint256, bytes));

        euint256 encBid = FHE.fromExternal(encBidExt, proof);
        FHE.allowThis(encBid);

        // msg.value ETH is now held by the contract — no further transfer needed

        // ── compute current price homomorphically ─────────────────────────────
        euint256 currentPrice = _currentEncPrice(auction);

        // ── FHE comparison: encBid >= encCurrentPrice? ────────────────────────
        ebool isWinning = FHE.ge(encBid, currentPrice);

        // Allow this contract and the bot to use isWinning
        FHE.allowThis(isWinning);

        // ── store decryption request — mirrors PersonRegistry pattern ─────────
        uint256 currentRequestId = requestId;

        decryptionRequests[currentRequestId] = DecryptionRequest({
            isWinning: isWinning,
            bidder:    sender,
            ethAmount: msg.value,
            poolId:    id
        });

        requestId++;

        // ── emit event — bot listens to this and calls fulfillDecryption() ─────
        emit DecryptionRequested(
            currentRequestId,
            isWinning,
            id,
            sender,
            msg.value
        );

        // ── zero delta — pool swaps nothing ───────────────────────────────────
        return (
            BaseHook.beforeSwap.selector,
            BeforeSwapDeltaLibrary.ZERO_DELTA,
            0
        );
    }

    // =========================================================================
    //                          HOOK: afterSwap
    // =========================================================================

    function _afterSwap(
        address,
        PoolKey calldata,
        SwapParams calldata,
        BalanceDelta,
        bytes calldata
    ) internal override returns (bytes4, int128) {
        // All logic in beforeSwap + fulfillDecryption
        return (BaseHook.afterSwap.selector, 0);
    }

    // =========================================================================
    //                         FULFILL DECRYPTION (BOT CALLBACK)
    // =========================================================================

    /**
     * @notice Called by the off-chain bot after it decrypts isWinning.
     *
     *  Mirrors PersonRegistry.fulfillDecryption() exactly:
     *    bot listens to DecryptionRequested → decrypts → calls this.
     *
     *  Winner:
     *    → auction.settled = true
     *    → auctioned asset transferred to winner
     *    → ETH stored under auction.proceeds for seller to claim
     *
     *  Loser (or race where auction already settled by earlier bid):
     *    → full ETH refunded to bidder immediately
     *
     * @param _requestId   Matches the requestId from DecryptionRequested event
     * @param _isWinning   Decrypted boolean result from bot
     */
    function fulfillDecryption(
        uint256 _requestId,
        bool _isWinning
    ) external nonReentrant {
        DecryptionRequest storage req = decryptionRequests[_requestId];
        if (req.bidder == address(0)) revert RequestNotFound();

        // Read request data before deleting
        address bidder    = req.bidder;
        uint256 ethAmount = req.ethAmount;
        PoolId  poolId    = req.poolId;

        // Delete first — prevent re-entrancy on same requestId
        delete decryptionRequests[_requestId];

        emit DecryptionFulfilled(_requestId, _isWinning);

        AuctionConfig storage auction = auctions[poolId];

        if (_isWinning && !auction.settled) {
            // ── WINNER ────────────────────────────────────────────────────────
            auction.settled  = true;
            auction.proceeds = ethAmount;   // locked for seller to claim

            _sendAssetToWinner(auction, bidder);

            emit AuctionSettled(poolId, bidder, ethAmount);

        } else {
            // ── LOSER ─────────────────────────────────────────────────────────
            // Also covers race: two bids pending, both win FHE check,
            // second fulfillDecryption sees auction.settled = true → refund
            _sendETH(bidder, ethAmount);

            emit BidRefunded(poolId, bidder, ethAmount);
        }
    }

    // =========================================================================
    //                       SELLER: WITHDRAW PROCEEDS
    // =========================================================================

    /**
     * @notice Seller calls this after auction settles to claim their ETH.
     */
    function withdrawProceeds(PoolId poolId) external nonReentrant {
        AuctionConfig storage auction = auctions[poolId];

        if (auction.seller != msg.sender) revert NotSeller();
        if (!auction.settled)             revert NotSettled();
        if (auction.proceedsClaimed)      revert AlreadyClaimed();

        auction.proceedsClaimed = true;
        uint256 amount = auction.proceeds;

        _sendETH(msg.sender, amount);

        emit ProceedsClaimed(poolId, msg.sender, amount);
    }

    // =========================================================================
    //                           EXPIRE AUCTION
    // =========================================================================

    /**
     * @notice Anyone can call after duration passes with no winner.
     *         Returns asset to seller. No ETH involved since no winner paid.
     */
    function expireAuction(PoolId poolId) external nonReentrant {
        AuctionConfig storage auction = auctions[poolId];

        if (auction.seller == address(0)) revert AuctionNotFound();
        if (auction.settled)              revert AuctionAlreadySettled();
        require(
            block.number > auction.startBlock + auction.duration,
            "Auction still active"
        );

        auction.settled = true;
        _sendAssetToWinner(auction, auction.seller);

        emit AuctionExpired(poolId);
    }

    // =========================================================================
    //                          INTERNAL HELPERS
    // =========================================================================

    /**
     * @notice Compute current encrypted auction price.
     *
     *  currentPrice = max(encStartPrice - (encDecayRate * blocksElapsed), encReserve)
     *
     *  All arithmetic in FHE encrypted space — no plaintext price is ever exposed.
     */
    function _currentEncPrice(
        AuctionConfig storage auction
    ) internal view returns (euint256) {
        uint256 blocksElapsed = block.number - auction.startBlock;

        euint256 decayed = FHE.mul(
            auction.encDecayRate,
            FHE.asEuint256(blocksElapsed)
        );

        euint256 price = FHE.sub(auction.encStartPrice, decayed);

        // Clamp at reserve — price never drops below floor
        return FHE.max(price, auction.encReserve);
    }

    /**
     * @notice Transfer auctioned asset to winner or back to seller on expiry.
     */
    function _sendAssetToWinner(
        AuctionConfig storage auction,
        address recipient
    ) internal {
        if (auction.assetType == AssetType.ERC721) {
            IERC721(auction.asset).transferFrom(
                address(this),
                recipient,
                auction.tokenIdOrAmount
            );
        } else if (auction.assetType == AssetType.ERC20) {
            IERC20(auction.asset).safeTransfer(
                recipient,
                auction.tokenIdOrAmount
            );
        } else {
            // Confidential ERC-20 (ERC-7984)
            IConfidentialERC20(auction.asset).transfer(
                recipient,
                FHE.asEuint256(auction.tokenIdOrAmount)
            );
        }
    }

    /**
     * @notice Pull auctioned asset from seller into hook custody at creation.
     */
    function _receiveAsset(
        AssetType assetType,
        address asset,
        uint256 tokenIdOrAmount,
        address seller
    ) internal {
        if (assetType == AssetType.ERC721) {
            IERC721(asset).transferFrom(seller, address(this), tokenIdOrAmount);
        } else if (assetType == AssetType.ERC20) {
            IERC20(asset).safeTransferFrom(seller, address(this), tokenIdOrAmount);
        } else {
            // Confidential ERC-20 — seller sets hook as operator on frontend
            IConfidentialERC20(asset).transferFrom(
                seller,
                address(this),
                FHE.asEuint256(tokenIdOrAmount)
            );
        }
    }

    function _sendETH(address to, uint256 amount) internal {
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert ETHTransferFailed();
    }

    /**
     * @notice Deploy a minimal ERC-20 via CREATE2 as token1 for the pool.
     *  No supply. No transfers. Purely structural for unique PoolId generation.
     */
    function _deployAuctionSlot(
        address seller,
        uint256 nonce
    ) internal returns (address deployed) {
        bytes32 salt = keccak256(abi.encodePacked(seller, nonce));
        bytes memory bc = type(AuctionSlot).creationCode;

        assembly {
            deployed := create2(0, add(bc, 0x20), mload(bc), salt)
        }
        require(deployed != address(0), "AuctionSlot deployment failed");
    }

    /**
     * @notice Predict AuctionSlot address before deploying.
     *  Frontend uses this to derive PoolId before createAuction tx confirms.
     */
    function predictAuctionSlot(
        address seller,
        uint256 nonce
    ) external view returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(seller, nonce));
        bytes32 bytecodeHash = keccak256(type(AuctionSlot).creationCode);

        return address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            bytecodeHash
        )))));
    }



    function getAuction(PoolId poolId) external view returns (AuctionConfig memory) {
        return auctions[poolId];
    }

    function getDecryptionRequest(uint256 _requestId) external view returns (
        address bidder,
        uint256 ethAmount,
        PoolId  poolId
    ) {
        DecryptionRequest storage req = decryptionRequests[_requestId];
        return (req.bidder, req.ethAmount, req.poolId);
    }

    function isAuctionActive(PoolId poolId) external view returns (bool) {
        AuctionConfig storage a = auctions[poolId];
        return (
            !a.settled &&
            block.number >= a.startBlock &&
            block.number <= a.startBlock + a.duration
        );
    }

    function blocksRemaining(PoolId poolId) external view returns (uint256) {
        AuctionConfig storage a = auctions[poolId];
        uint256 endBlock = a.startBlock + a.duration;
        if (block.number >= endBlock) return 0;
        return endBlock - block.number;
    }

    receive() external payable {}
}

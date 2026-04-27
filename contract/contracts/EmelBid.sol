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
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {FHE, externalEuint64, euint64, externalEuint256, euint256, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface ICWETH {
    function transferFrom(address from, address to, euint64 amount) external returns (euint64);
    function transfer(address to, euint64 amount) external returns (euint64);
    function deposit(address to) external payable;
}

interface IConfidentialERC20 {
    function ConfidentialTransferFrom(address from, address to, euint64 amount) external returns (euint64);
    function ConfidentialTransfer(address to, euint64 amount) external returns (euint64);
}



contract EmelBid is
    BaseHook,
    ReentrancyGuard,
    ZamaEthereumConfig,
    Ownable
{
    using SafeERC20 for IERC20;
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;


    enum AssetType { ERC20, ERC721, CONFIDENTIAL }

    struct AuctionConfig {
        address seller;

        uint256 publicStartPrice;   // plaintext anchor in cWETH token units (6 decimals)

        // Encrypted price curve — all in cWETH token units (6 decimals)
        euint64 encStartPrice;      // real starting price (hidden)
        euint64 encDecayRate;       // cWETH drop per block (hidden)
        euint64 encReserve;         // floor / reserve price (hidden)

        uint256 startBlock;
        uint256 duration;           // auction length in blocks

        AssetType assetType;
        address asset;              // ERC20 / ERC721 / ConfidentialERC20 address
        uint256 tokenIdOrAmount;    // tokenId for ERC721, amount for ERC20/CONFIDENTIAL

        // Proceeds stored as encrypted cWETH for seller to claim
        euint64 proceeds;
        bool proceedsClaimed;

        bool settled;
    }

    /// @dev One entry per pending decryption — bot reads requestId from event
    struct DecryptionRequest {
        ebool isWinning;  // encrypted comparison result — bot decrypts this
        address bidder;
        euint64 bidAmount;  // encrypted cWETH bid — held until fulfillDecryption()
        PoolId poolId;
    }

   

    mapping(PoolId => AuctionConfig) public auctions;
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(address => uint256) public sellerNonce;
    mapping(PoolId => address) public auctionWinner;
    mapping(PoolId => address[]) public auctionBidders;
    mapping(address => mapping(PoolId => euint64)) public userBid;

    uint256 public requestId;
    ICWETH public immutable CWETH;
    address public decryptor;

    // sqrtPrice 1:1 — used for pool init only
    uint160 private constant SQRT_PRICE_1_1 = 79228162514264337593543950336;


    event AuctionCreated(
        PoolId indexed poolId,
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
        ebool isWinning,
        PoolId poolId,
        address bidder
    );

    event DecryptionFulfilled(
        uint256 indexed requestId,
        bool isWinning
    );

    event AuctionSettled(
        PoolId indexed poolId,
        address indexed winner
    );

    event BidRefunded(
        PoolId indexed poolId,
        address indexed bidder
    );

    event ProceedsClaimed(
        PoolId indexed poolId,
        address indexed seller
    );

    event AuctionExpired(PoolId indexed poolId);


    error AuctionNotFound();
    error AuctionNotStarted();
    error AuctionEnded();
    error AuctionAlreadySettled();
    error NoBidAmount();
    error InvalidDuration();
    error InvalidPublicStartPrice();
    error NotSeller();
    error NotSettled();
    error AlreadyClaimed();
    error ETHTransferFailed();
    error RequestNotFound();

    modifier onlyDecryptor() {
        require(msg.sender == decryptor, "Not decryptor");
        _;
    }


    constructor(IPoolManager _poolManager, address _cweth, address _decryptor)
        BaseHook(_poolManager)
        Ownable(msg.sender)
    {
        CWETH = ICWETH(_cweth);
        decryptor = _decryptor;
    }


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
        externalEuint64 encStartPrice,
        externalEuint64 encDecayRate,
        externalEuint64 encReserve,
        bytes calldata inputProof,
        uint256 duration,
        AssetType assetType,
        address asset,
        uint256 tokenIdOrAmount
    ) external nonReentrant {
        if (publicStartPrice == 0) revert InvalidPublicStartPrice();
        if (duration == 0) revert InvalidDuration();

        // Pull asset into hook custody — approve or setOperator on frontend first
        _receiveAsset(assetType, asset, tokenIdOrAmount, msg.sender);

        // Deploy unique AuctionSlot via CREATE2 — becomes token1 in the pool
        address auctionSlot = _deployAuctionSlot(
            msg.sender,
            sellerNonce[msg.sender]++
        );

        // address(0) < any deployed address — ordering always satisfied
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(address(0)),
            currency1: Currency.wrap(auctionSlot),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(this))
        });

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

        // afterInitialize fires immediately inside this call
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
            externalEuint64 encStartPriceExt,
            externalEuint64 encDecayRateExt,
            externalEuint64 encReserveExt,
            bytes memory inputProof,
            uint256 duration,
            AssetType assetType,
            address asset,
            uint256 tokenIdOrAmount
        ) = abi.decode(hookData, (
            address, uint256,
            externalEuint64, externalEuint64, externalEuint64,
            bytes,
            uint256, AssetType, address, uint256
        ));

        euint64 encStart   = FHE.fromExternal(encStartPriceExt, inputProof);
        euint64 encDecay   = FHE.fromExternal(encDecayRateExt,  inputProof);
        euint64 encReserve = FHE.fromExternal(encReserveExt,    inputProof);

        FHE.allowThis(encStart);
        FHE.allowThis(encDecay);
        FHE.allowThis(encReserve);

        PoolId id = key.toId();

        // zero euint64 for proceeds placeholder
        euint64 zeroProceeds = FHE.asEuint64(0);
        FHE.allowThis(zeroProceeds);

        auctions[id] = AuctionConfig({
            seller: seller,
            publicStartPrice: publicStartPrice,
            encStartPrice: encStart,
            encDecayRate: encDecay,
            encReserve: encReserve,
            startBlock: block.number,
            duration: duration,
            assetType: assetType,
            asset: asset,
            tokenIdOrAmount: tokenIdOrAmount,
            proceeds: zeroProceeds,
            proceedsClaimed: false,
            settled: false
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

    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata,
        bytes calldata hookData
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {

        PoolId id = key.toId();
        AuctionConfig storage auction = auctions[id];

        if (auction.seller == address(0)) revert AuctionNotFound();
        if (block.number < auction.startBlock) revert AuctionNotStarted();
        if (block.number > auction.startBlock + auction.duration) revert AuctionEnded();
        if (auction.settled) revert AuctionAlreadySettled();

        (externalEuint64 encBidExt, bytes memory proof, address msgSender) =
            abi.decode(hookData, (externalEuint64, bytes, address));

        euint64 encBid = FHE.fromExternal(encBidExt, proof);
        FHE.allowThis(encBid);
        FHE.allow(encBid, msgSender);

        // Bidder must have called setOperator(address(this)) on cWETH frontend

        FHE.allowTransient(encBid, address(CWETH));
        CWETH.confidentialTransferFrom(msgSender, address(this), encBid);

        // store bid per user per auction
        userBid[msgSender][id] = encBid;
        FHE.allow(encBid, msgSender);  // bidder can decrypt their own bid

        // track bidder in auction
        auctionBidders[id].push(msgSender);

        // compute current price homomorphically
        euint64 currentPrice = _currentEncPrice(auction);

        // FHE comparison: encBid >= encCurrentPrice? 
        ebool isWinning = FHE.ge(encBid, currentPrice);
        FHE.allowThis(isWinning);
        FHE.allow(isWinning, msgSender);
        FHE.allow(isWinning, _decryptor);

        // store decryption request
        uint256 currentRequestId = requestId;

        decryptionRequests[currentRequestId] = DecryptionRequest({
            isWinning: isWinning,
            bidder: msgSender,
            bidAmount: encBid,
            poolId: id
        });

        requestId++;

        emit DecryptionRequested(currentRequestId, isWinning, id, msgSender);

        return (
            BaseHook.beforeSwap.selector,
            BeforeSwapDeltaLibrary.ZERO_DELTA,
            0
        );
    }



    function _afterSwap(
        address,
        PoolKey calldata,
        SwapParams calldata,
        BalanceDelta,
        bytes calldata
    ) internal override returns (bytes4, int128) {
        return (BaseHook.afterSwap.selector, 0);
    }


    function fulfillDecryption(
        uint256 _requestId,
        bool _isWinning
    ) external nonReentrant onlyDecryptor {
        DecryptionRequest storage req = decryptionRequests[_requestId];
        if (req.bidder == address(0)) revert RequestNotFound();

        address bidder = req.bidder;
        euint64 bidAmount = req.bidAmount;
        PoolId poolId = req.poolId;

        // Delete before acting — prevents re-entrancy on same requestId
        delete decryptionRequests[_requestId];

        emit DecryptionFulfilled(_requestId, _isWinning);

        AuctionConfig storage auction = auctions[poolId];

        if (_isWinning && !auction.settled) {
            // WINNER
            auction.settled  = true;
            auction.proceeds = bidAmount;   // encrypted cWETH for seller
            FHE.allowThis(auction.proceeds);
            FHE.allow(auction.proceeds, auction.seller); // seller can decrypt proceeds

            auctionWinner[poolId] = bidder; // record winner

            _sendAssetToWinner(auction, bidder);

            emit AuctionSettled(poolId, bidder);

        } else {
            // LOSER — refund encrypted cWETH
            FHE.allow(bidAmount, bidder);
            CWETH.ConfidentialTransfer(bidder, bidAmount);

            emit BidRefunded(poolId, bidder);
        }
    }

    // =========================================================================
    //                       SELLER: WITHDRAW PROCEEDS
    // =========================================================================

    /**
     * @notice Seller calls this after settlement to claim encrypted cWETH proceeds.
     *  Seller can then call cWETH withdraw() to convert back to ETH if needed.
     */
    function withdrawProceeds(PoolId poolId) external nonReentrant {
        AuctionConfig storage auction = auctions[poolId];

        if (auction.seller != msg.sender) revert NotSeller();
        if (!auction.settled)             revert NotSettled();
        if (auction.proceedsClaimed)      revert AlreadyClaimed();

        auction.proceedsClaimed = true;

        FHE.allow(auction.proceeds, msg.sender);
        CWETH.transfer(msg.sender, auction.proceeds);

        emit ProceedsClaimed(poolId, msg.sender);
    }


    /**
     * @notice Anyone can call after duration passes with no winner.
     *  Returns asset to seller. No cWETH involved since no winner bid was accepted.
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
     * @notice Compute current encrypted price.
     *  currentPrice = max(encStartPrice - (encDecayRate * blocksElapsed), encReserve)
     *  All in cWETH token units (6 decimals). All in FHE encrypted space.
     */
    function _currentEncPrice(
        AuctionConfig storage auction
    ) internal view returns (euint64) {
        uint256 blocksElapsed = block.number - auction.startBlock;

        euint64 decayed = FHE.mul(
            auction.encDecayRate,
            FHE.asEuint64(uint64(blocksElapsed))
        );

        euint64 price = FHE.sub(auction.encStartPrice, decayed);

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
            // Confidential ERC-20 (ERC-7984, euint64)
            IConfidentialERC20(auction.asset).ConfidentialTransfer(
                recipient,
                FHE.asEuint64(uint64(auction.tokenIdOrAmount))
            );
        }
    }

    /**
     * @notice Pull auctioned asset from seller into hook custody.
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
                FHE.asEuint64(uint64(tokenIdOrAmount))
            );
        }
    }


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

    function predictAuctionSlot(
        address seller,
        uint256 nonce
    ) external view returns (address) {
        bytes32 salt         = keccak256(abi.encodePacked(seller, nonce));
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

    /// @notice Get all bidders for an auction
    function getAuctionBidders(PoolId poolId) external view returns (address[] memory) {
        return auctionBidders[poolId];
    }

    /// @notice Get total number of bids for an auction
    function getBidCount(PoolId poolId) external view returns (uint256) {
        return auctionBidders[poolId].length;
    }

    /// @notice Get the winner of a settled auction
    function getWinner(PoolId poolId) external view returns (address) {
        return auctionWinner[poolId];
    }

    /// @notice Get a specific user's encrypted bid for an auction
    ///         User must have FHE permission to decrypt their own bid
    function getUserBid(address user, PoolId poolId) external view returns (euint64) {
        return userBid[user][poolId];
    }

    function getDecryptionRequest(uint256 _requestId) external view returns (
        address bidder,
        PoolId  poolId
    ) {
        DecryptionRequest storage req = decryptionRequests[_requestId];
        return (req.bidder, req.poolId);
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

    // Only owner can update the cWETH contract address if needed
    function setCWETH(address _cweth) external onlyOwner {
        CWETH = ICWETH(_cweth);
    }

    function setDecryptor(address _decryptor) external onlyOwner {
        decryptor = _decryptor;
    }

    receive() external payable {}
}

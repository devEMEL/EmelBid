// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {FHE, externalEuint64, euint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface ICWETH {
    function confidentialTransferFrom(address from, address to, euint64 amount) external returns (euint64);
    function confidentialTransfer(address to, euint64 amount) external returns (euint64);
}

interface IERC7984 {
    function confidentialTransferFrom(address from, address to, euint64 amount) external returns (euint64);
    function confidentialTransfer(address to, euint64 amount) external returns (euint64);
}

contract EmelBid is ReentrancyGuard, ZamaEthereumConfig, Ownable {
    using SafeERC20 for IERC20;

    enum AssetType { ERC20, ERC721, Confidential }

    struct AuctionConfig {
        address seller;

        uint256 publicStartPrice;

        euint64 encStartPrice;
        euint64 encDecayRate;
        euint64 encReserve;

        uint256 startBlock;
        uint256 duration;

        AssetType assetType;
        address asset;

        uint256 tokenIdOrAmount; // ERC20 / ERC721
        euint64 encAmount;       // Confidential

        euint64 proceeds;
        bool proceedsClaimed;
        bool settled;
    }

    struct DecryptionRequest {
        ebool isWinning;
        address bidder;
        euint64 bidAmount;
        bytes32 auctionId;
    }

    mapping(bytes32 => AuctionConfig) public auctions;
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(bytes32 => bool) public pendingSettlement;
    mapping(address => uint256) public sellerNonce;
    mapping(bytes32 => address) public auctionWinner;
    mapping(bytes32 => address[]) public auctionBidders;

    mapping(address => mapping(bytes32 => euint64)) public userBid;

    uint256 public requestId;
    ICWETH public CWETH;
    address public decryptor;

    // EVENTS
    event AuctionCreated(bytes32 indexed auctionId, address indexed seller);
    event DecryptionRequested(uint256 indexed requestId, bytes32 indexed auctionId, address bidder);
    event DecryptionFulfilled(uint256 indexed requestId, bool isWinning);
    event AuctionSettled(bytes32 indexed auctionId, address winner);
    event BidRefunded(bytes32 indexed auctionId, address bidder);
    event AuctionExpired(bytes32 indexed auctionId);
    event ProceedsClaimed(bytes32 indexed auctionId);

    modifier onlyDecryptor() {
        require(msg.sender == decryptor, "Not decryptor");
        _;
    }

    constructor(address _cweth, address _decryptor) Ownable(msg.sender) {
        CWETH = ICWETH(_cweth);
        decryptor = _decryptor;
    }

    function createAuction(
        uint256 publicStartPrice,
        externalEuint64 encStartPrice,
        externalEuint64 encDecayRate,
        externalEuint64 encReserve,
        externalEuint64 encAmountExt,
        bytes calldata inputProof,
        uint256 duration,
        AssetType assetType,
        address asset,
        uint256 tokenIdOrAmount
    ) external nonReentrant returns (bytes32 auctionId) {
        require(publicStartPrice > 0, "Invalid price");
        require(duration > 0, "Invalid duration");

        auctionId = keccak256(abi.encodePacked(msg.sender, sellerNonce[msg.sender]++));

        euint64 encStart = FHE.fromExternal(encStartPrice, inputProof);
        euint64 encDecay = FHE.fromExternal(encDecayRate, inputProof);
        euint64 encReserve_ = FHE.fromExternal(encReserve, inputProof);

        require(FHE.isSenderAllowed(encStart), "Not allowed");

        FHE.allowThis(encStart);
        FHE.allowThis(encDecay);
        FHE.allowThis(encReserve_);

        euint64 zero = FHE.asEuint64(0);
        FHE.allowThis(zero);

        AuctionConfig storage auction = auctions[auctionId];

        auction.seller = msg.sender;
        auction.publicStartPrice = publicStartPrice;
        auction.encStartPrice = encStart;
        auction.encDecayRate = encDecay;
        auction.encReserve = encReserve_;
        auction.startBlock = block.number;
        auction.duration = duration;
        auction.assetType = assetType;
        auction.asset = asset;
        auction.proceeds = zero;

        if (assetType == AssetType.Confidential) {
            euint64 amount = FHE.fromExternal(encAmountExt, inputProof);
            require(FHE.isSenderAllowed(amount), "Not allowed");


            auction.encAmount = amount;

            
            FHE.allowTransient(amount, asset);
            IERC7984(asset).confidentialTransferFrom(msg.sender, address(this), amount);
            FHE.allow(amount, asset);
            FHE.allowThis(amount);
            
            FHE.allow(amount, msg.sender);
            FHE.allow(amount, decryptor);


        } else if (assetType == AssetType.ERC721) {
            auction.tokenIdOrAmount = tokenIdOrAmount;
            IERC721(asset).transferFrom(msg.sender, address(this), tokenIdOrAmount);

        } else {
            auction.tokenIdOrAmount = tokenIdOrAmount;
            IERC20(asset).safeTransferFrom(msg.sender, address(this), tokenIdOrAmount);
        }

        emit AuctionCreated(auctionId, msg.sender);
    }

    function placeBid(bytes32 auctionId, externalEuint64 encBidExt, bytes calldata proof) external nonReentrant {
        AuctionConfig storage auction = auctions[auctionId];

        require(!auction.settled, "Settled");
        require(!pendingSettlement[auctionId], "Pending");
        require(block.number >= auction.startBlock, "Not started");
        require(block.number <= auction.startBlock + auction.duration, "Ended");

        euint64 encBid = FHE.fromExternal(encBidExt, proof);
        require(FHE.isSenderAllowed(encBid), "Not allowed");

        FHE.allowTransient(encBid, address(CWETH));
        CWETH.confidentialTransferFrom(msg.sender, address(this), encBid);

        userBid[msg.sender][auctionId] = encBid;
        FHE.allowThis(encBid);
        FHE.allow(encBid, msg.sender);
        FHE.allow(encBid, decryptor);
        FHE.allow(encBid, address(CWETH));
        auctionBidders[auctionId].push(msg.sender);


        euint64 currentPrice = _currentEncPrice(auction);
        ebool isWinning = FHE.ge(encBid, currentPrice);

        FHE.allowThis(isWinning);
        FHE.allow(isWinning, msg.sender);
        FHE.allow(isWinning, decryptor);

        uint256 id = requestId++;

        decryptionRequests[id] = DecryptionRequest({
            isWinning: isWinning,
            bidder: msg.sender,
            bidAmount: encBid,
            auctionId: auctionId
        });

        pendingSettlement[auctionId] = true;

        emit DecryptionRequested(id, auctionId, msg.sender);
    }

    function fulfillDecryption(uint256 _requestId, bool _isWinning) external onlyDecryptor nonReentrant {
        DecryptionRequest storage req = decryptionRequests[_requestId];
        require(req.bidder != address(0), "Invalid");

        address bidder = req.bidder;
        euint64 bidAmount = req.bidAmount;
        bytes32 auctionId = req.auctionId;

        delete decryptionRequests[_requestId];

        AuctionConfig storage auction = auctions[auctionId];

        pendingSettlement[auctionId] = false;

        emit DecryptionFulfilled(_requestId, _isWinning);

        if (_isWinning && !auction.settled) {
            auction.settled = true;

            auction.proceeds = bidAmount;
            FHE.allowThis(auction.proceeds);
            FHE.allow(auction.proceeds, auction.seller);

            auctionWinner[auctionId] = bidder;

            _sendAsset(auction, bidder);

            emit AuctionSettled(auctionId, bidder);
        } else {
            FHE.allowThis(bidAmount);
            FHE.allow(bidAmount, bidder);
            
            CWETH.confidentialTransfer(bidder, bidAmount);

            emit BidRefunded(auctionId, bidder);
        }
    }

    function withdrawProceeds(bytes32 auctionId) external nonReentrant {
        AuctionConfig storage auction = auctions[auctionId];

        require(msg.sender == auction.seller, "Not seller");
        require(auction.settled, "Not settled");
        require(!auction.proceedsClaimed, "Claimed");

        auction.proceedsClaimed = true;

        FHE.allow(auction.proceeds, msg.sender);
        CWETH.confidentialTransfer(msg.sender, auction.proceeds);

        emit ProceedsClaimed(auctionId);
    }

    // can be called by anyone
    function expireAuction(bytes32 auctionId) external nonReentrant {
        AuctionConfig storage auction = auctions[auctionId];

        require(!auction.settled, "Settled");
        require(block.number > auction.startBlock + auction.duration, "Active");

        auction.settled = true;

        _sendAsset(auction, auction.seller);

        emit AuctionExpired(auctionId);
    }

    function _currentEncPrice(AuctionConfig storage auction) internal returns (euint64) {
        uint64 elapsed = uint64(block.number - auction.startBlock);

        euint64 decay = FHE.mul(auction.encDecayRate, FHE.asEuint64(elapsed));

        ebool underflow = FHE.gt(decay, auction.encStartPrice);

        euint64 safe = FHE.select(
            underflow,
            FHE.asEuint64(0),
            FHE.sub(auction.encStartPrice, decay)
        );

        return FHE.max(safe, auction.encReserve);
    }

    function _sendAsset(AuctionConfig storage auction, address recipient) internal {
        if (auction.assetType == AssetType.ERC721) {
            IERC721(auction.asset).transferFrom(address(this), recipient, auction.tokenIdOrAmount);
        } else if (auction.assetType == AssetType.ERC20) {
            IERC20(auction.asset).safeTransfer(recipient, auction.tokenIdOrAmount);
        } else {
            FHE.allowTransient(auction.encAmount, auction.asset);
            IERC7984(auction.asset).confidentialTransfer(recipient, auction.encAmount);
        }
    }

    function setDecryptor(address _decryptor) external onlyOwner {
        decryptor = _decryptor;
    }

    function setCWETH(address _cweth) external onlyOwner {
        CWETH = ICWETH(_cweth);
    }


    // -----------------------------------------------------------------------
    // View helpers
    // -----------------------------------------------------------------------

    function getAuction(bytes32 auctionId)
        external view
        returns (AuctionConfig memory)
    {
        return auctions[auctionId];
    }

    function getAuctionBidders(bytes32 auctionId)
        external view
        returns (address[] memory)
    {
        return auctionBidders[auctionId];
    }

    function getBidCount(bytes32 auctionId)
        external view
        returns (uint256)
    {
        return auctionBidders[auctionId].length;
    }

    function getWinner(bytes32 auctionId)
        external view
        returns (address)
    {
        return auctionWinner[auctionId];
    }

    function getUserBid(address user, bytes32 auctionId)
        external view
        returns (euint64)
    {
        return userBid[user][auctionId];
    }

    function getDecryptionRequest(uint256 _requestId)
        external view
        returns (address bidder, bytes32 auctionId)
    {
        DecryptionRequest storage req = decryptionRequests[_requestId];
        return (req.bidder, req.auctionId);
    }

    function isAuctionActive(bytes32 auctionId)
        external view
        returns (bool)
    {
        AuctionConfig storage a = auctions[auctionId];
        return (
            !a.settled &&
            block.number >= a.startBlock &&
            block.number <= a.startBlock + a.duration
        );
    }

    function blocksRemaining(bytes32 auctionId)
        external view
        returns (uint256)
    {
        AuctionConfig storage a = auctions[auctionId];
        uint256 endBlock = a.startBlock + a.duration;
        if (block.number >= endBlock) return 0;
        return endBlock - block.number;
    }


}

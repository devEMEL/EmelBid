import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { deployFixture } from "./helpers/setup";

describe("EmelBid — ERC721 Auctions", function () {
  this.timeout(300_000);

  let ctx: Awaited<ReturnType<typeof deployFixture>>;

  beforeEach(async function () {
    ctx = await deployFixture();
  });

  const PUBLIC_START_PRICE = 8_000n;
  const ENC_START_PRICE    = 10_000n;
  const ENC_DECAY_RATE     = 100n;
  const ENC_RESERVE        = 2_000n;
  const DURATION           = 100n;
  const NFT_URI           = "ipfs://toy-nft";

  async function createERC721Auction() {
    const { hook, seller, sellerAddress, mockERC721, hookAddress, mockERC721Address } = ctx;

    const mintTx = await mockERC721.connect(seller).mint(NFT_URI);
    const mintReceipt = await mintTx.wait();
    const transferEvent = mintReceipt?.logs.find(l => { try { return mockERC721.interface.parseLog(l)?.name === "Transfer" } catch { return false } });
    const tokenId = mockERC721.interface.parseLog(transferEvent!)!.args.tokenId;

    await mockERC721.connect(seller).approve(hookAddress, tokenId);

    const encInput = await fhevm
      .createEncryptedInput(hookAddress, sellerAddress)
      .add64(ENC_START_PRICE)
      .add64(ENC_DECAY_RATE)
      .add64(ENC_RESERVE)
      .add64(0n)
      .encrypt();

    const tx = await hook.connect(seller).createAuction(
      PUBLIC_START_PRICE,
      encInput.handles[0],
      encInput.handles[1],
      encInput.handles[2],
      encInput.handles[3],
      encInput.inputProof,
      DURATION,
      1, // ERC721
      mockERC721Address,
      tokenId
    );
    const receipt = await tx.wait();
    const event = receipt?.logs.find(l => { try { return hook.interface.parseLog(l)?.name === "AuctionCreated" } catch { return false } });
    const parsed = hook.interface.parseLog(event!);
    return { auctionId: parsed!.args.auctionId, tokenId };
  }

  it("should create an ERC721 auction and pull NFT into hook", async function () {
    const { mockERC721, hookAddress } = ctx;
    const { auctionId, tokenId } = await createERC721Auction();
    expect(await mockERC721.ownerOf(tokenId)).to.equal(hookAddress);

    const auction = await ctx.hook.getAuction(auctionId);
    expect(auction.assetType).to.equal(1n); // ERC721
    expect(auction.tokenIdOrAmount).to.equal(tokenId);
  });

  it("should allow a bidder to place a bid", async function () {
    const { hook, bidder1, hookAddress, fundBidderWithCweth, ethToCwethUnits } = ctx;
    const { auctionId } = await createERC721Auction();

    const bidEth = ethers.parseEther("0.01");
    const bidUnits = ethToCwethUnits(bidEth);
    await fundBidderWithCweth(bidder1, bidEth * 2n);

    const encInput = await fhevm
      .createEncryptedInput(hookAddress, ctx.bidder1Address)
      .add64(bidUnits)
      .encrypt();

    const tx = await hook.connect(bidder1).placeBid(
      auctionId,
      encInput.handles[0],
      encInput.inputProof
    );
    const receipt = await tx.wait();

    const event = receipt?.logs.find((log: any) => {
      try { return hook.interface.parseLog(log)?.name === "DecryptionRequested"; }
      catch { return false; }
    });
    expect(event).to.not.be.undefined;
    const parsed = hook.interface.parseLog(event!);
    expect(parsed!.args.bidder).to.equal(ctx.bidder1Address);
  });

  it("should transfer to the winner", async function () {
    const { hook, bidder1, decryptor, mockERC721, bidder1Address, fundBidderWithCweth, ethToCwethUnits } = ctx;
    const { auctionId, tokenId } = await createERC721Auction();

    const bidEth = ethers.parseEther("0.1");
    const bidUnits = ethToCwethUnits(bidEth);
    await fundBidderWithCweth(bidder1, bidEth * 2n);

    const encInput = await fhevm
      .createEncryptedInput(ctx.hookAddress, bidder1Address)
      .add64(bidUnits)
      .encrypt();

    let tx = await hook.connect(bidder1).placeBid(auctionId, encInput.handles[0], encInput.inputProof);
    let receipt = await tx.wait();
    const event = receipt?.logs.find(l => { try { return hook.interface.parseLog(l)?.name === "DecryptionRequested" } catch { return false } });
    const requestId = hook.interface.parseLog(event!)!.args.requestId;

    await hook.connect(decryptor).fulfillDecryption(requestId, true);

    expect(await mockERC721.ownerOf(tokenId)).to.equal(bidder1Address);
  });

  it("should refund the loser", async function () {
    const { hook, seller, sellerAddress, bidder1, decryptor, cweth, bidder1Address, fundBidderWithCweth, ethToCwethUnits, cwethAddress, mockERC721 } = ctx;
    const { auctionId, tokenId } = await createERC721Auction();

    const bidEth = ethers.parseEther("0.001"); // 1,000 units < reserve 2,000
    const bidUnits = ethToCwethUnits(bidEth);
    await fundBidderWithCweth(bidder1, bidEth * 2n);

    const balBefore = await cweth.connect(bidder1).confidentialBalanceOf(bidder1Address);
    const clearBefore = await fhevm.userDecryptEuint(FhevmType.euint64, balBefore, cwethAddress, bidder1);

    const encInput = await fhevm
      .createEncryptedInput(ctx.hookAddress, bidder1Address)
      .add64(bidUnits)
      .encrypt();

    let tx = await hook.connect(bidder1).placeBid(auctionId, encInput.handles[0], encInput.inputProof);
    let receipt = await tx.wait();
    const event = receipt?.logs.find(l => { try { return hook.interface.parseLog(l)?.name === "DecryptionRequested" } catch { return false } });
    const requestId = hook.interface.parseLog(event!)!.args.requestId;

    const balAfter = await cweth.connect(bidder1).confidentialBalanceOf(bidder1Address);
    const clearAfter = await fhevm.userDecryptEuint(FhevmType.euint64, balAfter, cwethAddress, bidder1);
    expect(clearBefore).to.equal(clearAfter + bidUnits);

    await hook.connect(decryptor).fulfillDecryption(requestId, false);

    // seller GETS BACK THEIR NFT after expiry
    await ethers.provider.send("hardhat_mine", ["0x" + (DURATION + 1n).toString(16)]);
    await hook.connect(seller).expireAuction(auctionId);
    expect(await mockERC721.ownerOf(tokenId)).to.equal(sellerAddress);
  });

  it("should allow seller to claim proceeds", async function () {
    const { hook, seller, bidder1, decryptor, cweth, sellerAddress, fundBidderWithCweth, ethToCwethUnits, cwethAddress, bidder1Address } = ctx;
    const { auctionId } = await createERC721Auction();

    const bidEth = ethers.parseEther("0.1");
    const bidUnits = ethToCwethUnits(bidEth);
    await fundBidderWithCweth(bidder1, bidEth * 2n);

    const encInput = await fhevm
      .createEncryptedInput(ctx.hookAddress, bidder1Address)
      .add64(bidUnits)
      .encrypt();

    let tx = await hook.connect(bidder1).placeBid(auctionId, encInput.handles[0], encInput.inputProof);
    let receipt = await tx.wait();
    const event = receipt?.logs.find(l => { try { return hook.interface.parseLog(l)?.name === "DecryptionRequested" } catch { return false } });
    const requestId = hook.interface.parseLog(event!)!.args.requestId;

    await hook.connect(decryptor).fulfillDecryption(requestId, true);

    expect(await hook.getWinner(auctionId)).to.equal(bidder1Address);


    await hook.connect(seller).withdrawProceeds(auctionId);

    const balAfter = await cweth.connect(seller).confidentialBalanceOf(sellerAddress);
    const clearAfter = await fhevm.userDecryptEuint(FhevmType.euint64, balAfter, cwethAddress, seller);

    expect(clearAfter).to.equal(0n + bidUnits);
  });
});

//  npx hardhat test test/EmelBid.erc721.test.ts
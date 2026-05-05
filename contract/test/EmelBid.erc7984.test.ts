import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { deployFixture } from "./helpers/setup";

describe("EmelBid — ERC7984 (Confidential) Auctions", function () {
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
  const CONFIDENTIAL_AMOUNT = 500n; // 500 units

  async function createConfidentialAuction() {
    const { emelBid, seller, sellerAddress, mockERC7984, emelBidAddress, mockERC7984Address } = ctx;

    // Mint confidential tokens to seller
    await mockERC7984.mint(sellerAddress, CONFIDENTIAL_AMOUNT);
    
    // Set emelBid as operator on the confidential token
    const until = Math.floor(Date.now() / 1000) + 1_000_000;
    await mockERC7984.connect(seller).setOperator(emelBidAddress, BigInt(until));

    const encInput = await fhevm
      .createEncryptedInput(emelBidAddress, sellerAddress)
      .add64(ENC_START_PRICE)
      .add64(ENC_DECAY_RATE)
      .add64(ENC_RESERVE)
      .add64(CONFIDENTIAL_AMOUNT)
      .encrypt();

    const tx = await emelBid.connect(seller).createAuction(
      PUBLIC_START_PRICE,
      encInput.handles[0],
      encInput.handles[1],
      encInput.handles[2],
      encInput.handles[3],
      encInput.inputProof,
      DURATION,
      2, // Confidential (AssetType.Confidential)
      mockERC7984Address,
      CONFIDENTIAL_AMOUNT,
      CONFIDENTIAL_AMOUNT
    );
    const receipt = await tx.wait();
    const event = receipt?.logs.find(l => { try { return emelBid.interface.parseLog(l)?.name === "AuctionCreated" } catch { return false } });
    const parsed = emelBid.interface.parseLog(event!);
    return parsed!.args.auctionId;
  }

  it("should create a confidential auction and pull tokens into emelBid", async function () {
    const { emelBid, mockERC7984, seller, sellerAddress, mockERC7984Address } = ctx;

    const auctionId = await createConfidentialAuction();

    const auction = await emelBid.getAuction(auctionId);
    expect(auction.assetType).to.equal(2n);
  });

  it("should allow a bidder to place a bid", async function () {
    const { emelBid, bidder1, emelBidAddress, fundBidderWithCweth, ethToCwethUnits } = ctx;
    const auctionId = await createConfidentialAuction();

    const bidEth = ethers.parseEther("0.01");
    const bidUnits = ethToCwethUnits(bidEth);
    await fundBidderWithCweth(bidder1, bidEth * 2n);

    const encInput = await fhevm
      .createEncryptedInput(emelBidAddress, ctx.bidder1Address)
      .add64(bidUnits)
      .encrypt();

    const tx = await emelBid.connect(bidder1).placeBid(
      auctionId,
      encInput.handles[0],
      encInput.inputProof
    );
    const receipt = await tx.wait();

    const event = receipt?.logs.find((log: any) => {
      try { return emelBid.interface.parseLog(log)?.name === "DecryptionRequested"; }
      catch { return false; }
    });
    expect(event).to.not.be.undefined;
    const parsed = emelBid.interface.parseLog(event!);
    expect(parsed!.args.bidder).to.equal(ctx.bidder1Address);
  });

  it("should transfer to the winner", async function () {
    const { emelBid, bidder1, decryptor, mockERC7984, bidder1Address, fundBidderWithCweth, ethToCwethUnits, mockERC7984Address } = ctx;
    const auctionId = await createConfidentialAuction();

    const bidEth = ethers.parseEther("0.1");
    const bidUnits = ethToCwethUnits(bidEth);
    await fundBidderWithCweth(bidder1, bidEth * 2n);

    const encInput = await fhevm
      .createEncryptedInput(ctx.emelBidAddress, bidder1Address)
      .add64(bidUnits)
      .encrypt();

    let tx = await emelBid.connect(bidder1).placeBid(auctionId, encInput.handles[0], encInput.inputProof);
    let receipt = await tx.wait();
    const event = receipt?.logs.find(l => { try { return emelBid.interface.parseLog(l)?.name === "DecryptionRequested" } catch { return false } });
    const requestId = emelBid.interface.parseLog(event!)!.args.requestId;

    await emelBid.connect(decryptor).fulfillDecryption(requestId, true);

    const balHandle = await mockERC7984.connect(bidder1).confidentialBalanceOf(bidder1Address);
    const clearBal = await fhevm.userDecryptEuint(FhevmType.euint64, balHandle, mockERC7984Address, bidder1);
    expect(clearBal).to.equal(CONFIDENTIAL_AMOUNT);
  });

  it("should refund the loser", async function () {
    const { emelBid, seller, sellerAddress, bidder1, decryptor, cweth, bidder1Address, fundBidderWithCweth, ethToCwethUnits, cwethAddress, mockERC7984, mockERC7984Address } = ctx;
    const auctionId = await createConfidentialAuction();

    const bidEth = ethers.parseEther("0.001"); // 1,000 units < reserve 2,000
    const bidUnits = ethToCwethUnits(bidEth);
    await fundBidderWithCweth(bidder1, bidEth * 2n);

    const balBefore = await cweth.connect(bidder1).confidentialBalanceOf(bidder1Address);
    const clearBefore = await fhevm.userDecryptEuint(FhevmType.euint64, balBefore, cwethAddress, bidder1);

    const encInput = await fhevm
      .createEncryptedInput(ctx.emelBidAddress, bidder1Address)
      .add64(bidUnits)
      .encrypt();

    let tx = await emelBid.connect(bidder1).placeBid(auctionId, encInput.handles[0], encInput.inputProof);
    let receipt = await tx.wait();
    const event = receipt?.logs.find(l => { try { return emelBid.interface.parseLog(l)?.name === "DecryptionRequested" } catch { return false } });
    const requestId = emelBid.interface.parseLog(event!)!.args.requestId;

    const balAfter = await cweth.connect(bidder1).confidentialBalanceOf(bidder1Address);
    const clearAfter = await fhevm.userDecryptEuint(FhevmType.euint64, balAfter, cwethAddress, bidder1);
    expect(clearBefore).to.equal(clearAfter + bidUnits);

    await emelBid.connect(decryptor).fulfillDecryption(requestId, false);

    // seller GETS BACK THEIR tokens after expiry
    await ethers.provider.send("hardhat_mine", ["0x" + (DURATION + 1n).toString(16)]);
    await emelBid.connect(seller).expireAuction(auctionId);
    
    const sellerBalHandle = await mockERC7984.connect(seller).confidentialBalanceOf(sellerAddress);
    const clearSellerBal = await fhevm.userDecryptEuint(FhevmType.euint64, sellerBalHandle, mockERC7984Address, seller);
    expect(clearSellerBal).to.equal(CONFIDENTIAL_AMOUNT);
  });

  it("should allow seller to claim proceeds", async function () {
    const { emelBid, seller, bidder1, decryptor, cweth, sellerAddress, fundBidderWithCweth, ethToCwethUnits, cwethAddress, bidder1Address } = ctx;
    const auctionId = await createConfidentialAuction();

    const bidEth = ethers.parseEther("0.1");
    const bidUnits = ethToCwethUnits(bidEth);
    await fundBidderWithCweth(bidder1, bidEth * 2n);

    const encInput = await fhevm
      .createEncryptedInput(ctx.emelBidAddress, bidder1Address)
      .add64(bidUnits)
      .encrypt();

    let tx = await emelBid.connect(bidder1).placeBid(auctionId, encInput.handles[0], encInput.inputProof);
    let receipt = await tx.wait();
    const event = receipt?.logs.find(l => { try { return emelBid.interface.parseLog(l)?.name === "DecryptionRequested" } catch { return false } });
    const requestId = emelBid.interface.parseLog(event!)!.args.requestId;

    await emelBid.connect(decryptor).fulfillDecryption(requestId, true);

    expect(await emelBid.getWinner(auctionId)).to.equal(bidder1Address);


    await emelBid.connect(seller).withdrawProceeds(auctionId);

    const balAfter = await cweth.connect(seller).confidentialBalanceOf(sellerAddress);
    const clearAfter = await fhevm.userDecryptEuint(FhevmType.euint64, balAfter, cwethAddress, seller);

    expect(clearAfter).to.equal(0n + bidUnits);
  });
});

//  npx hardhat test test/EmelBid.erc7984.test.ts
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { deployFixture } from "./helpers/setup";

describe("EmelBid — ERC20 Auctions", function () {
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
  const ERC20_AMOUNT       = ethers.parseUnits("100", 18);

  async function createERC20Auction() {
    const { hook, seller, sellerAddress, mockERC20, hookAddress, mockERC20Address } = ctx;

    await mockERC20.mint(sellerAddress, ERC20_AMOUNT);
    await mockERC20.connect(seller).approve(hookAddress, ERC20_AMOUNT);

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
      0, // ERC20
      mockERC20Address,
      ERC20_AMOUNT
    );
    const receipt = await tx.wait();
    const event = receipt?.logs.find((log: any) => {
      try { return hook.interface.parseLog(log)?.name === "AuctionCreated"; }
      catch { return false; }
    });
    const parsed = hook.interface.parseLog(event!);
    return parsed!.args.auctionId;
  }

  it("should create an ERC20 auction and pull asset into hook", async function () {
    const { mockERC20, hookAddress } = ctx;
    const auctionId = await createERC20Auction();
    expect(await mockERC20.balanceOf(hookAddress)).to.equal(ERC20_AMOUNT);

    const auction = await ctx.hook.getAuction(auctionId);
    expect(auction.seller).to.equal(ctx.sellerAddress);
    expect(auction.settled).to.equal(false);
  });

  it("should allow a bidder to place a bid", async function () {
    const { hook, bidder1, hookAddress, fundBidderWithCweth, ethToCwethUnits } = ctx;
    const auctionId = await createERC20Auction();

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

  it("should settle the auction for the winner", async function () {
    const { hook, bidder1, decryptor, mockERC20, bidder1Address, fundBidderWithCweth, ethToCwethUnits } = ctx;
    const auctionId = await createERC20Auction();

    const bidEth = ethers.parseEther("0.01"); // 10,000 units > current price
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

    // Fulfill as winning
    await hook.connect(decryptor).fulfillDecryption(requestId, true);

    expect(await mockERC20.balanceOf(bidder1Address)).to.equal(ERC20_AMOUNT);
    const auction = await hook.getAuction(auctionId);
    expect(auction.settled).to.equal(true);
    expect(await hook.getWinner(auctionId)).to.equal(bidder1Address);
  });

  it("should transfer to the winner", async function () {
    const { hook, bidder1, decryptor, mockERC20, bidder1Address, fundBidderWithCweth, ethToCwethUnits } = ctx;
    const auctionId = await createERC20Auction();

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

    expect(await mockERC20.balanceOf(bidder1Address)).to.equal(ERC20_AMOUNT);
  });

  it("should refund the loser", async function () {
    const { hook, seller, sellerAddress, bidder1, decryptor, cweth, bidder1Address, fundBidderWithCweth, ethToCwethUnits, cwethAddress, mockERC20 } = ctx;
    const auctionId = await createERC20Auction();

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

    // Fulfill as losing
    await hook.connect(decryptor).fulfillDecryption(requestId, false);
    
    // seller GETS BACK THEIR erc20 TOKENS after expiry
    const sellerBalBefore = await mockERC20.connect(seller).balanceOf(sellerAddress);
    
    // Skip duration
    await ethers.provider.send("hardhat_mine", ["0x" + (DURATION + 1n).toString(16)]);
    
    await hook.connect(seller).expireAuction(auctionId);
    
    const sellerBalAfter = await mockERC20.connect(seller).balanceOf(sellerAddress);
    expect(sellerBalAfter).to.equal(sellerBalBefore + ERC20_AMOUNT);
  });

  it("should allow seller to claim proceeds", async function () {
    const { hook, seller, bidder1, decryptor, cweth, sellerAddress, fundBidderWithCweth, ethToCwethUnits, cwethAddress, bidder1Address } = ctx;
    const auctionId = await createERC20Auction();

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

//  npx hardhat test test/EmelBid.erc20.test.ts
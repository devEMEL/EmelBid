import { ethers, fhevm } from "hardhat";
import { Signer } from "ethers";
import type { EmelBid, MockERC20, MockERC721, MockERC7984, CWETH } from "../../types";

export async function deployFixture() {
  if (!fhevm.isMock) {
    throw new Error("This test suite can only run in FHEVM mock environment");
  }
  await fhevm.initializeCLIApi();

  const [deployer, seller, bidder1, bidder2, decryptor] = await ethers.getSigners();

  const deployerAddress  = await deployer.getAddress();
  const sellerAddress    = await seller.getAddress();
  const bidder1Address   = await bidder1.getAddress();
  const bidder2Address   = await bidder2.getAddress();
  const decryptorAddress = await decryptor.getAddress();

  // ── cWETH ───────────────────────────────────────────
  const CWETHFactory = await ethers.getContractFactory("CWETH", deployer);
  const cweth = await CWETHFactory.deploy() as unknown as CWETH;
  await cweth.waitForDeployment();
  const cwethAddress = await cweth.getAddress();

  // ── EmelBid ─────────────────────────────────────────
  const EmelBidFactory = await ethers.getContractFactory("EmelBid", deployer);
  const emelBid = await EmelBidFactory.deploy(cwethAddress, decryptorAddress) as unknown as EmelBid;
  await emelBid.waitForDeployment();
  const emelBidAddress = await emelBid.getAddress();

  // ── MockERC20 ───────────────────────────────────────
  const MockERC20Factory = await ethers.getContractFactory("MockERC20", deployer);
  const mockERC20 = await MockERC20Factory.deploy() as unknown as MockERC20;
  await mockERC20.waitForDeployment();
  const mockERC20Address = await mockERC20.getAddress();

  // ── MockERC721 ──────────────────────────────────────
  const MockERC721Factory = await ethers.getContractFactory("MockERC721", deployer);
  const mockERC721 = await MockERC721Factory.deploy() as unknown as MockERC721;
  await mockERC721.waitForDeployment();
  const mockERC721Address = await mockERC721.getAddress();

  // ── MockERC7984 ─────────────────────────────────────
  const MockERC7984Factory = await ethers.getContractFactory("MockERC7984", deployer);
  const mockERC7984 = await MockERC7984Factory.deploy() as unknown as MockERC7984;
  await mockERC7984.waitForDeployment();
  const mockERC7984Address = await mockERC7984.getAddress();

  /**
   * Helper — deposit ETH into cWETH for a bidder and set emelBid as operator
   */
  async function fundBidderWithCweth(bidder: Signer, ethAmount: bigint): Promise<void> {
    const bidderAddr = await bidder.getAddress();
    // deposit ETH to get cWETH
    await cweth.connect(bidder).deposit(bidderAddr, { value: ethAmount });

    // Set emelBid as operator on cWETH so emelBid can pull cWETH during placeBid
    const until = Math.floor(Date.now() / 1000) + 1_000_000;
    await cweth.connect(bidder).setOperator(emelBidAddress, BigInt(until));
  }

  const CWETH_RATE = 1_000_000_000_000n; // 1e12

  function ethToCwethUnits(ethAmount: bigint): bigint {
    return ethAmount / CWETH_RATE;
  }

  return {
    deployer, seller, bidder1, bidder2, decryptor,
    deployerAddress, sellerAddress, bidder1Address, bidder2Address, decryptorAddress,
    emelBid, cweth, mockERC20, mockERC721, mockERC7984,
    emelBidAddress, cwethAddress, mockERC20Address, mockERC721Address, mockERC7984Address,
    fundBidderWithCweth,
    ethToCwethUnits
  };
}
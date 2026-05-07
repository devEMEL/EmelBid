import { useWalletClient, useAccount, usePublicClient } from 'wagmi';
import { CONTRACTS } from '@/lib/constants';
import CWETHAbi from '@/lib/abis/CWETH.json';
import EmelBidAbi from '@/lib/abis/EmelBid.json';
import MockERC20Abi from '@/lib/abis/MockERC20.json';
import MockERC721Abi from '@/lib/abis/MockERC721.json';
import MockERC7984Abi from '@/lib/abis/MockERC7984.json';
import { parseUnits, toHex } from 'viem';
import { useFhe } from '@/components/FheProvider';
import { toast } from 'react-toastify';

export function useEmelBid() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const fhe = useFhe();

  function uint8ArrayToHex(arr: Uint8Array): `0x${string}` {
    return typeof arr === 'string' && (arr as string).startsWith('0x')
      ? (arr as string) as `0x${string}`
      : toHex(arr);
  }

  const createAuction = async (params: {
    assetType: number;
    asset: string;
    tokenIdOrAmount: string;
    publicStartPrice: string;
    encStartPrice: string;
    decayRate: string;
    reservePrice: string;
    duration: string;
  }) => {
    try {
      if (!walletClient || !address) throw new Error("Wallet not connected");
      if (!fhe) throw new Error("FHE instance not initialized");

      // 1. Encryption
      toast.info("Encrypting auction parameters...");
      console.log("Encrypting auction parameters...");

      // Yield thread to allow React to render the toast before WASM blocks it
      await new Promise(resolve => setTimeout(resolve, 100));

      const encryptedInput = await fhe
        .createEncryptedInput(CONTRACTS.EMEL_BID, address)
        .add64(parseUnits(params.encStartPrice, 6))    // encStartPrice (cWETH = 6 dec)
        .add64(BigInt(params.decayRate))               // encDecayRate
        .add64(parseUnits(params.reservePrice, 6))     // encReserve (cWETH = 6 dec)
        .add64(params.assetType === 2 ? parseUnits(params.tokenIdOrAmount, 6) : BigInt(0)) // encAmountExt (eCT = 6 dec)
        .encrypt();

      // 2. Approval & Public Arguments
      let approvalAbi;
      let approvalAmount;
      let publicTokenIdOrAmount;

      if (params.assetType === 0) {
        // ERC20: tokenIdOrAmount = amount (18 decimals)
        approvalAbi = MockERC20Abi.abi;
        approvalAmount = parseUnits(params.tokenIdOrAmount, 18);
        publicTokenIdOrAmount = approvalAmount;
      } else if (params.assetType === 1) {
        // ERC721: tokenIdOrAmount = tokenId
        approvalAbi = MockERC721Abi.abi;
        approvalAmount = BigInt(params.tokenIdOrAmount);
        publicTokenIdOrAmount = approvalAmount;
      } else {
        // Confidential: tokenIdOrAmount = 0
        approvalAbi = MockERC7984Abi.abi;
        approvalAmount = parseUnits(params.tokenIdOrAmount, 6);
        publicTokenIdOrAmount = BigInt(0);
      }

      console.log("Approving EmelBid...");
      toast.info("Approving EmelBid...");
      const approveTx = await walletClient.writeContract({
        address: params.asset as `0x${string}`,
        abi: approvalAbi,
        functionName: 'approve',
        args: [CONTRACTS.EMEL_BID, approvalAmount],
      });
      console.log("Approval TX:", approveTx);

      if (publicClient) {
        toast.info("Waiting for approval confirmation...");
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
      }

      // 3. Create Auction
      console.log("Creating Auction...");
      toast.info("Creating Auction...");

      const handles = encryptedInput.handles.map((h: Uint8Array) => uint8ArrayToHex(h));
      const inputProof = uint8ArrayToHex(encryptedInput.inputProof as unknown as Uint8Array);

      const [
        encStartPriceHandle,
        encDecayRateHandle,
        encReserveHandle,
        encAmountExtHandle
      ] = handles;


      console.log("Auction Parameters:", {
        publicStartPrice: parseUnits(params.publicStartPrice, 6),
        encStartPriceHandle,
        encDecayRateHandle,
        encReserveHandle,
        encAmountExtHandle,
        inputProof,
        duration: BigInt(params.duration),
        assetType: params.assetType,
        asset: params.asset,
        publicTokenIdOrAmount
      });

      const tx = await walletClient.writeContract({
        address: CONTRACTS.EMEL_BID as `0x${string}`,
        abi: EmelBidAbi.abi,
        functionName: 'createAuction',
        args: [
          parseUnits(params.publicStartPrice, 6), // publicStartPrice
          encStartPriceHandle,                    // encStartPrice
          encDecayRateHandle,                     // encDecayRate
          encReserveHandle,                       // encReserve
          encAmountExtHandle,                     // encAmountExt
          inputProof,                             // inputProof
          BigInt(params.duration),                // duration
          params.assetType,                       // assetType
          params.asset,                           // asset
          publicTokenIdOrAmount,                   // tokenIdOrAmount
          BigInt(0)                               // publicErc7984Amount
        ],
      });

      toast.success("Auction created successfully!");
      return tx;
    } catch (error: any) {
      console.error("Error creating auction:", error);
      toast.error(`Failed to create auction: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  const placeBid = async (auctionId: string, bidAmount: string) => {
    try {
      if (!walletClient || !address) throw new Error("Wallet not connected");
      if (!fhe) throw new Error("FHE instance not initialized");

      toast.info("Encrypting bid amount...");

      // Yield thread to allow React to render the toast before WASM blocks it
      await new Promise(resolve => setTimeout(resolve, 100));

      // 1. Encryption
      const encryptedInput = await fhe
        .createEncryptedInput(CONTRACTS.EMEL_BID, address)
        .add64(parseUnits(bidAmount, 6)) // CWETH has 6 decimals
        .encrypt();

      const encBidExtHandle = uint8ArrayToHex(encryptedInput.handles[0]);
      const inputProof = uint8ArrayToHex(encryptedInput.inputProof as unknown as Uint8Array);

      const until = BigInt(Math.floor(Date.now() / 1000) + 3000);

      // 2. Approval
      toast.info("Approving CWETH...");
      const approveTx = await walletClient.writeContract({
        address: CONTRACTS.CWETH as `0x${string}`,
        abi: CWETHAbi.abi,
        functionName: 'setOperator',
        args: [CONTRACTS.EMEL_BID, until],
      });

      if (publicClient) {
        toast.info("Waiting for approval confirmation...");
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
      }

      // 3. Place Bid
      toast.info("Placing Encrypted Bid...");
      const tx = await walletClient.writeContract({
        address: CONTRACTS.EMEL_BID as `0x${string}`,
        abi: EmelBidAbi.abi,
        functionName: 'placeBid',
        args: [
          auctionId as `0x${string}`,
          encBidExtHandle,
          inputProof
        ],
      });

      toast.success("Bid placed successfully!");
      return tx;
    } catch (error: any) {
      console.error("Error placing bid:", error);
      toast.error(`Failed to place bid: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  const expireAuction = async (auctionId: string) => {
    try {
      if (!walletClient || !address) throw new Error("Wallet not connected");
      toast.info("Expiring auction and withdrawing asset...");
      const tx = await walletClient.writeContract({
        address: CONTRACTS.EMEL_BID as `0x${string}`,
        abi: EmelBidAbi.abi,
        functionName: 'expireAuction',
        args: [auctionId as `0x${string}`],
      });
      toast.success("Auction expired successfully!");
      return tx;
    } catch (error: any) {
      console.error("Error expiring auction:", error);
      toast.error(`Failed to expire auction: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  const withdrawProceeds = async (auctionId: string) => {
    try {
      if (!walletClient || !address) throw new Error("Wallet not connected");
      toast.info("Withdrawing auction proceeds...");
      const tx = await walletClient.writeContract({
        address: CONTRACTS.EMEL_BID as `0x${string}`,
        abi: EmelBidAbi.abi,
        functionName: 'withdrawProceeds',
        args: [auctionId as `0x${string}`],
      });
      toast.success("Proceeds withdrawn successfully!");
      return tx;
    } catch (error: any) {
      console.error("Error withdrawing proceeds:", error);
      toast.error(`Failed to withdraw proceeds: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  const getWinner = async (auctionId: string) => {
    try {
      if (!publicClient) return "0x0000000000000000000000000000000000000000";
      const winner = await publicClient.readContract({
        address: CONTRACTS.EMEL_BID as `0x${string}`,
        abi: EmelBidAbi.abi,
        functionName: 'auctionWinner',
        args: [auctionId as `0x${string}`],
      });
      return winner as string;
    } catch (error) {
      console.error("Error getting winner:", error);
      return "0x0000000000000000000000000000000000000000";
    }
  };

  const getWinningBidDetails = async (auctionId: string) => {
    try {
      if (!publicClient) throw new Error("Public client not available");
      if (!fhe) throw new Error("FHE instance not initialized");

      // 1. Get the winning request ID
      const winningReqId = await publicClient.readContract({
        address: CONTRACTS.EMEL_BID as `0x${string}`,
        abi: EmelBidAbi.abi,
        functionName: 'winningRequestId',
        args: [auctionId as `0x${string}`],
      }) as bigint;


      // 2. Get the decryption request (isWinning handle, bidder, bidAmount handle, auctionId)
      const [isWinningHandle, bidder, bidAmountHandle, reqAuctionId] = await publicClient.readContract({
        address: CONTRACTS.EMEL_BID as `0x${string}`,
        abi: EmelBidAbi.abi,
        functionName: 'getDecryptionRequest',
        args: [winningReqId],
      }) as [any, any, any, any];

      // 3. Public decrypt the handles using fhe.publicDecrypt
      const results = await fhe.publicDecrypt([isWinningHandle, bidAmountHandle]);

      const decryptedIsWinning = results.values[isWinningHandle];
      const decryptedBidAmount = results.values[bidAmountHandle];

      return {
        requestId: winningReqId,
        bidder,
        auctionId: reqAuctionId,
        isWinning: decryptedIsWinning,
        bidAmount: decryptedBidAmount,
        decryptionProof: results.decryptionProof,
      };
    } catch (error: any) {
      console.error("Error getting winning bid details:", error);
      return null;
    }
  };

  return { createAuction, placeBid, expireAuction, withdrawProceeds, getWinner, getWinningBidDetails };
}

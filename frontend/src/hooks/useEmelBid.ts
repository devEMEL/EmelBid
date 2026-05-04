import { useWalletClient, useAccount, usePublicClient } from 'wagmi';
import { CONTRACTS } from '@/lib/constants';
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
          publicTokenIdOrAmount                   // tokenIdOrAmount
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

  return { createAuction };
}

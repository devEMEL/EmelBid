// import { useState } from 'react';
// import { useWalletClient, useAccount } from 'wagmi';
// import { parseEther, parseUnits } from 'viem';
// import { CONTRACTS } from '@/lib/constants';
// import MockERC20Abi from '@/lib/abis/MockERC20.json';
// import MockERC721Abi from '@/lib/abis/MockERC721.json';
// import MockERC7984Abi from '@/lib/abis/MockERC7984.json';
// import { Coins, Image as ImageIcon, ShieldCheck, Loader2 } from 'lucide-react';

// export default function TestingTools() {
//   const { address } = useAccount();
//   const { data: walletClient } = useWalletClient();
//   const [loading, setLoading] = useState<string | null>(null);

//   const mintERC20 = async () => {
//     if (!walletClient || !address) return;
//     setLoading('erc20');
//     try {
//       const hash = await walletClient.writeContract({
//         address: CONTRACTS.NBL as `0x${string}`,
//         abi: MockERC20Abi.abi,
//         functionName: 'mint',
//         args: [address, parseEther('1000')],
//       });
//       console.log('Minted 1000 NBL:', hash);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(null);
//     }
//   };

//   const mintNFT = async () => {
//     if (!walletClient || !address) return;
//     setLoading('nft');
//     try {
//       // User's requested metadata
//       const metadata = {
//           name: "Bored Ape",
//           description: "Bored Ape Yacht Club is a collection of 10,000 unique digital apes living on the Ethereum blockchain.",
//           image: "ipfs://bafkreiatjyx5hkzw4iciwuoj24yz56mng6ls2e6thcowhv4357p742asm4",
//       };
      
//       let tokenURI = "ipfs://bafkreiatjyx5hkzw4iciwuoj24yz56mng6ls2e6thcowhv4357p742asm4";
      
//       try {
//         const { getTokenURI } = await import('@/lib/ipfs');
//         tokenURI = await getTokenURI(metadata);
//       } catch (e) {
//         console.warn("Pinata upload failed or not configured, using fallback URI");
//       }

//       const hash = await walletClient.writeContract({
//         address: CONTRACTS.MOCK_ERC721 as `0x${string}`,
//         abi: MockERC721Abi.abi,
//         functionName: 'safeMint',
//         args: [address, tokenURI],
//       });
//       console.log('Minted NFT:', hash);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(null);
//     }
//   };

//   const mintERC7984 = async () => {
//     if (!walletClient || !address) return;
//     setLoading('erc7984');
//     try {
//       const hash = await walletClient.writeContract({
//         address: CONTRACTS.MOCK_ERC7984 as `0x${string}`,
//         abi: MockERC7984Abi.abi,
//         functionName: 'mint',
//         args: [address, parseUnits('1', 6)],
//       });
//       console.log('Minted Private Asset:', hash);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(null);
//     }
//   };

//   return (
//     <div className="flex flex-wrap gap-3 mt-8">
//       <button 
//         onClick={mintERC20}
//         disabled={!!loading}
//         className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-sm text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white"
//       >
//         {loading === 'erc20' ? <Loader2 size={12} className="animate-spin" /> : <Coins size={12} />}
//         Mint 1000 NBL
//       </button>
//       <button 
//         onClick={mintNFT}
//         disabled={!!loading}
//         className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-sm text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white"
//       >
//         {loading === 'nft' ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
//         Mint Bored Ape
//       </button>
//       <button 
//         onClick={mintERC7984}
//         disabled={!!loading}
//         className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-sm text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white"
//       >
//         {loading === 'erc7984' ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
//         Mint Confidential Token (100k Tokens)
//       </button>
//     </div>
//   );
// }

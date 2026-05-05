"use client";

import { useState } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { toast } from 'react-toastify';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { CONTRACTS } from '@/lib/constants';
import MockERC20Abi from '@/lib/abis/MockERC20.json';
import MockERC721Abi from '@/lib/abis/MockERC721.json';
import MockERC7984Abi from '@/lib/abis/MockERC7984.json';
import CWETHAbi from '@/lib/abis/CWETH.json';
import { Coins, Image as ImageIcon, ShieldCheck, Droplets, Loader2, ChevronRight, ExternalLink } from 'lucide-react';

export default function FaucetPage() {
  const { address } = useAccount();
  const { data: wagmiWalletClient } = useWalletClient();
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [loading, setLoading] = useState<string | null>(null);
  const [cwethAmount, setCwethAmount] = useState('0.1');

  const faucetAssets = [
    {
      id: 'cweth',
      name: 'Wrapped ETH (CWETH)',
      symbol: 'CWETH',
      desc: 'Canonical Wrapped ETH for Sepolia. Minted by depositing raw Sepolia ETH.',
      icon: Droplets,
      color: 'text-blue-400',
      action: 'Wrap ETH',
      hasInput: true,
      inputValue: cwethAmount,
      onInputChange: (val: string) => setCwethAmount(val),
      fn: async (client: any, userAddress: any) => {
        return await client.writeContract({
          address: CONTRACTS.CWETH as `0x${string}`,
          abi: CWETHAbi.abi,
          functionName: 'deposit',
          args: [userAddress],
          value: parseEther(cwethAmount),
        });
      }
    },
    {
      id: 'erc20',
      name: 'EmelToken (NBL)',
      symbol: 'NBL',
      desc: 'Native utility token for EmelBid marketplace testing.',
      icon: Coins,
      color: 'text-primary',
      action: 'Mint 100k NBL',
      fn: async (client: any, userAddress: any) => {
        return await client.writeContract({
          address: CONTRACTS.NBL as `0x${string}`,
          abi: MockERC20Abi.abi,
          functionName: 'mint',
          args: [userAddress, parseEther('100000')],
        });
      }
    },
    {
      id: 'nft',
      name: 'Bored Ape Yacht Club',
      symbol: 'BAYC',
      desc: 'Unique digital collectibles. Mints a mock Bored Ape with IPFS metadata.',
      icon: ImageIcon,
      color: 'text-purple-400',
      action: 'Safe Mint NFT',
      fn: async (client: any, userAddress: any) => {
        const tokenURI = "ipfs://bafkreicii2htwqeqec6hyegzypw5mbweimcq7cszpiwsdstxuzkcd23ktm";
        console.log("Resulting TokenURI:", tokenURI);

        return await client.writeContract({
          address: CONTRACTS.MOCK_ERC721 as `0x${string}`,
          abi: MockERC721Abi.abi,
          functionName: 'mint',
          args: [tokenURI],
        });
      }
    },
    {
      id: 'erc7984',
      name: 'Emel Confidential Token',
      symbol: 'eCT',
      desc: 'Experimental private shared asset using the ERC7984 standard on fhEVM.',
      icon: ShieldCheck,
      color: 'text-amber-500',
      action: 'Mint 100k eCT',
      fn: async (client: any, userAddress: any) => {
        return await client.writeContract({
          address: CONTRACTS.MOCK_ERC7984 as `0x${string}`,
          abi: MockERC7984Abi.abi,
          functionName: 'mint',
          args: [userAddress, parseUnits("100000", 6)], // decimals 6 but mint takes uint64 for the math
        });
      }
    }
  ];

  const handleAction = async (asset: any) => {
    if (!authenticated) {
      toast.info("Please login with Privy first");
      login();
      return;
    }

    // Resolve the best active client and address
    let activeClient = wagmiWalletClient;
    let activeAddress = address;

    if (!activeClient && wallets.length > 0) {
      console.log("Using Privy wallet fallback...");
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      
      // Ensure we are on Sepolia if using Privy fallback
      if (parseInt(wallet.chainId.split(':')[1]) !== sepolia.id) {
        try {
          await wallet.switchChain(sepolia.id);
        } catch (e) {
          toast.error("Please switch your wallet to Sepolia");
          return;
        }
      }

      activeClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: sepolia,
        transport: custom(provider)
      });
      activeAddress = address;
    }

    if (!activeAddress || !activeClient) {
      toast.error("Wallet connection in progress. If you just logged in, please wait 2 seconds.");
      console.error("Connection Debug:", { authenticated, address, wagmiReady: !!wagmiWalletClient, privyWallets: wallets.length });
      return;
    }

    // Verify chain for Wagmi client as well
    const currentChainId = await activeClient.getChainId();
    if (currentChainId !== sepolia.id) {
      toast.info("Switching to Sepolia...");
      try {
        if (wagmiWalletClient) {
          const { switchChain } = await import('@wagmi/core');
          const { wagmiConfig } = await import('@/components/Providers');
          // @ts-ignore
          await switchChain(wagmiConfig, { chainId: sepolia.id });
        } else {
           const wallet = wallets[0];
           await wallet.switchChain(sepolia.id);
        }
      } catch (e) {
        toast.error("Please switch your wallet network to Sepolia.");
        return;
      }
    }

    setLoading(asset.id);
    const toastId = toast.loading(`Requesting ${asset.symbol}...`);
    try {
      const hash = await asset.fn(activeClient, activeAddress);
      toast.update(toastId, { 
        render: `${asset.symbol} request successful!`, 
        type: "success", 
        isLoading: false, 
        autoClose: 5000 
      });
      console.log(`${asset.symbol} TX:`, hash);
    } catch (e: any) {
      console.error(e);
      toast.update(toastId, { 
        render: `Failed: ${e.shortMessage || e.message}`, 
        type: "error", 
        isLoading: false, 
        autoClose: 5000 
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pt-20 pb-40 px-6 max-w-5xl mx-auto relative z-10">
      <div className="fixed top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="mb-16 space-y-4">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
          Market Faucet
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 max-w-xl">
          Acquire test assets for the Sepolia environment.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faucetAssets.map((asset) => {
          const Icon = asset.icon;
          const isProcessing = loading === asset.id;
          
          return (
            <div key={asset.id} className="glass-morphism bg-white/[0.01] border border-white/5 p-8 flex flex-col justify-between hover:border-white/10 transition-all group relative overflow-hidden">
               <Icon size={120} className={`absolute -right-8 -bottom-8 opacity-[0.02] transform rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6 ${asset.color}`} />
               
               <div className="space-y-6">
                 <div className={`w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded-xl transition-colors group-hover:bg-white/10 ${asset.color}`}>
                   <Icon size={24} />
                 </div>
                 
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{asset.name}</h3>
                     <span className="text-[9px] font-black px-2 py-0.5 bg-white/5 text-white/40 rounded uppercase tracking-wider">{asset.symbol}</span>
                   </div>
                   <p className="text-[10px] font-bold text-white/30 leading-relaxed uppercase tracking-widest">{asset.desc}</p>
                 </div>

                 {asset.hasInput && (
                   <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                     <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Amount</label>
                     <input 
                       type="text"
                       value={asset.inputValue}
                       onChange={(e) => asset.onInputChange?.(e.target.value)}
                       className="w-full bg-white/[0.03] border border-white/5 py-4 px-6 text-xl font-black text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                       placeholder="0.0"
                     />
                   </div>
                 )}
               </div>

               <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                 <button 
                  onClick={() => handleAction(asset)}
                  disabled={!!loading}
                  className="bg-white text-black px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isProcessing ? <Loader2 size={14} className="animate-spin" /> : asset.action}
                   <ChevronRight size={14} />
                 </button>
                 
                 <div className="flex items-center gap-2 text-[9px] font-black text-white/10 group-hover:text-white/20 transition-colors uppercase tracking-widest">
                   <span>Sepolia</span>
                   <ExternalLink size={10} />
                 </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

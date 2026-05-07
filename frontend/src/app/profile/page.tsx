import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, Copy, Lock, Unlock } from 'lucide-react';
import { useAccount, useReadContract, useSignTypedData } from 'wagmi';
import { parseAbi, formatUnits } from 'viem';
import { CONTRACTS } from '@/lib/constants';
import { fetchUserAuctions } from '@/lib/subgraph';
import { useFhe } from '@/components/FheProvider';
import ListingImage from '@/components/ListingImage';
import { Network, Alchemy } from 'alchemy-sdk';
import { toast } from 'react-toastify';

const alchemy = new Alchemy({
  apiKey: "TajhoIdNGy7RFjvAjEMca",
  network: Network.ETH_SEPOLIA,
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const fheInstance = useFhe();
  const { signTypedDataAsync } = useSignTypedData();

  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'auctions'>('tokens');
  
  const [cwethValue, setCwethValue] = useState<string>('****');
  const [ectValue, setEctValue] = useState<string>('****');
  const [decryptingCweth, setDecryptingCweth] = useState(false);
  const [decryptingEct, setDecryptingEct] = useState(false);

  const [nfts, setNfts] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  
  const { data: nblBalance } = useReadContract({
    address: CONTRACTS.NBL as `0x${string}`,
    abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  const { data: cwethHandle } = useReadContract({
    address: CONTRACTS.CWETH as `0x${string}`,
    abi: parseAbi(['function confidentialBalanceOf(address) view returns (uint256)']),
    functionName: 'confidentialBalanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  const { data: ectHandle } = useReadContract({
    address: CONTRACTS.MOCK_ERC7984 as `0x${string}`,
    abi: parseAbi(['function confidentialBalanceOf(address) view returns (uint256)']),
    functionName: 'confidentialBalanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  useEffect(() => {
    if (!address) return;
    
    async function loadData() {
      // Load NFTs
      try {
         const nftsData = await alchemy.nft.getNftsForOwner(address as string);
         setNfts(nftsData.ownedNfts);
      } catch(e) { console.error(e) }
      
      // Load Auctions
      const userData = await fetchUserAuctions(address as string);
      setAuctions(userData);
    }
    loadData();
  }, [address]);

  const handleDecryptCweth = async () => {
    if (!fheInstance || !address || cwethHandle === undefined) return;
    if (cwethHandle === 0n) {
        setCwethValue('0');
        return;
    }
    setDecryptingCweth(true);
    try {
        const keypair = fheInstance.generateKeypair();
        const contractAddresses = [CONTRACTS.CWETH];
        const hexHandle = `0x${cwethHandle.toString(16).padStart(64, '0')}`;
        const handleContractPairs = [{ handle: hexHandle, contractAddress: CONTRACTS.CWETH }];
        
        const startTimeStamp = Math.floor(Date.now() / 1000);
        const durationDays = 1;
        
        const eip712 = fheInstance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
        const signature = await signTypedDataAsync({
          domain: eip712.domain as any, types: { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification } as any, primaryType: 'UserDecryptRequestVerification', message: eip712.message as any,
        });
        const cleanSig = signature.startsWith("0x") ? signature.slice(2) : signature;
        
        const results = await fheInstance.userDecrypt(handleContractPairs, keypair.privateKey, keypair.publicKey, cleanSig, contractAddresses, address, Number(startTimeStamp), Number(durationDays));
        
        if (results[hexHandle] !== undefined) setCwethValue(formatUnits(BigInt(results[hexHandle].toString()), 6));
        else if (cwethValue === '****') setCwethValue('0');
    } catch(e) { console.error("Decryption failed", e); }
    setDecryptingCweth(false);
  };

  const handleDecryptEct = async () => {
    if (!fheInstance || !address || ectHandle === undefined) return;
    if (ectHandle === 0n) {
        setEctValue('0');
        return;
    }
    setDecryptingEct(true);
    try {
        const keypair = fheInstance.generateKeypair();
        const contractAddresses = [CONTRACTS.MOCK_ERC7984];
        const hexHandle = `0x${ectHandle.toString(16).padStart(64, '0')}`;
        const handleContractPairs = [{ handle: hexHandle, contractAddress: CONTRACTS.MOCK_ERC7984 }];
        
        const startTimeStamp = Math.floor(Date.now() / 1000);
        const durationDays = 1;
        
        const eip712 = fheInstance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
        const signature = await signTypedDataAsync({
          domain: eip712.domain as any, types: { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification } as any, primaryType: 'UserDecryptRequestVerification', message: eip712.message as any,
        });
        const cleanSig = signature.startsWith("0x") ? signature.slice(2) : signature;
        
        const results = await fheInstance.userDecrypt(handleContractPairs, keypair.privateKey, keypair.publicKey, cleanSig, contractAddresses, address, Number(startTimeStamp), Number(durationDays));
        
        if (results[hexHandle] !== undefined) setEctValue(formatUnits(BigInt(results[hexHandle].toString()), 6));

        else if (ectValue === '****') setEctValue('0');
    } catch(e) { console.error("Decryption failed", e); }
    setDecryptingEct(false);
  };

  if (!address) {
      return (
          <div className="pt-20 pb-40 px-6 max-w-4xl mx-auto flex flex-col items-center relative z-10 text-center">
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Connect Wallet</h1>
             <p className="text-white/40 uppercase tracking-widest text-xs">Please connect your wallet to view your profile.</p>
          </div>
      )
  }

  const cleanNbl = nblBalance ? formatUnits(nblBalance as bigint, 18) : "0";

  return (
    <div className="pt-8 pb-40 px-6 max-w-4xl mx-auto flex flex-col items-center relative z-10">
      
      {/* Hero Section */}
      <section className="w-full text-center mb-16">
        <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">My Profile</span>
        <div className="flex items-center justify-center gap-4 bg-white/[0.02] border border-white/5 py-4 px-8 rounded-full w-fit mx-auto">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-emerald-500 p-0.5">
                <div className="w-full h-full bg-black rounded-full" />
            </div>
            <div 
                className="flex items-center gap-3 cursor-pointer group/copy" 
                onClick={() => { navigator.clipboard.writeText(address); toast.success("Address copied!"); }}
            >
                <h1 className="text-xl font-black tracking-widest text-white uppercase font-mono group-hover/copy:text-primary transition-colors">
                    {address.substring(0, 6)}...{address.substring(address.length - 4)}
                </h1>
                <Copy size={14} className="text-white/20 group-hover/copy:text-primary transition-colors" />
            </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-white/[0.03] rounded-full mb-12 shadow-inner border border-white/5 backdrop-blur-md">
        <button 
          onClick={() => setActiveTab('tokens')}
          className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
            activeTab === 'tokens' ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10' : 'text-white/40 hover:text-white'
          }`}
        >
          Tokens
        </button>
        <button 
          onClick={() => setActiveTab('nfts')}
          className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
            activeTab === 'nfts' ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10' : 'text-white/40 hover:text-white'
          }`}
        >
          Owned NFTs
        </button>
        <button 
          onClick={() => setActiveTab('auctions')}
          className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
            activeTab === 'auctions' ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10' : 'text-white/40 hover:text-white'
          }`}
        >
          My Auctions
        </button>
      </div>

      {/* Content */}
      <div className="w-full">
        {activeTab === 'tokens' ? (
          <div className="space-y-6">


              {/* NBL (Public) */}
              <div className="group bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] p-8 rounded-lg transition-all duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#FFD217]/20 rounded-full flex items-center justify-center p-3 text-primary font-black">NBL</div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                          NBL Token
                          <span className="bg-white/10 text-white/50 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Public</span>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-white/40 text-[10px] font-black tracking-[0.2em] uppercase">ERC20</p>
                        <span className="text-white/20 text-[10px]">|</span>
                        <p className="text-white/40 text-[10px] font-mono hover:text-primary transition-colors cursor-pointer flex items-center gap-1" onClick={() => { navigator.clipboard.writeText(CONTRACTS.NBL); toast.success("Contract copied!"); }}>
                            {CONTRACTS.NBL.substring(0,6)}...{CONTRACTS.NBL.substring(38)}
                            <Copy size={10} />
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white tracking-tight">{cleanNbl}</p>
                  </div>
                </div>
              </div>

              {/* CWETH (Confidential) */}
              <div className="group bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] p-8 rounded-lg transition-all duration-500 relative overflow-hidden ring-1 ring-primary/10 hover:ring-primary/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center p-3 text-blue-400 font-black relative overflow-hidden">
                        <ShieldCheck size={24} className="absolute opacity-20" />
                        CWETH
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                          Confidential WETH
                          <span className="bg-primary/20 text-primary text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1"><Lock size={10} /> FHE Encrypted</span>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-white/40 text-[10px] font-black tracking-[0.2em] uppercase">CWETH</p>
                        <span className="text-white/20 text-[10px]">|</span>
                        <p className="text-white/40 text-[10px] font-mono hover:text-primary transition-colors cursor-pointer flex items-center gap-1" onClick={() => { navigator.clipboard.writeText(CONTRACTS.CWETH); toast.success("Contract copied!"); }}>
                            {CONTRACTS.CWETH.substring(0,6)}...{CONTRACTS.CWETH.substring(38)}
                            <Copy size={10} />
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6 justify-end">
                    {cwethValue === '****' && (
                        <button onClick={handleDecryptCweth} disabled={decryptingCweth} className="bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-primary hover:text-black transition-all">
                            {decryptingCweth ? <Loader2 className="animate-spin" size={12} /> : <Unlock size={12} />}
                            {decryptingCweth ? 'Decrypting...' : 'Decrypt'}
                        </button>
                    )}
                    <p className={`text-2xl font-black tracking-tight w-24 text-right ${cwethValue === '****' ? 'text-white/20' : 'text-primary'}`}>{cwethValue} CWETH</p>
                  </div>
                </div>
              </div>

              {/* eCT (Confidential MockERC7984) */}
              <div className="group bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] p-8 rounded-lg transition-all duration-500 relative overflow-hidden ring-1 ring-primary/10 hover:ring-primary/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center p-3 text-emerald-400 font-black relative overflow-hidden">
                        <ShieldCheck size={24} className="absolute opacity-20" />
                        eCT
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                          Emel Confidential Token
                          <span className="bg-primary/20 text-primary text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1"><Lock size={10} /> FHE Encrypted</span>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-white/40 text-[10px] font-black tracking-[0.2em] uppercase">MockERC7984</p>
                        <span className="text-white/20 text-[10px]">|</span>
                        <p className="text-white/40 text-[10px] font-mono hover:text-primary transition-colors cursor-pointer flex items-center gap-1" onClick={() => { navigator.clipboard.writeText(CONTRACTS.MOCK_ERC7984); toast.success("Contract copied!"); }}>
                            {CONTRACTS.MOCK_ERC7984.substring(0,6)}...{CONTRACTS.MOCK_ERC7984.substring(38)}
                            <Copy size={10} />
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6 justify-end">
                    {ectValue === '****' && (
                        <button onClick={handleDecryptEct} disabled={decryptingEct} className="bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-primary hover:text-black transition-all">
                            {decryptingEct ? <Loader2 className="animate-spin" size={12} /> : <Unlock size={12} />}
                            {decryptingEct ? 'Decrypting...' : 'Decrypt'}
                        </button>
                    )}
                    <p className={`text-2xl font-black tracking-tight w-24 text-right ${ectValue === '****' ? 'text-white/20' : 'text-primary'}`}>{ectValue} eCT</p>
                  </div>
                </div>
              </div>

          </div>
        ) : activeTab === 'nfts' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
             {nfts.length === 0 ? (
                 <div className="col-span-full p-20 text-center text-white/20 font-black uppercase text-xs tracking-widest opacity-50 border border-dashed border-white/5">
                   No NFTs found in wallet
                 </div>
             ) : (
                nfts.map((nft, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden group">
                        <div className="aspect-square bg-black p-4 relative flex items-center justify-center">
                           <ListingImage assetType={1} asset={nft.contract.address} tokenIdOrAmount={nft.tokenId} className="w-full h-full object-contain" />
                        </div>
                        <div className="p-4 border-t border-white/5">
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{nft.contract.name || 'Unknown Collection'}</p>
                           <p className="text-white font-black tracking-tight uppercase truncate">{nft.title || `Token #${nft.tokenId}`}</p>
                        </div>
                    </div>
                ))
             )}
          </div>
        ) : (
           <div className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
             <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1fr] gap-4 px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 bg-white/[0.02]">
               <div>Auction ID</div>
               <div>Asset</div>
               <div>Duration</div>
               <div className="text-right">Status</div>
             </div>
             <div className="divide-y divide-white/5">
               {auctions.length === 0 ? (
                    <div className="p-20 text-center text-white/20 font-black uppercase text-xs tracking-widest opacity-50">
                        No Auctions Created
                    </div>
               ) : (
                   auctions.map((a: any) => (
                    <div 
                        key={a.id} 
                        onClick={() => navigate(`/auctions/${a.id}`)}
                        className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_1fr] gap-4 px-8 py-7 items-center hover:bg-white/[0.03] transition-all group cursor-pointer"
                    >
                        <div className="font-mono text-xs text-white uppercase group-hover:text-primary transition-colors">
                            {a.id.substring(0, 10)}...
                        </div>
                        <div className="flex items-center gap-3 font-black text-xs text-white">
                            <ListingImage assetType={Number(a.assetType)} asset={a.asset} tokenIdOrAmount={a.tokenIdOrAmount} className="w-8 h-8 rounded-md" />
                            <span className="truncate max-w-[120px]">{a.asset}</span>
                        </div>
                        <div className="font-black text-xs text-white/60 uppercase">
                            {a.duration} BLKS
                        </div>
                        <div className="text-right flex justify-end">
                            <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${a.settled ? 'bg-emerald-500/20 text-emerald-400' : (a.expired ? 'bg-white/10 text-white/40' : 'bg-primary/20 text-primary animate-pulse')}`}>
                                {a.settled ? 'Settled' : (a.expired ? 'Expired' : 'Active')}
                            </span>
                        </div>
                    </div>
                   ))
               )}
             </div>
           </div>
        )}
      </div>
    </div>
  );
}

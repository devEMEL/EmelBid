import { useState, useMemo } from 'react';
import { Info, Image as ImageIcon, Coins, ShieldCheck, ChevronRight, Check, Search, Loader2 } from 'lucide-react';
import { useNFTs } from '@/hooks/useNFTs';
import { useEmelBid } from '@/hooks/useEmelBid';
import { toast } from 'react-toastify';

type AssetType = 'erc20' | 'nft' | 'erc7984'; 


export default function CreateAuctionPage() {
  const [assetType, setAssetType] = useState<AssetType>('erc20');
  const { nfts, loading: nftsLoading } = useNFTs();
  const { createAuction } = useEmelBid();
  const [selectedNFT, setSelectedNFT] = useState<any>(null);

  // Log NFT tokenURIs for debugging
  // useMemo(() => {
  //   if (nfts.length > 0) {
  //     console.log("Vault NFTs Loaded:", nfts.map(n => ({ id: n.tokenId, uri: n.tokenUri })));
  //   }
  // }, [nfts]);

  const [contractAddress, setContractAddress] = useState('');
  const [amountOrId, setAmountOrId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Auction Params
  const [startPrice, setStartPrice] = useState('0.01');
  const [encStartPrice, setEncStartPrice] = useState('0.03');
  const [decayRate, setDecayRate] = useState('20');
  const [reservePrice, setReservePrice] = useState('0.01');
  const [duration, setDuration] = useState('3600');

  const assetTypes = [
    { id: 'nft', label: 'NFT (ERC721)', icon: ImageIcon, desc: 'Unique Digital Collectibles' },
    { id: 'erc20', label: 'Tokens (ERC20)', icon: Coins, desc: 'Fungible Digital Assets' },
    { id: 'erc7984', label: 'Private (ERC7984)', icon: ShieldCheck, desc: 'Confidential Shared Assets' },
  ];

  const handleInitialize = async () => {
    if (!contractAddress || !amountOrId) {
      toast.error("Please fill in all asset details");
      return;
    }
    setLoading(true);
    const id = toast.loading("Initializing Encrypted Auction...");
    try {
      const tx = await createAuction({
        assetType: assetType === 'erc20' ? 0 : assetType === 'nft' ? 1 : 2,
        asset: contractAddress,
        tokenIdOrAmount: amountOrId,
        publicStartPrice: startPrice,
        encStartPrice: encStartPrice,
        decayRate: decayRate,
        reservePrice: reservePrice,
        duration: duration
      });
      console.log("Auction Created:", tx);
      toast.update(id, { render: "Auction Created Successfully!", type: "success", isLoading: false, autoClose: 5000 });
    } catch (e: any) {
      console.error(e);
      toast.update(id, { render: `Failed: ${e.message}`, type: "error", isLoading: false, autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center px-6 pt-12 pb-40 relative">
      {/* Background Decor */}
      <div className="fixed top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 relative z-10">
        
        {/* Left Side: Asset Selection */}
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">New Auction</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Select an asset to list on the encrypted marketplace.</p>
          </div>

          {/* Asset Type Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {assetTypes.map((type) => {
              const Icon = type.icon;
              const isActive = assetType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setAssetType(type.id as AssetType)}
                  className={`flex flex-col items-center justify-center p-6 border transition-all text-center group ${
                    isActive 
                    ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,210,23,0.1)]' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-primary' : 'text-white/20 group-hover:text-white/40'} />
                  <span className={`text-[9px] font-black uppercase tracking-widest mt-3 ${isActive ? 'text-white' : 'text-white/20'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="glass-morphism bg-white/[0.01] border border-white/5 p-8 space-y-8">
            {assetType === 'nft' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Assets</label>
                  {nftsLoading && <Loader2 size={12} className="animate-spin text-primary" />}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {nftsLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="aspect-square bg-white/[0.02] animate-pulse"></div>
                    ))
                  ) : nfts.length > 0 ? (
                    nfts.map((nft: any) => (
                      <button
                        key={`${nft.contract.address}-${nft.tokenId}`}
                        onClick={() => {
                          console.log("Selected NFT TokenURI:", nft.tokenUri);
                          setSelectedNFT(nft);
                          setContractAddress(nft.contract.address);
                          setAmountOrId(nft.tokenId);
                        }}
                        className={`aspect-square relative group overflow-hidden border transition-all ${
                          selectedNFT?.tokenId === nft.tokenId && selectedNFT?.contract.address === nft.contract.address
                          ? 'border-primary' 
                          : 'border-white/5 hover:border-white/20'
                        }`}
                      >
                        <img 
                          src={nft.image?.cachedUrl || nft.image?.originalUrl || "https://placehold.co/400x400/000000/FFFFFF?text=NFT"} 
                          alt={nft.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[8px] font-black text-white uppercase tracking-widest">Select #{nft.tokenId}</span>
                        </div>
                        {selectedNFT?.tokenId === nft.tokenId && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-primary flex items-center justify-center">
                            <Check size={10} className="text-black" />
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-20 border border-dashed border-white/10">
                      <ImageIcon size={32} className="mb-4" />
                      <p className="text-[9px] font-black uppercase tracking-widest">No NFTs found on Sepolia</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Contract Configuration</label>
                  <div className="bg-white/[0.02] border border-white/5 p-6 space-y-4">
                    <div className="space-y-2">
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/10">Asset Address</span>
                       <input 
                        type="text"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-primary transition-all font-mono text-xs text-white"
                       />
                    </div>
                    <div className="space-y-2">
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/10">
                         {assetType === 'erc20' ? 'Amount (Tokens)' : 'Private Amount (eCT)'}
                       </span>
                       <input 
                        type="text"
                        value={amountOrId}
                        onChange={(e) => setAmountOrId(e.target.value)}
                        placeholder={assetType === 'erc20' ? '1.0' : '100.0'}
                        className="w-full bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-primary transition-all font-mono text-xs text-white"
                       />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Right Side: Auction Parameters */}
        <div className="space-y-6">
           
          <div className="glass-morphism bg-white/[0.01] border border-white/5 p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                <span className="text-white/20">Public Price</span>
                <span className="text-primary italic">Public</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 flex items-center justify-between">
                <input 
                  type="text" 
                  value={startPrice}
                  onChange={(e) => setStartPrice(e.target.value)}
                  className="bg-transparent border-none p-0 text-3xl font-black text-white focus:ring-0 focus:outline-none w-full"
                />
                <span className="text-[10px] font-black text-white/20 ml-2 uppercase">CWETH</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                <span className="text-white/20">Encrypted Start Price</span>
                <span className="text-amber-500 italic flex items-center gap-1">
                  <ShieldCheck size={10} />
                  Encrypted
                </span>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 flex items-center justify-between">
                <input 
                  type="text" 
                  value={encStartPrice}
                  onChange={(e) => setEncStartPrice(e.target.value)}
                  className="bg-transparent border-none p-0 text-3xl font-black text-white focus:ring-0 focus:outline-none w-full"
                />
                <span className="text-[10px] font-black text-white/20 ml-2 uppercase">CWETH</span>
              </div>
            </div>

             <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                <span className="text-white/20">Decay Rate</span>
                <span className="text-amber-500 italic flex items-center gap-1">
                  <ShieldCheck size={10} />
                  Encrypted
                </span>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 flex items-center justify-between">
                <input 
                  type="text" 
                  value={decayRate}
                  onChange={(e) => setDecayRate(e.target.value)}
                  className="bg-transparent border-none p-0 text-3xl font-black text-white focus:ring-0 focus:outline-none w-full"
                />
                <span className="text-[10px] font-black text-white/20 ml-2 uppercase">Units</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                <span className="text-white/20">Min. Reserve (Floor Price)</span>
                <span className="text-amber-500 italic flex items-center gap-1">
                  <ShieldCheck size={10} />
                  Encrypted
                </span>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 flex items-center justify-between">
                <input 
                  type="text" 
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  className="bg-transparent border-none p-0 text-3xl font-black text-white focus:ring-0 focus:outline-none w-full"
                />
                <span className="text-[10px] font-black text-white/20 ml-2 uppercase">CWETH</span>
              </div>
            </div>

             <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                <span className="text-white/20">Duration</span>
                <span className="text-white/40 italic">
                  Exp: {(() => {
                    const mins = Math.floor((parseInt(duration || '0') * 12) / 60);
                    return mins >= 60 ? `${(mins/60).toFixed(1)}h` : `${mins}m`;
                  })()}
                </span>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 flex items-center justify-between">
                <input 
                  type="text" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-transparent border-none p-0 text-3xl font-black text-white focus:ring-0 focus:outline-none w-full"
                />
                <span className="text-[10px] font-black text-white/20 ml-2 uppercase">Blocks</span>
              </div>
            </div>

            <button 
              onClick={handleInitialize}
              disabled={loading || !contractAddress || !amountOrId}
              className="w-full bg-primary text-black font-black tracking-[0.2em] uppercase py-6 text-[10px] shadow-[0_0_30px_rgba(255,210,23,0.15)] hover:bg-white transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Create Dutch Auction"}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

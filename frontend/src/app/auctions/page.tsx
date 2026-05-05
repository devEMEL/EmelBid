
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/constants';
import EmelBidAbi from '@/lib/abis/EmelBid.json';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Loader2, ExternalLink, Timer, ShieldAlert, ImageIcon, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { fetchAuctions } from '@/lib/subgraph';

import ListingImage from '@/components/ListingImage';

export default function AuctionsPage() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { data: totalDecryptions } = useReadContract({
    address: CONTRACTS.EMEL_BID as `0x${string}`,
    abi: EmelBidAbi.abi,
    functionName: 'totalDecryptions',
  });

  useEffect(() => {
    async function getAuctions() {
      const data = await fetchAuctions();
      setAuctions(data);
      setLoading(false);
    }
    getAuctions();
    const interval = setInterval(getAuctions, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredAuctions = auctions.filter(a => 
    a.id.toLowerCase().includes(search.toLowerCase()) || 
    a.asset.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-8 pb-40 px-6 max-w-6xl mx-auto relative z-10">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
              Live Auctions
            </h1>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Subgraph Synced</span>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Encrypted Dutch Auctions on Sepolia Testnet.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/" className="bg-primary text-black px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all gold-glow hover:brightness-110 active:scale-95 flex items-center gap-3">
            <Plus size={16} strokeWidth={3} />
            Initialize Auction
          </Link>
        </div>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-morphism p-8 rounded-lg bg-white/[0.01] border-l-2 border-primary">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Total Listings</p>
          <h4 className="text-4xl font-black text-white tracking-tighter">{auctions.length}</h4>
          <p className="text-tertiary-dim text-xs font-bold mt-2">Active Marketplace</p>
        </div>
        <div className="glass-morphism p-8 rounded-lg bg-white/[0.01]">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Vol. Settled</p>
          <h4 className="text-4xl font-black text-white tracking-tighter">
            {totalDecryptions ? totalDecryptions.toString() : '0'}
          </h4>
          <p className="text-tertiary-dim text-xs font-bold mt-2">Successful Decryptions</p>
        </div>


      </div>

      {/* Search Filter */}
      <div className="mb-8 max-w-md">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="FILTER BY AUCTION ID OR ASSET..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-none px-12 py-5 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10"
          />
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
        </div>
      </div>

      {/* Auctions Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Querying Subgraph Index...</span>
          </div>
        ) : filteredAuctions.length > 0 ? (
          filteredAuctions.map((auction) => (
            <div 
              key={auction.id} 
              onClick={() => navigate(`/auctions/${auction.id}`)}
              className="glass-morphism p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-white/5 hover:border-primary transition-all group cursor-pointer overflow-hidden"
            >
              <div className="flex items-center gap-8 w-full md:w-auto">
                <ListingImage 
                  assetType={Number(auction.assetType)} 
                  asset={auction.asset} 
                  tokenIdOrAmount={auction.tokenIdOrAmount}
                  className="w-20 h-20 shrink-0" 
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">
                      {Number(auction.assetType) === 1 ? "NFT" : Number(auction.assetType) === 0 ? "ERC20" : "ERC7984"} Listing
                    </span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${auction.settled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary animate-pulse'}`}>
                      {auction.settled ? 'Settled' : 'Active'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tighter uppercase truncate max-w-[200px]">
                    {auction.id.substring(0, 10)}...
                  </h3>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                    <span className="truncate max-w-[200px]">{auction.asset}</span>
                    <ExternalLink size={10} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-12 w-full md:w-auto text-right">
                <div>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Start Price</p>
                   <p className="text-lg font-black text-white tracking-tighter">{formatUnits(BigInt(auction.publicStartPrice), 6)} CWETH</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Duration</p>
                   <div className="flex flex-col items-end gap-0.5">
                     <div className="flex items-center justify-end gap-2">
                       <Timer size={12} className="text-primary/40" />
                       <p className="text-lg font-black text-white tracking-tighter">{auction.duration} BLKS</p>
                     </div>
                     <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">
                       ~{Number(auction.duration) * 12 >= 3600 
                         ? `${(Number(auction.duration) * 12 / 3600).toFixed(1)} hrs` 
                         : `${Math.round(Number(auction.duration) * 12 / 60)} mins`}
                     </p>
                   </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                   <button className="bg-white/5 border border-white/10 px-6 py-3 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all">
                      Bid Now
                   </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center text-white/20 font-black uppercase text-xs tracking-widest opacity-50 border border-dashed border-white/5">
            No auctions detected in the current epoch.
          </div>
        )}
      </div>
    </div>
  );
}

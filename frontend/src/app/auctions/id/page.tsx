import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePublicClient, useAccount } from 'wagmi';
import { 
  ArrowLeft, ExternalLink, Timer, ShieldAlert, ImageIcon, 
  Coins, User, Hash, Clock, CheckCircle2, AlertCircle,
  Gem, Wallet, Zap, ShieldCheck, Flame, Download
} from 'lucide-react';
import { formatUnits } from 'viem';
import { fetchAuctionById } from '@/lib/subgraph';
import ListingImage from '@/components/ListingImage';
import { useEmelBid } from '@/hooks/useEmelBid';

export default function AuctionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { expireAuction, withdrawProceeds, getWinner } = useEmelBid();
  
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentBlock, setCurrentBlock] = useState<bigint>(0n);
  const [winner, setWinner] = useState<string>("0x0000000000000000000000000000000000000000");

  useEffect(() => {
    async function getAuction() {
      if (!id) return;
      const data = await fetchAuctionById(id);
      setAuction(data);
      setLoading(false);
      
      if (publicClient) {
        const block = await publicClient.getBlockNumber();
        setCurrentBlock(block);
      }

      if (data?.settled) {
        const w = await getWinner(id);
        setWinner(w);
      }
    }
    getAuction();
  }, [id, publicClient]);

  const handleExpire = async () => {
    if (!id) return;
    await expireAuction(id);
    // Refresh data
    const data = await fetchAuctionById(id);
    setAuction(data);
  };

  const handleWithdraw = async () => {
    if (!id) return;
    await withdrawProceeds(id);
    // Refresh data
    const data = await fetchAuctionById(id);
    setAuction(data);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 opacity-40">
        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Retrieving Encrypted Metadata...</span>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <AlertCircle size={48} className="text-red-500/40" />
        <div className="text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Auction Not Found</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2">The requested auction ID does not exist on the subgraph.</p>
        </div>
        <Link to="/auctions" className="px-8 py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isExpired = !auction.settled && currentBlock > BigInt(auction.startBlock) + BigInt(auction.duration);
  const canWithdraw = auction.settled && winner !== "0x0000000000000000000000000000000000000000" && auction.seller.toLowerCase() === address?.toLowerCase();

  return (
    <div className="pt-8 pb-40 px-6 max-w-6xl mx-auto relative">
      <Link to="/auctions" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Back to Marketplace</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Visual Asset */}
        <div className="lg:col-span-5 space-y-6">
          <ListingImage 
            assetType={Number(auction.assetType)} 
            asset={auction.asset} 
            tokenIdOrAmount={auction.tokenIdOrAmount}
            className="aspect-square w-full" 
          />

          <div className="glass-morphism p-8 space-y-6 bg-white/[0.01]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Asset Type</span>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {Number(auction.assetType) === 1 ? "NFT (ERC721)" : Number(auction.assetType) === 0 ? "Tokens (ERC20)" : "Confidential Tokens"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-6">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Network</span>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Sepolia FHEVM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-0.5 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-widest">ID #{auction.id.substring(0,8)}</span>
              <span className="text-[8px] text-primary/60 font-black uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={10} />
                Encrypted with FHE
              </span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none mb-6">
               Auction Details
            </h1>
            <p className="text-white/40 text-sm leading-relaxed uppercase tracking-widest font-bold max-w-xl">
              Confidential Dutch Auction where the winning price is decrypted only upon settlement. Private bids ensure zero slippage and front-running protection.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-morphism p-8 bg-white/[0.02] border-l-2 border-primary">
              <div className="flex items-center gap-2 mb-4 text-white/20">
                <Zap size={14} className="text-primary/60" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Public Start Price</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tighter">{formatUnits(BigInt(auction.publicStartPrice), 6)}</span>
                <span className="text-xs font-black text-primary uppercase">CWETH</span>
              </div>
            </div>
            <div className="glass-morphism p-8 bg-white/[0.02] border-l-2 border-white/10 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4 text-white/20">
                <Clock size={14} className="text-white/20" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Duration</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tighter">{auction.duration}</span>
                <span className="text-xs font-black text-white/40 uppercase">Blocks</span>
              </div>
              <div className="mt-2 text-[10px] font-black text-primary/60 uppercase tracking-widest">
                ≈ {Number(auction.duration) * 12 >= 3600 
                  ? `${(Number(auction.duration) * 12 / 3600).toFixed(1)} Hours` 
                  : `${Math.round(Number(auction.duration) * 12 / 60)} Minutes`}
              </div>
            </div>
          </div>

          {/* Detailed Data */}
          <div className="glass-morphism bg-white/[0.01] border border-white/5 divide-y divide-white/5">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <User size={16} className="text-white/20" />
                <div>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Auction Seller</p>
                   <p className="text-xs font-mono text-white/60">{auction.seller}</p>
                </div>
              </div>
              <a 
                href={`https://sepolia.etherscan.io/address/${auction.seller}`} 
                target="_blank" 
                className="p-2 bg-white/5 hover:bg-white/10 transition-colors rounded-none w-fit"
              >
                <ExternalLink size={14} className="text-white/40" />
              </a>
            </div>

            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Hash size={16} className="text-white/20" />
                <div>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Liquidity/Amount Identifier</p>
                   <p className="text-xs font-mono text-white/60">{auction.tokenIdOrAmount}</p>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Timer size={16} className="text-white/20" />
                <div>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Start Block</p>
                   <p className="text-xs font-black text-white/80 uppercase">{auction.startBlock}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Status</p>
                 <p className={`text-xs font-black uppercase ${auction.settled ? 'text-emerald-400' : isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                   {auction.settled ? 'Finalized' : isExpired ? 'Expired' : 'Active'}
                 </p>
              </div>
            </div>
            
            {auction.settled && winner !== "0x0000000000000000000000000000000000000000" && (
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-500/[0.02]">
                <div className="flex items-center gap-4">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <div>
                    <p className="text-[9px] font-black text-emerald-400/40 uppercase tracking-widest">Auction Winner</p>
                    <p className="text-xs font-mono text-emerald-400">{winner}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-4 space-y-4">
            {!auction.settled && !isExpired ? (
               <button className="w-full bg-primary text-black py-6 rounded-none font-black text-xs uppercase tracking-[0.4em] gold-glow hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-4">
                  <Gem size={18} />
                  Place Encrypted Bid
               </button>
            ) : isExpired ? (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <button 
                  onClick={handleExpire}
                  className="flex-1 w-full bg-red-500 text-white py-6 rounded-none font-black text-xs uppercase tracking-[0.4em] hover:bg-red-600 active:scale-[0.99] transition-all flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                >
                  <Flame size={18} />
                  Expire Auction
                </button>
                <div className="flex-1 text-[10px] font-black uppercase tracking-widest text-white/40 leading-relaxed italic">
                  Click to withdraw asset if auction is expired with no winner.
                </div>
              </div>
            ) : auction.settled && auction.seller.toLowerCase() === address?.toLowerCase() ? (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <button 
                  onClick={handleWithdraw}
                  className="flex-1 w-full bg-emerald-500 text-white py-6 rounded-none font-black text-xs uppercase tracking-[0.4em] hover:bg-emerald-600 active:scale-[0.99] transition-all flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                  <Download size={18} />
                  Withdraw Proceeds
                </button>
                <div className="flex-1 text-[10px] font-black uppercase tracking-widest text-white/40 leading-relaxed italic">
                  Collect the encrypted payment from the successful auction.
                </div>
              </div>
            ) : (
              <div className="w-full bg-white/5 border border-white/10 py-6 text-center">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Auction Terminated</span>
              </div>
            )}
            
            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest text-center mt-6 flex items-center justify-center gap-2">
              <ShieldAlert size={12} />
              All bids are encrypted via FHE Protocol v1.0
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

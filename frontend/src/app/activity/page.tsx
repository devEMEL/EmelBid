import { useState, useEffect } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { fetchAuctions, fetchBids } from '@/lib/subgraph';
import { formatUnits } from 'viem';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  // const [timeRange, setTimeRange] = useState('All time');
  const [filterType, setFilterType] = useState('All types');

  useEffect(() => {
    async function loadActivity() {
      const [auctions, bids] = await Promise.all([
        fetchAuctions(),
        fetchBids()
      ]);

      const formattedAuctions = auctions.map((a: any) => ({
        id: a.id,
        time: Number(a.createdAtTimestamp || 0),
        type: 'Auction Created',
        asset: a.asset,
        amount: formatUnits(BigInt(a.publicStartPrice || 0), 6) + ' CWETH Start',
        hash: a.transactionHash || a.id
      }));

      const formattedBids = bids.map((b: any) => ({
        id: b.id,
        time: Number(b.timestamp || 0),
        type: 'Bid Placed',
        asset: b.auction?.asset || '-',
        amount: 'Encrypted Bid',
        hash: b.transactionHash || b.id
      }));

      const merged = [...formattedAuctions, ...formattedBids]
        .sort((a, b) => b.time - a.time);

      setActivities(merged);
      setLoading(false);
    }

    loadActivity();
    const interval = setInterval(loadActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestampInSeconds: number) => {
    if (!timestampInSeconds) return 'Unknown';
    const date = new Date(timestampInSeconds * 1000);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff} secs ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const filteredActivities = activities.filter(a => {
    if (filterType === 'All types') return true;
    if (filterType === 'Auctions' && a.type === 'Auction Created') return true;
    if (filterType === 'Bids' && a.type === 'Bid Placed') return true;
    return false;
  });

  return (
    <main className="pt-8 pb-40 px-6 max-w-[1200px] mx-auto relative z-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="flex flex-wrap gap-6 w-full md:w-auto">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col justify-center w-full sm:w-auto min-w-[240px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 blur-[60px] rounded-full pointer-events-none"></div>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-1 relative z-10">Total Activity</p>
            <p className="text-4xl font-black tracking-tighter text-white inline-block relative z-10">{loading ? '...' : activities.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-10 border-b border-white/10 mb-10">
        <button className="pb-5 text-primary border-b-2 border-primary font-black uppercase tracking-widest text-xs flex items-center gap-3">
          Activity 
          <span className="bg-primary text-black text-[10px] px-2 py-0.5 rounded-full font-black">{activities.length}</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Filter by type</label>
            <div className="relative">
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center justify-between gap-10 bg-black border border-primary/50 px-5 py-3 rounded-xl text-sm font-bold transition-all min-w-[220px] text-white group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">filter_list</span>
                  {filterType}
                </div>
                <span className={`material-symbols-outlined text-white/40 group-hover:text-primary transition-all ${filterOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              
              {filterOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-black border border-primary/30 rounded-xl shadow-2xl z-20 py-2 overflow-hidden backdrop-blur-xl">
                  {['All types', 'Auctions', 'Bids'].map(type => (
                    <button 
                      key={type}
                      onClick={() => {
                        setFilterType(type);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors border-l-2 ${filterType === type ? 'text-primary bg-primary/10 border-primary' : 'text-white/70 hover:bg-white/5 hover:text-white border-transparent'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List Table */}
      <div className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1fr] gap-4 px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 bg-white/[0.02]">
          <div>Time</div>
          <div>Type</div>
          <div>Asset</div>
          <div>Amount Details</div>
          <div className="text-right">Txn Hash</div>
        </div>
        
        {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Syncing Activity...</span>
            </div>
        ) : filteredActivities.length === 0 ? (
             <div className="p-20 text-center text-white/20 font-black uppercase text-xs tracking-widest opacity-50 border border-dashed border-white/5">
               No activity found.
             </div>
        ) : (
            <div className="divide-y divide-white/5">
                {filteredActivities.map((tx) => (
                    <div key={tx.id} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_1.2fr_1fr] gap-4 px-8 py-7 items-center hover:bg-white/[0.03] transition-all group cursor-pointer">
                    <div className="flex md:block justify-between items-center text-[10px] font-bold uppercase tracking-tight text-white/50">
                        <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Time</span>
                        {formatTime(tx.time)}
                    </div>

                    <div className="flex md:block justify-between items-center">
                        <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Type</span>
                        <p className={`font-bold text-xs ${tx.type === 'Auction Created' ? 'text-emerald-400' : 'text-primary'}`}>{tx.type}</p>
                    </div>

                    <div className="flex md:block justify-between items-center">
                        <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Asset</span>
                        <p className="font-mono text-xs text-white/60 truncate max-w-[120px]">{tx.asset}</p>
                    </div>

                    <div className="flex md:block justify-between items-center">
                        <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Amount Details</span>
                        <p className={`font-black text-[11px] tracking-tight ${tx.type === 'Bid Placed' ? 'text-white/40 italic' : 'text-white'}`}>{tx.amount}</p>
                    </div>

                    <div className="flex md:block justify-between items-center md:text-right">
                        <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Txn Hash</span>
                        <a 
                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-white/30 hover:text-primary transition-colors tracking-widest flex items-center justify-end gap-1.5 group/hash"
                        >
                        {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                        <ExternalLink size={10} className="text-primary/60 shrink-0" />
                        </a>
                    </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </main>
  );
}

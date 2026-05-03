
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

const transactions = [
  { 
    id: 1,
    time: '2 mins ago',
    type: 'Swap ETH for PEPU',
    usd: '$3,524.65',
    token0Amount: '-1.42 ETH',
    token1Amount: '+7,842,500 PEPU',
    hash: '0x07616c15236920bf2562922417926de7d73d376ef249df7cc35176ccae51bd6b'
  },
  { 
    id: 2,
    time: '12 mins ago',
    type: 'Add ETH and USDT',
    usd: '$1,205.50',
    token0Amount: '-0.50 ETH',
    token1Amount: '-1,200.00 USDT',
    hash: '0x07616c15236920bf2562922417926de7d73d376ef249df7cc35176ccae51bd6b'
  },
  { 
    id: 3,
    time: '4 hours ago',
    type: 'Remove ETH and ZAMA',
    usd: '$842.10',
    token0Amount: '+0.15 ETH',
    token1Amount: '+142.50 ZAMA',
    hash: '0x07616c15236920bf2562922417926de7d73d376ef249df7cc35176ccae51bd6b'
  },
  { 
    id: 4,
    time: '1 day ago',
    type: 'Swap USDC for ETH',
    usd: '$1,500.00',
    token0Amount: '-1,500.00 USDC',
    token1Amount: '+0.58 ETH',
    hash: '0x07616c15236920bf2562922417926de7d73d376ef249df7cc35176ccae51bd6b'
  }
];

export default function ActivityPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('All time');
  const [filterType, setFilterType] = useState('All types');

  return (
    <main className="pt-8 pb-40 px-6 max-w-[1200px] mx-auto relative z-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="flex flex-wrap gap-6 w-full md:w-auto">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col justify-center w-full sm:w-auto min-w-[240px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 blur-[60px] rounded-full pointer-events-none"></div>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-1 relative z-10">Total Value Locked</p>
            <p className="text-4xl font-black tracking-tighter text-white inline-block relative z-10">$1.42B</p>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col justify-center w-full sm:w-auto min-w-[240px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/5 blur-[60px] rounded-full pointer-events-none"></div>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-1 relative z-10">1D Volume</p>
            <p className="text-4xl font-black tracking-tighter text-white inline-block relative z-10">$210.4M</p>
          </div>
        </div>
        <button className="bg-primary text-black px-5 py-2.5 rounded-full font-black text-[10px] tracking-[0.1em] flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg gold-glow">
          <span className="material-symbols-outlined text-sm font-bold">download</span>
          EXPORT CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-10 border-b border-white/10 mb-10">
        <button className="pb-5 text-primary border-b-2 border-primary font-black uppercase tracking-widest text-xs flex items-center gap-3">
          Activity 
          <span className="bg-primary text-black text-[10px] px-2 py-0.5 rounded-full font-black">24</span>
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
                  {['All types', 'Swaps', 'Approvals', 'Added Liquidity', 'Remove Liquidity', 'Collect Fees'].map(type => (
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
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Time Range</label>
          <div className="flex bg-black/40 rounded-xl p-1.5 border border-white/10">
            {['24h', '7d', '30d', 'All time'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 md:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${timeRange === range ? 'bg-primary text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* Transaction List Table */}
      <div className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_1fr] gap-4 px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 bg-white/[0.02]">
          <div>Time</div>
          <div>Type</div>
          <div>USD</div>
          <div>Token0 Amount</div>
          <div>Token1 Amount</div>
          <div className="text-right">Txn Hash</div>
        </div>
        <div className="divide-y divide-white/5">
          {transactions.map((tx) => (
             <div key={tx.id} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_1fr] gap-4 px-8 py-7 items-center hover:bg-white/[0.03] transition-all group cursor-pointer">
               <div className="flex md:block justify-between items-center text-[10px] font-bold uppercase tracking-tight text-white/50">
                  <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Time</span>
                  {tx.time}
               </div>

               <div className="flex md:block justify-between items-center">
                 <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Type</span>
                 <p className="font-bold text-xs text-white group-hover:text-primary transition-colors">{tx.type}</p>
               </div>

               <div className="flex md:block justify-between items-center">
                 <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">USD</span>
                 <p className="font-black text-xs text-white">{tx.usd}</p>
               </div>

               <div className="flex md:block justify-between items-center">
                 <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Token0 Amount</span>
                 <p className={`font-black text-[11px] tracking-tight ${tx.token0Amount.startsWith('-') ? 'text-white/60' : 'text-primary/90'}`}>{tx.token0Amount}</p>
               </div>

               <div className="flex md:block justify-between items-center">
                 <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Token1 Amount</span>
                 <p className={`font-black text-[11px] tracking-tight ${tx.token1Amount.startsWith('-') ? 'text-white/60' : 'text-primary/90'}`}>{tx.token1Amount}</p>
               </div>

               <div className="flex md:block justify-between items-center md:text-right">
                 <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Txn Hash</span>
                 <a 
                   href={`https://testnet.arcscan.app/tx/${tx.hash}`}
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
      </div>

      {/* Pagination */}
      <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <p className="text-xs text-white/30 font-black uppercase tracking-widest">
          Page 1 of 3 <span className="mx-2 opacity-20">|</span> Showing 1-10 of 24 transactions
        </p>
        <div className="flex gap-3">
          <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-[0.2em] text-white/30 cursor-not-allowed">
            Previous
          </button>
          <button className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-black text-[10px] uppercase tracking-[0.2em] text-primary transition-all active:scale-95 shadow-lg">
            Next Page
          </button>
        </div>
      </div>
    </main>
  );
}

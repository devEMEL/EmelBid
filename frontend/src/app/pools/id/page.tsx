import { useParams, Link } from 'react-router-dom';
import { ArrowUp, ExternalLink } from 'lucide-react';

export default function PoolDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const hooksMock: Record<string, { name: string, desc: string }> = {
    default: { name: "Dynamic Volatility Fee", desc: "Dynamically adjusts LP fee tiers based on 24H rolling price volatility." },
    "0x5...": { name: "Limit Order Hook", desc: "Enables single-sided limit orders processed as concentrated liquidity." }
  };
  const hookData = id && hooksMock[id] ? hooksMock[id] : hooksMock.default;

  const token0Address = "0x0000000000000000000000000000000000000000"; // NATIVE
  const token1Address = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDC example

  const getCurrencyParam = (address: string) => {
    return (address === "0" || address === "0x0000000000000000000000000000000000000000") ? "NATIVE" : address;
  };

  const t0 = { symbol: 'ETH', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' };
  const t1 = { symbol: 'USDC', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' };

  const addLiquidityPath = `/positions/create/currency0=${getCurrencyParam(token0Address)}&currency1=${getCurrencyParam(token1Address)}`;

  return (
    <div className="pt-8 pb-40 px-6 max-w-7xl mx-auto relative z-10 flex flex-col items-center">
      {/* Abstract Background Mesh specific to details */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-full opacity-10 pointer-events-none flex justify-center">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="w-full">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              <div className="w-16 h-16 rounded-full border-4 border-black overflow-hidden bg-black flex items-center justify-center relative z-[2]">
                <img className="w-full h-full object-contain grayscale transition-all duration-500 hover:grayscale-0" alt="ETH" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXybhITYp9WXpTJN179H2b1uf4LtIXUPfE7MGSX8enKDACJehiY52Un6ORUcgNJVusj9wAokDwCj3R5pr89ac6YZuOijRGc8WJWpWhBsUjwPSigUgeXVNXkUJbC8HX3KXMBUFA4ZfBf0SayK4nggIKiqy4AWvkFg3_pFUtLOpsvqANIEYmot2SJ6RrXb8mytnZ6ooK69T8XTgtYQ-PRCNy-Et2IxvuSa9t1Bh-27egOH-McFlA3eHh-DgqCWeq4ngj9sWZlWiYSDGo"/>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-black overflow-hidden bg-black flex items-center justify-center relative z-[1]">
                <img className="w-full h-full object-contain grayscale transition-all duration-500 hover:grayscale-0" alt="USDC" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_If4tb7GbsCftgddAVbwTwjqScGKRJPxgOWRvTG96x87nuLhhU-Wt9H6U2RjSZ1Hv-QRBFCcn3Cg3O6KlF_qEB35wjoVYmi9TRzfpCSk1hcWFfZhrOMN_M2I1Mb-VUY4sjXHfJThKk67GnCNy56hx-W9R6os6euq7a6OMeOBKd0ycGISaB-22yYnhp5zDcGeTWBllF1G36gYZbRGH98jfMrHau9MiHBG17Rc0gTMs_azsK5ehOt0ruEdNprRma46ThaoFtWcGshA-"/>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter uppercase text-white">ETH / USDC</h1>
                <span className="bg-white/10 px-3 py-1 text-[10px] font-black tracking-widest text-white/60 uppercase">0.05% Fee</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-3xl font-black tracking-tighter text-white/60">$2,482.14</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-sm bg-emerald-400/10 px-2 py-1">
                  <ArrowUp size={14} strokeWidth={3} />
                  +4.2%
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Pool ID:</span>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{id ? `${id.slice(0, 10)}...${id.slice(-8)}` : 'UNKNOWN'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Link to="/" className="flex-1 md:flex-none border border-white/10 text-white px-8 py-3 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center hover:bg-white/5 transition-all">
              Swap
            </Link>
            <Link 
              to={addLiquidityPath}
              className="flex-1 md:flex-none bg-primary text-black px-8 py-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all gold-glow hover:brightness-110 active:scale-95 flex items-center justify-center text-center"
            >
              Add Liquidity
            </Link>
          </div>
        </header>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            { label: '24h Volume', val: '$42,901,482' },
            { label: '7d Volume', val: '$210,482,109' },
            { label: 'Fees (24h)', val: '$21,450' }
          ].map((m, i) => (
            <div key={i} className="glass-morphism bg-white/[0.01] border border-white/5 p-6 hover:bg-white/[0.02] transition-colors">
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-2">{m.label}</p>
              <p className="text-3xl font-black text-white tracking-tighter">{m.val}</p>
            </div>
          ))}
        </div>

        {/* Bento Grid for Analytics */}
        <div className="grid grid-cols-12 gap-6 mb-12">
          {/* Price Chart Module (The Monolith) */}
          <div className="col-span-12 lg:col-span-8 glass-morphism bg-white/[0.01] border border-white/5 p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <div className="flex gap-6">
                <button className="text-primary font-black uppercase text-[10px] tracking-widest border-b-[3px] border-primary pb-4 -mb-[19px]">Price</button>
                <button className="text-white/40 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors pb-4 -mb-[19px]">Volume</button>
              </div>
              <div className="flex bg-black/40 border border-white/5 p-1">
                <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-black bg-primary">1D</button>
                <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">1W</button>
                <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">1M</button>
                <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">1Y</button>
              </div>
            </div>

            {/* Abstract Chart Visualization */}
            <div className="h-[400px] w-full flex items-end gap-[2px] group">
              <div className="flex-1 bg-white/[0.03] h-[30%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-white/[0.03] h-[45%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-white/[0.03] h-[40%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-white/[0.03] h-[60%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-white/[0.03] h-[55%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-primary/40 h-[70%] border-t border-primary/50 relative group-hover:bg-primary/50 transition-all"></div>
              <div className="flex-1 bg-primary/30 h-[65%] border-t border-primary/50 relative group-hover:bg-primary/40 transition-all"></div>
              <div className="flex-1 bg-primary/20 h-[80%] border-t border-primary/50 relative group-hover:bg-primary/30 transition-all"></div>
              <div className="flex-1 bg-primary/50 h-[90%] border-t border-primary shadow-[0_0_20px_rgba(255,210,23,0.3)] relative group-hover:bg-primary/60 transition-all"></div>
              <div className="flex-1 bg-white/[0.03] h-[85%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-white/[0.03] h-[75%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-white/[0.03] h-[80%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-white/[0.03] h-[95%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-white/10 h-[85%] hover:bg-primary/20 transition-all border-t border-white/20 relative"></div>
              <div className="flex-1 bg-white/[0.03] h-[70%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-white/[0.03] h-[60%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-white/[0.03] h-[50%] hover:bg-primary/20 transition-all"></div>
              <div className="flex-1 bg-white/[0.03] h-[45%] hover:bg-primary/20 transition-all"></div>
            </div>

            <div className="absolute inset-x-8 bottom-8 flex justify-between text-[10px] uppercase tracking-widest text-white/20 font-black border-t border-white/5 pt-4">
              <span>JAN 10</span>
              <span>JAN 15</span>
              <span>JAN 20</span>
              <span>JAN 25</span>
              <span className="text-primary/60">TODAY</span>
            </div>
          </div>

          {/* Stats Column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* TVL Card */}
            <div className="glass-morphism bg-white/[0.01] border border-white/5 p-8 flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-2">Total Value Locked</p>
              <p className="text-5xl font-black tracking-tighter text-white inline-block">$142.8M</p>
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-1">Total APR</p>
                <p className="text-3xl font-black text-primary tracking-tight">24.8%</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,210,23,0.5)]"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Top 1% of Pools</span>
              </div>
            </div>

            {/* Pool Balances */}
            <div className="glass-morphism bg-white/[0.01] border border-white/5 p-6 border-l-[3px] border-l-primary">
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-4">Pool Balances</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-white/10 bg-black flex items-center justify-center overflow-hidden">
                       <img className="w-full h-full object-contain" alt="ETH" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXybhITYp9WXpTJN179H2b1uf4LtIXUPfE7MGSX8enKDACJehiY52Un6ORUcgNJVusj9wAokDwCj3R5pr89ac6YZuOijRGc8WJWpWhBsUjwPSigUgeXVNXkUJbC8HX3KXMBUFA4ZfBf0SayK4nggIKiqy4AWvkFg3_pFUtLOpsvqANIEYmot2SJ6RrXb8mytnZ6ooK69T8XTgtYQ-PRCNy-Et2IxvuSa9t1Bh-27egOH-McFlA3eHh-DgqCWeq4ngj9sWZlWiYSDGo"/>
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">ETH</span>
                  </div>
                  <span className="text-sm font-mono text-white tracking-tight">18,942.2</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-white/10 bg-black flex items-center justify-center overflow-hidden">
                       <img className="w-full h-full object-contain" alt="USDC" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_If4tb7GbsCftgddAVbwTwjqScGKRJPxgOWRvTG96x87nuLhhU-Wt9H6U2RjSZ1Hv-QRBFCcn3Cg3O6KlF_qEB35wjoVYmi9TRzfpCSk1hcWFfZhrOMN_M2I1Mb-VUY4sjXHfJThKk67GnCNy56hx-W9R6os6euq7a6OMeOBKd0ycGISaB-22yYnhp5zDcGeTWBllF1G36gYZbRGH98jfMrHau9MiHBG17Rc0gTMs_azsK5ehOt0ruEdNprRma46ThaoFtWcGshA-"/>
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">USDC</span>
                  </div>
                  <span className="text-sm font-mono text-white tracking-tight">29,910,482.5</span>
                </div>
              </div>
            </div>

            {/* Hook Details */}
            <div className="glass-morphism bg-white/[0.01] border border-white/5 p-6">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-black">Active Hook</p>
                <div className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 uppercase tracking-widest border border-primary/20">V4</div>
              </div>
              <p className="text-sm font-black text-white mb-2">{hookData.name}</p>
              <p className="text-[10px] font-medium text-white/50 leading-relaxed">{hookData.desc}</p>
            </div>


          </div>
        </div>


        {/* Recent Swaps Table - Redesigned to match Profile Activity */}
        <section className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-2xl font-black tracking-tighter uppercase text-white">Recent Swaps</h3>
          </div>
          
          <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_1fr] gap-4 px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 bg-white/[0.02]">
            <div>Time</div>
            <div>Type</div>
            <div>USD</div>
            <div>Token0 Amount</div>
            <div>Token1 Amount</div>
            <div className="text-right">Txn Hash</div>
          </div>

          <div className="divide-y divide-white/5">
            {[
              { time: '2 mins ago', type: `Swap ${t1.symbol} for ${t0.symbol}`, t0Amt: '+1.42', t1Amt: '-3,524.00', usd: '$3,524.65', hash: '0x42d5892cf6b3521a47dbead53a21235bf56e32ee805724d6ae7a208a39064c01' },
              { time: '5 mins ago', type: `Swap ${t0.symbol} for ${t1.symbol}`, t0Amt: '-4.83', t1Amt: '+12,000.00', usd: '$11,998.21', hash: '0x42d5892cf6b3521a47dbead53a21235bf56e32ee805724d6ae7a208a39064c01' },
              { time: '8 mins ago', type: `Swap ${t1.symbol} for ${t0.symbol}`, t0Amt: '+0.85', t1Amt: '-2,110.00', usd: '$2,109.35', hash: '0x42d5892cf6b3521a47dbead53a21235bf56e32ee805724d6ae7a208a39064c01' },
              { time: '12 mins ago', type: `Swap ${t1.symbol} for ${t0.symbol}`, t0Amt: '+2.10', t1Amt: '-5,212.00', usd: '$5,211.90', hash: '0x42d5892cf6b3521a47dbead53a21235bf56e32ee805724d6ae7a208a39064c01' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_1fr] gap-4 px-8 py-7 items-center hover:bg-white/[0.03] transition-all group cursor-pointer">
                <div className="flex md:block justify-between items-center text-[10px] font-bold uppercase tracking-tight text-white/50">
                  <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Time</span>
                  {row.time}
                </div>

                <div className="flex md:block justify-between items-center">
                  <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Type</span>
                  <p className="font-bold text-xs text-white group-hover:text-primary transition-colors uppercase tracking-widest">{row.type}</p>
                </div>

                <div className="flex md:block justify-between items-center">
                  <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">USD</span>
                  <p className="font-black text-xs text-white">{row.usd}</p>
                </div>

                <div className="flex md:block justify-between items-center">
                  <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Token0</span>
                  <p className={`font-black text-[11px] tracking-tight ${row.t0Amt.startsWith('-') ? 'text-white/60' : 'text-primary'}`}>{row.t0Amt} {t0.symbol}</p>
                </div>

                <div className="flex md:block justify-between items-center">
                  <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Token1</span>
                  <p className={`font-black text-[11px] tracking-tight ${row.t1Amt.startsWith('-') ? 'text-white/60' : 'text-primary'}`}>{row.t1Amt} {t1.symbol}</p>
                </div>

                <div className="flex md:block justify-between items-center md:text-right">
                  <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Txn Hash</span>
                  <a 
                    href={`https://testnet.arcscan.app/tx/${row.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-white/30 hover:text-primary transition-colors tracking-widest flex items-center justify-end gap-1.5 group/hash"
                  >
                    {row.hash.slice(0, 6)}...{row.hash.slice(-4)}
                    <ExternalLink size={10} className="text-primary/60 shrink-0" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-white/[0.01] text-center border-t border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group">
            <button className="text-[10px] font-black text-white/30 group-hover:text-white transition-colors py-2 uppercase tracking-[0.2em] outline-none tracking-widest">
              Load More History
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

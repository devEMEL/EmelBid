import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw, ChevronDown, Flame, ArrowUpCircle, ArrowDownCircle, X, AlertTriangle, Wallet } from 'lucide-react';
import TokenSelector, { Token } from '@/components/TokenSelector';

const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', balance: '45.23' },
  { symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', balance: '12,400.00' },
  { symbol: 'USDT', name: 'Tether', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png', balance: '5,120.50' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png', balance: '1.24' },
  { symbol: 'DAI', name: 'Dai Stablecoin', logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png', balance: '8,900.00' },
];

export default function PositionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [manageOpen, setManageOpen] = useState(false);
  const [isCollectingFees, setIsCollectingFees] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'increase' | 'decrease' | 'burn' | null>(null);
  const [activeModal, setActiveModal] = useState<'increase' | 'decrease' | 'burn' | 'collect' | null>(null);
  const [decreasePercent, setDecreasePercent] = useState(50);
  const [increasePercent0, setIncreasePercent0] = useState<number | null>(null);
  const [increasePercent1, setIncreasePercent1] = useState<number | null>(null);
  const [token0, setToken0] = useState<Token>(TOKENS[0]);
  const [token1, setToken1] = useState<Token>(TOKENS[1]);

  // Mock position data based on the ID
  const position = {
    id: id,
    pair: 'ETH / USDC',
    fee: '0.05%',
    status: 'In Range',
    statusColor: 'text-emerald-400',
    liquidity: '$42,850.42',
    unclaimedFees: '$142.50',
    token0: { symbol: 'ETH', amount: '12.4 ETH', value: '$25,120.00' },
    token1: { symbol: 'USDC', amount: '17,730.42 USDC', value: '$17,730.42' },
    range: { min: '2,450.00', max: '3,850.00', current: '3,142.12' },
    imgs: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuClYLTjMo-ECiwi1rxIYCry-M0GiEH4kWXDlAh3entO2pdN5tPzkWY_rajik19c48DLkT9cEzl40ERJ6fZ795zPp-nbGSuhplgI_gG2zeEM6zhGn6If4syR89Ar5sFHRQdCCuOPiNTgH8JzmxtzhbgcEgkIqzVBi1jJVBmxj4TCZvd_SEWAw8-wX2D04wS5s3UfTJC38p8wVqSmuaeug1kz6BFqmj9WEQjsx7pjtHm2NMxo5ZdufoPCwF1cgc5VVN7uMIbcWzFIv9It',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBloYkWcAZ6nPHwnmfr57eTpo9sQHjaPnq1pOAEahqybC22VT7cuyiepuqlQxTcbSBZWhCoIeGUkF4SDg4ujaMebFNeZozVwNLw3YEYuyeQi18wPDMjSvuKmYeePF6IFZLtG4qtswQf3z0TvGOOdNC6RVS_AXRLVTlaptmOzoPoC8tQNeXJkNFcCNS8wO9mxPgY9RgGPFN5FfRIF8vZgxnP8mn0sCLN_IFvdxkbCD7L-V_UVNWhc0agxbWvwV63hi5VKn0dqAerM1fd'
    ]
  };

  return (
    <div className="pt-8 pb-40 px-6 max-w-4xl mx-auto relative">
      <Link to="/profile" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Back to Profile</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="flex -space-x-4 scale-125">
            {position.imgs.map((img, i) => (
              <div key={i} className="w-12 h-12 rounded-full border-[3px] border-black bg-black overflow-hidden relative z-[5-i]">
                <img alt="token" className="w-full h-full object-contain" src={img}/>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{position.pair}</h1>
              <span className="text-xs font-black bg-white/10 text-white/60 px-3 py-1 rounded-full uppercase tracking-widest">{position.fee}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 ${position.statusColor}`}>
                {position.status}
              </span>
              <span className="text-[10px] text-white/20 font-mono uppercase">Position #{position.id}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 relative">
          <button 
            onClick={() => {
              setActiveModal('collect');
              setIsCollectingFees(true);
              setManageOpen(false);
            }}
            className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border ${
              isCollectingFees 
                ? 'bg-primary/20 text-white border-primary ring-1 ring-primary/20' 
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            Collect Fees
          </button>
          
          <button 
            onClick={() => {
              setManageOpen(!manageOpen);
              setIsCollectingFees(false);
            }}
            className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${manageOpen ? 'bg-white/20 text-white border border-white/30' : 'bg-primary text-black gold-glow'}`}
          >
            Manage
            <ChevronDown size={14} className={`transition-transform duration-300 ${manageOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Manage Actions */}
      {manageOpen && (
        <div className="flex flex-wrap gap-4 mb-12 p-1 bg-white/[0.03] border border-white/5 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <button 
            onClick={() => {
              setSelectedAction('increase');
              setActiveModal('increase');
            }}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 px-6 py-4 rounded-xl border transition-all group ${
              selectedAction === 'increase' 
                ? 'bg-primary/20 border-primary ring-1 ring-primary/20' 
                : 'bg-white/5 border-white/10 hover:bg-primary/10 hover:border-primary/30'
            }`}
          >
            <ArrowUpCircle size={16} className={`transition-colors ${selectedAction === 'increase' ? 'text-primary' : 'text-white/20 group-hover:text-primary'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedAction === 'increase' ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>Increase Position</span>
          </button>
          
          <button 
            onClick={() => {
              setSelectedAction('decrease');
              setActiveModal('decrease');
            }}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 px-6 py-4 rounded-xl border transition-all group ${
              selectedAction === 'decrease' 
                ? 'bg-primary/20 border-primary ring-1 ring-primary/20' 
                : 'bg-white/5 border-white/10 hover:bg-primary/10 hover:border-primary/30'
            }`}
          >
            <ArrowDownCircle size={16} className={`transition-colors ${selectedAction === 'decrease' ? 'text-primary' : 'text-white/20 group-hover:text-primary'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedAction === 'decrease' ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>Decrease Position</span>
          </button>
          
          <button 
            onClick={() => {
              setSelectedAction('burn');
              setActiveModal('burn');
            }}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 px-6 py-4 rounded-xl border transition-all group ${
              selectedAction === 'burn' 
                ? 'bg-red-500/20 border-red-500 ring-1 ring-red-500/20' 
                : 'bg-red-500/[0.03] border-red-500/10 hover:bg-red-500/10 hover:border-red-500/30'
            }`}
          >
            <Flame size={16} className={`transition-colors ${selectedAction === 'burn' ? 'text-red-400' : 'text-red-400/40 group-hover:text-red-400'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedAction === 'burn' ? 'text-white' : 'text-red-400/60 group-hover:text-white'}`}>Burn Position</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Liquidity Card */}
        <div className="glass-morphism bg-white/[0.01] border border-white/5 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 blur-[80px] rounded-full pointer-events-none transition-colors group-hover:bg-primary/10"></div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-6">Total Liquidity</p>
          <p className="text-5xl font-black tracking-tighter text-white mb-8">{position.liquidity}</p>
          
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center py-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <img src={position.imgs[0]} alt="token0" className="w-6 h-6 rounded-full" />
                <span className="text-sm font-black text-white">{position.token0.symbol}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">{position.token0.amount}</p>
                <p className="text-[10px] text-white/30 font-mono">{position.token0.value}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <img src={position.imgs[1]} alt="token1" className="w-6 h-6 rounded-full" />
                <span className="text-sm font-black text-white">{position.token1.symbol}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">{position.token1.amount}</p>
                <p className="text-[10px] text-white/30 font-mono">{position.token1.value}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Unclaimed Fees Card */}
        <div className="glass-morphism bg-white/[0.01] border border-white/5 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none transition-colors group-hover:bg-emerald-500/10"></div>
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-black">Unclaimed Fees</p>
            <RefreshCw size={14} className="text-white/20" />
          </div>
          <p className="text-5xl font-black tracking-tighter text-emerald-400 mb-8">{position.unclaimedFees}</p>
          
          <div className="space-y-4 relative z-10">
             {/* Mock fees list */}
             <div className="flex justify-between items-center py-4 border-t border-white/5">
              <span className="text-sm font-black text-white/60">ETH</span>
              <span className="text-sm font-black text-white">0.042 ETH</span>
            </div>
            <div className="flex justify-between items-center py-4 border-t border-white/5 text-white/60">
              <span className="text-sm font-black">USDC</span>
              <span className="text-sm font-black text-white">12.50 USDC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Range Section */}
      <div className="glass-morphism bg-white/[0.01] border border-white/5 p-8">
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-8 text-center">Price Range</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="text-center p-6 bg-white/[0.02] border border-white/5">
            <p className="text-[9px] uppercase tracking-widest text-white/20 font-black mb-2">Min Price</p>
            <p className="text-3xl font-black text-white leading-none">{position.range.min}</p>
            <p className="text-[9px] text-white/40 uppercase mt-2">USDC per ETH</p>
          </div>
          
          <div className="text-center p-8 bg-primary/5 border border-primary/20 rounded-2xl relative shadow-[0_0_30px_rgba(255,210,23,0.05)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[8px] font-black px-3 py-1 uppercase tracking-[0.2em] rounded-full">Current Market</div>
            <p className="text-[9px] uppercase tracking-widest text-primary/40 font-black mb-2">Current Price</p>
            <p className="text-4xl font-black text-primary">{position.range.current}</p>
            <p className="text-[9px] text-primary/40 uppercase mt-1">USDC per ETH</p>
          </div>

          <div className="text-center p-6 bg-white/[0.02] border border-white/5">
            <p className="text-[9px] uppercase tracking-widest text-white/20 font-black mb-2">Max Price</p>
            <p className="text-3xl font-black text-white leading-none">{position.range.max}</p>
            <p className="text-[9px] text-white/40 uppercase mt-2">USDC per ETH</p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-12 relative h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="absolute h-full glass-morphism bg-primary/20 border-x border-primary" style={{ left: '20%', right: '25%' }}></div>
          <div className="absolute top-0 h-full w-1 bg-primary gold-glow" style={{ left: '42%' }}></div>
        </div>
        <div className="flex justify-between mt-4 text-[15px] font-black uppercase tracking-[0.3em] text-white/50">
          <span>0</span>
          <span>&infin;</span>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="mt-12">
        <button 
          onClick={() => setHistoryOpen(!historyOpen)}
          className="flex items-center gap-3 group outline-none"
        >
          <div className={`p-2 rounded-lg transition-colors ${historyOpen ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'}`}>
            <ChevronDown size={16} className={`transition-transform duration-300 ${historyOpen ? 'rotate-180' : ''}`} />
          </div>
          <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${historyOpen ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
            View Position History
          </span>
        </button>

        {historyOpen && (
          <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="glass-morphism bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5 bg-white/[0.02]">
                <div>Time</div>
                <div>Action</div>
                <div>Value</div>
                <div className="text-right">Hash</div>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { time: '2 days ago', action: 'Increase Liquidity', value: '$12,450.00', hash: '0x07616c15236920bf2562922417926de7d73d376ef249df7cc35176ccae51bd6b' },
                  { time: '5 days ago', action: 'Mint Position', value: '$30,400.42', hash: '0xd7ad58961727936a2818a7d25e4125f46487926de7d73d376ef249df7ccaa12fb' },
                  { time: '1 week ago', action: 'Collect Fees', value: '$842.10', hash: '0x17c928821727936a2818a7d25e4125f46487926de7d73d376ef249df7ccae51bd6b' }
                ].map((tx, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-8 py-6 items-center hover:bg-white/[0.03] transition-all group cursor-pointer">
                    <div className="text-[10px] font-bold text-white/40">{tx.time}</div>
                    <div className="text-[11px] font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">{tx.action}</div>
                    <div className="text-[11px] font-black text-white">{tx.value}</div>
                    <div className="text-right">
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
          </div>
        )}
      </div>

      {/* Collect Fees Modal */}
      {activeModal === 'collect' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveModal(null)}
          ></div>
          
          <div className="relative w-full max-w-lg h-[90vh] glass-morphism bg-[#0A0A0A] border border-primary/30 p-10 shadow-[0_0_50px_rgba(255,210,23,0.1)] animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mt-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Collect Fees</h2>
              <p className="text-[9px] text-white/40 font-medium max-w-[280px] uppercase tracking-[0.2em] mb-4">
                Claim your earned trading fees from this position.
              </p>
            </div>

            <div className="w-full flex-1 flex flex-col justify-center space-y-4">
              <div className="bg-white/[0.02] border border-white/5 p-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-6 text-center">Unclaimed Earnings</p>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-4">
                       <img src={position.imgs[0]} className="w-6 h-6 border border-white/10" />
                       <div>
                         <p className="text-xs font-black text-white uppercase">0.042 ETH</p>
                         <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Ethereum</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">$130.00</span>
                  </div>
                  
                  <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-4">
                       <img src={position.imgs[1]} className="w-6 h-6 border border-white/10" />
                       <div>
                         <p className="text-xs font-black text-white uppercase">12.50 USDC</p>
                         <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">USD Coin</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">$12.50</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Total Receivable</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">$142.50</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <button 
                onClick={() => setActiveModal(null)}
                className="py-4 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button className="py-5 bg-primary text-black font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,210,23,0.2)] hover:brightness-110 active:scale-95 transition-all text-[9px]">
                Collect All Fees
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Increase Position Modal */}
      {activeModal === 'increase' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveModal(null)}
          ></div>
          
          <div className="relative w-full max-w-lg h-[90vh] glass-morphism bg-[#0A0A0A] border border-primary/30 p-10 shadow-[0_0_50px_rgba(255,210,23,0.1)] animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mt-6">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Increase Position</h2>
              <p className="text-[9px] text-white/40 font-medium max-w-[280px] uppercase tracking-[0.2em] mb-2">
                Add more liquidity to your existing range.
              </p>
            </div>

            <div className="w-full flex-1 flex flex-col justify-center space-y-3">
              {/* Token Input 0 */}
              <div className="bg-white/[0.02] border border-white/5 p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Deposit Amount</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Bal: {token0.balance} {token0.symbol}</span>
                    <div className="flex gap-2">
                       {[25, 50, 75, 100].map(p => (
                        <button 
                          key={p} 
                          onClick={() => setIncreasePercent0(p)}
                          className={`text-[9px] font-black uppercase transition-colors ${
                            increasePercent0 === p ? 'text-primary' : 'text-white/20 hover:text-white/40'
                          }`}
                        >
                          {p === 100 ? 'MAX' : `${p}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <input 
                    type="number" 
                    placeholder="0.0" 
                    className="bg-transparent text-xl font-black text-white outline-none w-1/2 uppercase"
                  />
                  <TokenSelector 
                    selectedToken={token0}
                    onSelect={setToken0}
                    tokens={TOKENS}
                  />
                </div>
              </div>

              {/* Token Input 1 */}
              <div className="bg-white/[0.02] border border-white/5 p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Deposit Amount</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Bal: {token1.balance} {token1.symbol}</span>
                    <div className="flex gap-2">
                      {[25, 50, 75, 100].map(p => (
                        <button 
                          key={p} 
                          onClick={() => setIncreasePercent1(p)}
                          className={`text-[9px] font-black uppercase transition-colors ${
                            increasePercent1 === p ? 'text-primary' : 'text-white/20 hover:text-white/40'
                          }`}
                        >
                          {p === 100 ? 'MAX' : `${p}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <input 
                    type="number" 
                    placeholder="0.0" 
                    className="bg-transparent text-xl font-black text-white outline-none w-1/2 uppercase"
                  />
                  <TokenSelector 
                    selectedToken={token1}
                    onSelect={setToken1}
                    tokens={TOKENS}
                  />
                </div>
              </div>

              <div className="pt-2 px-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Selected Range</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">In Range</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.01] border border-white/5 p-2.5 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Min Price</p>
                    <p className="text-base font-black text-white">{position.range.min}</p>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 p-2.5 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Max Price</p>
                    <p className="text-base font-black text-white">{position.range.max}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <button 
                onClick={() => setActiveModal(null)}
                className="py-4 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all font-black"
              >
                Cancel
              </button>
              <button className="py-4 bg-primary text-black text-[9px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,210,23,0.3)] hover:brightness-110 transition-all font-black">
                Add Liquidity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decrease Position Modal */}
      {activeModal === 'decrease' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveModal(null)}
          ></div>
          
          <div className="relative w-full max-w-lg h-[90vh] glass-morphism bg-[#0A0A0A] border border-primary/30 p-10 shadow-[0_0_50px_rgba(255,210,23,0.1)] animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mt-6">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Remove Liquidity</h2>
              <p className="text-[9px] text-white/40 font-medium max-w-[280px] uppercase tracking-[0.2em] mb-2">
                Withdraw a portion of your assets.
              </p>
            </div>

            <div className="w-full flex-1 flex flex-col justify-center space-y-6">
              <div className="text-center">
                <span className="text-4xl font-black text-white tracking-tighter">{decreasePercent}%</span>
                <div className="flex justify-center gap-2 mt-6">
                  {[25, 50, 75, 100].map((p) => (
                    <button 
                      key={p}
                      onClick={() => setDecreasePercent(p)}
                      className={`px-3 py-1.5 border text-[8px] font-black uppercase tracking-widest transition-all ${
                        decreasePercent === p 
                        ? 'bg-primary text-black border-primary' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {p === 100 ? 'MAX' : `${p}%`}
                    </button>
                  ))}
                </div>
                <div className="px-10 mt-6 md:mt-10">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={decreasePercent}
                    onChange={(e) => setDecreasePercent(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 appearance-none outline-none accent-primary cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-5 space-y-3">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">Assets to Receive</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <img src={position.imgs[0]} className="w-4 h-4" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">ETH</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/60">6.22 ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <img src={position.imgs[1]} className="w-4 h-4" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">USDC</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/60">8,871.21 USDC</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <button 
                onClick={() => setActiveModal(null)}
                className="py-4 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all font-black"
              >
                Cancel
              </button>
              <button className="py-4 bg-primary text-black text-[9px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,210,23,0.3)] hover:brightness-110 transition-all font-black">
                Remove Liquidity
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Burn Modal */}
      {activeModal === 'burn' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveModal(null)}
          ></div>
          
          <div className="relative w-full max-w-lg h-[90vh] glass-morphism bg-[#0A0A0A] border border-red-500/30 p-10 shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mt-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Burn Position</h2>
              <p className="text-[9px] text-white/40 font-medium max-w-[280px] uppercase tracking-[0.2em]">
                This action is final and irreversible.
              </p>
            </div>

            <div className="w-full flex-1 flex flex-col justify-center space-y-4">
              <div className="bg-white/[0.02] border border-white/5 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-red-500/5 blur-[50px] pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Tokens to Claim</span>
                  <Wallet size={10} className="text-white/20" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <img src={position.imgs[0]} className="w-4 h-4" />
                       <span className="text-[11px] font-black text-white">12.442 ETH</span>
                    </div>
                    <span className="text-[9px] font-mono text-white/30">$25,262.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <img src={position.imgs[1]} className="w-4 h-4" />
                       <span className="text-[11px] font-black text-white">17,742.92 USDC</span>
                    </div>
                    <span className="text-[9px] font-mono text-white/30">$17,742.92</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Total Value</span>
                  <span className="text-xl font-black text-white tracking-tight">$43,005.42</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/10">
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-400/80 leading-relaxed font-black uppercase tracking-widest">
                  withdraw liquidity and terminate fee generation permanently.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <button 
                onClick={() => setActiveModal(null)}
                className="py-4 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button className="py-4 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:brightness-110 transition-all">
                Confirm Burn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

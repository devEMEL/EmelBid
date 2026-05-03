import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tokens' | 'activity' | 'positions'>('tokens');

  const positions = [
    {
      id: 1,
      pair: 'ETH / USDC',
      fee: '0.05%',
      range: '2,450.00 — 3,850.00',
      liquidity: '$42,850.42',
      status: 'In Range',
      statusColor: 'text-emerald-400',
      imgs: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuClYLTjMo-ECiwi1rxIYCry-M0GiEH4kWXDlAh3entO2pdN5tPzkWY_rajik19c48DLkT9cEzl40ERJ6fZ795zPp-nbGSuhplgI_gG2zeEM6zhGn6If4syR89Ar5sFHRQdCCuOPiNTgH8JzmxtzhbgcEgkIqzVBi1jJVBmxj4TCZvd_SEWAw8-wX2D04wS5s3UfTJC38p8wVqSmuaeug1kz6BFqmj9WEQjsx7pjtHm2NMxo5ZdufoPCwF1cgc5VVN7uMIbcWzFIv9It',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBloYkWcAZ6nPHwnmfr57eTpo9sQHjaPnq1pOAEahqybC22VT7cuyiepuqlQxTcbSBZWhCoIeGUkF4SDg4ujaMebFNeZozVwNLw3YEYuyeQi18wPDMjSvuKmYeePF6IFZLtG4qtswQf3z0TvGOOdNC6RVS_AXRLVTlaptmOzoPoC8tQNeXJkNFcCNS8wO9mxPgY9RgGPFN5FfRIF8vZgxnP8mn0sCLN_IFvdxkbCD7L-V_UVNWhc0agxbWvwV63hi5VKn0dqAerM1fd'
      ]
    },
    {
      id: 2,
      pair: 'WBTC / ETH',
      fee: '0.3%',
      range: '0.045 — 0.082',
      liquidity: '$12,400.12',
      status: 'In Range',
      statusColor: 'text-emerald-400',
      imgs: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA9fS3D-HZ_-lGQ2BXSLW-iFGfMzXneWXpusuEWp-7z3SHyHuEbnch2ViRXS52mWEl4ZMkgM1pJGdwy1SMUbN-l3oDHFl8zDeb1OCfqI0u40yUnBvRHf--2uli5lSgEHgnEZamTswfIDt63FeIXnlTad5IQf9y1YZKyyfc2ONeHAhYs1akExVKqWyg6oQW8WSfmPNVDWtZk8EwV1hN3XFnV0NgFvOFKz-BdMuiYLhtQquqDuiNl_KoodMz1BFPwvqug0iaZvnuBcxIS',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuClYLTjMo-ECiwi1rxIYCry-M0GiEH4kWXDlAh3entO2pdN5tPzkWY_rajik19c48DLkT9cEzl40ERJ6fZ795zPp-nbGSuhplgI_gG2zeEM6zhGn6If4syR89Ar5sFHRQdCCuOPiNTgH8JzmxtzhbgcEgkIqzVBi1jJVBmxj4TCZvd_SEWAw8-wX2D04wS5s3UfTJC38p8wVqSmuaeug1kz6BFqmj9WEQjsx7pjtHm2NMxo5ZdufoPCwF1cgc5VVN7uMIbcWzFIv9It'
      ]
    }
  ];
  const assets = [
    { name: 'Ethereum', symbol: 'ETH', balance: '32.4', value: '$84,200.00', change: '+4.2%', allocation: '58.9%', color: 'bg-[#627eea]/20', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClYLTjMo-ECiwi1rxIYCry-M0GiEH4kWXDlAh3entO2pdN5tPzkWY_rajik19c48DLkT9cEzl40ERJ6fZ795zPp-nbGSuhplgI_gG2zeEM6zhGn6If4syR89Ar5sFHRQdCCuOPiNTgH8JzmxtzhbgcEgkIqzVBi1jJVBmxj4TCZvd_SEWAw8-wX2D04wS5s3UfTJC38p8wVqSmuaeug1kz6BFqmj9WEQjsx7pjtHm2NMxo5ZdufoPCwF1cgc5VVN7uMIbcWzFIv9It' },
    { name: 'Wrapped Bitcoin', symbol: 'WBTC', balance: '0.68', value: '$45,300.00', change: '+1.8%', allocation: '31.7%', color: 'bg-[#f7931a]/20', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9fS3D-HZ_-lGQ2BXSLW-iFGfMzXneWXpusuEWp-7z3SHyHuEbnch2ViRXS52mWEl4ZMkgM1pJGdwy1SMUbN-l3oDHFl8zDeb1OCfqI0u40yUnBvRHf--2uli5lSgEHgnEZamTswfIDt63FeIXnlTad5IQf9y1YZKyyfc2ONeHAhYs1akExVKqWyg6oQW8WSfmPNVDWtZk8EwV1hN3XFnV0NgFvOFKz-BdMuiYLhtQquqDuiNl_KoodMz1BFPwvqug0iaZvnuBcxIS' },
    { name: 'emelSwap', symbol: 'EMEL', balance: '4,200', value: '$13,350.42', change: '+28.4%', allocation: '9.4%', color: 'bg-[#FFD217]/20', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWFpLMohjGa7qnXjSRSnntdmhqsMbsPGgdqpOGz02maqDfEPKszPIHkkpRF9VBzgw_W-wtmLNwETLRnOwd76kwHPILD7wq_hn4ltYF49-_BXC5uiyrXhXivz_gVSzLV_pPAeok81nHjf_mJDQq1ZtxE--g4FL-vZtBChiYRgdvk0R3Ock_M--Fz3dErK5rQeQTMkve8x0NonOqfFxlWxeevGv4XC7DyCb9VFhaHGTtVKY8Rnv3OdvOAAdsO2BJLotRq8mgS1-ReN6b', isNative: true },
  ];

  return (
    <div className="pt-8 pb-40 px-6 max-w-4xl mx-auto flex flex-col items-center relative z-10">
      
      {/* Hero Section */}
      <section className="w-full text-center mb-16">
        <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">My Portfolio</span>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-4">
          $142,850.<span className="text-white/40">42</span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-tertiary-dim font-bold bg-tertiary-dim/10 px-4 py-1.5 rounded-full w-fit mx-auto border border-tertiary-dim/20">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          <span className="text-sm tracking-tight">+12.5% ($15,240.00)</span>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-white/[0.03] rounded-full mb-12 shadow-inner border border-white/5 backdrop-blur-md">
        <button 
          onClick={() => setActiveTab('tokens')}
          className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
            activeTab === 'tokens' 
              ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10' 
              : 'text-white/40 hover:text-white'
          }`}
        >
          Tokens
        </button>
        <button 
          onClick={() => setActiveTab('positions')}
          className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
            activeTab === 'positions' 
              ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10' 
              : 'text-white/40 hover:text-white'
          }`}
        >
          Positions
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
            activeTab === 'activity' 
              ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10' 
              : 'text-white/40 hover:text-white'
          }`}
        >
          Activity
        </button>
      </div>

      {/* Content Bento */}
      <div className="w-full">
        {activeTab === 'tokens' ? (
          <div className="space-y-6">
            {assets.map((asset, idx) => (
              <div 
                key={idx} 
                className={`group bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] p-8 rounded-lg transition-all duration-500 cursor-pointer ${asset.isNative ? 'ring-1 ring-primary/20' : ''}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 ${asset.color} rounded-full flex items-center justify-center p-3 transition-transform duration-500 group-hover:scale-110`}>
                      <img alt={asset.symbol} className="w-full h-full object-contain" src={asset.img}/>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-white tracking-tight">{asset.name}</h3>
                        {asset.isNative && (
                          <span className="bg-primary text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Native</span>
                        )}
                      </div>
                      <p className="text-white/40 text-[10px] font-black tracking-[0.2em] uppercase mt-1">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white tracking-tight">{asset.value}</p>
                    <p className="text-tertiary-dim text-sm font-black mt-1">{asset.change}</p>
                  </div>
                </div>

                {/* Allocation Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                    <span>Allocation: {asset.allocation}</span>
                    <span className="font-mono">{asset.balance} {asset.symbol}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,210,23,0.3)]" 
                      style={{ width: asset.allocation }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'positions' ? (
          <div className="space-y-8">
            {/* Position Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-primary/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-black mb-2 relative z-10">Total Liquidity</p>
                <p className="text-2xl font-black text-white relative z-10 tracking-tight">$55,250.54</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-black mb-2 relative z-10">Unclaimed Fees</p>
                <p className="text-2xl font-black text-emerald-400 relative z-10 tracking-tight">$1,142.20</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-white/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-white/10 transition-colors"></div>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-black mb-2 relative z-10">Active Positions</p>
                <p className="text-2xl font-black text-white relative z-10 tracking-tight">{positions.length}</p>
              </div>
            </div>

            <div className="space-y-6">
            {positions.map((pos) => (
              <div 
                key={pos.id} 
                onClick={() => navigate(`/positions/${pos.id}`)}
                className="group bg-white/[0.01] border border-white/[0.05] hover:bg-white/[0.03] p-8 rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="flex -space-x-4">
                      {pos.imgs.map((img, i) => (
                        <div key={i} className="w-12 h-12 rounded-full border-[3px] border-black bg-black overflow-hidden relative z-[5-i]">
                          <img alt="token" className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" src={img}/>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-white tracking-tight">{pos.pair}</h3>
                        <span className="text-[9px] font-black bg-white/10 text-white/60 px-2 py-0.5 rounded uppercase tracking-widest">{pos.fee}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 ${pos.statusColor}`}>
                          {pos.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.1em] mt-2">
                        Range: <span className="text-white/60">{pos.range}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-left md:text-right w-full md:w-auto">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Liquidity Value</p>
                    <p className="text-2xl font-black text-white tracking-tight">{pos.liquidity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
          <div className="w-full bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
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
                    <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Token0</span>
                    <p className={`font-black text-[11px] tracking-tight ${tx.token0Amount.startsWith('-') ? 'text-white/60' : 'text-primary'}`}>{tx.token0Amount}</p>
                  </div>

                  <div className="flex md:block justify-between items-center">
                    <span className="md:hidden text-[9px] font-black text-white/20 uppercase tracking-widest">Token1</span>
                    <p className={`font-black text-[11px] tracking-tight ${tx.token1Amount.startsWith('-') ? 'text-white/60' : 'text-primary'}`}>{tx.token1Amount}</p>
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
            
            {/* Pagination ported but simplified */}
            <div className="p-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white/[0.01]">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                Showing recent activity
              </p>
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-full font-black text-[9px] uppercase tracking-widest text-white/30 cursor-not-allowed">
                  Prev
                </button>
                <button className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-black text-[9px] uppercase tracking-widest text-primary transition-all">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { ethers } from 'ethers';

export default function PoolsPage() {
  const navigate = useNavigate();
  const [addressSearch, setAddressSearch] = useState('');

  const computePoolId = (poolKey: { currency0: string; currency1: string; fee: number; tickSpacing: number; hooks: string }) => {
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "uint24", "int24", "address"],
      [
        poolKey.currency0,
        poolKey.currency1,
        poolKey.fee,
        poolKey.tickSpacing,
        poolKey.hooks,
      ]
    );
    return ethers.keccak256(encoded);
  };
  
  const pools = [
    { 
      id: 1, 
      pair: 'ETH / USDC', 
      fee: '0.05%', 
      rawFee: 500,
      tickSpacing: 10,
      hooks: ethers.ZeroAddress,
      tvl: '$124.5M', 
      volume24h: '$42.1M', 
      volTrend: '+12.4%',
      apr: '18.4%',
      token0: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
      token1: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      imgs: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuClYLTjMo-ECiwi1rxIYCry-M0GiEH4kWXDlAh3entO2pdN5tPzkWY_rajik19c48DLkT9cEzl40ERJ6fZ795zPp-nbGSuhplgI_gG2zeEM6zhGn6If4syR89Ar5sFHRQdCCuOPiNTgH8JzmxtzhbgcEgkIqzVBi1jJVBmxj4TCZvd_SEWAw8-wX2D04wS5s3UfTJC38p8wVqSmuaeug1kz6BFqmj9WEQjsx7pjtHm2NMxo5ZdufoPCwF1cgc5VVN7uMIbcWzFIv9It',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBloYkWcAZ6nPHwnmfr57eTpo9sQHjaPnq1pOAEahqybC22VT7cuyiepuqlQxTcbSBZWhCoIeGUkF4SDg4ujaMebFNeZozVwNLw3YEYuyeQi18wPDMjSvuKmYeePF6IFZLtG4qtswQf3z0TvGOOdNC6RVS_AXRLVTlaptmOzoPoC8tQNeXJkNFcCNS8wO9mxPgY9RgGPFN5FfRIF8vZgxnP8mn0sCLN_IFvdxkbCD7L-V_UVNWhc0agxbWvwV63hi5VKn0dqAerM1fd'
      ]
    },
    { 
      id: 2, 
      pair: 'EMEL / ETH', 
      fee: '0.3%', 
      rawFee: 3000,
      tickSpacing: 60,
      hooks: ethers.ZeroAddress,
      tvl: '$18.2M', 
      volume24h: '$5.4M', 
      volTrend: '+4.2%',
      apr: '42.6%',
      token0: '0x8888888888888888888888888888888888888888',
      token1: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
      isHot: true,
      imgs: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDWFpLMohjGa7qnXjSRSnntdmhqsMbsPGgdqpOGz02maqDfEPKszPIHkkpRF9VBzgw_W-wtmLNwETLRnOwd76kwHPILD7wq_hn4ltYF49-_BXC5uiyrXhXivz_gVSzLV_pPAeok81nHjf_mJDQq1ZtxE--g4FL-vZtBChiYRgdvk0R3Ock_M--Fz3dErK5rQeQTMkve8x0NonOqfFxlWxeevGv4XC7DyCb9VFhaHGTtVKY8Rnv3OdvOAAdsO2BJLotRq8mgS1-ReN6b',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuClYLTjMo-ECiwi1rxIYCry-M0GiEH4kWXDlAh3entO2pdN5tPzkWY_rajik19c48DLkT9cEzl40ERJ6fZ795zPp-nbGSuhplgI_gG2zeEM6zhGn6If4syR89Ar5sFHRQdCCuOPiNTgH8JzmxtzhbgcEgkIqzVBi1jJVBmxj4TCZvd_SEWAw8-wX2D04wS5s3UfTJC38p8wVqSmuaeug1kz6BFqmj9WEQjsx7pjtHm2NMxo5ZdufoPCwF1cgc5VVN7uMIbcWzFIv9It'
      ]
    },
    { 
      id: 3, 
      pair: 'WBTC / ETH', 
      fee: '0.3%', 
      rawFee: 3000,
      tickSpacing: 60,
      hooks: ethers.ZeroAddress,
      tvl: '$45.8M', 
      volume24h: '$12.1M', 
      volTrend: '-2.1%',
      apr: '12.2%',
      token0: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      token1: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
      imgs: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA9fS3D-HZ_-lGQ2BXSLW-iFGfMzXneWXpusuEWp-7z3SHyHuEbnch2ViRXS52mWEl4ZMkgM1pJGdwy1SMUbN-l3oDHFl8zDeb1OCfqI0u40yUnBvRHf--2uli5lSgEHgnEZamTswfIDt63FeIXnlTad5IQf9y1YZKyyfc2ONeHAhYs1akExVKqWyg6oQW8WSfmPNVDWtZk8EwV1hN3XFnV0NgFvOFKz-BdMuiYLhtQquqDuiNl_KoodMz1BFPwvqug0iaZvnuBcxIS',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuClYLTjMo-ECiwi1rxIYCry-M0GiEH4kWXDlAh3entO2pdN5tPzkWY_rajik19c48DLkT9cEzl40ERJ6fZ795zPp-nbGSuhplgI_gG2zeEM6zhGn6If4syR89Ar5sFHRQdCCuOPiNTgH8JzmxtzhbgcEgkIqzVBi1jJVBmxj4TCZvd_SEWAw8-wX2D04wS5s3UfTJC38p8wVqSmuaeug1kz6BFqmj9WEQjsx7pjtHm2NMxo5ZdufoPCwF1cgc5VVN7uMIbcWzFIv9It'
      ]
    }
  ];

  const filteredPools = pools.filter(pool => 
    !addressSearch || 
    pool.token0.toLowerCase().includes(addressSearch.toLowerCase()) || 
    pool.token1.toLowerCase().includes(addressSearch.toLowerCase())
  );

  return (
    <div className="pt-8 pb-40 px-6 max-w-6xl mx-auto relative z-10">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
            Liquidity Pools
          </h1>
        </div>
        <div className="flex gap-4">
          <Link to="/pools/create" className="bg-primary text-black px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all gold-glow hover:brightness-110 active:scale-95 flex items-center gap-3">
            <Plus size={16} strokeWidth={3} />
            Create Pool
          </Link>
        </div>
      </header>

      {/* Analytics Summary - MOVED ABOVE POOLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-morphism p-8 rounded-lg bg-white/[0.01]">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Total Value Locked</p>
          <h4 className="text-4xl font-black text-white tracking-tighter">$4.82B</h4>
          <p className="text-tertiary-dim text-xs font-bold mt-2">+2.4% last 24h</p>
        </div>
        <div className="glass-morphism p-8 rounded-lg bg-white/[0.01]">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Volume 24H</p>
          <h4 className="text-4xl font-black text-white tracking-tighter">$1.15B</h4>
          <p className="text-tertiary-dim text-xs font-bold mt-2">+12.8% last 24h</p>
        </div>
        <div className="glass-morphism p-8 rounded-lg bg-white/[0.01]">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Total Fees 24H</p>
          <h4 className="text-4xl font-black text-white tracking-tighter">$3.45M</h4>
          <p className="text-tertiary-dim text-xs font-bold mt-2">Shared with LPs</p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-8 max-w-md">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search by token address..." 
            value={addressSearch}
            onChange={(e) => setAddressSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-full px-12 py-4 text-sm font-medium text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
          />
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
        </div>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-6 p-6 border-b border-white/[0.05] bg-white/[0.01]">
            <div className="col-span-2 text-[10px] font-black text-white/30 uppercase tracking-widest">Pool Pair</div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right">TVL</div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Volume 24H</div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right">24H Trend</div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right">APR</div>
          </div>

          {/* Pool Rows */}
          {filteredPools.map((pool) => {
            const computedId = computePoolId({
              currency0: pool.token0,
              currency1: pool.token1,
              fee: pool.rawFee,
              tickSpacing: pool.tickSpacing,
              hooks: pool.hooks
            });
            return (
            <div 
              key={pool.id} 
              onClick={() => navigate(`/pools/${computedId}`)}
              className="grid grid-cols-1 md:grid-cols-6 p-6 items-center border-b border-white/[0.05] hover:bg-white/[0.03] transition-all duration-300 group last:border-0 cursor-pointer"
            >
              <div className="col-span-2 flex items-center gap-6">
                <div className="flex -space-x-4">
                  {pool.imgs.map((img, i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-[3px] border-black bg-black overflow-hidden relative z-[5-i]">
                      <img alt="token" className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" src={img}/>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-white tracking-tight">{pool.pair}</h3>
                    <span className="text-[9px] font-black bg-white/10 text-white/60 px-2 py-0.5 rounded uppercase">{pool.fee}</span>
                    {pool.isHot && (
                      <span className="bg-primary/20 text-primary text-[9px] font-black px-2 py-0.5 rounded uppercase animate-pulse">Hot</span>
                    )}
                  </div>
                  
                </div>
              </div>
              <div className="flex md:block justify-between items-center mt-6 md:mt-0">
                <span className="md:hidden text-[9px] font-black text-white/30 uppercase">TVL</span>
                <p className="text-lg font-black text-white text-right tracking-tight">{pool.tvl}</p>
              </div>
              <div className="flex md:block justify-between items-center mt-2 md:mt-0">
                <span className="md:hidden text-[9px] font-black text-white/30 uppercase">Volume</span>
                <p className="text-lg font-black text-white text-right tracking-tight leading-none">{pool.volume24h}</p>
              </div>
              <div className="flex md:block justify-between items-center mt-2 md:mt-0">
                <span className="md:hidden text-[9px] font-black text-white/30 uppercase">Trend</span>
                <div className="text-right">
                  {pool.volTrend ? (
                    <p className={`text-lg font-black tracking-tight ${pool.volTrend.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {pool.volTrend}
                    </p>
                  ) : <p className="text-lg font-black text-white/20 tracking-tight">-</p>}
                </div>
              </div>
              <div className="flex md:block justify-between items-center mt-2 md:mt-0">
                <span className="md:hidden text-[9px] font-black text-white/30 uppercase">APR</span>
                <p className="text-lg font-black text-tertiary-dim text-right tracking-tight">{pool.apr}</p>
              </div>
              
            </div>
            );
          })}
          {filteredPools.length === 0 && (
            <div className="p-20 text-center text-white/20 font-black uppercase text-xs tracking-widest opacity-50">
              No pools found for this token address
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

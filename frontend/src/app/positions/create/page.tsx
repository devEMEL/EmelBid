import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Info, Minus, Plus, Infinity } from 'lucide-react';
import TokenSelector, { Token } from '@/components/TokenSelector';

const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', balance: '45.23', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  { symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', balance: '12,400.00', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48' },
  { symbol: 'USDT', name: 'Tether', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png', balance: '5,120.50', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png', balance: '1.24', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
  { symbol: 'DAI', name: 'Dai Stablecoin', logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png', balance: '8,900.00', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
];

export default function CreatePositionPage() {
  const { params } = useParams<{ params: string }>();
  
  const [tokenA, setTokenA] = useState<Token>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(TOKENS[1]);
  const [feeTier, setFeeTier] = useState('0.3%');
  const [rangeType, setRangeType] = useState<'full' | 'custom'>('custom');
  const [strategy, setStrategy] = useState<'stable' | 'wide'>('wide');
  const [minPrice, setMinPrice] = useState(71142);
  const [maxPrice, setMaxPrice] = useState(141832);
  const [copied0, setCopied0] = useState(false);
  const [copied1, setCopied1] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const feeTiers = [
    { label: '0.01%', sub: 'STABLE', spacing: '1' },
    { label: '0.05%', sub: 'BEST', spacing: '10' },
    { label: '0.3%', sub: 'DEFI', spacing: '60' },
    { label: '1.00%', sub: 'EXOTIC', spacing: '200' },
  ];

  const copyToClipboard = (text: string, isToken0: boolean) => {
    navigator.clipboard.writeText(text);
    if (isToken0) {
      setCopied0(true);
      setTimeout(() => setCopied0(false), 2000);
    } else {
      setCopied1(true);
      setTimeout(() => setCopied1(false), 2000);
    }
  };

  const isTokenA0 = (tokenA.address || '').toLowerCase() < (tokenB.address || '').toLowerCase();
  const t0 = isTokenA0 ? tokenA : tokenB;
  const t1 = isTokenA0 ? tokenB : tokenA;

  return (
    <div className="pt-8 pb-40 px-6 max-w-4xl mx-auto relative group/page">
      {/* Abstract Background Mesh */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[150px] rounded-full pointer-events-none group-hover/page:bg-primary/10 transition-colors duration-1000"></div>
      <div className="absolute bottom-40 left-0 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

      <Link to="/positions" className="flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8 group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Back to Positions</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Mint Position</h1>
      </div>

      <div className="glass-morphism bg-white/[0.01] border border-white/5 p-10 relative overflow-hidden space-y-12">
        
        {/* Step 1: Select Pair */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Step 1: Select Pair</label>
             <Info size={12} className="text-white/10" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 p-6 flex flex-col gap-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">First Asset</span>
              <TokenSelector selectedToken={tokenA} onSelect={setTokenA} tokens={TOKENS} className="w-full" />
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 flex flex-col gap-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Second Asset</span>
              <TokenSelector selectedToken={tokenB} onSelect={setTokenB} tokens={TOKENS} className="w-full" />
            </div>
          </div>

          {/* Terminal Readout */}
          <div className="bg-black/40 border border-white/5 p-6 font-mono relative group">
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <span className="text-primary text-[10px] font-black w-6">[0]</span>
                <div className="flex flex-col gap-1 flex-1">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className="text-white text-[10px] font-black uppercase">{t0.symbol}</span>
                       <span className="text-white/20 text-[8px] uppercase tracking-widest font-black">Token0</span>
                     </div>
                     <button onClick={() => copyToClipboard(t0.address || '', true)} className={`transition-colors p-1 ${copied0 ? 'text-primary' : 'text-white/10 hover:text-primary'}`}>
                       {copied0 ? <Check size={10} /> : <Copy size={10} />}
                     </button>
                   </div>
                   <span className="text-white/40 text-[9px] tracking-widest break-all select-all leading-relaxed uppercase">{t0.address}</span>
                </div>
              </div>
              <div className="flex items-start gap-4 pt-4 border-t border-white/[0.03]">
                <span className="text-white/20 text-[10px] font-black w-6">[1]</span>
                <div className="flex flex-col gap-1 flex-1">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className="text-white text-[10px] font-black uppercase">{t1.symbol}</span>
                       <span className="text-white/20 text-[8px] uppercase tracking-widest font-black">Token1</span>
                     </div>
                     <button onClick={() => copyToClipboard(t1.address || '', false)} className={`transition-colors p-1 ${copied1 ? 'text-primary' : 'text-white/10 hover:text-primary'}`}>
                       {copied1 ? <Check size={10} /> : <Copy size={10} />}
                     </button>
                   </div>
                   <span className="text-white/40 text-[9px] tracking-widest break-all select-all leading-relaxed uppercase">{t1.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Fee Tier */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Step 2: Select Fee Tier</label>
            <Info size={12} className="text-white/10" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {feeTiers.map((tier) => (
              <button
                key={tier.label}
                onClick={() => setFeeTier(tier.label)}
                className={`flex flex-col text-left transition-all relative overflow-hidden group border-t-2 ${
                  feeTier === tier.label ? 'bg-white/[0.04] border-primary shadow-[inset_0_0_20px_rgba(255,210,23,0.05)]' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <div className="p-6 pb-2">
                  <span className={`text-3xl font-black tracking-tighter block leading-none ${feeTier === tier.label ? 'text-primary' : 'text-white'}`}>{tier.label}</span>
                </div>
                <div className="mt-auto border-t border-white/[0.03] p-4 bg-white/[0.01] flex flex-col gap-1.5">
                   <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-black tracking-widest uppercase ${feeTier === tier.label ? 'text-white' : 'text-white/20'}`}>{tier.sub}</span>
                      {feeTier === tier.label && <Check size={8} className="text-primary" />}
                   </div>
                   <span className={`text-[9px] font-mono tracking-widest uppercase ${feeTier === tier.label ? 'text-primary' : 'text-white/10'}`}>Tick Spacing: {tier.spacing}</span>
                </div>
                {feeTier === tier.label && <div className="absolute top-0 right-0 w-2 h-2 bg-primary"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Price Range (Redesigned as Technical Corridor) */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Step 3: Select Price Range</label>
            <div className="flex bg-white/5 p-1 border border-white/10">
               {['CUSTOM', 'FULL RANGE'].map((type) => (
                 <button 
                  key={type}
                  onClick={() => setRangeType(type === 'FULL RANGE' ? 'full' : 'custom')}
                  className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all ${
                    (type === 'FULL RANGE' && rangeType === 'full') || (type === 'CUSTOM' && rangeType === 'custom')
                      ? 'bg-primary text-black'
                      : 'text-white/30 hover:text-white'
                  }`}
                 >
                   {type}
                 </button>
               ))}
            </div>
          </div>

          {rangeType === 'custom' && (
            <div className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
               {['STABLE', 'WIDE', 'ULTRA-WIDE'].map((strat) => (
                 <button 
                  key={strat}
                  onClick={() => setStrategy(strat.toLowerCase() as any)}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest border transition-all ${
                    strategy === strat.toLowerCase()
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white/[0.01] border-white/5 text-white/20 hover:text-white/40'
                  }`}
                 >
                   {strat}
                 </button>
               ))}
            </div>
          )}

          <div className="bg-black/40 border border-white/5 overflow-hidden flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] relative">
            {/* MIN PRICE */}
            <div className={`p-8 flex flex-col items-center justify-center gap-4 transition-all ${rangeType === 'full' ? 'opacity-20' : 'opacity-100'}`}>
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-primary/40"></div>
                 [ MIN_PRICE ]
               </span>
               <div className="flex items-center gap-8">
                  <button onClick={() => setMinPrice(Math.max(0, minPrice - 100))} disabled={rangeType === 'full'} className="text-white/10 hover:text-primary transition-colors disabled:opacity-0 p-2 border border-white/5 hover:border-primary/20"><Minus size={14} /></button>
                  <div className="flex flex-col items-center">
                    {rangeType === 'full' ? (
                      <span className="text-4xl font-black text-white tracking-tighter font-mono">0</span>
                    ) : (
                      <input 
                        type="text"
                        className="bg-transparent border-none text-3xl font-black text-center w-full focus:ring-0 text-white outline-none font-mono tracking-tighter p-0"
                        value={formatPrice(minPrice)}
                        onChange={(e) => {
                          const val = e.target.value.replace(/,/g, '');
                          if (val === '' || !isNaN(Number(val))) setMinPrice(val === '' ? 0 : Number(val));
                        }}
                      />
                    )}
                    <span className="text-[8px] font-mono text-primary/60 uppercase tracking-[0.2em] mt-1">-14.2% OFFSET</span>
                  </div>
                  <button onClick={() => setMinPrice(minPrice + 100)} disabled={rangeType === 'full'} className="text-white/10 hover:text-primary transition-colors disabled:opacity-0 p-2 border border-white/5 hover:border-primary/20"><Plus size={14} /></button>
               </div>
            </div>

            {/* CENTRAL ANCHOR */}
            <div className="bg-white/5 border-y md:border-y-0 md:border-x border-white/5 flex flex-col items-center justify-center px-6 py-4 md:py-0">
               <div className="flex flex-col items-center relative gap-2">
                 <span className="text-[8px] font-black tracking-[0.3em] text-primary uppercase">PRICE</span>
                 <p className="text-sm font-black text-white font-mono tracking-tighter">70,833.90</p>
                 <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">{t1.symbol}/{t0.symbol}</span>
               </div>
            </div>

            {/* MAX PRICE */}
            <div className={`p-8 flex flex-col items-center justify-center gap-4 transition-all ${rangeType === 'full' ? 'opacity-20' : 'opacity-100'}`}>
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                 [ MAX_PRICE ]
                 <div className="w-1.5 h-1.5 bg-primary/40"></div>
               </span>
               <div className="flex items-center gap-8">
                  <button onClick={() => setMaxPrice(Math.max(minPrice + 100, maxPrice - 100))} disabled={rangeType === 'full'} className="text-white/10 hover:text-primary transition-colors disabled:opacity-0 p-2 border border-white/5 hover:border-primary/20"><Minus size={14} /></button>
                  <div className="flex flex-col items-center">
                    {rangeType === 'full' ? (
                      <Infinity size={32} className="text-white opacity-40 my-1 font-mono" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <input 
                          type="text"
                          className="bg-transparent border-none text-3xl font-black text-center w-full focus:ring-0 text-white outline-none font-mono tracking-tighter p-0"
                          value={formatPrice(maxPrice)}
                          onChange={(e) => {
                            const val = e.target.value.replace(/,/g, '');
                            if (val === '' || !isNaN(Number(val))) setMaxPrice(val === '' ? 0 : Number(val));
                          }}
                        />
                        <span className="text-[8px] font-mono text-primary/60 uppercase tracking-[0.2em] mt-1">+100.2% OFFSET</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setMaxPrice(maxPrice + 100)} disabled={rangeType === 'full'} className="text-white/10 hover:text-primary transition-colors disabled:opacity-0 p-2 border border-white/5 hover:border-primary/20"><Plus size={14} /></button>
               </div>
            </div>
          </div>
          
        </div>

        {/* Step 4: Deposit Amount */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Step 4: Deposit Tokens</label>
            <Info size={12} className="text-white/10" />
          </div>
          
          <div className="space-y-4">
            <div className="bg-black/40 border border-white/5 p-6 flex flex-col gap-4 group focus-within:border-primary/40 transition-all">
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Amount to Deposit</span>
                  <input className="bg-transparent border-none text-3xl font-black p-0 focus:ring-0 text-white outline-none w-full" placeholder="0.0" type="text" defaultValue="0.5" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 border border-white/10">
                    <img className="h-4 w-4 rounded-full" src={t0.logo} alt={t0.symbol} />
                    <span className="text-xs font-black text-white tracking-widest uppercase">{t0.symbol}</span>
                  </div>
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Balance: {t0.balance}</span>
                </div>
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 p-6 flex flex-col gap-4 group focus-within:border-primary/40 transition-all">
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Amount to Deposit</span>
                  <input className="bg-transparent border-none text-3xl font-black p-0 focus:ring-0 text-white outline-none w-full" placeholder="0.0" type="text" defaultValue="35,416" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 border border-white/10">
                    <img className="h-4 w-4 rounded-full" src={t1.logo} alt={t1.symbol} />
                    <span className="text-xs font-black text-white tracking-widest uppercase">{t1.symbol}</span>
                  </div>
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Balance: {t1.balance}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-4">
          <button className="w-full bg-primary text-black font-black tracking-[0.2em] uppercase py-6 text-[10px] gold-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            Mint Position
          </button>
        </div>
      </div>
    </div>
  );
}

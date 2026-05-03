import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Info, ChevronDown } from 'lucide-react';
import TokenSelector, { Token } from '@/components/TokenSelector';

const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', balance: '45.23', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  { symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', balance: '12,400.00', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48' },
  { symbol: 'USDT', name: 'Tether', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png', balance: '5,120.50', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png', balance: '1.24', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
  { symbol: 'DAI', name: 'Dai Stablecoin', logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png', balance: '8,900.00', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
];

export default function CreatePoolPage() {
  const [feeTier, setFeeTier] = useState('0.3%');
  const [startingRatio, setStartingRatio] = useState('1:1');
  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);
  const [tokenA, setTokenA] = useState<Token>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(TOKENS[1]);

  const copyToken = (address: string, isA: boolean) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    if (isA) {
      setCopiedA(true);
      setTimeout(() => setCopiedA(false), 2000);
    } else {
      setCopiedB(true);
      setTimeout(() => setCopiedB(false), 2000);
    }
  };

  const feeTiers = [
    { label: '0.01%', sub: 'STABLE', spacing: '1' },
    { label: '0.05%', sub: 'BEST', spacing: '10' },
    { label: '0.3%', sub: 'DEFI', spacing: '60' },
    { label: '1.00%', sub: 'EXOTIC', spacing: '200' },
  ];

  const [copied0, setCopied0] = useState(false);
  const [copied1, setCopied1] = useState(false);

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
    <div className="pt-8 pb-40 px-6 max-w-4xl mx-auto relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-40 left-0 w-[250px] h-[250px] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

      <Link to="/pools" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Back to Pools</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Create Pool</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Initialize a new liquidity pair and set protocol parameters.</p>
      </div>

      <div className="glass-morphism bg-white/[0.01] border border-white/5 p-10 relative overflow-hidden space-y-10">
        
        {/* Select Pair Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Step 1: Select Pair</label>
             <Info size={12} className="text-white/10" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Token A */}
            <div className="bg-white/[0.02] border border-white/5 p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">First Asset</span>
              </div>
              <div className="flex justify-between items-center">
                <TokenSelector 
                  selectedToken={tokenA}
                  onSelect={setTokenA}
                  tokens={TOKENS}
                  className="w-full"
                />
              </div>
            </div>

            {/* Token B */}
            <div className="bg-white/[0.02] border border-white/5 p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Second Asset</span>
              </div>
              <div className="flex justify-between items-center">
                <TokenSelector 
                  selectedToken={tokenB}
                  onSelect={setTokenB}
                  tokens={TOKENS}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Token Order Summary - Protocol Readout */}
          <div className="bg-black/40 border border-white/5 p-6 font-mono relative group">
            <div className="space-y-3">
              <div className="flex items-start gap-4 group/t0">
                <span className="text-primary text-[10px] font-black w-6">[0]</span>
                <div className="flex flex-col gap-1 flex-1">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className="text-white text-[10px] font-black uppercase">{t0.symbol}</span>
                       <span className="text-white/20 text-[8px] uppercase tracking-widest font-black">Token0</span>
                     </div>
                     <button 
                      onClick={() => copyToClipboard(t0.address || '', true)}
                      className={`transition-colors p-1 ${copied0 ? 'text-primary' : 'text-white/10 hover:text-primary'}`}
                      title="Copy Address"
                     >
                       {copied0 ? <Check size={10} /> : <Copy size={10} />}
                     </button>
                   </div>
                   <span className="text-white/40 text-[9px] tracking-widest break-all select-all leading-relaxed uppercase">
                     {t0.address}
                   </span>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-4 border-t border-white/[0.03] group/t1">
                <span className="text-white/20 text-[10px] font-black w-6">[1]</span>
                <div className="flex flex-col gap-1 flex-1">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className="text-white text-[10px] font-black uppercase">{t1.symbol}</span>
                       <span className="text-white/20 text-[8px] uppercase tracking-widest font-black">Token1</span>
                     </div>
                     <button 
                      onClick={() => copyToClipboard(t1.address || '', false)}
                      className={`transition-colors p-1 ${copied1 ? 'text-primary' : 'text-white/10 hover:text-primary'}`}
                      title="Copy Address"
                     >
                       {copied1 ? <Check size={10} /> : <Copy size={10} />}
                     </button>
                   </div>
                   <span className="text-white/40 text-[9px] tracking-widest break-all select-all leading-relaxed uppercase">
                     {t1.address}
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Tier Section */}
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
                  feeTier === tier.label
                    ? 'bg-white/[0.04] border-primary shadow-[inset_0_0_20px_rgba(255,210,23,0.05)]'
                    : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <div className="p-6 pb-2">
                  <span className={`text-3xl font-black tracking-tighter block leading-none ${feeTier === tier.label ? 'text-primary' : 'text-white'}`}>
                    {tier.label}
                  </span>
                </div>
                
                <div className="mt-auto border-t border-white/[0.03] p-4 bg-white/[0.01] flex flex-col gap-1.5">
                   <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-black tracking-widest uppercase ${feeTier === tier.label ? 'text-white' : 'text-white/20'}`}>
                        {tier.sub}
                      </span>
                      {feeTier === tier.label && (
                        <Check size={8} className="text-primary" />
                      )}
                   </div>
                   <span className={`text-[9px] font-mono tracking-widest uppercase ${feeTier === tier.label ? 'text-primary' : 'text-white/10'}`}>
                     Tick Spacing: {tier.spacing}
                   </span>
                </div>

                {feeTier === tier.label && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-primary"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Starting Price Ratio Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">Step 3: Initial Rate</label>
            <Info size={12} className="text-white/10" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['1:1', '2:1', '1:2', 'CUSTOM'].map((opt) => (
              <button
                key={opt}
                onClick={() => setStartingRatio(opt)}
                className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest transition-all border ${
                  startingRatio === opt
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          
          {startingRatio === 'CUSTOM' && (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-white/[0.02] border border-white/5 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="space-y-2">
                 <p className="text-[8px] font-black uppercase tracking-widest text-white/20 text-center">{tokenA.symbol}</p>
                 <input
                   className="w-full bg-transparent border-b border-white/10 py-2 text-center focus:outline-none focus:border-primary transition-all font-black text-2xl text-white uppercase"
                   type="text"
                   defaultValue="1.0"
                 />
               </div>
               <span className="text-primary font-black text-2xl mt-4">:</span>
               <div className="space-y-2">
                 <p className="text-[8px] font-black uppercase tracking-widest text-white/20 text-center">{tokenB.symbol}</p>
                 <input
                   className="w-full bg-transparent border-b border-white/10 py-2 text-center focus:outline-none focus:border-primary transition-all font-black text-2xl text-white uppercase"
                   type="text"
                   defaultValue="1.0"
                 />
               </div>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="pt-4">
          <button className="w-full bg-primary text-black font-black tracking-[0.2em] uppercase py-6 text-[10px] gold-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            Initialize Liquidity Pool
          </button>
        </div>
      </div>
    </div>
  );
}

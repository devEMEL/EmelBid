import { useState } from 'react';
import { ArrowDown, ChevronDown } from 'lucide-react';
import TokenSelector, { Token } from '@/components/TokenSelector';
import Toast from '@/components/Toast';

const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', balance: '1.42' },
  { symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', balance: '4,102.00' },
  { symbol: 'USDT', name: 'Tether', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png', balance: '5,120.50' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png', balance: '0.042' },
  { symbol: 'DAI', name: 'Dai Stablecoin', logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png', balance: '8,900.00' },
];

export default function SwapPage() {
  const [fromAmount, setFromAmount] = useState('1.00');
  const [toAmount, setToAmount] = useState('2,431.12');
  const [slippage, setSlippage] = useState('5');
  const [isAutoSlippage, setIsAutoSlippage] = useState(true);
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);

  return (
    <div className="flex-grow flex items-center justify-center px-4 pt-8 pb-40 relative">
      {/* Background Glows */}
      <div className="fixed top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[480px]">      

        <div className="glass-morphism p-6 rounded-2xl border border-white/5 bg-white/[0.01] shadow-2xl relative">
          <div className="space-y-4">
            {/* From Token */}
            <div className="bg-white/[0.03] p-6 rounded-none border border-white/5 hover:border-white/10 transition-all">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">You Pay</span>
                <span className="text-[10px] font-bold text-white/40">Balance: {fromToken.balance} {fromToken.symbol}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <input 
                  type="text" 
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="bg-transparent border-none p-0 text-3xl font-black text-white focus:ring-0 focus:outline-none w-full placeholder:text-white/10"
                  placeholder="0.00"
                />
                <TokenSelector 
                  selectedToken={fromToken}
                  onSelect={setFromToken}
                  tokens={TOKENS}
                  className="shrink-0"
                />
              </div>
            </div>

            {/* Interchange Arrow */}
            <div className="flex justify-center -my-8 relative z-10">
              <button className="w-10 h-10 bg-black border border-white/10 rounded-none flex items-center justify-center text-primary shadow-xl hover:scale-110 active:scale-95 transition-all">
                <ArrowDown size={18} strokeWidth={3} />
              </button>
            </div>

            {/* To Token */}
            <div className="bg-white/[0.03] p-6 rounded-none border border-white/5 hover:border-white/10 transition-all">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">You Receive</span>
                <span className="text-[10px] font-bold text-white/40">Balance: {toToken.balance} {toToken.symbol}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <input 
                  type="text" 
                  value={toAmount}
                  readOnly
                  className="bg-transparent border-none p-0 text-3xl font-black text-white/40 focus:ring-0 focus:outline-none w-full"
                  placeholder="0.00"
                />
                <TokenSelector 
                  selectedToken={toToken}
                  onSelect={setToToken}
                  tokens={TOKENS}
                  className="shrink-0"
                />
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <button className="w-full mt-6 py-5 rounded-xl bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all gold-glow hover:brightness-110 active:scale-[0.98]">
            SWAP
          </button>
        </div>

        {/* Detailed Stats */}
        <div className="mt-8 px-6 space-y-3">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/20">
            <span>Rate</span>
            <span className="text-white/40">1 ETH = 2,431.12 USDC</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/20">
            <span>Slippage Tolerance</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setIsAutoSlippage(true); setSlippage('5'); }}
                className={`px-2 py-1 rounded-md transition-all font-bold ${isAutoSlippage ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
              >
                Auto
              </button>
              <div className={`relative flex items-center bg-black/40 border rounded-md px-2 py-1 transition-all ${!isAutoSlippage ? 'border-primary/50' : 'border-white/5'}`}>
                <input 
                  type="text" 
                  value={slippage}
                  onChange={(e) => { setSlippage(e.target.value); setIsAutoSlippage(false); }}
                  className="bg-transparent border-none p-0 text-[10px] font-bold text-white focus:ring-0 focus:outline-none w-6 text-right"
                />
                <span className="text-[10px] ml-0.5 text-white/40">%</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/20">
            <span>Estimated Gas</span>
            <span className="text-white/40">$4.12</span>
          </div>
        </div>
        {/* Toast Demo Layer */}
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
          <Toast 
            type="pending"
            title="Transaction Pending"
            message="Swapping 2.45 ETH for 4,500.00 USDC..."
            onClose={() => {}}
          />
          <Toast 
            type="success"
            title="Transaction Confirmed"
            message="Successfully swapped 0.5 WBTC for 32,150.20 USDT"
            txHash="0x123...abc"
            onClose={() => {}}
          />
          <Toast 
            type="error"
            title="Transaction Failed"
            message="Execution reverted: Insufficient liquidity for this trade pair. Please try a smaller amount."
            onClose={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

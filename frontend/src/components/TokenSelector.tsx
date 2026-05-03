import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface Token {
  symbol: string;
  name: string;
  logo: string;
  address?: string;
  balance?: string;
}

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  tokens: Token[];
  label?: string;
  className?: string;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onSelect,
  tokens,
  label = "Select Token",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTokens = tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 transition-all group active:scale-95"
      >
        {selectedToken ? (
          <>
            <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-5 h-5 shrink-0" />
            <span className="text-sm font-black text-white uppercase tracking-tight">{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="text-sm font-black text-white/40 uppercase tracking-tight">{label}</span>
        )}
        <ChevronDown 
          size={14} 
          className={`text-white/20 group-hover:text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown / Modal Portal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-6">
          {/* Solid Opaque Backdrop */}
          <div 
            className="absolute inset-0 bg-black"
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="relative w-full max-w-lg h-[90vh] glass-morphism bg-[#0A0A0A] border border-primary/30 p-10 shadow-[0_0_50px_rgba(255,210,23,0.1)] animate-in zoom-in-95 duration-300 flex flex-col items-center overflow-hidden text-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center mt-6 w-full">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1 font-black">Select Token</h2>
              <p className="text-[9px] text-white/40 font-medium uppercase tracking-[0.2em] mb-8">
                CHOOSE AN ASSET TO CONTINUE.
              </p>

              <div className="w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input
                  autoFocus
                  type="text"
                  placeholder="SEARCH NAME OR CONTRACT ADDRESS"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/40 transition-colors"
                />
              </div>
            </div>

            {/* Token List */}
            <div className="w-full flex-1 overflow-y-auto custom-scrollbar mt-6 px-1">
              {filteredTokens.length > 0 ? (
                <div className="space-y-1">
                  {filteredTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        onSelect(token);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className={`w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors group ${
                        selectedToken?.symbol === token.symbol ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img src={token.logo} alt={token.symbol} className="w-8 h-8 border border-white/10" />
                        <div className="text-left">
                          <p className={`text-[13px] font-black uppercase tracking-tight ${
                            selectedToken?.symbol === token.symbol ? 'text-primary' : 'text-white'
                          }`}>
                            {token.symbol}
                          </p>
                          <p className="text-[8px] font-medium text-white/30 uppercase tracking-widest">{token.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        {token.balance && (
                          <span className="text-[10px] font-mono text-white/60">{token.balance}</span>
                        )}
                        {selectedToken?.symbol === token.symbol && (
                          <span className="text-[7px] font-black uppercase tracking-widest text-primary font-bold">Selected</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 opacity-20">
                  <Search size={32} className="mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest">No assets found</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TokenSelector;

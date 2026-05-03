import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { usePrivy } from '@privy-io/react-auth';
import { Menu, X, Wallet, LogOut, ArrowRight, Copy, Check } from 'lucide-react';


export default function Navbar() {
  const { login, authenticated, user, logout } = usePrivy();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const [copied, setCopied] = useState(false);

  const wallet = user?.wallet?.address;
  const shortAddress = wallet ? `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}` : '';

  const handleCopy = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navLinks = [
    { label: 'Swap', href: '/' },
    { label: 'Pools', href: '/pools' },
    { label: 'Activity', href: '/activity' },
    { label: 'Profile', href: '/profile' },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-black/60 border-b border-white/5 backdrop-blur-3xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Logo />
            <nav className="hidden md:flex gap-10 items-center">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  to={link.href} 
                  className={`relative text-[10px] font-black uppercase tracking-[0.3em] transition-all py-1 ${
                    pathname === link.href ? 'text-white' : 'text-white/30 hover:text-white'
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(255,210,23,0.4)]"></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop View */}
            <div className="hidden md:flex items-center gap-4">
              {!authenticated ? (
                <>
                  <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,210,23,0.5)] animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Arc Testnet</span>
                  </div>
                  <button 
                    onClick={login}
                    className="bg-primary text-black px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all gold-glow hover:brightness-110 active:scale-95"
                  >
                    Connect Wallet
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="bg-white border border-transparent text-black px-5 h-11 rounded-full flex items-center gap-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <div className="flex items-center gap-2 pr-4 border-r border-black/10">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Arc Testnet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold tracking-tighter">
                        {shortAddress}
                      </span>
                      <button 
                        onClick={handleCopy} 
                        className="text-black/40 hover:text-black hover:scale-110 active:scale-95 transition-all"
                        title="Copy Address"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={logout}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/50 hover:text-red-400 text-white/50 px-6 h-11 rounded-full flex items-center justify-center font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 md:hidden bg-black/95 backdrop-blur-2xl transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col h-full pt-32 px-8 pb-12 overflow-y-auto">
          {/* Mobile Nav Links */}
          <nav className="flex flex-col gap-8 mb-auto">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between group py-4 border-b border-white/5"
              >
                <div className="flex flex-col">
                  <span className={`text-xl font-black uppercase italic tracking-tighter transition-all duration-300 ${pathname === link.href ? 'text-primary' : 'text-white/40 group-hover:text-primary'}`}>
                    {link.label}
                  </span>
                  {pathname === link.href && (
                    <div className="h-1 w-12 bg-primary mt-1 shadow-[0_0_10px_rgba(255,210,23,0.5)]"></div>
                  )}
                </div>
                <ArrowRight className={`text-primary transition-all duration-300 ${pathname === link.href ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </Link>
            ))}
          </nav>

          {/* Mobile Authentication Area */}
          <div className="mt-12 pt-12 border-t border-white/5">
            {!authenticated ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(255,210,23,0.5)] animate-pulse"></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Network Status</p>
                    <p className="text-xs font-bold text-white uppercase">Arc Testnet ACTIVE</p>
                  </div>
                </div>
                <button 
                  onClick={() => { login(); setIsMenuOpen(false); }}
                  className="w-full bg-primary text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all gold-glow"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white text-black p-8 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-black/5 pb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Connected Wallet</p>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                      <Wallet size={24} className="opacity-20" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-lg font-bold tracking-tighter">{shortAddress}</p>
                        <p className="text-[10px] font-black uppercase text-black/30 tracking-widest">Arc Testnet</p>
                      </div>
                      <button 
                        onClick={handleCopy} 
                        className="w-10 h-10 flex items-center justify-center rounded-full text-black/20 hover:text-black hover:bg-black/5 hover:scale-105 active:scale-95 transition-all outline-none"
                        title="Copy Address"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full bg-white/5 border border-white/10 text-white/40 py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:text-red-400 hover:border-red-400/30 transition-all"
                >
                  <LogOut size={16} />
                  Disconnect
                </button>
              </div>
            )}
          </div>

          <p className="mt-20 text-center text-[9px] font-black uppercase tracking-widest text-white/10 italic">
            emelSwap Protocol v4.0 Mobile Terminal
          </p>
        </div>
      </div>
    </>
  );
}

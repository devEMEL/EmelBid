
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-20 px-8 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-12">
          <Link to="/add-token" className="hover:text-primary transition-colors">Add Token</Link>
          <a href="#" className="hover:text-primary transition-colors">X (Twitter)</a>
          <a href="#" className="hover:text-primary transition-colors">GitHub</a>
          <a href="#" className="hover:text-primary transition-colors">Docs</a>
          <a href="#" className="hover:text-primary transition-colors">Discord</a>
        </div>
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
          &copy; 2026 EmelSwap. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

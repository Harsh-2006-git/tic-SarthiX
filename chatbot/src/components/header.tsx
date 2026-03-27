import { Landmark, Compass } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 glass border-b border-orange-100 py-3 shadow-sm">
      <div className="container mx-auto px-4 sm:px-8 lg:px-12 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 transition-transform active:scale-95">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden flex items-center justify-center border-2 border-orange-50 bg-white shadow-sm flex-shrink-0">
            <div className="text-xl sm:text-2xl text-orange-600 font-bold">🕉</div>
          </div>
          <span className="text-lg sm:text-2xl font-bold tracking-tight text-slate-700 whitespace-nowrap">
            Divya<span className="text-orange-600">Assistant</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-gray-50/50 p-1 rounded-2xl border border-gray-100">
          <Link href="/" className="px-5 py-2 rounded-xl text-sm font-bold bg-white text-orange-600 shadow-sm">
            AI Planner
          </Link>
          <a href="http://localhost:5173" className="px-5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-orange-600 hover:bg-white/50 transition-all">
            Main Site
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-orange-600 transition-all shadow-md active:scale-95">
            <Compass size={16} />
            Support
          </button>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { Search, Calendar, Bell, Radio, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { connected } = useSocket();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3 w-72">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sessions, customers, or risk signals..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium">
          <Radio className={`w-3.5 h-3.5 ${connected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
          <span className="text-slate-600">{connected ? 'Real-Time Pipeline Active' : 'Connecting Engine...'}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Last 7 Days</span>
        </div>

        <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 border border-white"></span>
        </button>

        <Link
          to="/demo-store"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Simulate Store</span>
        </Link>
      </div>
    </header>
  );
}

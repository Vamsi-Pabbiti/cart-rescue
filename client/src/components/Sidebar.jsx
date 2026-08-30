import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  Zap, 
  FlaskConical, 
  BarChart3, 
  Users, 
  Megaphone, 
  FileText, 
  Database, 
  Settings, 
  ShoppingBag,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Live Sessions', path: '/sessions', icon: Activity },
    { name: 'Risk Monitor', path: '/risk-monitor', icon: ShieldAlert },
    { name: 'Recovery Actions', path: '/actions', icon: Zap },
    { name: 'Experiments', path: '/experiments', icon: FlaskConical },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Campaigns', path: '/campaigns', icon: Megaphone },
    { name: 'Audit Logs', path: '/audit-logs', icon: FileText },
    { name: 'Dataset Import', path: '/datasets', icon: Database },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 shrink-0">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
            CR
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-none text-base">Cart Rescue</h1>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">AI Remediation Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}

        <div className="pt-3 mt-3 border-t border-slate-100">
          <NavLink
            to="/demo-store"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>Open Demo Store</span>
            <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold">LIVE</span>
          </NavLink>
        </div>
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-3 bg-slate-50/50">
        <div className="flex items-center justify-between px-2 text-[11px]">
          <span className="text-slate-500">API Gateway Status</span>
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <CheckCircle2 className="w-3 h-3" />
            Healthy
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
              {user ? user.name.charAt(0) : 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">{user?.role || 'admin'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

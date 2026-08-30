import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import { Search, RefreshCw, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function LiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const navigate = useNavigate();

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sessions', {
        params: { search, riskLevel: riskFilter, limit: 30 }
      });
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [riskFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Live Sessions Monitor</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time clickstream monitoring & instant risk evaluation</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter session or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSessions()}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-48"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical (81-100%)</option>
            <option value="high">High (61-80%)</option>
            <option value="medium">Medium (31-60%)</option>
            <option value="low">Low (0-30%)</option>
          </select>

          <button
            onClick={fetchSessions}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Session ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Cart Value</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Current Page</th>
                <th className="py-3.5 px-4">Time on Site</th>
                <th className="py-3.5 px-4">Tries / Fails</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Recommended Action</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">Loading live sessions...</td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">No active sessions found.</td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr
                    key={s.sessionId}
                    onClick={() => navigate(`/sessions/${s.sessionId}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">#{s.sessionId}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{s.customerName}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">₹{(s.cartValue || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-600">{s.cartItems?.length || 0}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{s.currentPage}</td>
                    <td className="py-3 px-4 text-slate-600">{Math.floor((s.timeOnPage || 0) / 60)}m {(s.timeOnPage || 0) % 60}s</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{s.paymentAttempts || 0} / <span className={s.paymentFailures > 0 ? 'text-red-600 font-bold' : ''}>{s.paymentFailures || 0}</span></td>
                    <td className="py-3 px-4">
                      <RiskBadge score={s.riskScore} level={s.riskLevel} />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 capitalize">
                      {(s.abandonmentReason || 'unknown').replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-800 text-[11px]">
                        {s.recommendedAction || 'DO_NOTHING'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1 text-slate-400 hover:text-blue-600 rounded">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

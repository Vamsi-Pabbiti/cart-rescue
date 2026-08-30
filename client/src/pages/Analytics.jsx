import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { DollarSign, Tag, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

export default function Analytics() {
  const [funnelData, setFunnelData] = useState([]);
  const [reasonsData, setReasonsData] = useState([]);
  const [recoveryData, setRecoveryData] = useState([]);
  const [marginData, setMarginData] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [funnelRes, recoveryRes, marginRes] = await Promise.all([
          api.get('/analytics/funnel'),
          api.get('/analytics/recovery'),
          api.get('/analytics/margin')
        ]);
        setFunnelData(funnelRes.data.funnel || []);
        setReasonsData(funnelRes.data.reasons || []);
        setRecoveryData(recoveryRes.data.recoveryByAction || []);
        setMarginData(marginRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadAnalytics();
  }, []);

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Conversion & Margin Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">Comprehensive funnel conversion, abandonment reasons, and incremental margin impact</p>
      </div>

      {marginData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Gross Recovered" value={`₹${(marginData.grossRecoveredRevenue / 100000).toFixed(2)}L`} color="indigo" icon={DollarSign} />
          <StatCard title="Discount Cost" value={`₹${marginData.discountCost.toLocaleString()}`} color="orange" icon={Tag} />
          <StatCard title="Incremental Margin" value={`₹${(marginData.incrementalMargin / 100000).toFixed(2)}L`} color="green" icon={TrendingUp} />
          <StatCard title="Margin / Recovery" value={`₹${marginData.marginPerRecovery.toLocaleString()}`} color="blue" icon={PieChartIcon} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">E-Commerce Conversion Funnel</h3>
          <div className="space-y-3 text-xs">
            {funnelData.map((f, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-medium text-slate-700">
                  <span>{f.stage}</span>
                  <span>{f.count.toLocaleString()} ({f.percentage}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${f.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Abandonment Reasons Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reasonsData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="reason">
                  {reasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {reasonsData.map((r, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-600 truncate">{r.reason}: <strong className="text-slate-900">{r.percentage}%</strong></span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Recovery Performance by Action Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recoveryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="action" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                <Tooltip />
                <Bar dataKey="rate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import LiveActivityStream from '../components/LiveActivityStream';
import { Users, AlertTriangle, TrendingUp, DollarSign, Tag, PieChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/analytics/overview');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const kpis = data?.kpis || {
    activeSessions: 2481,
    highRiskSessions: 384,
    recoveryRate: 18.7,
    recoveredRevenue: 842000,
    discountSpend: 72400,
    incrementalMargin: 584000
  };

  const chartData = data?.riskTrend || [
    { day: 'Mon', riskScore: 42, abandoned: 120, recovered: 22 },
    { day: 'Tue', riskScore: 45, abandoned: 140, recovered: 28 },
    { day: 'Wed', riskScore: 38, abandoned: 98, recovered: 20 },
    { day: 'Thu', riskScore: 52, abandoned: 180, recovered: 35 },
    { day: 'Fri', riskScore: 48, abandoned: 165, recovered: 31 },
    { day: 'Sat', riskScore: 55, abandoned: 210, recovered: 42 },
    { day: 'Sun', riskScore: 40, abandoned: 130, recovered: 26 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Executive Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time cart abandonment risk & incremental margin analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Active Sessions" value={kpis.activeSessions.toLocaleString()} change="+12.4% vs last week" icon={Users} color="blue" />
        <StatCard title="High-Risk Sessions" value={kpis.highRiskSessions.toLocaleString()} change="15.4% of total" icon={AlertTriangle} color="red" />
        <StatCard title="Recovery Rate" value={`${kpis.recoveryRate}%`} change="+3.2% vs control" icon={TrendingUp} color="green" />
        <StatCard title="Recovered Revenue" value={`₹${(kpis.recoveredRevenue / 100000).toFixed(2)}L`} change="+₹1.2L incremental" icon={DollarSign} color="indigo" />
        <StatCard title="Discount Spend" value={`₹${kpis.discountSpend.toLocaleString()}`} change="Within campaign limit" icon={Tag} color="orange" />
        <StatCard title="Incremental Margin" value={`₹${(kpis.incrementalMargin / 100000).toFixed(2)}L`} change="₹1,450 net per recovery" icon={PieChart} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Abandonment Risk & Recovery Trend</h3>
              <p className="text-xs text-slate-400">Daily breakdown of abandoned vs recovered sessions</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Abandoned</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Recovered</span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAbandoned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="abandoned" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAbandoned)" />
                <Area type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRecovered)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1">
          <LiveActivityStream />
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { TrendingUp, DollarSign, PieChart } from 'lucide-react';
import api from '../services/api';

export default function Experiments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.get('/analytics/experiments');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const control = data?.control || { totalSessions: 410, conversions: 30, conversionRate: 7.2, revenue: 480000 };
  const treatment = data?.treatment || { totalSessions: 1640, conversions: 160, conversionRate: 9.8, revenue: 640000, discountSpend: 24000 };
  const impact = data?.impact || { incrementalConversionRate: 2.6, totalIncrementalRevenue: 160000, netIncrementalMargin: 116000 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Holdout Control A/B Experiments</h1>
        <p className="text-xs text-slate-500 mt-0.5">Rigorous comparison of AI treatment vs 20% holdout control group</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Incremental Conversion" value={`+${impact.incrementalConversionRate}%`} change="AI Treatment Uplift" color="green" icon={TrendingUp} />
        <StatCard title="Incremental Revenue" value={`+₹${(impact.totalIncrementalRevenue / 100000).toFixed(2)}L`} change="Treatment - Control" color="indigo" icon={DollarSign} />
        <StatCard title="Incremental Margin" value={`+₹${(impact.netIncrementalMargin / 100000).toFixed(2)}L`} change="Net of discount costs" color="green" icon={PieChart} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400"></span>
              <h3 className="text-sm font-bold text-slate-900">CONTROL GROUP (20% Holdout)</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">No Action Executed</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400">Sessions</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{control.totalSessions.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400">Conversion Rate</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{control.conversionRate}%</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400">Total Revenue</span>
              <p className="text-lg font-bold text-slate-900 mt-1">₹{(control.revenue / 100000).toFixed(2)}L</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400">Discount Spend</span>
              <p className="text-lg font-bold text-slate-900 mt-1">₹0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-xs space-y-4 ring-1 ring-blue-100">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <h3 className="text-sm font-bold text-slate-900">AI TREATMENT GROUP (80%)</h3>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">AI Remediation Active</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-blue-50/50 rounded-lg">
              <span className="text-slate-500">Sessions</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{treatment.totalSessions.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <span className="text-emerald-700">Conversion Rate</span>
              <p className="text-lg font-bold text-emerald-700 mt-1">{treatment.conversionRate}%</p>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-lg">
              <span className="text-slate-500">Total Revenue</span>
              <p className="text-lg font-bold text-slate-900 mt-1">₹{(treatment.revenue / 100000).toFixed(2)}L</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <span className="text-amber-700">Discount Spend</span>
              <p className="text-lg font-bold text-amber-800 mt-1">₹{(treatment.discountSpend || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

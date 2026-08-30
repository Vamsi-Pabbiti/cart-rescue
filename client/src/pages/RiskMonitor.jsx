import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import { ShieldAlert, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function RiskMonitor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/risk/live');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const dist = data?.distribution || { low: 1420, medium: 320, high: 210, critical: 110 };
  const pieData = [
    { name: 'Low (0-30%)', value: dist.low, color: '#10b981' },
    { name: 'Medium (31-60%)', value: dist.medium, color: '#f59e0b' },
    { name: 'High (61-80%)', value: dist.high, color: '#f97316' },
    { name: 'Critical (81-100%)', value: dist.critical, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Real-Time Risk Monitor</h1>
        <p className="text-xs text-slate-500 mt-0.5">Automated scoring distribution & high-risk session queue</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Low Risk (0-30%)" value={dist.low.toLocaleString()} color="green" icon={CheckCircle} />
        <StatCard title="Medium Risk (31-60%)" value={dist.medium.toLocaleString()} color="orange" icon={Activity} />
        <StatCard title="High Risk (61-80%)" value={dist.high.toLocaleString()} color="orange" icon={AlertTriangle} />
        <StatCard title="Critical Risk (81-100%)" value={dist.critical.toLocaleString()} color="red" icon={ShieldAlert} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Risk Score Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">High-Risk Session Queue</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {(data?.highRiskSessions || []).map((s) => (
              <div
                key={s.sessionId}
                onClick={() => navigate(`/sessions/${s.sessionId}`)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 p-2 rounded-lg cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-blue-600">#{s.sessionId}</span>
                  <span className="text-slate-700 font-medium ml-2">{s.customerName}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 capitalize">Primary Cause: {(s.abandonmentReason || 'unknown').replace('_', ' ')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge score={s.riskScore} level={s.riskLevel} />
                  <span className="font-bold text-slate-900">₹{(s.cartValue || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

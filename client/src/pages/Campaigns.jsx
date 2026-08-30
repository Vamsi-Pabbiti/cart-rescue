import React, { useState, useEffect } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import api from '../services/api';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', budget: 100000, maxDiscount: 10, minOrderValue: 500 });

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', form);
      setShowModal(false);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Campaign Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Define recovery budget caps, max discount guardrails, and target rules</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((c) => {
          const utilPct = Math.min(Math.round(((c.spent || 0) / (c.budget || 1)) * 100), 100);
          return (
            <div key={c._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {c.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Budget Utilization</span>
                  <span>₹{(c.spent || 0).toLocaleString()} / ₹{(c.budget || 0).toLocaleString()} ({utilPct}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${utilPct > 90 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${utilPct}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400">Max Discount Limit</span>
                  <p className="font-bold text-slate-900 mt-0.5">{c.maxDiscount}% per order</p>
                </div>
                <div>
                  <span className="text-slate-400">Min Order Value</span>
                  <p className="font-bold text-slate-900 mt-0.5">₹{c.minOrderValue}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create New Campaign</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Campaign Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Maximum Budget (₹)</label>
                <input type="number" required value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} className="w-full p-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Max Discount Guardrail (%)</label>
                <input type="number" required value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} className="w-full p-2 border border-slate-200 rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

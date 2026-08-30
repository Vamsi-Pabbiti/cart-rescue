import React, { useState, useEffect } from 'react';
import { Search, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers', { params: { search } });
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const toggleConsent = async (cust, channel) => {
    try {
      const field = `${channel}OptIn`;
      const updated = await api.patch(`/customers/${cust.customerId}`, {
        [field]: !cust[field]
      });
      setCustomers((prev) => prev.map((c) => (c.customerId === cust.customerId ? updated.data : c)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customer Profiles & Consent</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer profiles and channel communication opt-in compliance</p>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Total Spend</th>
                <th className="py-3.5 px-4">Email Opt-In</th>
                <th className="py-3.5 px-4">WhatsApp Opt-In</th>
                <th className="py-3.5 px-4">SMS Opt-In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">Loading customers...</td></tr>
              ) : customers.map((c) => (
                <tr key={c.customerId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono">{c.email}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono">{c.phone || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-700">{c.totalOrders}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">₹{(c.totalSpend || 0).toLocaleString()}</td>

                  <td className="py-3 px-4">
                    <button onClick={() => toggleConsent(c, 'email')} className="flex items-center gap-1.5 cursor-pointer">
                      {c.emailOptIn ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-300" />}
                      <span className={c.emailOptIn ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>{c.emailOptIn ? 'Yes' : 'No'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <button onClick={() => toggleConsent(c, 'whatsapp')} className="flex items-center gap-1.5 cursor-pointer">
                      {c.whatsappOptIn ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-300" />}
                      <span className={c.whatsappOptIn ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>{c.whatsappOptIn ? 'Yes' : 'No'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <button onClick={() => toggleConsent(c, 'sms')} className="flex items-center gap-1.5 cursor-pointer">
                      {c.smsOptIn ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-300" />}
                      <span className={c.smsOptIn ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>{c.smsOptIn ? 'Yes' : 'No'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

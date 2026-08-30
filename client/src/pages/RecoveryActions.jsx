import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function RecoveryActions() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get('/actions/history');
        setHistory(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const boundedMenu = [
    { code: 'DO_NOTHING', name: 'Do Nothing', desc: 'No intervention. Preserves margin for low-risk or price-shopping shoppers.', cost: '₹0' },
    { code: 'SHOW_PAYMENT_HELP', name: 'Show Payment Help', desc: 'Instant gateway retry assistant or UPI fallback prompt.', cost: '₹0' },
    { code: 'OFFER_COD', name: 'Offer Cash on Delivery', desc: 'Enable verified COD or UPI cashback incentive for payment completion.', cost: '₹50' },
    { code: 'SHIPPING_INCENTIVE', name: 'Shipping Fee Incentive', desc: 'Waive shipping fee (₹99) if margin guardrail allows.', cost: '₹99' },
    { code: 'DELIVERY_INFORMATION', name: 'Delivery Guarantee Info', desc: 'Display express timeline & tracking guarantee.', cost: '₹0' },
    { code: 'SMALL_DISCOUNT', name: 'Small Discount (Max 10%)', desc: 'Targeted micro-discount within per-campaign budget.', cost: '10%' },
    { code: 'REMINDER_NOTIFICATION', name: 'Reminder Notification', desc: 'Trigger opt-in WhatsApp or Email cart recovery reminder.', cost: '₹2' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Recovery Actions & Policy Menu</h1>
        <p className="text-xs text-slate-500 mt-0.5">Strictly bounded action catalog with automatic margin & policy guardrails</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boundedMenu.map((act) => (
          <div key={act.code} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{act.code}</span>
              <span className="text-xs font-semibold text-slate-500">Est Cost: {act.cost}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{act.name}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{act.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Action Decision & Policy History Log</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {loading ? (
            <p className="py-4 text-center text-slate-400">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="py-4 text-center text-slate-400">No action history recorded yet.</p>
          ) : (
            history.map((h, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-semibold text-blue-600">#{h.sessionId}</span>
                  <span className="font-bold text-slate-900 ml-2">{h.action}</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{h.reason}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${h.policyStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {h.policyStatus}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{new Date(h.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

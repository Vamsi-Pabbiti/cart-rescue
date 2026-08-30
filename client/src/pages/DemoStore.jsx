import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, RefreshCw, Sparkles, CreditCard, CheckCircle2 } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import PolicyBadge from '../components/PolicyBadge';
import SignalBreakdown from '../components/SignalBreakdown';
import api from '../services/api';

export default function DemoStore() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [cart, setCart] = useState([
    { id: 'P-101', name: 'Wireless Noise-Canceling Headphones', price: 4999, qty: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' }
  ]);
  const [shippingCost, setShippingCost] = useState(99);
  const [demoResult, setDemoResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [autoDemoActive, setAutoDemoActive] = useState(false);

  const products = [
    { id: 'P-101', name: 'Wireless Noise-Canceling Headphones', price: 4999, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', rating: 4.8 },
    { id: 'P-102', name: 'Ultra-Smart Fitness Watch Pro', price: 3499, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', rating: 4.6 },
    { id: 'P-103', name: 'Portable Bluetooth Speaker', price: 1999, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', rating: 4.5 },
    { id: 'P-104', name: 'Ergonomic Mechanical Keyboard', price: 5999, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', rating: 4.9 }
  ];

  const triggerScenario = async (type) => {
    setSimulating(true);
    setDemoResult(null);
    try {
      const res = await api.post('/demo/trigger', { scenarioType: type });
      setDemoResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const runAutomatedDemo = async () => {
    setAutoDemoActive(true);
    setDemoResult(null);
    const scenarios = ['payment_failure', 'price_shopping', 'low_risk'];

    for (const sc of scenarios) {
      setSimulating(true);
      try {
        const res = await api.post('/demo/trigger', { scenarioType: sc });
        setDemoResult(res.data);
        await new Promise((r) => setTimeout(r, 2500));
      } catch (err) {
        console.error(err);
      }
    }
    setSimulating(false);
    setAutoDemoActive(false);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="bg-slate-900 text-white px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
          <div className="hidden sm:block text-xs font-semibold text-blue-400 border-l border-slate-700 pl-3">
            Real-Time AI Pipeline Simulation Mode
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="text-slate-400 mr-1 hidden lg:inline">Quick Trigger:</span>

          <button
            onClick={() => triggerScenario('payment_failure')}
            disabled={simulating}
            className="px-3 py-1.5 bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white border border-red-500/40 rounded-lg transition-colors cursor-pointer"
          >
            Simulate Payment Failure
          </button>

          <button
            onClick={() => triggerScenario('price_shopping')}
            disabled={simulating}
            className="px-3 py-1.5 bg-amber-600/20 text-amber-300 hover:bg-amber-600 hover:text-white border border-amber-500/40 rounded-lg transition-colors cursor-pointer"
          >
            Simulate Price Shopping
          </button>

          <button
            onClick={() => triggerScenario('shipping_shock')}
            disabled={simulating}
            className="px-3 py-1.5 bg-orange-600/20 text-orange-300 hover:bg-orange-600 hover:text-white border border-orange-500/40 rounded-lg transition-colors cursor-pointer"
          >
            Simulate Shipping Shock
          </button>

          <button
            onClick={() => triggerScenario('low_risk')}
            disabled={simulating}
            className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 rounded-lg transition-colors cursor-pointer"
          >
            Simulate Low Risk
          </button>

          <button
            onClick={runAutomatedDemo}
            disabled={simulating}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{autoDemoActive ? 'Running Multi-Scenario Demo...' : 'Run Automated Demo'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Apex Electronics Store</h2>
              <p className="text-xs text-slate-500">Interactive Customer E-Commerce Experience</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${activeTab === 'catalog' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Catalog
              </button>
              <button
                onClick={() => setActiveTab('cart')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${activeTab === 'cart' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Cart ({cart.length})
              </button>
              <button
                onClick={() => setActiveTab('checkout')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${activeTab === 'checkout' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Checkout
              </button>
            </div>
          </div>

          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-3 p-4 flex flex-col justify-between">
                  <img src={p.image} alt="" className="w-full h-40 object-cover rounded-lg bg-slate-100" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs font-bold text-blue-600 mt-1">₹{p.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => {
                      setCart([{ id: p.id, name: p.name, price: p.price, qty: 1, image: p.image }]);
                      setActiveTab('checkout');
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    Buy Now & Checkout
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'checkout' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Checkout & Payment Gateway</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Customer Name</label>
                  <input type="text" readOnly value="Priya Sharma" className="w-full p-2 bg-slate-50 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Delivery Address</label>
                  <input type="text" readOnly value="Bandra West, Mumbai - 400050" className="w-full p-2 bg-slate-50 border rounded-lg" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Cart Items Total</span>
                  <span>₹{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span>₹{shippingCost}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Payable Amount</span>
                  <span>₹{(cartSubtotal + shippingCost).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <p className="text-xs font-bold text-slate-700">Simulate Payment Action:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => triggerScenario('payment_failure')}
                    disabled={simulating}
                    className="py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-red-600" />
                    <span>Fail Payment Gateway</span>
                  </button>

                  <button
                    onClick={() => triggerScenario('low_risk')}
                    disabled={simulating}
                    className="py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Complete Payment Success</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">AI Decision Pipeline Inspector</h3>
            </div>

            {simulating ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                <p className="text-xs font-semibold text-slate-700">Running AI Risk & Policy Pipeline...</p>
              </div>
            ) : !demoResult ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Click any simulation button above to watch the AI risk scoring, diagnosis, and policy engine evaluate in real time!
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block font-mono">Session ID</span>
                    <span className="font-bold font-mono text-blue-600">#{demoResult.session.sessionId}</span>
                  </div>
                  <RiskBadge score={demoResult.riskAssessment.score} level={demoResult.riskAssessment.level} />
                </div>

                <SignalBreakdown signals={demoResult.riskAssessment.signals} />

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 block font-semibold">AI Diagnosis</span>
                  <p className="font-bold text-slate-900 capitalize">
                    {(demoResult.diagnosis.primaryReason || '').replace('_', ' ')} ({(demoResult.diagnosis.confidence * 100).toFixed(0)}% confidence)
                  </p>
                  <p className="text-slate-600 text-[11px] mt-1">{demoResult.diagnosis.explanation}</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 uppercase">Recommended Action</span>
                    <PolicyBadge status={demoResult.actionDecision.policyStatus} />
                  </div>
                  <p className="font-bold text-blue-600 text-sm">{demoResult.actionDecision.action}</p>
                  <p className="text-slate-500 text-[11px]">{demoResult.actionDecision.reason}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

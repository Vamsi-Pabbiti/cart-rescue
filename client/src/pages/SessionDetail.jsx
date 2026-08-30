import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import SignalBreakdown from '../components/SignalBreakdown';
import RecommendationCard from '../components/RecommendationCard';
import { ArrowLeft, User, ShoppingBag } from 'lucide-react';
import api from '../services/api';

export default function SessionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/sessions/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading session details...</div>;

  const session = data?.session;
  const customer = data?.customer || {};
  const riskAssessment = data?.latestRiskAssessment || {};

  if (!session) return <div className="p-8 text-center text-slate-400">Session not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/sessions" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sessions</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono text-slate-900">Session #{session.sessionId}</h1>
            <RiskBadge score={session.riskScore} level={session.riskLevel} />
          </div>
          <p className="text-xs text-slate-500 mt-1">Ingested {new Date(session.createdAt).toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-slate-400 block">Status</span>
            <span className="font-bold text-slate-900 capitalize">{session.status}</span>
          </div>
          <div className="text-right border-l border-slate-200 pl-4">
            <span className="text-slate-400 block">Holdout Group</span>
            <span className="font-bold text-blue-600">{session.experimentGroup || 'TREATMENT'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900">Customer Details</h3>
              </div>
              <span className="text-xs font-medium text-slate-500">ID: {session.customerId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Name</span>
                <p className="font-semibold text-slate-900">{session.customerName}</p>
              </div>
              <div>
                <span className="text-slate-400">Email</span>
                <p className="font-semibold text-slate-900">{session.customerEmail || 'N/A'}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Communication Opt-In Status</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${customer.emailOptIn ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <span>Email</span>
                  <span className="font-bold">{customer.emailOptIn ? '✓ Opted in' : '✕ Opted out'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${customer.whatsappOptIn ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <span>WhatsApp</span>
                  <span className="font-bold">{customer.whatsappOptIn ? '✓ Opted in' : '✕ Opted out'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${customer.smsOptIn ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <span>SMS</span>
                  <span className="font-bold">{customer.smsOptIn ? '✓ Opted in' : '✕ Opted out'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${customer.pushOptIn ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <span>Push</span>
                  <span className="font-bold">{customer.pushOptIn ? '✓ Opted in' : '✕ Opted out'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900">Cart Contents</h3>
              </div>
              <span className="text-xs font-bold text-slate-900">Total: ₹{(session.cartValue || 0).toLocaleString()}</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {(session.cartItems || []).map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Behavioral Signals</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Time on site</span>
                <span className="font-bold text-slate-900 mt-1 block">{Math.floor((session.timeOnPage || 0) / 60)}m {(session.timeOnPage || 0) % 60}s</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Product Views</span>
                <span className="font-bold text-slate-900 mt-1 block">{session.productViews || 0}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Payment Attempts</span>
                <span className="font-bold text-slate-900 mt-1 block">{session.paymentAttempts || 0}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Payment Failures</span>
                <span className={`font-bold mt-1 block ${session.paymentFailures > 0 ? 'text-red-600' : 'text-slate-900'}`}>{session.paymentFailures || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <SignalBreakdown signals={riskAssessment.signals || []} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">AI Primary Diagnosis</h3>

            <div>
              <span className="text-xs text-slate-400 block">Primary Reason</span>
              <p className="text-sm font-bold text-slate-900 capitalize mt-0.5">
                {(session.abandonmentReason || 'unknown').replace('_', ' ')}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Confidence</span>
              <p className="text-sm font-bold text-blue-600 mt-0.5">{((riskAssessment.confidence || 0.85) * 100).toFixed(0)}%</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed">
              {riskAssessment.explanation || 'Analyzed behavioral clickstream patterns to diagnose abandonment root cause.'}
            </div>
          </div>

          <RecommendationCard session={session} onActionExecuted={fetchDetail} />
        </div>
      </div>
    </div>
  );
}

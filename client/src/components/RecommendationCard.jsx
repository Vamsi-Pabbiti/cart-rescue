import React, { useState } from 'react';
import PolicyBadge from './PolicyBadge';
import RiskBadge from './RiskBadge';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function RecommendationCard({ session, onActionExecuted }) {
  const [executing, setExecuting] = useState(false);
  const [executedMessage, setExecutedMessage] = useState(null);

  if (!session) return null;

  const handleExecute = async (actionToRun) => {
    setExecuting(true);
    try {
      const res = await api.post('/actions/execute', {
        sessionId: session.sessionId,
        action: actionToRun
      });
      setExecutedMessage(res.data.message);
      if (onActionExecuted) onActionExecuted(res.data);
    } catch (err) {
      console.error(err);
      setExecutedMessage('Action failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setExecuting(false);
    }
  };

  const action = session.recommendedAction || 'DO_NOTHING';
  const isDoNothing = action === 'DO_NOTHING';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">AI Recommendation</h4>
            <p className="text-xs text-slate-500">{session.abandonmentReason ? session.abandonmentReason.replace('_', ' ').toUpperCase() : 'Analysis complete'}</p>
          </div>
        </div>
        <PolicyBadge status={session.actionExecuted ? 'Approved' : 'Approved'} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-slate-400 font-medium">Risk Score</span>
          <div className="mt-1">
            <RiskBadge score={session.riskScore} level={session.riskLevel} />
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-slate-400 font-medium">Recommended Action</span>
          <div className="mt-1 font-bold text-slate-900">{action}</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-slate-400 font-medium">Estimated Cost</span>
          <div className="mt-1 font-bold text-slate-900">₹{action === 'SHIPPING_INCENTIVE' ? (session.shippingCost || 99) : 0}</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-slate-400 font-medium">Expected Margin Impact</span>
          <div className="mt-1 font-bold text-emerald-600">+₹{Math.round((session.cartValue || 2500) * 0.18)}</div>
        </div>
      </div>

      {executedMessage ? (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{executedMessage}</span>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => handleExecute('DO_NOTHING')}
            disabled={executing}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            Do Nothing
          </button>
          {!isDoNothing && (
            <button
              onClick={() => handleExecute(action)}
              disabled={executing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>{executing ? 'Executing...' : 'Execute Action'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

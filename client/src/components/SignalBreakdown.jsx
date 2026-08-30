import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function SignalBreakdown({ signals = [] }) {
  if (!signals || signals.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">No significant risk signals detected.</p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Contributing Signals</p>
      <div className="space-y-1.5">
        {signals.map((sig, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{sig.signal}</span>
            </div>
            <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded text-[11px]">
              +{sig.impact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

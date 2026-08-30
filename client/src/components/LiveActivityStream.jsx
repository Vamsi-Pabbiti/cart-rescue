import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Radio } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function LiveActivityStream() {
  const { connected, liveActivities } = useSocket();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-800">Live Activity Feed</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          {connected ? 'Socket.IO Active' : 'Connecting...'}
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
        {liveActivities.map((act, index) => (
          <div key={index} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 text-[11px]">{act.timestamp}</span>
              <div>
                <span className="font-medium text-slate-900 font-mono">Session #{act.sessionId}</span>
                <p className="text-slate-600 text-[11px] mt-0.5">{act.eventText}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge score={act.riskScore} />
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold tracking-wide">
                {act.action}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

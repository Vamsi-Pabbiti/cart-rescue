import React from 'react';
import StatCard from '../components/StatCard';
import { Cpu, Clock, DollarSign, Server, Mail, MessageSquare } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Settings & AI Ops</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time model performance, latency tracking, decision cost breakdown, and provider status</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">AI Engine Operational Metrics</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Decisions Today" value="12,482" color="blue" icon={Cpu} />
          <StatCard title="Average Latency" value="143 ms" color="green" icon={Clock} />
          <StatCard title="Estimated Cost" value="₹0.08 / dec" color="orange" icon={DollarSign} />
          <StatCard title="Active Model" value="Risk Engine v1" color="indigo" icon={Server} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Notification Service Provider Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>SendGrid Email Provider</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Permanent Free Tier (100/day)
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">Integrates via SendGrid REST API key (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono">SENDGRID_API_KEY</code>). System gracefully reports <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">Provider not configured</code> if key is absent.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Twilio SMS & WhatsApp Provider</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Live Trial / Active API
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">Integrates via Twilio API credentials (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono">TWILIO_ACCOUNT_SID</code> and <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">TWILIO_AUTH_TOKEN</code>).</p>
          </div>
        </div>
      </div>
    </div>
  );
}

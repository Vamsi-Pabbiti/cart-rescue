import React, { useState, useEffect } from 'react';
import RiskBadge from '../components/RiskBadge';
import PolicyBadge from '../components/PolicyBadge';
import { Search, Eye } from 'lucide-react';
import api from '../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', { params: { search, limit: 30 } });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Audit Logs & Decision Trails</h1>
          <p className="text-xs text-slate-500 mt-0.5">Auditable, transparent decision trail for every AI score, diagnosis, and action</p>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit log or session..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Session ID</th>
                <th className="py-3.5 px-4">Risk</th>
                <th className="py-3.5 px-4">Diagnosis</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Policy Result</th>
                <th className="py-3.5 px-4">Model Version</th>
                <th className="py-3.5 px-4 text-right">Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">Loading audit logs...</td></tr>
              ) : logs.map((log) => (
                <tr
                  key={log._id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">#{log.sessionId}</td>
                  <td className="py-3 px-4">
                    <RiskBadge score={log.riskScore} level={log.riskLevel} />
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-800 font-medium">
                    {(log.diagnosis?.primaryReason || 'unknown').replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{log.action?.recommendedAction}</td>
                  <td className="py-3 px-4">
                    <PolicyBadge status={log.result?.includes('Approved') ? 'Approved' : 'BLOCKED'} />
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{log.modelVersion}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-blue-600 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-mono">Audit Decision Trail — #{selectedLog.sessionId}</h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-semibold">Risk Score & Attribution</span>
                <p className="font-bold text-slate-900 mt-1">Score: {selectedLog.riskScore}% ({selectedLog.riskLevel})</p>
                <div className="mt-2 space-y-1">
                  {(selectedLog.signals || []).map((s, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-slate-600">
                      <span>{s.signal}</span>
                      <span className="font-bold text-red-600">+{s.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-semibold">Diagnosis Explanation</span>
                <p className="font-semibold text-slate-900 mt-1 capitalize">Primary: {(selectedLog.diagnosis?.primaryReason || '').replace('_', ' ')}</p>
                <p className="text-slate-600 mt-1">{selectedLog.diagnosis?.explanation}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-semibold">Policy Guardrail Status</span>
                <div className="mt-1 font-mono text-[11px]">
                  Status: <strong className="text-slate-900">{selectedLog.result}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

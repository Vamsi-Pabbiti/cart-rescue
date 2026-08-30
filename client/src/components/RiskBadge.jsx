import React from 'react';

export default function RiskBadge({ score, level }) {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = level ? level.toUpperCase() : 'LOW';

  if (score > 80 || level === 'critical') {
    badgeStyle = 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-300';
    label = 'CRITICAL';
  } else if (score > 60 || level === 'high') {
    badgeStyle = 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-300';
    label = 'HIGH';
  } else if (score > 30 || level === 'medium') {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300';
    label = 'MEDIUM';
  } else {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-300';
    label = 'LOW';
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${badgeStyle}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {label} ({score}%)
      </span>
    </div>
  );
}

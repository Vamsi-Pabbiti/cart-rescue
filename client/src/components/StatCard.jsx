import React from 'react';

export default function StatCard({ title, value, change, trend = 'up', icon: Icon, color = 'blue' }) {
  const isPositive = trend === 'up';

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {change && (
          <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-slate-500'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

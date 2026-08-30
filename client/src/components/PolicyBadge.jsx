import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function PolicyBadge({ status }) {
  const isApproved = status === 'Approved';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
        isApproved
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-red-50 text-red-700 border-red-200'
      }`}
    >
      {isApproved ? (
        <>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>✓ Approved</span>
        </>
      ) : (
        <>
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          <span>BLOCKED BY POLICY</span>
        </>
      )}
    </span>
  );
}

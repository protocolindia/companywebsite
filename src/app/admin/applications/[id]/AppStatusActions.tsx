'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Available transitions from each status (mirrors lib/workflow.ts)
const TRANSITIONS: Record<string, string[]> = {
  DRAFT: [],
  SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'DOCS_PENDING', 'REJECTED'],
  DOCS_PENDING: ['UNDER_REVIEW', 'REJECTED'],
  APPROVED: ['FILED'],
  FILED: ['COMPLETED'],
  COMPLETED: [],
  REJECTED: [],
};

export function AppStatusActions({ applicationId, currentStatus }: { applicationId: string; currentStatus: string }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const next = TRANSITIONS[currentStatus] || [];

  async function move(toStatus: string) {
    if (toStatus === 'REJECTED' && !reason.trim()) {
      alert('Please enter a rejection reason'); return;
    }
    setLoading(toStatus);
    const res = await fetch(`/api/admin/applications/${applicationId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toStatus, reason: reason.trim() || undefined }),
    });
    setLoading(null);
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || 'Action failed'); return;
    }
    setReason('');
    router.refresh();
  }

  if (next.length === 0) {
    return <p className="text-sm text-slate-500">No further actions available.</p>;
  }

  return (
    <div className="space-y-2">
      {next.includes('REJECTED') && (
        <textarea
          className="input text-sm"
          rows={2}
          placeholder="Reason (required for rejection)"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      )}
      <div className="flex flex-col gap-2">
        {next.map(s => (
          <button
            key={s}
            onClick={() => move(s)}
            disabled={loading !== null}
            className={`text-sm ${s === 'REJECTED' ? 'btn-danger' : 'btn-primary'}`}
          >
            {loading === s ? 'Working…' : `Move to ${s}`}
          </button>
        ))}
      </div>
    </div>
  );
}

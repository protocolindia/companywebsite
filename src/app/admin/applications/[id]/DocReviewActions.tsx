'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DocReviewActions({ documentId }: { documentId: string }) {
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_REUPLOAD' | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(a: 'APPROVE' | 'REJECT' | 'REQUEST_REUPLOAD') {
    if (a !== 'APPROVE' && !reason.trim()) {
      alert('Please enter a reason');
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/documents/${documentId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: a, reason: reason.trim() || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || 'Action failed');
      return;
    }
    setAction(null); setReason('');
    router.refresh();
  }

  if (!action) {
    return (
      <div className="flex gap-2 mt-2">
        <button onClick={() => submit('APPROVE')} disabled={loading} className="btn-primary text-sm">
          Approve
        </button>
        <button onClick={() => setAction('REQUEST_REUPLOAD')} className="btn-secondary text-sm">
          Request re-upload
        </button>
        <button onClick={() => setAction('REJECT')} className="btn-danger text-sm">
          Reject
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded">
      <label className="label text-sm">
        Reason ({action === 'REJECT' ? 'rejection' : 're-upload request'})
      </label>
      <textarea
        className="input mb-2"
        rows={3}
        placeholder="Explain what's wrong with this document so the user knows how to fix it…"
        value={reason}
        onChange={e => setReason(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={() => submit(action)} disabled={loading} className="btn-primary text-sm">
          {loading ? 'Saving…' : 'Confirm + email user'}
        </button>
        <button onClick={() => { setAction(null); setReason(''); }} className="btn-secondary text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/storage';
import { DocReviewActions } from './DocReviewActions';
import { AppStatusActions } from './AppStatusActions';

export default async function AdminAppDetail({ params }: { params: { id: string } }) {
  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      service: { include: { requirements: { orderBy: { order: 'asc' } } } },
      documents: { include: { requirement: true } },
      history: { orderBy: { createdAt: 'desc' }, include: { actor: true } },
    },
  });
  if (!app) notFound();

  const docByReq = new Map(app.documents.map(d => [d.requirementId, d]));

  // Pre-compute URLs (server-side)
  const docsWithUrl = await Promise.all(
    app.documents.map(async d => ({
      ...d,
      url: await getFileUrl(d.storageKey, d.storageProvider),
    }))
  );
  const docUrlMap = new Map(docsWithUrl.map(d => [d.id, d.url]));

  return (
    <div>
      <div className="mb-6">
        <div className="text-sm text-slate-500 font-mono">{app.referenceNo}</div>
        <h1 className="text-3xl font-bold">{app.service.name}</h1>
        <div className="mt-2 flex items-center gap-4">
          <span className="badge badge-blue">{app.status}</span>
          <span className="text-sm text-slate-600">
            {app.user.name} ({app.user.email})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Documents (2/3 width) */}
        <div className="col-span-2 space-y-4">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Documents</h2>
            <div className="space-y-3">
              {app.service.requirements.map(req => {
                const doc = docByReq.get(req.id);
                return (
                  <div key={req.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{req.name}{req.isRequired && ' *'}</h4>
                        {doc && (
                          <a
                            href={docUrlMap.get(doc.id)}
                            target="_blank"
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            {doc.fileName} →
                          </a>
                        )}
                      </div>
                      {doc && (
                        <span className={`badge ${
                          doc.status === 'APPROVED' ? 'badge-green'
                          : doc.status === 'REJECTED' || doc.status === 'REUPLOAD_REQUESTED' ? 'badge-red'
                          : 'badge-blue'
                        }`}>{doc.status}</span>
                      )}
                    </div>
                    {doc?.rejectionReason && (
                      <div className="bg-red-50 text-red-800 text-sm p-2 rounded mb-2">
                        Previous reason: {doc.rejectionReason}
                      </div>
                    )}
                    {doc && doc.status === 'UPLOADED' && (
                      <DocReviewActions documentId={doc.id} />
                    )}
                    {!doc && <p className="text-sm text-slate-500">Not uploaded yet</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Status panel + activity */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold mb-3">Application Actions</h3>
            <AppStatusActions applicationId={app.id} currentStatus={app.status} />
          </div>

          <div className="card">
            <h3 className="font-bold mb-3">Activity</h3>
            <ol className="space-y-2 text-xs max-h-96 overflow-y-auto">
              {app.history.map(h => (
                <li key={h.id} className="border-l-2 border-slate-200 pl-3">
                  <div>{h.entityType}: {h.fromStatus} → <b>{h.toStatus}</b></div>
                  {h.reason && <div className="text-slate-600 italic">"{h.reason}"</div>}
                  <div className="text-slate-400">
                    {h.actor?.name || 'system'} · {new Date(h.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

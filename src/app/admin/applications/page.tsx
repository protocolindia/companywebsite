import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const statusBadge: Record<string, string> = {
  DRAFT: 'badge-gray', SUBMITTED: 'badge-blue', UNDER_REVIEW: 'badge-yellow',
  DOCS_PENDING: 'badge-red', APPROVED: 'badge-green', FILED: 'badge-blue',
  COMPLETED: 'badge-green', REJECTED: 'badge-red',
};

export default async function AdminApplications({ searchParams }: { searchParams: { status?: string } }) {
  const where = searchParams.status ? { status: searchParams.status as any } : {};
  const apps = await prisma.application.findMany({
    where,
    include: { user: true, service: true, documents: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const filters = ['', 'SUBMITTED', 'UNDER_REVIEW', 'DOCS_PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Applications</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map(f => (
          <Link
            key={f || 'all'}
            href={f ? `/admin/applications?status=${f}` : '/admin/applications'}
            className={`px-3 py-1 rounded-full text-sm ${
              (searchParams.status || '') === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700'
            }`}
          >
            {f || 'All'}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-2">Ref</th><th>User</th><th>Service</th><th>Status</th><th>Docs</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(a => {
              const approved = a.documents.filter(d => d.status === 'APPROVED').length;
              return (
                <tr key={a.id} className="border-b hover:bg-slate-50">
                  <td className="py-3">
                    <Link href={`/admin/applications/${a.id}`} className="text-indigo-600 font-mono">{a.referenceNo}</Link>
                  </td>
                  <td>{a.user.name}<div className="text-xs text-slate-500">{a.user.email}</div></td>
                  <td>{a.service.name}</td>
                  <td><span className={statusBadge[a.status] || 'badge-gray'}>{a.status}</span></td>
                  <td>{approved}/{a.documents.length}</td>
                  <td className="text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

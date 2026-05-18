import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [total, submitted, underReview, docsPending, completed] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { status: 'SUBMITTED' } }),
    prisma.application.count({ where: { status: 'UNDER_REVIEW' } }),
    prisma.application.count({ where: { status: 'DOCS_PENDING' } }),
    prisma.application.count({ where: { status: 'COMPLETED' } }),
  ]);

  const recent = await prisma.application.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: true, service: true },
  });

  const stats = [
    { label: 'Total', value: total, color: 'bg-slate-100' },
    { label: 'New (Submitted)', value: submitted, color: 'bg-blue-100' },
    { label: 'Under Review', value: underReview, color: 'bg-yellow-100' },
    { label: 'Docs Pending', value: docsPending, color: 'bg-orange-100' },
    { label: 'Completed', value: completed, color: 'bg-green-100' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-5 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`p-4 rounded-lg ${s.color}`}>
            <div className="text-sm text-slate-600">{s.label}</div>
            <div className="text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-500 border-b">
              <th className="pb-2">Ref</th><th>User</th><th>Service</th><th>Status</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(a => (
              <tr key={a.id} className="border-b hover:bg-slate-50">
                <td className="py-2">
                  <Link href={`/admin/applications/${a.id}`} className="text-indigo-600 font-mono text-sm">{a.referenceNo}</Link>
                </td>
                <td>{a.user.name}</td>
                <td className="text-sm">{a.service.name}</td>
                <td><span className="badge badge-blue">{a.status}</span></td>
                <td className="text-sm text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

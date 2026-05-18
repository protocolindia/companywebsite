import { prisma } from '@/lib/prisma';

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    include: { _count: { select: { requirements: true, applications: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services</h1>
        <button className="btn-primary" disabled>+ New service (coming soon)</button>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-2">Name</th><th>Slug</th><th>Price</th><th>Duration</th>
              <th>Requirements</th><th>Applications</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} className="border-b">
                <td className="py-3 font-medium">{s.name}</td>
                <td className="font-mono text-xs text-slate-500">{s.slug}</td>
                <td>₹{(s.price / 100).toLocaleString('en-IN')}</td>
                <td>{s.durationDays}d</td>
                <td>{s._count.requirements}</td>
                <td>{s._count.applications}</td>
                <td>
                  <span className={s.isActive ? 'badge-green' : 'badge-gray'}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500 mt-4">
        Service creation UI is a stub. Add services via Prisma Studio (<code>npx prisma studio</code>) or extend this page.
      </p>
    </div>
  );
}

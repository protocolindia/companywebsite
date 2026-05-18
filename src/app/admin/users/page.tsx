import { prisma } from '@/lib/prisma';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-2">Name</th><th>Email</th><th>Phone</th><th>Role</th>
              <th>Applications</th><th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="py-3">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td>
                  <span className={u.role === 'ADMIN' ? 'badge-blue' : 'badge-gray'}>
                    {u.role}
                  </span>
                </td>
                <td>{u._count.applications}</td>
                <td className="text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

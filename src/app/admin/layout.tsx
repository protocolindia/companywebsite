import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/login');

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-4 space-y-1">
        <div className="text-xl font-bold mb-6 px-2">Admin</div>
        <Link href="/admin" className="block px-3 py-2 rounded hover:bg-slate-800">Dashboard</Link>
        <Link href="/admin/applications" className="block px-3 py-2 rounded hover:bg-slate-800">Applications</Link>
        <Link href="/admin/services" className="block px-3 py-2 rounded hover:bg-slate-800">Services</Link>
        <Link href="/admin/users" className="block px-3 py-2 rounded hover:bg-slate-800">Users</Link>
        <Link href="/admin/emails" className="block px-3 py-2 rounded hover:bg-slate-800">Email Templates</Link>
        <div className="pt-4 mt-4 border-t border-slate-700 text-xs uppercase text-slate-400 px-3 mb-1">Settings</div>
        <Link href="/admin/settings/general" className="block px-3 py-2 rounded hover:bg-slate-800">General</Link>
        <Link href="/admin/settings/email" className="block px-3 py-2 rounded hover:bg-slate-800">Email (Brevo)</Link>
        <Link href="/admin/settings/storage" className="block px-3 py-2 rounded hover:bg-slate-800">Storage</Link>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

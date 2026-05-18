import { prisma } from '@/lib/prisma';

export default async function EmailTemplatesPage() {
  const templates = await prisma.emailTemplate.findMany({ orderBy: { key: 'asc' } });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Email Templates</h1>
      <p className="text-slate-600 mb-6">
        Variables available in all templates: <code className="bg-slate-100 px-1 rounded">{'{{name}}'}</code>,{' '}
        <code className="bg-slate-100 px-1 rounded">{'{{refNo}}'}</code>,{' '}
        <code className="bg-slate-100 px-1 rounded">{'{{serviceName}}'}</code>,{' '}
        <code className="bg-slate-100 px-1 rounded">{'{{appName}}'}</code>,{' '}
        <code className="bg-slate-100 px-1 rounded">{'{{appUrl}}'}</code>,{' '}
        <code className="bg-slate-100 px-1 rounded">{'{{reason}}'}</code>,{' '}
        <code className="bg-slate-100 px-1 rounded">{'{{docName}}'}</code>
      </p>

      <div className="space-y-4">
        {templates.map(t => (
          <div key={t.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <code className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{t.key}</code>
                <h3 className="text-lg font-semibold mt-2">{t.subject}</h3>
              </div>
              <span className={t.isActive ? 'badge-green' : 'badge-gray'}>
                {t.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded text-sm">
              <div dangerouslySetInnerHTML={{ __html: t.bodyHtml }} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-slate-500 mt-4">
        Template editor UI is a stub. Edit via Prisma Studio or build an inline editor on this page.
      </p>
    </div>
  );
}

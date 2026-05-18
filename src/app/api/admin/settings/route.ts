import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { setSetting, invalidateSettingsCache } from '@/lib/settings';

// Whitelist of editable setting keys (security: prevents arbitrary writes)
const EDITABLE_KEYS = new Set([
  'storage.provider',
  'storage.r2.accountId',
  'storage.r2.accessKeyId',
  'storage.r2.secretAccessKey',
  'storage.r2.bucket',
  'storage.r2.publicUrl',
  'email.brevo.apiKey',
  'email.brevo.senderEmail',
  'email.brevo.senderName',
  'app.name',
  'app.supportEmail',
  'app.url',
]);

const SECRET_KEYS = new Set([
  'storage.r2.accessKeyId',
  'storage.r2.secretAccessKey',
  'email.brevo.apiKey',
]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const rows = await prisma.setting.findMany();
  // Mask secrets so we don't leak them back in the response
  const out = Object.fromEntries(
    rows.map(r => [r.key, r.isSecret && r.value ? '••••••••' : r.value])
  );
  return NextResponse.json(out);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updates = await req.json() as Record<string, string>;
  for (const [key, value] of Object.entries(updates)) {
    if (!EDITABLE_KEYS.has(key)) continue;
    // Skip masked values (user didn't change the secret)
    if (value === '••••••••') continue;
    await setSetting(key, value, SECRET_KEYS.has(key));
  }
  invalidateSettingsCache();
  return NextResponse.json({ ok: true });
}

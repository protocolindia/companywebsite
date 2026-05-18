import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { reviewDocument } from '@/lib/workflow';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { action, reason } = await req.json();
  if (!['APPROVE', 'REJECT', 'REQUEST_REUPLOAD'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    await reviewDocument({
      documentId: params.id,
      action,
      reason,
      adminId: user.id,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

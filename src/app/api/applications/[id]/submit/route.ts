import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateApplicationStatus } from '@/lib/workflow';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;

  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: { service: { include: { requirements: true } }, documents: true },
  });
  if (!app || app.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Validate all required documents are uploaded
  const requiredIds = app.service.requirements.filter(r => r.isRequired).map(r => r.id);
  const uploadedIds = new Set(app.documents.map(d => d.requirementId));
  const missing = requiredIds.filter(id => !uploadedIds.has(id));
  if (missing.length) {
    return NextResponse.json({ error: 'Missing required documents', missing }, { status: 400 });
  }

  await updateApplicationStatus({
    applicationId: app.id,
    toStatus: 'SUBMITTED',
    actorId: userId,
  });

  return NextResponse.json({ ok: true });
}

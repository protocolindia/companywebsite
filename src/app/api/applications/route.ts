import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateReferenceNo } from '@/lib/workflow';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;

  const apps = await prisma.application.findMany({
    where: { userId },
    include: { service: true, documents: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(apps);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;

  const { serviceId, formData } = await req.json();
  if (!serviceId) return NextResponse.json({ error: 'serviceId required' }, { status: 400 });

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

  const referenceNo = await generateReferenceNo();
  const app = await prisma.application.create({
    data: {
      userId,
      serviceId,
      referenceNo,
      formData: formData || {},
      status: 'DRAFT',
    },
  });

  return NextResponse.json({ id: app.id, referenceNo: app.referenceNo });
}

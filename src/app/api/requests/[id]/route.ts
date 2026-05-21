import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    const data = await req.json();
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: {
        programName: data.programName,
        programDate: data.programDate,
        clientType: data.clientType,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        peopleCount: data.peopleCount ? Number(data.peopleCount) : undefined,
        freePeople: data.freePeople !== undefined ? Number(data.freePeople) : undefined,
        days: data.days ? Number(data.days) : undefined,
        region: data.region,
        transportCost: data.transportCost !== undefined ? Number(data.transportCost) : undefined,
        accommodationCost: data.accommodationCost !== undefined ? Number(data.accommodationCost) : undefined,
        guideCost: data.guideCost !== undefined ? Number(data.guideCost) : undefined,
        excursionCost: data.excursionCost !== undefined ? Number(data.excursionCost) : undefined,
        mealsCost: data.mealsCost !== undefined ? Number(data.mealsCost) : undefined,
        totalCost: data.totalCost !== undefined ? Number(data.totalCost) : undefined,
        status: data.status,
        notes: data.notes,
      }
    });
    return NextResponse.json(updatedRequest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    
    const request = await prisma.request.findUnique({
      where: { id },
      include: { documents: true }
    });
    
    if (request && request.documents.length > 0) {
      const { del } = await import('@vercel/blob');
      for (const doc of request.documents) {
        try {
          if (doc.path.startsWith('https://')) {
            await del(doc.path);
          } else {
            // Фолбэк для старых локальных файлов
            const filePath = path.join(process.cwd(), 'public', doc.path);
            await fs.unlink(filePath);
          }
        } catch (e) {}
      }
    }

    await prisma.request.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}

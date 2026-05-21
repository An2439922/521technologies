import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, docId: string }> }) {
  try {
    const { docId: paramDocId } = await params;
    const docId = Number(paramDocId);
    
    const document = await prisma.document.findUnique({
      where: { id: docId }
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    try {
      if (document.path.startsWith('https://')) {
        const { del } = await import('@vercel/blob');
        await del(document.path);
      } else {
        const filePath = path.join(process.cwd(), 'public', document.path);
        await fs.unlink(filePath);
      }
    } catch (e) {}

    await prisma.document.delete({
      where: { id: docId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

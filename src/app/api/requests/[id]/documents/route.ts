import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const requestId = Number(paramId);
    
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const ext = path.extname(file.name).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF and DOC/DOCX are allowed.' }, { status: 400 });
    }
    
    const { put } = await import('@vercel/blob');
    
    const filename = `${uuidv4()}${ext}`;
    
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false
    });
    
    const document = await prisma.document.create({
      data: {
        name: file.name,
        path: blob.url,
        requestId,
      }
    });
    
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}

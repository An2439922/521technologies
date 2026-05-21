import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const requests = await prisma.request.findMany({
      include: { documents: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newRequest = await prisma.request.create({
      data: {
        programName: data.programName,
        programDate: data.programDate || null,
        clientType: data.clientType || 'Взрослые',
        fullName: data.fullName,
        phone: data.phone || '',
        email: data.email || null,
        peopleCount: Number(data.peopleCount),
        freePeople: data.freePeople ? Number(data.freePeople) : 0,
        days: data.days ? Number(data.days) : 1,
        region: data.region || 'Москва',
        transportCost: data.transportCost ? Number(data.transportCost) : 0,
        accommodationCost: data.accommodationCost ? Number(data.accommodationCost) : 0,
        guideCost: data.guideCost ? Number(data.guideCost) : 0,
        excursionCost: data.excursionCost ? Number(data.excursionCost) : 0,
        mealsCost: data.mealsCost ? Number(data.mealsCost) : 0,
        totalCost: data.totalCost ? Number(data.totalCost) : 0,
        notes: data.notes || null,
      }
    });
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

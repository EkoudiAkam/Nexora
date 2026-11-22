import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, contactName, phone, email, address, notes } = await req.json();
    if (!name) return NextResponse.json({ error: 'Nom du fournisseur requis' }, { status: 400 });
    const supplier = await prisma.supplier.create({
      data: { name, contactName, phone, email, address, notes },
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

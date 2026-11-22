import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const quotes = await prisma.quote.findMany({
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
    const sales = await prisma.sale.findMany({
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
    });

    const docs = [
      ...sales.map((s: any) => ({
        id: s.id,
        ref: s.invoiceNumber || s.reference,
        type: 'FACTURE',
        client: s.customer.name,
        date: s.createdAt,
        amount: Number(s.totalTTC),
        status: s.status,
      })),
      ...quotes.map((q: any) => ({
        id: q.id,
        ref: q.reference,
        type: 'DEVIS',
        client: q.customer.name,
        date: q.createdAt,
        amount: Number(q.totalTTC),
        status: q.status,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(docs);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

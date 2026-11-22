import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { customerId, items, validUntilDays = 30, notes } = await req.json();
    if (!customerId || !items || !items.length) {
      return NextResponse.json({ error: 'Client et articles requis' }, { status: 400 });
    }

    const count = await prisma.quote.count();
    const reference = `DEV-2025-${String(count + 1).padStart(4, '0')}`;
    let totalTTC = 0;

    const quoteItems = items.map((it: any) => {
      const lineTotal = it.quantity * it.unitPrice;
      totalTTC += lineTotal;
      return {
        productId: it.productId || null,
        productName: it.productName || 'Prestation',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: lineTotal,
      };
    });

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validUntilDays);

    const quote = await prisma.quote.create({
      data: {
        reference,
        customerId,
        totalTTC,
        status: 'ENVOYE',
        validUntil,
        notes,
        items: { create: quoteItems },
      },
      include: { customer: true, items: true },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

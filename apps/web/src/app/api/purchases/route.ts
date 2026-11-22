import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const purchases = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(purchases);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { supplierId, items } = await req.json();
    if (!supplierId || !items || !items.length) {
      return NextResponse.json({ error: 'Fournisseur et articles requis' }, { status: 400 });
    }
    const count = await prisma.purchaseOrder.count();
    const reference = `ACH-2025-${String(count + 1).padStart(4, '0')}`;
    let totalAmount = 0;

    const purchaseItems = items.map((it: any) => {
      const lineTotal = it.quantityOrdered * it.unitPrice;
      totalAmount += lineTotal;
      return {
        productId: it.productId,
        productName: it.productName || 'Article',
        quantityOrdered: it.quantityOrdered,
        unitPrice: it.unitPrice,
        total: lineTotal,
      };
    });

    const purchase = await prisma.purchaseOrder.create({
      data: {
        reference,
        supplierId,
        totalAmount,
        status: 'COMMANDE',
        items: {
          create: purchaseItems,
        },
      },
      include: { supplier: true, items: true },
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

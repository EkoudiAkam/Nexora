import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { customerId, items, notes, dueDate } = await req.json();
    if (!customerId || !items || !items.length) {
      return NextResponse.json({ error: 'Client et articles requis' }, { status: 400 });
    }

    // Vérification du verrouillage comptable (MonthlyClosing)
    const now = new Date();
    const isClosed = await prisma.monthlyClosing.findFirst({
      where: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        isLocked: true,
      },
    });
    if (isClosed) {
      return NextResponse.json(
        { error: `Période comptable ${now.getMonth() + 1}/${now.getFullYear()} verrouillée suite à la clôture mensuelle. Aucune nouvelle écriture commerciale n'est autorisée.` },
        { status: 403 }
      );
    }

    const adminUser = await prisma.user.findFirst();
    const count = await prisma.sale.count();
    const reference = `VTE-2025-${String(count + 1).padStart(4, '0')}`;
    const invoiceNumber = `FAC-2025-${String(count + 1).padStart(4, '0')}`;

    let subtotalHT = 0;
    let taxAmount = 0;
    let totalTTC = 0;

    const saleItemsData = items.map((item: any) => {
      const itemHT = item.quantity * item.unitPrice;
      const itemTax = itemHT * 0.18;
      const itemTTC = itemHT + itemTax;
      subtotalHT += itemHT;
      taxAmount += itemTax;
      totalTTC += itemTTC;

      return {
        productName: item.productName || 'Article',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: 18.0,
        totalHT: itemHT,
        totalTTC: itemTTC,
      };
    });

    const createdSale = await prisma.$transaction(async (tx) => {
      return await tx.sale.create({
        data: {
          reference,
          invoiceNumber,
          customerId,
          userId: adminUser?.id || '',
          subtotalHT,
          taxAmount,
          totalTTC,
          remainingBalance: totalTTC,
          paidAmount: 0,
          status: 'CONFIRMEE',
          notes,
          dueDate: dueDate ? new Date(dueDate) : null,
          items: {
            create: saleItemsData,
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });
    });

    return NextResponse.json(createdSale, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        sale: { include: { customer: true } },
        user: true,
      },
      orderBy: { paidAt: 'desc' },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { saleId, amount, method, notes, paymentProofRef } = await req.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
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
        { error: `Période comptable ${now.getMonth() + 1}/${now.getFullYear()} verrouillée suite à la clôture mensuelle. Aucun encaissement ne peut y être ajouté.` },
        { status: 403 }
      );
    }

    const adminUser = await prisma.user.findFirst();
    const count = await prisma.payment.count();
    const reference = `OP-${String(count + 1).padStart(4, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          reference,
          saleId: saleId || null,
          amount,
          method: method || 'CASH',
          paymentProofRef,
          notes,
          userId: adminUser?.id || '',
        },
      });

      if (saleId) {
        const sale = await tx.sale.findUnique({ where: { id: saleId } });
        if (sale) {
          const newPaid = Number(sale.paidAmount) + Number(amount);
          const newRemaining = Math.max(0, Number(sale.totalTTC) - newPaid);
          const newStatus = newRemaining === 0 ? 'PAYEE' : 'PARTIELLEMENT_PAYEE';

          await tx.sale.update({
            where: { id: saleId },
            data: {
              paidAmount: newPaid,
              remainingBalance: newRemaining,
              status: newStatus,
            },
          });
        }
      }

      return payment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

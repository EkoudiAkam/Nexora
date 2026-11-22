import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const closings = await prisma.monthlyClosing.findMany({
      include: {
        closedByUser: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });

    return NextResponse.json({ closings });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const year = Number(body.year);
    const month = Number(body.month);

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Année et mois invalides' }, { status: 400 });
    }

    // Définir la plage de dates pour ce mois
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Calculer les montants réels
    const [sales, payments, expenses, purchases] = await Promise.all([
      prisma.sale.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: 'ANNULEE' },
        },
      }),
      prisma.payment.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.expense.findMany({
        where: {
          expenseDate: { gte: startDate, lte: endDate },
        },
      }),
      prisma.purchaseOrder.findMany({
        where: {
          orderDate: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const totalRevenue = sales.reduce((acc, s) => acc + Number(s.totalTTC), 0);
    const totalReceipts = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const totalPurchases = purchases.reduce((acc, p) => acc + Number(p.totalAmount), 0);
    const totalDebts = sales.reduce((acc, s) => acc + Number(s.remainingBalance), 0);

    // Enregistrer le verrou de clôture
    const closing = await prisma.monthlyClosing.upsert({
      where: {
        year_month: {
          year,
          month,
        },
      },
      update: {
        revenue: totalRevenue,
        receipts: totalReceipts,
        refunds: 0,
        expenses: totalExpenses,
        purchases: totalPurchases,
        outstandingDebts: totalDebts,
        isLocked: true,
        closedAt: new Date(),
        closedByUserId: user.id,
      },
      create: {
        year,
        month,
        revenue: totalRevenue,
        receipts: totalReceipts,
        refunds: 0,
        expenses: totalExpenses,
        purchases: totalPurchases,
        outstandingDebts: totalDebts,
        isLocked: true,
        closedAt: new Date(),
        closedByUserId: user.id,
      },
    });

    // Journal d'audit inaltérable
    await prisma.auditLog.create({
      data: {
        action: 'MONTHLY_CLOSING_LOCKED',
        entity: 'MonthlyClosing',
        entityId: closing.id,
        userId: user.id,
        details: {
          year,
          month,
          revenue: totalRevenue,
          receipts: totalReceipts,
          expenses: totalExpenses,
          outstandingDebts: totalDebts,
          closedBy: user.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      closing,
      message: `Période ${month}/${year} clôturée et verrouillée avec succès.`,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

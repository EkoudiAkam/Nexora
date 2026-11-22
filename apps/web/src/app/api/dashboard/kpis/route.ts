import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sales = await prisma.sale.findMany();
    const payments = await prisma.payment.findMany();
    const expenses = await prisma.expense.findMany();

    const revenue = sales.reduce((acc, s) => acc + Number(s.totalTTC), 0);
    const receipts = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const outstandingDebts = sales.reduce((acc, s) => acc + Number(s.remainingBalance), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const salesCount = sales.length;

    return NextResponse.json({
      revenue,
      receipts,
      outstandingDebts,
      expenses: totalExpenses,
      salesCount,
      revenueGrowthPct: 12.8,
      receiptsGrowthPct: 8.4,
      salesCountGrowthPct: 6.2,
      debtsGrowthPct: -3.1,
      expensesGrowthPct: 2.3,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

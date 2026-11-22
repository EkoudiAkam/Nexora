import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({ include: { customer: true } });
    const payments = await prisma.payment.findMany();
    const expenses = await prisma.expense.findMany();

    const totalRevenue = sales.reduce((acc, s) => acc + Number(s.totalTTC), 0);
    const totalReceipts = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalDebts = sales.reduce((acc, s) => acc + Number(s.remainingBalance), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const netCashflow = totalReceipts - totalExpenses;

    return NextResponse.json({
      totalRevenue,
      totalReceipts,
      totalDebts,
      totalExpenses,
      netCashflow,
      salesCount: sales.length,
      customersCount: new Set(sales.map((s: any) => s.customerId)).size,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

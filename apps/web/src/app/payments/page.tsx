import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PaymentsClient } from './payments-client';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({
      include: {
        sale: { include: { customer: true } },
        user: true,
      },
      orderBy: { paidAt: 'desc' },
    }),
    prisma.expense.findMany({
      include: {
        supplier: true,
        user: true,
      },
      orderBy: { expenseDate: 'desc' },
    }),
  ]);

  return <PaymentsClient initialPayments={payments as any} initialExpenses={expenses as any} />;
}

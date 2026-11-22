import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { DashboardClient } from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Requêtes directes PostgreSQL 18
  const [sales, payments, expenses, subscriptions, products, quotes, settings] = await Promise.all([
    prisma.sale.findMany({
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.payment.findMany(),
    prisma.expense.findMany(),
    prisma.subscriptionAssignment.findMany({
      include: { customer: true, account: { include: { service: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.product.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.quote.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.companySettings.findFirst(),
  ]);

  const allSales = await prisma.sale.findMany({
    include: { items: true },
  });
  const revenue = allSales.reduce((acc, s) => acc + Number(s.totalTTC), 0);
  const receipts = payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const outstandingDebts = allSales.reduce((acc, s) => acc + Number(s.remainingBalance), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

  const kpis = {
    revenue,
    receipts,
    outstandingDebts,
    expenses: totalExpenses,
    salesCount: allSales.length,
  };

  // Calcul dynamique des 6 derniers mois d'activité depuis la base PostgreSQL
  const now = new Date();
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = targetDate.getMonth();
    const y = targetDate.getFullYear();
    const rawLabel = targetDate.toLocaleDateString('fr-FR', { month: 'short' });
    const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).replace('.', '');

    const monthlySales = allSales.filter((s) => {
      const d = new Date(s.createdAt);
      return d.getMonth() === m && d.getFullYear() === y && s.status !== 'ANNULEE';
    });
    const monthlyPayments = payments.filter((p) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const ca = monthlySales.reduce((acc, s) => acc + Number(s.totalTTC), 0);
    const encaissement = monthlyPayments.reduce((acc, p) => acc + Number(p.amount), 0);

    chartData.push({
      mois: label,
      ca,
      encaissement,
    });
  }

  return (
    <DashboardClient 
      userName={user.name}
      kpis={kpis}
      chartData={chartData}
      sales={JSON.parse(JSON.stringify(sales))}
      subscriptions={JSON.parse(JSON.stringify(subscriptions))}
      products={JSON.parse(JSON.stringify(products))}
      quotes={JSON.parse(JSON.stringify(quotes))}
      businessType={settings?.businessType || 'HYBRID'}
      enableInventory={settings?.enableInventory ?? true}
      enableDigitalSubs={settings?.enableDigitalSubs ?? true}
    />
  );
}

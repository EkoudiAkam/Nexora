import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatFCFA } from '@/lib/utils';
import { BarChart3, TrendingUp, DollarSign, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { MonthlyClosingsCard } from './monthly-closings-card';
import { ReportsHeaderActions } from './reports-header-actions';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [sales, payments, expenses, closings] = await Promise.all([
    prisma.sale.findMany({ include: { customer: true } }),
    prisma.payment.findMany(),
    prisma.expense.findMany(),
    prisma.monthlyClosing.findMany({
      include: {
        closedByUser: { select: { name: true, email: true } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
  ]);

  const serializedClosings = closings.map((c) => ({
    id: c.id,
    year: c.year,
    month: c.month,
    revenue: Number(c.revenue),
    receipts: Number(c.receipts),
    expenses: Number(c.expenses),
    outstandingDebts: Number(c.outstandingDebts),
    isLocked: c.isLocked,
    closedAt: c.closedAt.toISOString(),
    closedByUser: c.closedByUser ? { name: c.closedByUser.name, email: c.closedByUser.email } : undefined,
  }));

  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.totalTTC), 0);
  const totalReceipts = payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const totalDebts = sales.reduce((acc, s) => acc + Number(s.remainingBalance), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const netCashflow = totalReceipts - totalExpenses;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 shrink-0" />
            <span>Rapports & Analyse Financière</span>
          </h1>
        </div>
        <ReportsHeaderActions />
      </div>

      {/* 4 Indicateurs Clés Découplés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-4 space-y-2">
            <div className="text-xs font-medium text-slate-500">
              Chiffre d’Affaires (TTC)
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">{formatFCFA(totalRevenue)}</div>
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.8%</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-4 space-y-2">
            <div className="text-xs font-medium text-slate-500">
              Encaissements Réels
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">{formatFCFA(totalReceipts)}</div>
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Recouvrement : {Math.round((totalReceipts / (totalRevenue || 1)) * 100)}%</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-4 space-y-2">
            <div className="text-xs font-medium text-slate-500">
              Créances en Attente
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">{formatFCFA(totalDebts)}</div>
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                <span>Reste à recouvrer</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-4 space-y-2">
            <div className="text-xs font-medium text-slate-500">
              Flux Net de Trésorerie
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">{formatFCFA(netCashflow)}</div>
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                <span>Trésorerie nette disponible</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rapprochement de Trésorerie */}
      <Card className="border-slate-200/80 shadow-sm bg-white">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold text-slate-900">Rapprochement de Trésorerie</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Total Ventes Émises</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">{formatFCFA(totalRevenue)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Total Règlements Encaissés</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">{formatFCFA(totalReceipts)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Créances Débitrices</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">{formatFCFA(totalDebts)}</span>
            </div>
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <span className="text-indigo-900 block text-[11px] font-medium">Écart de Rapprochement</span>
              <span className="text-base font-bold text-indigo-700 tabular-nums">{formatFCFA(totalRevenue - (totalReceipts + totalDebts))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Clôture Mensuelle OHADA (Pleine largeur pour éliminer le scroll horizontal sur ordinateur) */}
      <MonthlyClosingsCard initialClosings={serializedClosings} />
    </div>
  );
}

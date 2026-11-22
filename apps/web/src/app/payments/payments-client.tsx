'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/utils';
import {
  ArrowLeftRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { CreatePaymentDrawer } from '@/components/drawers/CreatePaymentDrawer';
import { CreateExpenseDrawer } from '@/components/drawers/CreateExpenseDrawer';

interface PaymentItem {
  id: string;
  reference: string;
  amount: any;
  method: string;
  paidAt: any;
  notes?: string | null;
  sale?: {
    reference: string;
    invoiceNumber?: string | null;
    customer?: { name: string } | null;
  } | null;
}

interface ExpenseItem {
  id: string;
  reference: string;
  category: string;
  description: string;
  amount: any;
  method: string;
  expenseDate: any;
  receiptReference?: string | null;
  supplier?: { name: string } | null;
}

interface PaymentsClientProps {
  initialPayments: PaymentItem[];
  initialExpenses: ExpenseItem[];
}

export function PaymentsClient({ initialPayments, initialExpenses }: PaymentsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'receipts' | 'expenses'>('all');
  const [search, setSearch] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  const totalReceipts = initialPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const totalExpenses = initialExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const netCashflow = totalReceipts - totalExpenses;

  // Filtered lists
  const filteredPayments = initialPayments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.reference.toLowerCase().includes(q) ||
      (p.notes && p.notes.toLowerCase().includes(q)) ||
      (p.sale?.customer?.name && p.sale.customer.name.toLowerCase().includes(q))
    );
  });

  const filteredExpenses = initialExpenses.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.reference.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      (e.supplier?.name && e.supplier.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            <span>Paiements & Dépenses</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsExpenseOpen(true)}
            variant="outline"
            className="text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
            Nouvelle dépense
          </Button>
          <Button
            onClick={() => setIsPaymentOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Enregistrer un paiement
          </Button>
        </div>
      </div>

      {/* KPI Cards Matching Canva */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-5 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Solde de trésorerie net</div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {formatFCFA(netCashflow)}
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Trésorerie nette disponible</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-5 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Entrées (Encaissements réels)</div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {formatFCFA(totalReceipts)}
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{initialPayments.length} opérations enregistrées</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-5 space-y-1">
            <div className="text-xs text-slate-500 font-medium">Sorties (Charges & Dépenses)</div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {formatFCFA(totalExpenses)}
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                <span>{initialExpenses.length} dépenses d&apos;exploitation</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-4 sm:gap-6 text-xs font-bold overflow-x-auto whitespace-nowrap pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'all'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              Tous les flux ({initialPayments.length + initialExpenses.length})
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'receipts'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              Encaissements ({initialPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'expenses'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              Dépenses ({initialExpenses.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une opération..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Content depending on tab */}
        {(activeTab === 'all' || activeTab === 'receipts') && (
          <Card className="shadow-sm border-slate-200">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                Encaissements Clients
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">
                Total : {formatFCFA(totalReceipts)}
              </span>
            </div>
            {/* 1. VUE MOBILE ENCAISSEMENTS < 768px */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Aucun encaissement trouvé.
                </div>
              ) : (
                filteredPayments.map((p) => (
                  <div key={p.id} className="p-3.5 space-y-2 bg-white hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 text-xs">{p.reference}</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0.5 px-2">
                        {p.method}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      {p.sale?.customer?.name || p.notes || 'Règlement client'}
                      {p.sale?.invoiceNumber && (
                        <span className="text-[10px] text-indigo-600 block">Facture: {p.sale.invoiceNumber}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-400">
                        {new Date(p.paidAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="font-bold text-emerald-700 tabular-nums">
                        +{formatFCFA(Number(p.amount))}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 2. VUE ORDINATEUR ENCAISSEMENTS >= 768px */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">RÉFÉRENCE</th>
                    <th className="py-3 px-4">OPÉRATION / CLIENT</th>
                    <th className="py-3 px-4">TYPE</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">MOYEN</th>
                    <th className="py-3 px-4 text-right">MONTANT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Aucun encaissement trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {p.reference}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            {p.sale?.customer?.name || p.notes || 'Règlement client'}
                          </div>
                          {p.sale?.invoiceNumber && (
                            <div className="text-[10px] text-indigo-600">
                              Facture: {p.sale.invoiceNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            Encaissement
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(p.paidAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {p.method}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700 tabular-nums">
                          +{formatFCFA(Number(p.amount))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {(activeTab === 'all' || activeTab === 'expenses') && (
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                Dépenses & Charges Opérationnelles
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">
                Total : {formatFCFA(totalExpenses)}
              </span>
            </div>

            {/* 1. VUE MOBILE DÉPENSES < 768px */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Aucune dépense trouvée.
                </div>
              ) : (
                filteredExpenses.map((e) => (
                  <div key={e.id} className="p-3.5 space-y-2 bg-white hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 text-xs">{e.reference}</span>
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] py-0.5 px-2">
                        {e.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-800 font-medium">
                      {e.description}
                      {e.supplier?.name && (
                        <span className="text-[10px] text-slate-400 block">Fournisseur: {e.supplier.name}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-400">
                        {new Date(e.expenseDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • {e.method}
                      </span>
                      <span className="font-bold text-rose-600 tabular-nums">
                        -{formatFCFA(Number(e.amount))}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 2. VUE ORDINATEUR DÉPENSES >= 768px */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">RÉFÉRENCE</th>
                    <th className="py-3 px-4">LIBELLÉ / FOURNISSEUR</th>
                    <th className="py-3 px-4">CATÉGORIE</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">MOYEN</th>
                    <th className="py-3 px-4 text-right">MONTANT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Aucune dépense trouvée.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {e.reference}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{e.description}</div>
                          {e.supplier?.name && (
                            <div className="text-[10px] text-slate-500">
                              Fournisseur: {e.supplier.name}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                            {e.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(e.expenseDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {e.method}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-rose-600 tabular-nums">
                          -{formatFCFA(Number(e.amount))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Drawers */}
      <CreatePaymentDrawer
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={() => {
          setIsPaymentOpen(false);
          router.refresh();
        }}
      />

      <CreateExpenseDrawer
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onSuccess={() => {
          setIsExpenseOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

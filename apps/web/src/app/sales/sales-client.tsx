'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/utils';
import { ShoppingCart, Plus, FileText, ArrowDownToLine, Mail } from 'lucide-react';
import { CreateSaleDrawer } from '@/components/drawers/CreateSaleDrawer';
import { SendEmailModal } from '@/components/modals/SendEmailModal';

interface SaleItem {
  id: string;
  reference: string;
  invoiceNumber?: string | null;
  createdAt: any;
  totalTTC: any;
  paidAmount: any;
  remainingBalance: any;
  status: string;
  customer?: { name: string } | null;
}

interface SalesClientProps {
  initialSales: SaleItem[];
  customers: Array<{ id: string; name: string }>;
  products: Array<{ sku: string; name: string; price: number }>;
  businessType?: string;
}

export function SalesClient({ initialSales, customers, products, businessType = 'HYBRID' }: SalesClientProps) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSaleForEmail, setSelectedSaleForEmail] = useState<SaleItem | null>(null);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 shrink-0" />
            <span>Ventes & Factures ({initialSales.length})</span>
          </h1>
        </div>
        <Button 
          onClick={() => setIsDrawerOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs shadow-sm h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nouvelle Vente
        </Button>
      </div>

      <Card className="border-slate-200/80 shadow-sm overflow-hidden">
        {/* 1. VUE MOBILE (Cartes empilées élégantes sur smartphone < 768px) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {initialSales.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucune vente enregistrée.
            </div>
          ) : (
            initialSales.map((sale) => (
              <div key={sale.id} className="p-3.5 space-y-2.5 bg-white hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900 text-xs">{sale.reference}</span>
                    {sale.invoiceNumber && (
                      <span className="font-semibold text-indigo-600 text-xs">({sale.invoiceNumber})</span>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium py-0.5 px-2 ${
                      sale.status === 'PAYEE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : sale.status === 'PARTIELLEMENT_PAYEE'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {sale.status === 'PAYEE' ? 'Payée' : sale.status === 'PARTIELLEMENT_PAYEE' ? 'Acompte' : 'Impayée'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">{sale.customer?.name || 'Client Direct'}</span>
                  <span className="shrink-0">{new Date(sale.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total TTC</span>
                    <span className="font-bold text-slate-900 tabular-nums">{formatFCFA(Number(sale.totalTTC))}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/api/sales/${sale.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition-colors"
                      title="Télécharger PDF OHADA"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedSaleForEmail(sale)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      title="Envoyer par email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 2. VUE ORDINATEUR & TABLETTE (Tableau complet avec défilement fluide >= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Réf Vente</th>
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Date Émission</th>
                <th className="py-3 px-4 text-right">Total TTC</th>
                <th className="py-3 px-4 text-right">Payé</th>
                <th className="py-3 px-4 text-right">Solde Dû</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {initialSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Aucune vente enregistrée dans la base de données.
                  </td>
                </tr>
              ) : (
                initialSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{sale.reference}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">{sale.invoiceNumber || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{sale.customer?.name}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(sale.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">{formatFCFA(Number(sale.totalTTC))}</td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-semibold tabular-nums">{formatFCFA(Number(sale.paidAmount))}</td>
                    <td className="py-3 px-4 text-right text-rose-700 font-semibold tabular-nums">{formatFCFA(Number(sale.remainingBalance))}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={sale.status === 'PAYEE' ? 'default' : sale.status === 'PARTIELLEMENT_PAYEE' ? 'secondary' : 'destructive'} className="text-[10px] font-medium">
                        {sale.status === 'PAYEE' ? 'Payée' : sale.status === 'PARTIELLEMENT_PAYEE' ? 'Acompte' : 'Impayée'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={`/api/sales/${sale.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px] transition-colors"
                          title="Télécharger la facture officielle PDF OHADA"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          PDF
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedSaleForEmail(sale)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                          title="Envoyer la facture par e-mail au client"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateSaleDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={() => {
          setIsDrawerOpen(false);
          router.refresh();
        }}
        customers={customers}
        products={products}
        businessType={businessType}
      />

      <SendEmailModal
        isOpen={!!selectedSaleForEmail}
        onClose={() => setSelectedSaleForEmail(null)}
        defaultType="CUSTOMER_INVOICE"
        defaultRecipient="client@entreprise-demo.com"
        targetReference={selectedSaleForEmail?.invoiceNumber || selectedSaleForEmail?.reference || ''}
      />
    </div>
  );
}

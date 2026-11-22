'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/utils';
import { FileText, Plus, ArrowDownToLine, Mail } from 'lucide-react';
import { CreateQuoteDrawer } from '@/components/drawers/CreateQuoteDrawer';
import { SendEmailModal } from '@/components/modals/SendEmailModal';

interface DocItem {
  id: string;
  ref: string;
  type: string;
  client: string;
  date: any;
  amount: number;
  status: string;
}

interface DocumentsClientProps {
  initialDocs: DocItem[];
  customers: Array<{ id: string; name: string }>;
}

export function DocumentsClient({ initialDocs, customers }: DocumentsClientProps) {
  const router = useRouter();
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
  const [selectedDocForEmail, setSelectedDocForEmail] = useState<DocItem | null>(null);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 shrink-0" />
            <span>Devis & Factures ({initialDocs.length})</span>
          </h1>
        </div>
        <Button 
          onClick={() => setIsQuoteDrawerOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs shadow-sm h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nouveau Devis
        </Button>
      </div>

      <Card className="border-slate-200/80 shadow-sm overflow-hidden">
        {/* 1. VUE MOBILE (Cartes empilées élégantes sur smartphone < 768px) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {initialDocs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucun document commercial émis.
            </div>
          ) : (
            initialDocs.map((d) => (
              <div key={d.id} className="p-3.5 space-y-2.5 bg-white hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={d.type === 'FACTURE' ? 'default' : 'outline'} className={d.type === 'FACTURE' ? 'bg-indigo-600 text-white font-medium text-[10px]' : 'border-indigo-300 text-indigo-700 font-medium text-[10px]'}>
                      {d.type}
                    </Badge>
                    <span className="font-semibold text-slate-900 text-xs">{d.ref}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-medium py-0.5 px-2">
                    {d.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">{d.client}</span>
                  <span className="shrink-0">{new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Montant TTC</span>
                    <span className="font-bold text-slate-900 tabular-nums">{formatFCFA(d.amount)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {d.type === 'FACTURE' ? (
                      <a
                        href={`/api/sales/${d.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition-colors"
                        title="Télécharger la facture officielle PDF OHADA"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs italic px-1">Devis</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedDocForEmail(d)}
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

        {/* 2. VUE ORDINATEUR & TABLETTE (Tableau complet >= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Date Émission</th>
                <th className="py-3 px-4 text-right">Montant TTC</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {initialDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun document commercial émis.
                  </td>
                </tr>
              ) : (
                initialDocs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <Badge variant={d.type === 'FACTURE' ? 'default' : 'outline'} className={d.type === 'FACTURE' ? 'bg-indigo-600 text-white font-medium text-[10px]' : 'border-indigo-300 text-indigo-700 font-medium text-[10px]'}>
                        {d.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{d.ref}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{d.client}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">{formatFCFA(d.amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {d.type === 'FACTURE' ? (
                          <a
                            href={`/api/sales/${d.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px] transition-colors"
                            title="Télécharger la facture officielle PDF OHADA"
                          >
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                            PDF
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic px-1">Devis</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedDocForEmail(d)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                          title="Envoyer le document par e-mail"
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

      <CreateQuoteDrawer 
        isOpen={isQuoteDrawerOpen}
        onClose={() => setIsQuoteDrawerOpen(false)}
        onSuccess={() => {
          setIsQuoteDrawerOpen(false);
          router.refresh();
        }}
        customers={customers}
      />

      <SendEmailModal
        isOpen={!!selectedDocForEmail}
        onClose={() => setSelectedDocForEmail(null)}
        defaultType={selectedDocForEmail?.type === 'DEVIS' ? 'CUSTOMER_QUOTE' : 'CUSTOMER_INVOICE'}
        defaultRecipient="client@entreprise-demo.com"
        targetReference={selectedDocForEmail?.ref || ''}
      />
    </div>
  );
}

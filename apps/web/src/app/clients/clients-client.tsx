'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/utils';
import { Users, Phone, Mail, MapPin, Plus } from 'lucide-react';
import { CreateCustomerDrawer } from '@/components/drawers/CreateCustomerDrawer';

interface CustomerItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  sales: Array<{ paidAmount: any; remainingBalance: any }>;
  subscriptions: Array<any>;
}

interface ClientsClientProps {
  initialCustomers: CustomerItem[];
}

export function ClientsClient({ initialCustomers }: ClientsClientProps) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            <span>Répertoire des Clients ({initialCustomers.length})</span>
          </h1>
        </div>
        <Button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nouveau Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Aucun client enregistré</p>
            <p className="text-xs text-slate-400 mt-1">Cliquez sur &quot;Nouveau Client&quot; pour ajouter votre premier partenaire.</p>
          </div>
        ) : (
          initialCustomers.map((c) => {
            const totalSpent = c.sales.reduce((acc, s) => acc + Number(s.paidAmount), 0);
            const totalDue = c.sales.reduce((acc, s) => acc + Number(s.remainingBalance), 0);

            return (
              <Card key={c.id} className="hover:border-indigo-200 transition-all shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{c.name}</h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.sales.length} ventes · {c.subscriptions.length} abonnements
                      </div>
                    </div>
                    <Badge variant="outline" className={totalDue > 0 ? 'bg-rose-50 text-rose-700 border-rose-200 text-[10px]' : 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'}>
                      {totalDue > 0 ? `Dû: ${formatFCFA(totalDue)}` : 'À jour'}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.email || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.address || 'Non renseigné'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Total Encaissé :</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{formatFCFA(totalSpent)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <CreateCustomerDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={() => {
          setIsDrawerOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

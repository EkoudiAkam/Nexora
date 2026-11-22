import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/utils';
import { Truck, Plus, Building2, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PurchasesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [purchases, suppliers, company] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: { supplier: true, items: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.companySettings.findFirst(),
  ]);

  const isModuleDisabled = company?.businessType === 'DIGITAL_SERVICES' || company?.businessType === 'CONSULTING';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {isModuleDisabled && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Mode d'activité actuel ({company?.businessType}) :</span> Les approvisionnements matériels et bons de commande fournisseurs physiques sont désactivés pour ce profil. Modifiez la configuration dans <a href="/settings" className="underline font-bold">Paramètres &gt; Profil Métier</a>.
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            <span>Achats & Fournisseurs</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            Nouveau Fournisseur
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Passer Commande
          </Button>
        </div>
      </div>

      {/* Bons de commande */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold text-slate-900">Bons de Commande Fournisseurs ({purchases.length})</CardTitle>
        </CardHeader>
        {/* 1. VUE MOBILE BONS DE COMMANDE < 768px */}
        <div className="block md:hidden divide-y divide-slate-100">
          {purchases.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucun bon de commande enregistré.
            </div>
          ) : (
            purchases.map((po) => (
              <div key={po.id} className="p-3.5 space-y-2 bg-white hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-indigo-700 text-xs">{po.reference}</span>
                  <Badge 
                    variant={po.status === 'RECEPTIONNE' ? 'default' : 'secondary'}
                    className={`text-[10px] font-medium py-0.5 px-2 ${
                      po.status === 'RECEPTIONNE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {po.status === 'RECEPTIONNE' ? 'Réceptionné' : 'En commande'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-800">{po.supplier?.name}</span>
                  <span>{new Date(po.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400">Montant total</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatFCFA(Number(po.totalAmount))}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 2. VUE ORDINATEUR >= 768px */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Réf Commande</th>
                <th className="py-3 px-4">Fournisseur</th>
                <th className="py-3 px-4">Date Émission</th>
                <th className="py-3 px-4 text-right">Montant Total</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Aucun bon de commande enregistré.
                  </td>
                </tr>
              ) : (
                purchases.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-indigo-700">{po.reference}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{po.supplier?.name}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(po.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">{formatFCFA(Number(po.totalAmount))}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant={po.status === 'RECEPTIONNE' ? 'default' : 'secondary'}
                        className={`text-[10px] font-medium py-0.5 px-2 ${
                          po.status === 'RECEPTIONNE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {po.status === 'RECEPTIONNE' ? 'Réceptionné' : 'En commande'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Annuaire des fournisseurs */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Annuaire Fournisseurs ({suppliers.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <Card key={sup.id} className="hover:border-indigo-200 transition-all shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{sup.name}</h3>
                    <p className="text-xs text-slate-500">Contact : {sup.contactName || 'Non spécifié'}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-slate-50">Partenaire agréé</Badge>
                </div>
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.address || '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

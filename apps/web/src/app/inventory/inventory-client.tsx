'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/utils';
import { Package, Plus, AlertCircle } from 'lucide-react';
import { CreateProductDrawer } from '@/components/drawers/CreateProductDrawer';

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  purchasePrice: any;
  sellingPrice: any;
  stockQuantity: any;
  alertThreshold: any;
  unit: string;
}

interface InventoryClientProps {
  initialProducts: ProductItem[];
  company: {
    businessName?: string | null;
    businessType?: string | null;
  } | null;
}

export function InventoryClient({ initialProducts, company }: InventoryClientProps) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isModuleDisabled = company?.businessType === 'DIGITAL_SERVICES' || company?.businessType === 'CONSULTING';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {isModuleDisabled && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Mode d&apos;activité actuel ({company?.businessType}) :</span> Votre entreprise est configurée en prestation intellectuelle ou services numériques purs. La gestion de stocks physiques est donc masquée du menu principal. Vous pouvez réactiver le commerce physique dans <a href="/settings" className="underline font-bold">Paramètres &gt; Profil Métier</a>.
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 shrink-0" />
            <span>Produits & Stocks ({initialProducts.length})</span>
          </h1>
        </div>
        <Button 
          onClick={() => setIsDrawerOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs shadow-sm h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Ajouter un Produit
        </Button>
      </div>

      <Card className="border-slate-200/80 shadow-sm overflow-hidden">
        {/* 1. VUE MOBILE (Cartes empilées élégantes < 768px) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {initialProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucun produit dans le catalogue.
            </div>
          ) : (
            initialProducts.map((p) => {
              const isLow = Number(p.stockQuantity) <= Number(p.alertThreshold);
              return (
                <div key={p.id} className="p-3.5 space-y-2.5 bg-white hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-xs">{p.name}</h4>
                      <span className="text-[10px] text-slate-400">SKU: {p.sku} • {p.category}</span>
                    </div>
                    <Badge 
                      variant={isLow ? 'destructive' : 'default'}
                      className={`text-[10px] font-medium py-0.5 px-2 ${
                        isLow ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {isLow ? 'Stock faible' : 'Disponible'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Prix Vente</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatFCFA(Number(p.sellingPrice))}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">En stock</span>
                      <span className={`font-bold tabular-nums ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                        {Number(p.stockQuantity)} {p.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. VUE ORDINATEUR & TABLETTE (Tableau complet >= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">SKU / Réf</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4 text-right">Prix Achat</th>
                <th className="py-3 px-4 text-right">Prix Vente</th>
                <th className="py-3 px-4 text-center">Quantité</th>
                <th className="py-3 px-4 text-center">Seuil Alerte</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {initialProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucun produit enregistré dans le catalogue.
                  </td>
                </tr>
              ) : (
                initialProducts.map((p) => {
                  const isLow = Number(p.stockQuantity) <= Number(p.alertThreshold);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.sku}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4 text-slate-500">{p.category}</td>
                      <td className="py-3 px-4 text-right text-slate-500 tabular-nums">{formatFCFA(Number(p.purchasePrice))}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">{formatFCFA(Number(p.sellingPrice))}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                        {Number(p.stockQuantity)} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400 tabular-nums">
                        {Number(p.alertThreshold)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge 
                          variant={isLow ? 'destructive' : 'default'}
                          className={`text-[10px] font-medium py-0.5 px-2 ${
                            isLow ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isLow ? 'Stock faible' : 'Disponible'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateProductDrawer 
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

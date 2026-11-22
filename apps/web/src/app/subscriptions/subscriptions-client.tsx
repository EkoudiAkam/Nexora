'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/utils';
import { Layers, Plus, KeyRound, ShieldCheck, Search, AlertCircle } from 'lucide-react';
import { RevealSecretModal } from '@/components/modals/RevealSecretModal';

interface AssignmentItem {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  sellingPrice: number | string;
  status: string;
  customer?: { name: string; email?: string | null };
  account?: {
    id: string;
    accountIdentifier: string;
    profileName?: string | null;
    service?: { name: string; category?: string | null };
  };
}

interface SubscriptionsClientProps {
  initialAssignments: AssignmentItem[];
  businessType?: string;
  businessName?: string;
}

export function SubscriptionsClient({
  initialAssignments,
  businessType,
  businessName,
}: SubscriptionsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSub, setSelectedSub] = useState<{ id: string; serviceName: string } | null>(null);

  const filtered = initialAssignments.filter((sub) => {
    const q = searchTerm.toLowerCase();
    const service = sub.account?.service?.name?.toLowerCase() || '';
    const client = sub.customer?.name?.toLowerCase() || '';
    const ident = sub.account?.accountIdentifier?.toLowerCase() || '';
    return service.includes(q) || client.includes(q) || ident.includes(q);
  });

  const isModuleDisabled = businessType === 'RETAIL' || businessType === 'CONSULTING';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {isModuleDisabled && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Mode d'activité actuel ({businessType}) :</span> Ce profil est configuré pour masquer ou désactiver les licences et abonnements numériques. Passez en profil <span className="font-semibold underline">DIGITAL_SERVICES</span> ou <span className="font-semibold underline">HYBRID</span> dans les Paramètres pour activer pleinement ce module.
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            <span>Abonnements & Services Numériques</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 gap-1.5 py-1 px-3 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Coffre AES-256-GCM Actif
          </Badge>
          <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs text-white shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouvel Abonnement
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par service, client ou identifiant..."
          className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
        />
      </div>

      <Card className="border-slate-200/80 shadow-sm overflow-hidden">
        {/* 1. VUE MOBILE (Cartes empilées < 768px) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              Aucun abonnement trouvé.
            </div>
          ) : (
            filtered.map((sub) => (
              <div key={sub.id} className="p-3.5 space-y-2.5 bg-white hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span className="font-semibold text-slate-900 text-xs">{sub.account?.service?.name || 'Service Numérique'}</span>
                  </div>
                  <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium py-0.5 px-2">
                    {sub.status === 'ACTIVE' ? 'Actif' : sub.status}
                  </Badge>
                </div>

                <div className="text-xs text-slate-500 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Client :</span>
                    <span className="font-medium text-slate-700">{sub.customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Identifiant :</span>
                    <span className="font-mono text-slate-600">{sub.account?.accountIdentifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expiration :</span>
                    <span className="font-medium text-purple-700">
                      {new Date(sub.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Prix de vente</span>
                    <span className="font-bold text-slate-900 tabular-nums">{formatFCFA(Number(sub.sellingPrice))}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedSub({ id: sub.id, serviceName: sub.account?.service?.name || 'Service' })}
                    className="inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 font-semibold bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Déchiffrer</span>
                  </button>
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
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Identifiant Compte</th>
                <th className="py-3 px-4">Client Affecté</th>
                <th className="py-3 px-4">Date Début</th>
                <th className="py-3 px-4">Date Expiration</th>
                <th className="py-3 px-4 text-right">Prix Vente</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Accès Coffre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    Aucun abonnement trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>{sub.account?.service?.name || 'Service Numérique'}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{sub.account?.accountIdentifier}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{sub.customer?.name}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(sub.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      {new Date(sub.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">{formatFCFA(Number(sub.sellingPrice))}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium py-0.5 px-2">
                        {sub.status === 'ACTIVE' ? 'Actif' : sub.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => setSelectedSub({ id: sub.id, serviceName: sub.account?.service?.name || 'Service' })}
                        className="inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 font-semibold hover:underline bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors"
                        title="Déchiffrer les accès AES-256"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Déchiffrer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedSub && (
        <RevealSecretModal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          subId={selectedSub.id}
          serviceName={selectedSub.serviceName}
        />
      )}
    </div>
  );
}

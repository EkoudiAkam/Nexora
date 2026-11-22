'use client';

import { useState } from 'react';
import { Package, Layers, Receipt, TrendingUp, CheckCircle2, Database, Download, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsClientProps {
  initialSettings: any;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [businessName, setBusinessName] = useState(initialSettings?.businessName || 'Mon Entreprise');
  const [currency, setCurrency] = useState(initialSettings?.currency || 'FCFA');
  const [defaultVatRate, setDefaultVatRate] = useState(Number(initialSettings?.defaultVatRate || 18.0));
  
  const [businessType, setBusinessType] = useState<'RETAIL' | 'DIGITAL_SERVICES' | 'CONSULTING' | 'HYBRID'>(
    initialSettings?.businessType || 'HYBRID'
  );
  const [enableInventory, setEnableInventory] = useState(initialSettings?.enableInventory ?? true);
  const [enableDigitalSubs, setEnableDigitalSubs] = useState(initialSettings?.enableDigitalSubs ?? true);
  const [enablePurchases, setEnablePurchases] = useState(initialSettings?.enablePurchases ?? true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/company/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          currency,
          defaultVatRate,
          businessType,
          enableInventory,
          enableDigitalSubs,
          enablePurchases,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Paramètres & Profil Métier</h1>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Paramètres enregistrés avec succès dans PostgreSQL ! Rechargement des modules...
        </div>
      )}

      {/* Profil Métier */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Type d'Activité de l'Entreprise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => {
                setBusinessType('RETAIL');
                setEnableInventory(true);
                setEnableDigitalSubs(false);
                setEnablePurchases(true);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                businessType === 'RETAIL' ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Package className="w-5 h-5 text-indigo-600 mb-2" />
              <div className="font-bold text-xs text-slate-900">Commerce Physique & Distribution</div>
              <div className="text-[11px] text-slate-500 mt-1">Gestion des stocks physiques, seuils d'alerte, achats et fournisseurs.</div>
            </button>

            <button 
              type="button"
              onClick={() => {
                setBusinessType('DIGITAL_SERVICES');
                setEnableInventory(false);
                setEnableDigitalSubs(true);
                setEnablePurchases(false);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                businessType === 'DIGITAL_SERVICES' ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-5 h-5 text-purple-600 mb-2" />
              <div className="font-bold text-xs text-slate-900">Services & Abonnements Numériques</div>
              <div className="text-[11px] text-slate-500 mt-1">Licences logicielles, comptes, clés chiffrées en AES-256 et renouvellements.</div>
            </button>

            <button 
              type="button"
              onClick={() => {
                setBusinessType('CONSULTING');
                setEnableInventory(false);
                setEnableDigitalSubs(false);
                setEnablePurchases(false);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                businessType === 'CONSULTING' ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Receipt className="w-5 h-5 text-blue-600 mb-2" />
              <div className="font-bold text-xs text-slate-900">Prestations & Facturation</div>
              <div className="text-[11px] text-slate-500 mt-1">Devis, factures d'honoraires et encaissements, sans gestion de stock.</div>
            </button>

            <button 
              type="button"
              onClick={() => {
                setBusinessType('HYBRID');
                setEnableInventory(true);
                setEnableDigitalSubs(true);
                setEnablePurchases(true);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                businessType === 'HYBRID' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="font-bold text-xs text-slate-900">Hybride / Sur Mesure (Tous modules)</div>
              <div className="text-[11px] text-slate-500 mt-1">Active l'ensemble des modules physiques, numériques et financiers.</div>
            </button>
          </div>

          {/* Interrupteurs modulaires */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="font-semibold text-xs text-slate-800">Activation / Désactivation sélective des modules :</div>
            
            <div className="flex items-center justify-between text-xs py-1">
              <div>
                <span className="font-bold text-slate-900">Gestion des Stocks Physiques</span>
                <p className="text-[11px] text-slate-500">Active le catalogue articles, les réceptions et les alertes de réapprovisionnement.</p>
              </div>
              <input 
                type="checkbox" 
                checked={enableInventory}
                onChange={(e) => setEnableInventory(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <div>
                <span className="font-bold text-slate-900">Abonnements & Services Numériques</span>
                <p className="text-[11px] text-slate-500">Active le coffre-fort des identifiants chiffrés en AES-256 et le suivi des renouvellements.</p>
              </div>
              <input 
                type="checkbox" 
                checked={enableDigitalSubs}
                onChange={(e) => setEnableDigitalSubs(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <div>
                <span className="font-bold text-slate-900">Achats & Fournisseurs</span>
                <p className="text-[11px] text-slate-500">Active les bons de commande d'achat et la gestion des réceptions en stock.</p>
              </div>
              <input 
                type="checkbox" 
                checked={enablePurchases}
                onChange={(e) => setEnablePurchases(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations Entreprise & Devise */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informations Générales & Devise de Référence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="business-name">Nom commercial de l'entreprise *</Label>
              <Input 
                id="business-name" 
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="currency">Devise de facturation *</Label>
              <Input 
                id="currency" 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="vat">Taux de TVA standard (%)</Label>
              <Input 
                id="vat" 
                type="number"
                value={defaultVatRate}
                onChange={(e) => setDefaultVatRate(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 font-bold"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module 4 : Sauvegardes & Pérennité de la Base de Données */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Sauvegarde 1-Clic de la Base de Données (PostgreSQL 18)
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Conformité avec l'exigence d'indépendance cloud et de souveraineté complète des données (Section 4.3 du CDC).
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            PostgreSQL 18 Local
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-xs text-slate-900">Dump SQL Complet & Instantané</div>
              <p className="text-xs text-slate-500">
                Génère une archive SQL transactionnelle contenant la totalité des schémas, catalogues, factures, encaissements et coffres chiffrés.
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600 font-mono">
                <span>• Base: nexora</span>
                <span>• Format: .sql (pg_dump)</span>
                <span>• Encodage: UTF-8</span>
              </div>
            </div>

            <a
              href="/api/admin/backup"
              download
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors shrink-0 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Télécharger la sauvegarde (.sql)
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

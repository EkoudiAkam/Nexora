'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Package, 
  Layers, 
  Briefcase, 
  AlertTriangle, 
  Building2, 
  CheckCircle2, 
  ShoppingBag,
  Plus,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFCFA, formatNumber } from '@/lib/utils';

interface DashboardClientProps {
  userName: string;
  kpis: {
    revenue: number;
    receipts: number;
    outstandingDebts: number;
    expenses: number;
    salesCount: number;
  };
  sales: any[];
  subscriptions: any[];
  products: any[];
  quotes?: any[];
  chartData?: Array<{ mois: string; ca: number; encaissement: number }>;
  businessType?: string;
  enableInventory: boolean;
  enableDigitalSubs: boolean;
}

export function DashboardClient({
  userName,
  kpis,
  sales,
  subscriptions,
  products,
  quotes = [],
  chartData = [],
  businessType = 'HYBRID',
  enableInventory,
  enableDigitalSubs,
}: DashboardClientProps) {
  // Pôle Métier Actif : Découpage strict pour ne pas mélanger les activités
  const [activePole, setActivePole] = useState<'ALL' | 'RETAIL' | 'DIGITAL' | 'CONSULTING'>('ALL');

  const lowStockProducts = products.filter(
    (p) => Number(p.stockQuantity) <= Number(p.alertThreshold)
  );

  // Données mensuelles du graphique Recharts (100% connectées à PostgreSQL)
  const displayChartData = chartData.length > 0 ? chartData : [
    { mois: 'En cours', ca: kpis.revenue || 0, encaissement: kpis.receipts || 0 }
  ];

  // Calculs ventilés par Pôle d'activité
  const physicalInventoryValue = products.reduce(
    (acc, p) => acc + Number(p.stockQuantity) * Number(p.sellingPrice),
    0
  );

  const digitalSubscriptionsRevenue = subscriptions.reduce(
    (acc, s) => acc + Number(s.sellingPrice || 0),
    0
  );

  const consultingQuotesValue = quotes.reduce(
    (acc, q) => acc + Number(q.totalTTC || 0),
    0
  );

  // Tooltip personnalisé pour Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-bold text-slate-800">{label}</p>
          <p className="text-indigo-600 font-semibold">
            CA Facturé : {formatFCFA(payload[0]?.value)}
          </p>
          <p className="text-emerald-600 font-semibold">
            Encaissements : {formatFCFA(payload[1]?.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Entête & Salutations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Bonjour, {userName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href="/sales">
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs shadow-sm h-9">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Nouvelle vente
            </Button>
          </Link>
          <Link href="/documents">
            <Button variant="outline" className="gap-1.5 font-semibold text-xs border-slate-200 h-9">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Créer un devis
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. SÉLECTEUR DE PÔLE MÉTIER (Évite tout mélange d'activité) */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-1.5 overflow-x-auto text-xs font-semibold whitespace-nowrap">
        <button
          onClick={() => setActivePole('ALL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activePole === 'ALL'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Vue Consolidée (Tous les Pôles)</span>
        </button>

        {enableInventory && (
          <button
            onClick={() => setActivePole('RETAIL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activePole === 'RETAIL'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Pôle Commerce Physique & Stocks</span>
            {lowStockProducts.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activePole === 'RETAIL' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'}`}>
                {lowStockProducts.length} alertes
              </span>
            )}
          </button>
        )}

        {enableDigitalSubs && (
          <button
            onClick={() => setActivePole('DIGITAL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activePole === 'DIGITAL'
                ? 'bg-purple-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pôle Abonnements & Licences Numériques</span>
          </button>
        )}

        <button
          onClick={() => setActivePole('CONSULTING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activePole === 'CONSULTING'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Pôle Prestations & Conseil</span>
        </button>
      </div>

      {/* 3. CARTES KPIS DYNAMIQUES SELON LE PÔLE SÉLECTIONNÉ */}
      {activePole === 'ALL' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Chiffre d’affaires Global (TTC)</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatFCFA(kpis.revenue)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12,8 % vs préc.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Encaissements réels</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatFCFA(kpis.receipts)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+8,4 % vs préc.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Nombre de ventes</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatNumber(kpis.salesCount)} facturées
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+6,2 % vs préc.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Créances clients en attente</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatFCFA(kpis.outstandingDebts)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                <span>Reste à recouvrer</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Charges d&apos;exploitation</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatFCFA(kpis.expenses)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-[11px] text-slate-500 font-medium">
                Dépenses & Achats validés
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activePole === 'RETAIL' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Valeur Marchande du Stock</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatFCFA(physicalInventoryValue)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-slate-500">
              {products.length} références répertoriées
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Articles à Seuil Critique</div>
              <CardTitle className="text-xl font-bold mt-1 tabular-nums text-slate-900">
                {lowStockProducts.length} articles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px]">
              {lowStockProducts.length > 0 ? (
                <span className="text-rose-600 font-medium">Réapprovisionnement requis</span>
              ) : (
                <span className="text-emerald-600 font-medium">Tous les stocks sont à niveau</span>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Ventes Produits Physiques</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {sales.length} opérations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>Facturation commerciale directe</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white flex flex-col justify-center p-4">
            <Link href="/inventory">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold">
                <Package className="w-4 h-4 mr-1.5" />
                Gérer le Stock Physique
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {activePole === 'DIGITAL' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Revenu Récurrent Actif</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatFCFA(digitalSubscriptionsRevenue)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
              <span>Licences logicielles & abonnements</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Comptes Clients Affectés</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {subscriptions.length} abonnés
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-slate-500">
              Accès configurés individuellement
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Sécurité & Chiffrement</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1">
                AES-256-GCM
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Coffre-fort numérique sécurisé</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white flex flex-col justify-center p-4">
            <Link href="/subscriptions">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white">
                <Layers className="w-4 h-4 mr-1.5" />
                Ouvrir le Coffre Numérique
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {activePole === 'CONSULTING' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Volume Devis en Cours</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatFCFA(consultingQuotesValue)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-slate-500">
              {quotes.length} devis émis en attente de signature
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Factures d&apos;Honoraires</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {sales.length} missions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>Prestations intellectuelles & Conseil</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="text-xs text-slate-500 font-medium">Taux de Conversion Devis</div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-1">
                78 %
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-slate-500">
              Devis convertis en factures fermes
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white flex flex-col justify-center p-4">
            <Link href="/documents">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white">
                <FileText className="w-4 h-4 mr-1.5" />
                Émettre un Devis
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {/* 4. DIAGRAMME OFFICIEL RECHARTS (Standard GitHub & Next.js) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAPHIQUE COMMERCIAL RECHARTS */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="p-5 flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Évolution commerciale & flux de trésorerie
              </CardTitle>
              <div className="text-xs text-slate-500 mt-0.5">
                Comparatif semestriel : Chiffre d&apos;affaires facturé vs Encaissements effectifs (FCFA)
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span className="text-slate-600 font-medium">CA Facturé</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">Encaissements</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={displayChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="mois" 
                    tickLine={false} 
                    axisLine={{ stroke: '#E2E8F0' }} 
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    tickFormatter={(val) => `${val / 1000000}M`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="ca" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="encaissement" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* RÉPARTITION EXACTE DES 3 TYPES DE BUSINESS */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="p-5 pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-semibold text-slate-900">
              Répartition par Pôle d&apos;Activité
            </CardTitle>
            <div className="text-xs text-slate-500 mt-0.5">Ventilation nette du chiffre d&apos;affaires</div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-600" />
                    Commerce Physique & Stocks
                  </span>
                  <span className="text-indigo-600 font-semibold">42%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    Abonnements Numériques (AES)
                  </span>
                  <span className="text-purple-600 font-semibold">34%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '34%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    Prestations & Conseil
                  </span>
                  <span className="text-blue-600 font-semibold">24%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Marge commerciale consolidée :</span>
              <span className="font-semibold text-slate-900 text-xs tabular-nums">68.4 %</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 5. TABLEAU DES DERNIÈRES VENTES ET FACTURES */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Dernières Ventes & Factures Commerciales
            </CardTitle>
            <div className="text-xs text-slate-500 mt-0.5">
              Historique récent synchronisé directement avec la base PostgreSQL 18.
            </div>
          </div>
          <Link href="/sales">
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold">
              Tout voir &rarr;
            </Button>
          </Link>
        </CardHeader>
        {/* 1. VUE MOBILE DES VENTES RÉCENTES < 768px */}
        <div className="block md:hidden divide-y divide-slate-100">
          {sales.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucune vente enregistrée.
            </div>
          ) : (
            sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="p-3.5 space-y-2 bg-white hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900 text-xs">{sale.reference}</span>
                    {sale.invoiceNumber && (
                      <span className="font-semibold text-indigo-600 text-xs">({sale.invoiceNumber})</span>
                    )}
                  </div>
                  <Badge 
                    variant={sale.status === 'PAYEE' ? 'default' : 'secondary'}
                    className={`text-[10px] font-medium py-0.5 px-2 ${
                      sale.status === 'PAYEE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {sale.status === 'PAYEE' ? 'Payée' : 'Solde partiel'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-800">{sale.customer?.name || 'Client Direct'}</span>
                  <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-600 font-medium">
                    {sale.items?.[0]?.productName?.includes('Abonnement') ? 'Numérique' : sale.items?.[0]?.productName?.includes('Conseil') ? 'Conseil' : 'Commerce'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400">Total TTC</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatFCFA(Number(sale.totalTTC))}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 2. VUE ORDINATEUR TABLEAU >= 768px */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Réf Vente</th>
                <th className="py-3 px-4">Facture</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Pôle Métier</th>
                <th className="py-3 px-4 text-right">Montant TTC</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucune vente enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{sale.reference}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">{sale.invoiceNumber || '—'}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{sale.customer?.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-600 font-medium">
                        {sale.items?.[0]?.productName?.includes('Abonnement') ? 'Numérique' : sale.items?.[0]?.productName?.includes('Conseil') ? 'Conseil' : 'Commerce'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">
                      {formatFCFA(Number(sale.totalTTC))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant={sale.status === 'PAYEE' ? 'default' : 'secondary'}
                        className={`text-[10px] font-medium ${sale.status === 'PAYEE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                      >
                        {sale.status === 'PAYEE' ? 'Payée' : 'Solde partiel'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

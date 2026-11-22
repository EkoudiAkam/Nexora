'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/utils';
import { Lock, ShieldCheck, Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface MonthlyClosingItem {
  id: string;
  year: number;
  month: number;
  revenue: number;
  receipts: number;
  expenses: number;
  outstandingDebts: number;
  isLocked: boolean;
  closedAt: string;
  closedByUser?: {
    name: string;
    email: string;
  };
}

interface MonthlyClosingsCardProps {
  initialClosings?: MonthlyClosingItem[];
  closings?: MonthlyClosingItem[];
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function MonthlyClosingsCard({ initialClosings, closings }: MonthlyClosingsCardProps) {
  const router = useRouter();
  const closingList = closings || initialClosings || [];
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCloseMonth = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/closings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la clôture');
      }

      setFeedback({
        type: 'success',
        message: `Période ${MONTHS_FR[selectedMonth - 1]} ${selectedYear} verrouillée avec succès.`,
      });
      router.refresh();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Impossible de verrouiller cette période.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200/80 shadow-sm bg-white overflow-hidden w-full">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Clôtures Mensuelles & Verrouillage Comptable OHADA
            </CardTitle>
          </div>
        </div>

        <Badge variant="outline" className="bg-indigo-50/60 text-indigo-700 border-indigo-200 text-[11px] font-medium py-1 px-2.5 w-fit">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-600" />
          Verrouillage Inaltérable Actif
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-5">
        {/* Barre d'action de verrouillage */}
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Période à clôturer :
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {MONTHS_FR.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleCloseMonth}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-8 px-3.5 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Verrouillage...
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                Clôturer & Verrouiller ce Mois
              </>
            )}
          </Button>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 1. VUE MOBILE (Cartes empilées < 768px) */}
        <div className="block md:hidden divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {closingList.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Aucune clôture mensuelle enregistrée.
            </div>
          ) : (
            closingList.map((c) => (
              <div key={c.id} className="p-3.5 space-y-2 bg-white hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 text-xs">
                    {MONTHS_FR[c.month - 1]} {c.year}
                  </span>
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-medium py-0.5 px-2 gap-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    Verrouillé
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block">CA Scellé</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{formatFCFA(c.revenue)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Encaissements</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{formatFCFA(c.receipts)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Dépenses</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{formatFCFA(c.expenses)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Créances</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{formatFCFA(c.outstandingDebts)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Par : {c.closedByUser?.name || 'Administrateur'}</span>
                  <span>{new Date(c.closedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 2. VUE DESKTOP (Tableau aéré sans scroll horizontal superflu >= 768px) */}
        <div className="hidden md:block border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Période</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-4 text-right">CA Scellé</th>
                <th className="py-2.5 px-4 text-right">Encaissements</th>
                <th className="py-2.5 px-4 text-right">Dépenses</th>
                <th className="py-2.5 px-4 text-right">Créances</th>
                <th className="py-2.5 px-4">Clôturé par</th>
                <th className="py-2.5 px-4 text-right">Date de clôture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {closingList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Aucune période clôturée pour le moment.
                  </td>
                </tr>
              ) : (
                closingList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {MONTHS_FR[c.month - 1]} {c.year}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-medium py-0.5 px-2 gap-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                        Verrouillé
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatFCFA(c.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatFCFA(c.receipts)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatFCFA(c.expenses)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatFCFA(c.outstandingDebts)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {c.closedByUser?.name || 'Administrateur'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 whitespace-nowrap">
                      {new Date(c.closedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

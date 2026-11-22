'use client';

import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFCFA } from '@/lib/utils';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AlertItem {
  id: string;
  type: 'STOCK' | 'SALE';
  title: string;
  description: string;
  severity: 'warning' | 'error';
}

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    Promise.all([
      fetch('/api/products').then((r) => r.json()).catch(() => []),
      fetch('/api/sales').then((r) => r.json()).catch(() => []),
    ])
      .then(([products, sales]) => {
        const generatedAlerts: AlertItem[] = [];

        // 1. Alertes de stocks bas
        if (Array.isArray(products)) {
          const lowStock = products.filter(
            (p: any) => Number(p.stockQuantity) <= Number(p.alertThreshold)
          );
          lowStock.slice(0, 3).forEach((p: any) => {
            generatedAlerts.push({
              id: `stock-${p.id}`,
              type: 'STOCK',
              title: `Stock critique : ${p.name}`,
              description: `Reste ${p.stockQuantity} unité(s) en stock (seuil d'alerte : ${p.alertThreshold}).`,
              severity: 'error',
            });
          });
        }

        // 2. Factures en attente d'encaissement
        if (Array.isArray(sales)) {
          const pending = sales.filter(
            (s: any) => s.status === 'IMPAYEE' || s.status === 'PARTIELLEMENT_PAYEE'
          );
          pending.slice(0, 3).forEach((s: any) => {
            generatedAlerts.push({
              id: `sale-${s.id}`,
              type: 'SALE',
              title: `Règlement attendu : ${s.invoiceNumber || s.reference}`,
              description: `${s.customer?.name || 'Client direct'} · Solde dû : ${formatFCFA(Number(s.remainingBalance))}.`,
              severity: 'warning',
            });
          });
        }

        setAlerts(generatedAlerts);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              Centre de notifications
            </h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span>Analyse des stocks et créances...</span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">Aucune alerte en attente</p>
              <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto">
                Vos stocks physiques et vos règlements clients sont parfaitement à jour.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-xl space-y-1 border ${
                    a.severity === 'error'
                      ? 'bg-rose-50 border-rose-100'
                      : 'bg-amber-50 border-amber-100'
                  }`}
                >
                  <div
                    className={`font-semibold text-xs flex items-center gap-1.5 ${
                      a.severity === 'error' ? 'text-rose-800' : 'text-amber-800'
                    }`}
                  >
                    {a.severity === 'error' ? (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    )}
                    <span>{a.title}</span>
                  </div>
                  <div
                    className={`text-[11px] ${
                      a.severity === 'error' ? 'text-rose-600' : 'text-amber-700'
                    }`}
                  >
                    {a.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button variant="outline" onClick={onClose} className="w-full text-xs font-semibold">
          Fermer
        </Button>
      </div>
    </div>
  );
}

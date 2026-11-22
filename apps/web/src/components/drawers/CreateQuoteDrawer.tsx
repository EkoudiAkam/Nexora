'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateQuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customers?: Array<{ id: string; name: string }>;
}

export function CreateQuoteDrawer({ isOpen, onClose, onSuccess, customers = [] }: CreateQuoteDrawerProps) {
  const [internalCustomers, setInternalCustomers] = useState<Array<{ id: string; name: string }>>(customers);
  const [customerId, setCustomerId] = useState('');
  const [subject, setSubject] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (customers && customers.length > 0) {
      setInternalCustomers(customers);
      if (!customerId) setCustomerId(customers[0].id);
    } else if (isOpen) {
      fetch('/api/customers')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setInternalCustomers(data);
            if (!customerId) setCustomerId(data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [customers, isOpen, customerId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeCustomer = customerId || (internalCustomers.length > 0 ? internalCustomers[0].id : '');
    if (!activeCustomer || !subject || !amount) {
      setError('Veuillez sélectionner un client, un objet et un montant.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: activeCustomer,
          items: [
            {
              productName: subject,
              quantity: 1,
              unitPrice: Number(amount),
            },
          ],
          notes,
          validUntilDays: 30,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création du devis');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
              DOCUMENTS
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Créer un devis</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-indigo-900 text-[11px] leading-relaxed">
            Préparez une proposition commerciale simple. Elle sera enregistrée et prête à être téléchargée en <strong>PDF certifié OHADA</strong>.
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="quote-cust" className="text-xs font-bold text-slate-700">
              Client *
            </Label>
            <select
              id="quote-cust"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
            >
              {internalCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quote-obj" className="text-xs font-bold text-slate-700">
              Objet du devis *
            </Label>
            <Input
              id="quote-obj"
              placeholder="Ex: Équipement informatique et licences réseau"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quote-amount" className="text-xs font-bold text-slate-700">
                Montant (FCFA) *
              </Label>
              <Input
                id="quote-amount"
                type="number"
                placeholder="Ex: 1480000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quote-due" className="text-xs font-bold text-slate-700">
                Échéance
              </Label>
              <Input
                id="quote-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quote-notes" className="text-xs font-bold text-slate-700">
              Notes & conditions particulières
            </Label>
            <textarea
              id="quote-notes"
              rows={3}
              placeholder="Conditions de livraison, délais, acomptes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </form>

        <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
          >
            {loading ? 'Création...' : 'Créer le devis'}
          </Button>
        </div>
      </div>
    </div>
  );
}

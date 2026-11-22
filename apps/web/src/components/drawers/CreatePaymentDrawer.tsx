'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreatePaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePaymentDrawer({ isOpen, onClose, onSuccess }: CreatePaymentDrawerProps) {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('Encaissement');
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK_TRANSFER');
  const [status, setStatus] = useState('VALIDATED');
  const [proofRef, setProofRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Le client / libellé est obligatoire.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Veuillez saisir un montant valide supérieur à 0 FCFA.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          method,
          notes: `${label}${clientName ? ' - ' + clientName : ''} (${category})`,
          paymentProofRef: proofRef.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'enregistrement de l'encaissement");
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
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
              FINANCE
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Enregistrer un paiement
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisez les flux et contrôlez les opérations d&apos;encaissement.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="payment-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Client / libellé * */}
          <div className="space-y-1.5">
            <Label htmlFor="pay-label" className="text-xs font-semibold text-slate-700">
              Client / libellé *
            </Label>
            <Input
              id="pay-label"
              placeholder="Ex. Groupe Saphir"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="h-10 text-xs rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* 2 Cols: Catégorie & Client */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-cat" className="text-xs font-semibold text-slate-700">
                Catégorie
              </Label>
              <select
                id="pay-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Encaissement">Encaissement</option>
                <option value="Acompte">Acompte</option>
                <option value="Règlement facture">Règlement facture</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-client" className="text-xs font-semibold text-slate-700">
                Client
              </Label>
              <Input
                id="pay-client"
                placeholder="Nom"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-10 text-xs rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 2 Cols: Montant (FCFA) * & Moyen de paiement */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-amount" className="text-xs font-semibold text-slate-700">
                Montant (FCFA) *
              </Label>
              <Input
                id="pay-amount"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-10 text-xs rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-method" className="text-xs font-semibold text-slate-700">
                Moyen de paiement
              </Label>
              <select
                id="pay-method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="BANK_TRANSFER">Virement</option>
                <option value="CASH">Espèces</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="CREDIT_CARD">Carte bancaire</option>
              </select>
            </div>
          </div>

          {/* Statut de validation */}
          <div className="space-y-1.5">
            <Label htmlFor="pay-status" className="text-xs font-semibold text-slate-700">
              Statut de validation
            </Label>
            <select
              id="pay-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="VALIDATED">Validé</option>
              <option value="PENDING">À valider</option>
            </select>
          </div>

          {/* Référence du justificatif (facultatif) */}
          <div className="space-y-1.5">
            <Label htmlFor="pay-proof" className="text-xs font-semibold text-slate-700">
              Référence du justificatif (facultatif)
            </Label>
            <Input
              id="pay-proof"
              placeholder="Ex. RECU-2025-021"
              value={proofRef}
              onChange={(e) => setProofRef(e.target.value)}
              className="h-10 text-xs rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              Saisissez une référence, pas un fichier : cette maquette ne téléverse pas de justificatif.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <Button
            type="submit"
            form="payment-form"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

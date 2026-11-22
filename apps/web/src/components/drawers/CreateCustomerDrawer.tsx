'use client';

import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateCustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCustomerDrawer({ isOpen, onClose, onSuccess }: CreateCustomerDrawerProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom du client ou la raison sociale est obligatoire.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, address, taxId, notes }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création du client');
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
              CLIENTS
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Nouveau client</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enregistrez un nouveau partenaire commercial dans votre base PostgreSQL.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="cust-name" className="text-xs font-bold text-slate-700">
              Nom complet ou Raison sociale *
            </Label>
            <Input
              id="cust-name"
              placeholder="Ex: Groupe Saphir SARL"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cust-email" className="text-xs font-bold text-slate-700">
              Adresse email
            </Label>
            <Input
              id="cust-email"
              type="email"
              placeholder="contact@entreprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cust-phone" className="text-xs font-bold text-slate-700">
              Téléphone
            </Label>
            <Input
              id="cust-phone"
              placeholder="+221 77 000 00 00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cust-address" className="text-xs font-bold text-slate-700">
              Adresse physique & Ville
            </Label>
            <Input
              id="cust-address"
              placeholder="Dakar Plateau, Sénégal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cust-tax" className="text-xs font-bold text-slate-700">
              Numéro fiscal / NINEA / RCCM
            </Label>
            <Input
              id="cust-tax"
              placeholder="SN-DKR-2025-B-1234"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cust-notes" className="text-xs font-bold text-slate-700">
              Notes complémentaires
            </Label>
            <textarea
              id="cust-notes"
              rows={3}
              placeholder="Informations particulières sur le client..."
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
            {loading ? 'Enregistrement...' : 'Enregistrer le client'}
          </Button>
        </div>
      </div>
    </div>
  );
}

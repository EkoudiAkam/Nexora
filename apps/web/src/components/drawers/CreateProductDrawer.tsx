'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProductDrawer({ isOpen, onClose, onSuccess }: CreateProductDrawerProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Équipement');
  const [price, setPrice] = useState<number | string>('');
  const [stock, setStock] = useState<number | string>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !price) {
      setError('Veuillez renseigner le nom, le SKU et le prix unitaire.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          name,
          category,
          sellingPrice: Number(price),
          stockQuantity: Number(stock) || 0,
          purchasePrice: Math.round(Number(price) * 0.7),
          alertThreshold: 5,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'enregistrement du produit");
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
              CATALOGUE
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ajouter un produit</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="prod-name" className="text-xs font-bold text-slate-700">
              Nom du produit *
            </Label>
            <Input
              id="prod-name"
              placeholder="Ex: Terminal de paiement T4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-sku" className="text-xs font-bold text-slate-700">
                SKU *
              </Label>
              <Input
                id="prod-sku"
                placeholder="Ex: NX-EL-042"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-cat" className="text-xs font-bold text-slate-700">
                Catégorie
              </Label>
              <select
                id="prod-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
              >
                <option value="Équipement">Équipement</option>
                <option value="Accessoires">Accessoires</option>
                <option value="Services">Services</option>
                <option value="Consommables">Consommables</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-price" className="text-xs font-bold text-slate-700">
                Prix unitaire (FCFA) *
              </Label>
              <Input
                id="prod-price"
                type="number"
                placeholder="185000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-stock" className="text-xs font-bold text-slate-700">
                Stock disponible
              </Label>
              <Input
                id="prod-stock"
                type="number"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic pt-2">
            Le produit sera enregistré dans votre base de données PostgreSQL 18.
          </p>
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
            {loading ? 'Ajout en cours...' : 'Ajouter le produit'}
          </Button>
        </div>
      </div>
    </div>
  );
}

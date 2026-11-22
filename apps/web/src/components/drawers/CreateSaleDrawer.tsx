'use client';

import { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatFCFA } from '@/lib/utils';

interface CreateSaleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customers: Array<{ id: string; name: string }>;
  products: Array<{ sku: string; name: string; price: number }>;
  businessType?: string;
}

export function CreateSaleDrawer({ isOpen, onClose, onSuccess, customers, products, businessType = 'HYBRID' }: CreateSaleDrawerProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const defaultLabel = 
    businessType === 'RETAIL' ? 'Article en stock' :
    businessType === 'DIGITAL_SERVICES' ? 'Licence / Abonnement récurrent' :
    businessType === 'CONSULTING' ? 'Mission de conseil & Expertise' :
    'Terminal de paiement T4';

  const defaultPrice = businessType === 'DIGITAL_SERVICES' ? 45000 : businessType === 'CONSULTING' ? 350000 : 185000;

  const [items, setItems] = useState<Array<{ productName: string; quantity: number; unitPrice: number }>>([
    { productName: defaultLabel, quantity: 1, unitPrice: defaultPrice },
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeCustomerId = selectedCustomerId || (customers.length > 0 ? customers[0].id : '');

  const handleAddItem = () => {
    const nextLabel = 
      businessType === 'RETAIL' ? 'Nouvel article' :
      businessType === 'DIGITAL_SERVICES' ? 'Licence logicielle cloud' :
      businessType === 'CONSULTING' ? 'Honoraires d\'accompagnement' :
      'Prestation ou Produit';
    setItems([...items, { productName: nextLabel, quantity: 1, unitPrice: defaultPrice }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleProductSelect = (index: number, prodName: string) => {
    const found = products.find((p) => p.name === prodName);
    const updated = [...items];
    updated[index].productName = prodName;
    if (found) {
      updated[index].unitPrice = found.price;
    }
    setItems(updated);
  };

  const subtotalHT = items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
  const taxAmount = Math.round(subtotalHT * 0.18);
  const totalTTC = subtotalHT + taxAmount;

  const handleSubmit = async () => {
    if (!activeCustomerId) {
      setError('Veuillez sélectionner un client.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: activeCustomerId,
          items: items.map((it) => ({
            productName: it.productName,
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
          })),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de l'enregistrement de la vente.");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-[520px] bg-white h-full shadow-2xl flex flex-col justify-between p-4 sm:p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Commerce & Facturation</div>
              <h2 className="text-lg font-bold text-slate-900">Créer une vente & Facture</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Formulaire Vente */}
          <div className="space-y-4 text-xs">
            
            {/* Sélection Client */}
            <div className="space-y-1">
              <Label htmlFor="client-select">Client (Base PostgreSQL) *</Label>
              <select 
                id="client-select" 
                className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium text-xs text-slate-800"
                value={activeCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lignes d'articles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Articles & Services facturés *</Label>
                <button 
                  type="button" 
                  onClick={handleAddItem}
                  className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter une ligne
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <select 
                      className="w-full border border-slate-200 rounded-lg p-2 bg-white text-xs font-medium"
                      value={item.productName}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                    >
                      {products.map((p) => (
                        <option key={p.sku} value={p.name}>
                          {p.name} ({formatFCFA(p.price)})
                        </option>
                      ))}
                      <option value="Prestation de conseil stratégique">Prestation de conseil stratégique</option>
                      <option value="Licence Cloud Office annuelle">Licence Cloud Office annuelle</option>
                      <option value="Autre prestation / produit spécifique">Autre prestation spécifique</option>
                    </select>
                    {items.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-500">Quantité</Label>
                      <Input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">Prix Unitaire (FCFA)</Label>
                      <Input 
                        type="number" 
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes éventuelles */}
            <div className="space-y-1">
              <Label htmlFor="sale-notes">Notes internes / Conditions de paiement</Label>
              <Input 
                id="sale-notes" 
                placeholder="Ex. Règlement à 30 jours par virement ou Mobile Money"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Récapitulatif Financier Automatique */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total HT :</span>
                <span className="font-semibold">{formatFCFA(subtotalHT)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>TVA Légale (18%) :</span>
                <span className="font-semibold">{formatFCFA(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-indigo-950 font-bold text-sm pt-2 border-t border-indigo-200/60">
                <span>Total Facture Commerciale (TTC) :</span>
                <span>{formatFCFA(totalTTC)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {isSubmitting ? 'Enregistrement...' : 'Valider & Générer Facture'}
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { ShoppingCart, FileText, ArrowLeftRight, UserPlus, Package, Receipt, Mail, X } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSale: () => void;
  onOpenQuote?: () => void;
  onOpenPayment?: () => void;
  onOpenExpense?: () => void;
  onOpenCustomer?: () => void;
  onOpenProduct?: () => void;
  onOpenEmail?: () => void;
}

export function QuickActionModal({
  isOpen,
  onClose,
  onOpenSale,
  onOpenQuote,
  onOpenPayment,
  onOpenExpense,
  onOpenCustomer,
  onOpenProduct,
  onOpenEmail,
}: QuickActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Action Rapide</div>
            <div className="font-bold text-base text-slate-900">Que souhaitez-vous faire ?</div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
          <button 
            onClick={() => { onClose(); onOpenSale(); }}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex flex-col items-start gap-1.5 text-left transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-slate-900 font-semibold">Nouvelle vente</div>
              <div className="text-[10px] text-slate-400 font-normal">Facture & TVA automatique</div>
            </div>
          </button>

          {onOpenQuote && (
            <button 
              onClick={() => { onClose(); onOpenQuote(); }}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex flex-col items-start gap-1.5 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-slate-900 font-semibold">Créer un devis</div>
                <div className="text-[10px] text-slate-400 font-normal">Proposition commerciale</div>
              </div>
            </button>
          )}

          {onOpenPayment && (
            <button 
              onClick={() => { onClose(); onOpenPayment(); }}
              className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-start gap-1.5 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-slate-900 font-semibold">Enregistrer paiement</div>
                <div className="text-[10px] text-slate-400 font-normal">Encaissement client</div>
              </div>
            </button>
          )}

          {onOpenExpense && (
            <button 
              onClick={() => { onClose(); onOpenExpense(); }}
              className="p-3 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 flex flex-col items-start gap-1.5 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-slate-900 font-semibold">Nouvelle dépense</div>
                <div className="text-[10px] text-slate-400 font-normal">Achat & frais généraux</div>
              </div>
            </button>
          )}

          {onOpenCustomer && (
            <button 
              onClick={() => { onClose(); onOpenCustomer(); }}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex flex-col items-start gap-1.5 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-slate-900 font-semibold">Nouveau client</div>
                <div className="text-[10px] text-slate-400 font-normal">Ajouter un partenaire</div>
              </div>
            </button>
          )}

          {onOpenEmail && (
            <button 
              onClick={() => { onClose(); onOpenEmail(); }}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex flex-col items-start gap-1.5 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-slate-900 font-semibold">Transmettre par email</div>
                <div className="text-[10px] text-slate-400 font-normal">Rapport ou facture client</div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Mail, Send, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'REPORT_DIGEST' | 'CUSTOMER_INVOICE' | 'CUSTOMER_QUOTE' | 'SUBSCRIPTION_EXPIRY';
  defaultEmail?: string;
  defaultRecipient?: string;
  defaultName?: string;
  entityId?: string;
  targetReference?: string;
}

export function SendEmailModal({
  isOpen,
  onClose,
  defaultType = 'REPORT_DIGEST',
  defaultEmail = '',
  defaultRecipient = '',
  defaultName = '',
  entityId,
  targetReference,
}: SendEmailModalProps) {
  const initialEmail = defaultEmail || defaultRecipient || '';
  const initialEntityId = entityId || targetReference || '';
  const [type, setType] = useState<string>(defaultType);
  const [recipientEmail, setRecipientEmail] = useState(initialEmail);
  const [recipientName, setRecipientName] = useState(defaultName);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setRecipientEmail(initialEmail);
      setRecipientName(defaultName);
      setMessage('');
      setSuccess(null);
      setError(null);
    }
  }, [isOpen, defaultType, initialEmail, defaultName]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      setError('L’adresse email du destinataire est requise.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          recipientEmail,
          recipientName,
          message,
          entityId: initialEntityId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’envoi');
      }

      setSuccess(data.message || 'Email envoyé avec succès.');
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Envoi de Rapport & Document</h2>
              <p className="text-xs text-slate-500">Transmission par email sécurisé (Traçabilité AuditLog)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3.5 text-xs">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email-type" className="text-xs font-medium text-slate-700">
                Nature de l’envoi *
              </Label>
              <select
                id="email-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="REPORT_DIGEST">Synthèse financière & Bilan périodique (Gérance)</option>
                <option value="CUSTOMER_INVOICE">Facture commerciale dématérialisée (Client)</option>
                <option value="CUSTOMER_QUOTE">Proposition commerciale & Devis (Client)</option>
                <option value="SUBSCRIPTION_EXPIRY">Rappel d’échéance de licence (Abonné)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="rec-name" className="text-xs font-medium text-slate-700">
                  Nom du destinataire
                </Label>
                <Input
                  id="rec-name"
                  placeholder="Ex: Direction ou Client"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="h-9 text-xs rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="rec-email" className="text-xs font-medium text-slate-700">
                  Email destinataire *
                </Label>
                <Input
                  id="rec-email"
                  type="email"
                  placeholder="destinataire@domaine.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="rec-msg" className="text-xs font-medium text-slate-700">
                Message d&apos;accompagnement (optionnel)
              </Label>
              <textarea
                id="rec-msg"
                rows={3}
                placeholder="Ajoutez une note personnalisée qui apparaîtra dans le corps de l'email..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-normal text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs gap-1.5 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer l&apos;email</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

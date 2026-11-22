'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Copy, Check, Eye, EyeOff, KeyRound, AlertTriangle } from 'lucide-react';

interface RevealSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  subId: string;
  serviceName?: string;
}

export function RevealSecretModal({
  isOpen,
  onClose,
  subId,
  serviceName,
}: RevealSecretModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretData, setSecretData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchSecret = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${subId}/reveal`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du déchiffrement');
      }
      setSecretData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Déclencher le déchiffrement à l'ouverture si les données ne sont pas encore chargées
  React.useEffect(() => {
    if (isOpen && subId) {
      setSecretData(null);
      setError(null);
      setShowPassword(false);
      fetchSecret();
    }
  }, [isOpen, subId]);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <KeyRound className="w-5 h-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                Coffre Numérique AES-256
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {serviceName || 'Licence & Abonnement'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-500">
            <div className="w-7 h-7 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold">Déchiffrement AES-256-GCM en cours...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Échec du déchiffrement</div>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        ) : secretData ? (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block uppercase">
                  Identifiant / Email
                </label>
                <div className="mt-1 flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs font-bold text-slate-800">
                  <span className="truncate">{secretData.accountIdentifier}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-slate-500 hover:text-purple-700"
                    onClick={() => copyToClipboard(secretData.accountIdentifier, 'login')}
                  >
                    {copiedKey === 'login' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {secretData.credentials?.password && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block uppercase">
                    Mot de Passe
                  </label>
                  <div className="mt-1 flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs font-bold text-slate-800">
                    <span className="truncate">
                      {showPassword ? secretData.credentials.password : '••••••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-slate-500 hover:text-slate-800"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-slate-500 hover:text-purple-700"
                        onClick={() => copyToClipboard(secretData.credentials.password, 'password')}
                      >
                        {copiedKey === 'password' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {secretData.credentials?.profilePin && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block uppercase">
                    Code PIN Profil
                  </label>
                  <div className="mt-1 flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs font-bold text-purple-700">
                    <span>{secretData.credentials.profilePin}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-slate-500 hover:text-purple-700"
                      onClick={() => copyToClipboard(secretData.credentials.profilePin, 'pin')}
                    >
                      {copiedKey === 'pin' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {secretData.credentials?.backupCodes && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block uppercase">
                    Codes de secours 2FA
                  </label>
                  <div className="mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600 space-y-1">
                    {Array.isArray(secretData.credentials.backupCodes) ? (
                      secretData.credentials.backupCodes.map((code: string, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span>{code}</span>
                          <button
                            onClick={() => copyToClipboard(code, `backup-${idx}`)}
                            className="text-slate-400 hover:text-purple-600"
                          >
                            {copiedKey === `backup-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))
                    ) : (
                      <span>{JSON.stringify(secretData.credentials.backupCodes)}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-[11px] text-purple-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Tracé d'audit certifié :</span> Cet accès a été enregistré
                dans les journaux d'audit inaltérables avec votre identifiant utilisateur.
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Fermer le coffre
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

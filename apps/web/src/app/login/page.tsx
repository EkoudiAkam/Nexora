'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  Info,
  Package,
  Layers,
  Briefcase,
  Building2,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Formulaire (Champs vides par défaut pour une véritable saisie)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState<'RETAIL' | 'DIGITAL_SERVICES' | 'CONSULTING' | 'HYBRID'>('HYBRID');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modale de Configuration OAuth
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'Google' | 'Apple' | 'Facebook'>('Google');

  // Authentification Réelle avec l'API Route Handler Next.js & PostgreSQL (Argon2id)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Veuillez renseigner votre adresse email et votre mot de passe.');
      }

      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const body =
        mode === 'signup'
          ? JSON.stringify({ name, email, password, companyName, businessType })
          : JSON.stringify({ email, password });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (mode === 'signup' ? "Échec de l'inscription" : 'Identifiants incorrects'));
      }

      setSuccessMsg(
        mode === 'signup'
          ? 'Compte créé avec succès ! Redirection vers votre tableau de bord...'
          : 'Connexion réussie ! Chargement de votre espace de gestion...'
      );

      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 700);
    } catch (err) {
      setError((err as Error).message || "Échec de l'authentification.");
    } finally {
      setLoading(false);
    }
  };

  // Clic sur un bouton d'authentification sociale (Google, Apple, Facebook)
  const handleSocialClick = async (provider: 'Google' | 'Apple' | 'Facebook') => {
    setSelectedProvider(provider);
    setError(null);

    if (provider === 'Google') {
      // Vérifier si le Google Client ID est configuré pour lancer le véritable flux OAuth
      try {
        const testRes = await fetch('/api/auth/oauth/google');
        if (testRes.status === 400) {
          const data = await testRes.json();
          if (data.error === 'GOOGLE_CLIENT_ID_MISSING') {
            // Afficher la modale explicative au lieu d'une fausse redirection
            setOauthModalOpen(true);
            return;
          }
        }
        // Si configuré, rediriger directement vers accounts.google.com
        window.location.href = '/api/auth/oauth/google';
      } catch {
        setOauthModalOpen(true);
      }
    } else {
      setOauthModalOpen(true);
    }
  };

  // Pré-remplissage rapide du compte Administrateur de démonstration
  const handleFillAdmin = () => {
    setEmail('admin@nexora.com');
    setPassword('AdminPassword123!');
    setError(null);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-[#F8FAFC] text-slate-800 p-4 sm:p-6 font-sans">
      {/* Barre Supérieure Discrète */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            N
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">NEXORA</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 text-[11px] font-semibold gap-1.5 py-1 px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            PostgreSQL 18 Local
          </Badge>
        </div>
      </div>

      {/* Conteneur Central du Formulaire */}
      <div className="w-full max-w-[440px] mx-auto my-auto space-y-5">
        <div className="text-center space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            NEXORA ERP / Espace d&apos;entreprise
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Connexion à votre espace' : 'Créer votre compte ERP'}
          </h1>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Renseignez vos accès pour accéder à vos ventes, stocks et factures.'
              : 'Initialisez votre profil collaborateur sécurisé en local.'}
          </p>
        </div>

        <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
          {/* Onglets Bascule Se connecter / Créer un compte */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Créer un compte
            </button>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Boutons d'Authentification Externe OAuth */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Authentification Externe Sécurisée
              </label>

              <button
                type="button"
                onClick={() => handleSocialClick('Google')}
                className="w-full h-10 px-3 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm"
              >
                <FcGoogle className="w-5 h-5 shrink-0" />
                <span>Continuer avec Google</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSocialClick('Apple')}
                  className="h-9 px-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm"
                >
                  <FaApple className="w-4 h-4 text-slate-900" />
                  <span>Apple ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('Facebook')}
                  className="h-9 px-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm"
                >
                  <FaFacebook className="w-4 h-4 text-[#1877F2]" />
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            {/* Séparateur */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                ou par identifiants
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Alertes d'Erreur ou de Succès */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {/* Formulaire Principal (Argon2id) */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                      Nom complet *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ex: Prénom Nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="companyName" className="text-xs font-semibold text-slate-700">
                      Raison sociale de l&apos;entreprise
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Ex: Ivoire Distribution SARL"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs font-semibold text-slate-700">
                      Type d&apos;activité principal *
                    </Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setBusinessType('RETAIL')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          businessType === 'RETAIL'
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Package className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Commerce & Stocks</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Vente physique</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBusinessType('DIGITAL_SERVICES')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          businessType === 'DIGITAL_SERVICES'
                            ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Layers className="w-3.5 h-3.5 text-purple-600" />
                          <span>Abonnements & SaaS</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Licences récurrentes</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBusinessType('CONSULTING')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          businessType === 'CONSULTING'
                            ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                          <span>Prestations & Conseil</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Devis & missions</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBusinessType('HYBRID')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          businessType === 'HYBRID'
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Commerçant Hybride</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Les 3 pôles réunis</div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                  Adresse email professionnelle *
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                    Mot de passe *
                  </Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={handleFillAdmin}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Remplir Admin démo
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 pr-10 h-10 text-xs rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl gap-2 shadow-sm transition-all mt-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Vérification sécurisée...</span>
                  </div>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Se connecter à NEXORA' : 'Créer mon compte'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Aide et Identifiants de Démonstration */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wide">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            Accès d'évaluation immédiat
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span>admin@nexora.com</span>
            <span className="text-slate-400">/</span>
            <span>AdminPassword123!</span>
            <button
              onClick={handleFillAdmin}
              className="text-indigo-600 hover:underline font-bold text-[10px]"
            >
              Insérer
            </button>
          </div>
        </div>
      </div>

      {/* Pied de Page conforme au Canva */}
      <div className="text-center text-[11px] text-slate-400 py-3">
        NEXORA · Interface de gestion mono-entreprise · Données hébergées en local sous PostgreSQL 18
      </div>

      {/* Modale de Configuration OAuth Réel */}
      <Dialog open={oauthModalOpen} onOpenChange={setOauthModalOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <ExternalLink className="w-5 h-5" />
              </span>
              <div>
                <DialogTitle className="text-base font-semibold text-slate-900">
                  Connexion {selectedProvider} OAuth 2.0
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Intégration d'authentification externe sécurisée
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Clés d'API OAuth requises dans le fichier .env
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800/90">
                Pour que la fenêtre d'authentification officielle {selectedProvider} s'ouvre, vous devez renseigner vos identifiants d'application dans votre fichier <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> :
              </p>
              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/80 font-mono text-[10px] space-y-1 text-slate-800">
                <div>GOOGLE_CLIENT_ID="votre-id-client.apps.googleusercontent.com"</div>
                <div>GOOGLE_CLIENT_SECRET="votre-secret-client"</div>
              </div>
            </div>

            <div className="space-y-2 text-slate-600">
              <span className="font-bold text-slate-800 block">Étapes pour activer {selectedProvider} :</span>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Rendez-vous sur <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">Google Cloud Console</a>.</li>
                <li>Créez un ID client OAuth 2.0 (Application Web).</li>
                <li>Ajoutez l'URI de redirection autorisée : <code className="bg-slate-100 px-1 rounded font-mono text-[10px]">http://localhost:3001/api/auth/oauth/google/callback</code>.</li>
                <li>Collez les deux clés dans votre fichier <code className="bg-slate-100 px-1 rounded font-mono text-[10px]">.env</code> à la racine.</li>
              </ol>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
              <span>En attendant la clé OAuth :</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setOauthModalOpen(false);
                  handleFillAdmin();
                }}
                className="text-xs font-bold text-indigo-600"
              >
                Utiliser le compte Admin
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={() => setOauthModalOpen(false)}
              className="bg-slate-900 text-white font-bold text-xs"
            >
              Compris, fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

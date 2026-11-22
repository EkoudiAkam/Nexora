'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Truck, 
  ArrowLeftRight, 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  Settings as SettingsIcon,
  Layers,
  LogOut 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidebarProps {
  businessType?: string;
  companyName?: string;
  enableInventory?: boolean;
  enableDigitalSubs?: boolean;
  enablePurchases?: boolean;
  currentUser?: { name: string; email: string; role: string } | null;
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({
  businessType = 'HYBRID',
  companyName,
  enableInventory = true,
  enableDigitalSubs = true,
  enablePurchases = true,
  currentUser,
  onNavigate,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside className={cn(
      'w-64 flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 select-none',
      className
    )}>
      <div className="space-y-6 overflow-y-auto">
        {/* Logo NEXORA */}
        <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
            N
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-slate-900">NEXORA</span>
          </div>
        </Link>

        {/* Encart Entreprise Mono-Entreprise Dynamique */}
        {(() => {
          const companyInitials = (companyName || 'Mon Entreprise')
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase())
            .join('') || 'ME';

          return (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                {companyInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs text-slate-900 truncate">{companyName || 'Mon Entreprise'}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Espace privé ({businessType})
                </div>
              </div>
            </div>
          );
        })()}

        {/* Navigation Next.js Modulaire */}
        <nav className="space-y-4 text-xs font-medium">
          {/* Vue d'ensemble */}
          <Link 
            href="/"
            onClick={handleLinkClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive('/') 
                ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
            Vue d&apos;ensemble
          </Link>

          {/* PÔLE COMMERCE */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Commerce
            </div>
            
            <Link 
              href="/sales"
              onClick={handleLinkClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive('/sales') ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-slate-500" />
              Ventes & Factures
            </Link>
            
            <Link 
              href="/clients"
              onClick={handleLinkClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive('/clients') ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-slate-500" />
              Clients
            </Link>

            {/* Module Stock Physique */}
            {enableInventory && (
              <Link 
                href="/inventory"
                onClick={handleLinkClick}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive('/inventory') ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4 text-slate-500" />
                Produits & stocks
              </Link>
            )}

            {/* Module Abonnements & Services Numériques */}
            {enableDigitalSubs && (
              <Link 
                href="/subscriptions"
                onClick={handleLinkClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  isActive('/subscriptions') ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Abonnements & Services</span>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-[10px]">AES</Badge>
              </Link>
            )}

            {/* Module Achats */}
            {enablePurchases && (
              <Link 
                href="/purchases"
                onClick={handleLinkClick}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive('/purchases') ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Truck className="w-4 h-4 text-slate-500" />
                Achats & fournisseurs
              </Link>
            )}
          </div>

          {/* PÔLE FINANCE */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Finance
            </div>
            
            <Link 
              href="/payments"
              onClick={handleLinkClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive('/payments') ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-slate-500" />
              Paiements & dépenses
            </Link>

            <Link 
              href="/documents"
              onClick={handleLinkClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive('/documents') ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-500" />
              Devis & factures
            </Link>

            <Link 
              href="/reports"
              onClick={handleLinkClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive('/reports') ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-500" />
              Rapports financiers
            </Link>
          </div>

          {/* PÔLE ADMINISTRATION */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Administration
            </div>
            
            <Link 
              href="/users"
              onClick={handleLinkClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive('/users') ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              Utilisateurs & permissions
            </Link>

            <Link 
              href="/settings"
              onClick={handleLinkClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive('/settings') ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-slate-500" />
              Paramètres
            </Link>
          </div>
        </nav>
      </div>

      {/* Profil Connecté & Déconnexion Dynamique */}
      {currentUser && (() => {
        const userInitials = (currentUser.name || 'U')
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((n) => n[0]?.toUpperCase())
          .join('') || 'U';

        return (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2.5 truncate max-w-[170px]">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center border border-indigo-200 shrink-0">
                {userInitials}
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-800 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 capitalize">{currentUser.role?.toLowerCase()}</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Se déconnecter"
              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        );
      })()}
    </aside>
  );
}

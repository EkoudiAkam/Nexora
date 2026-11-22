'use client';

import { Search, Plus, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  currentPageTitle: string;
  onOpenQuickAction?: () => void;
  onOpenNotifications?: () => void;
  onOpenMobileMenu?: () => void;
  userInitials?: string;
}

export function Header({
  currentPageTitle,
  onOpenQuickAction,
  onOpenNotifications,
  onOpenMobileMenu,
  userInitials = 'NX',
}: HeaderProps) {
  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0 z-10">
      {/* Côté Gauche : Menu Mobile & Fil d'Ariane */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            type="button"
            className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Fil d'Ariane */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
          <span className="hidden sm:inline">Espace de travail</span>
          <span className="hidden sm:inline">&rsaquo;</span>
          <span className="font-bold text-slate-800 capitalize truncate max-w-[120px] sm:max-w-none">
            {currentPageTitle}
          </span>
        </div>
      </div>

      {/* Côté Droit : Recherche Globale, Actions & Profil */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Recherche masquée sur mobile pour ne pas encombrer l'écran */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Rechercher partout..." 
            className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-44 lg:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Bouton Action Rapide */}
        {onOpenQuickAction && (
          <Button 
            onClick={onOpenQuickAction}
            size="sm"
            className="gap-1 text-xs font-semibold px-2.5 sm:px-3.5 shadow-sm h-8"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Action rapide</span>
            <span className="sm:hidden text-[11px]">Créer</span>
          </Button>
        )}

        {/* Centre de Notifications */}
        {onOpenNotifications && (
          <button 
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Centre de notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>
        )}

        {/* Avatar Utilisateur */}
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 shrink-0">
          {userInitials}
        </div>
      </div>
    </header>
  );
}

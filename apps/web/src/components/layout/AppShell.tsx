'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { CreateSaleDrawer } from '../drawers/CreateSaleDrawer';
import { CreateQuoteDrawer } from '../drawers/CreateQuoteDrawer';
import { CreatePaymentDrawer } from '../drawers/CreatePaymentDrawer';
import { CreateExpenseDrawer } from '../drawers/CreateExpenseDrawer';
import { CreateCustomerDrawer } from '../drawers/CreateCustomerDrawer';
import { CreateProductDrawer } from '../drawers/CreateProductDrawer';
import { NotificationsDrawer } from '../drawers/NotificationsDrawer';
import { QuickActionModal } from '../modals/QuickActionModal';
import { SendEmailModal } from '../modals/SendEmailModal';

interface AppShellProps {
  children: React.ReactNode;
  initialUser: any;
}

export function AppShell({ children, initialUser }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(initialUser);

  // Drawer & Sheet states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaleDrawerOpen, setIsSaleDrawerOpen] = useState(false);
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // If on /login page, don't show shell
  const isLoginPage = pathname === '/login';

  const reloadData = () => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch(() => {});

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(
            data.map((p: any) => ({
              sku: p.sku,
              name: p.name,
              price: Number(p.sellingPrice),
            }))
          );
        }
      })
      .catch(() => {});

    fetch('/api/company/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isLoginPage) return;
    reloadData();
  }, [isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return "Vue d'ensemble";
      case '/sales':
        return 'Ventes & Factures';
      case '/clients':
        return 'Clients';
      case '/inventory':
        return 'Produits & stocks';
      case '/subscriptions':
        return 'Abonnements & Services';
      case '/purchases':
        return 'Achats & Fournisseurs';
      case '/payments':
        return 'Paiements & Dépenses';
      case '/documents':
        return 'Devis & Factures';
      case '/reports':
        return 'Rapports & Statistiques';
      case '/users':
        return 'Utilisateurs & Permissions';
      case '/settings':
        return 'Paramètres';
      default:
        return 'Espace de gestion';
    }
  };

  const userInitials = currentUser?.name
    ? currentUser.name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((n: string) => n[0]?.toUpperCase())
        .join('') || 'NX'
    : 'NX';

  const handleSuccess = () => {
    reloadData();
    router.refresh();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* 1. Sidebar Ordinateur (Visible sur lg: et plus) */}
      <Sidebar
        className="hidden lg:flex"
        businessType={settings?.businessType || 'HYBRID'}
        companyName={settings?.businessName}
        enableInventory={settings?.enableInventory ?? true}
        enableDigitalSubs={settings?.enableDigitalSubs ?? true}
        enablePurchases={settings?.enablePurchases ?? true}
        currentUser={currentUser}
      />

      {/* 2. Sidebar Mobile (Tiroir Sheet standard shadcn/ui sur smartphone & tablette) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 max-w-[85vw] bg-white border-r border-slate-200">
          <Sidebar
            className="w-full h-full border-r-0"
            businessType={settings?.businessType || 'HYBRID'}
            companyName={settings?.businessName}
            enableInventory={settings?.enableInventory ?? true}
            enableDigitalSubs={settings?.enableDigitalSubs ?? true}
            enablePurchases={settings?.enablePurchases ?? true}
            currentUser={currentUser}
            onNavigate={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* 3. Zone Principale */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Unifié avec Hamburger Mobile */}
        <Header
          currentPageTitle={getPageTitle(pathname)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
          userInitials={userInitials}
        />

        {/* Contenu Page (Padding responsive : p-3 sur mobile, p-5 sur tablette, p-8 sur desktop) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6">
          {children}
        </main>
      </div>

      {/* 4. Tiroirs & Modales */}
      <CreateSaleDrawer
        isOpen={isSaleDrawerOpen}
        onClose={() => setIsSaleDrawerOpen(false)}
        onSuccess={() => {
          setIsSaleDrawerOpen(false);
          handleSuccess();
        }}
        customers={customers}
        products={products}
        businessType={settings?.businessType || 'HYBRID'}
      />

      <CreateQuoteDrawer
        isOpen={isQuoteDrawerOpen}
        onClose={() => setIsQuoteDrawerOpen(false)}
        onSuccess={() => {
          setIsQuoteDrawerOpen(false);
          handleSuccess();
        }}
        customers={customers}
      />

      <CreatePaymentDrawer
        isOpen={isPaymentDrawerOpen}
        onClose={() => setIsPaymentDrawerOpen(false)}
        onSuccess={() => {
          setIsPaymentDrawerOpen(false);
          handleSuccess();
        }}
      />

      <CreateExpenseDrawer
        isOpen={isExpenseDrawerOpen}
        onClose={() => setIsExpenseDrawerOpen(false)}
        onSuccess={() => {
          setIsExpenseDrawerOpen(false);
          handleSuccess();
        }}
      />

      <CreateCustomerDrawer
        isOpen={isCustomerDrawerOpen}
        onClose={() => setIsCustomerDrawerOpen(false)}
        onSuccess={() => {
          setIsCustomerDrawerOpen(false);
          handleSuccess();
        }}
      />

      <CreateProductDrawer
        isOpen={isProductDrawerOpen}
        onClose={() => setIsProductDrawerOpen(false)}
        onSuccess={() => {
          setIsProductDrawerOpen(false);
          handleSuccess();
        }}
      />

      <NotificationsDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />

      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onOpenSale={() => setIsSaleDrawerOpen(true)}
        onOpenQuote={() => setIsQuoteDrawerOpen(true)}
        onOpenPayment={() => setIsPaymentDrawerOpen(true)}
        onOpenExpense={() => setIsExpenseDrawerOpen(true)}
        onOpenCustomer={() => setIsCustomerDrawerOpen(true)}
        onOpenProduct={() => setIsProductDrawerOpen(true)}
        onOpenEmail={() => setIsEmailModalOpen(true)}
      />

      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        defaultType="REPORT_DIGEST"
      />
    </div>
  );
}

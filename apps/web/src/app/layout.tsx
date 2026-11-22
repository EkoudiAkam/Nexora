import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { getCurrentUser } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';
import { cn } from '@/lib/utils';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NEXORA — Gestion Commerciale & Financière',
  description: 'Logiciel de gestion commerciale, financière et opérationnelle mono-entreprise pour l’Afrique (FCFA).',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="fr" className={plusJakartaSans.variable}>
      <body className={cn('min-h-screen bg-slate-50 font-sans antialiased text-slate-800')}>
        <AppShell initialUser={user}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

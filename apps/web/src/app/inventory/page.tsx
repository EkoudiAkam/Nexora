import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { InventoryClient } from './inventory-client';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [products, company] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.companySettings.findFirst(),
  ]);

  return <InventoryClient initialProducts={products as any} company={company} />;
}

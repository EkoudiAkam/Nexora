import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ClientsClient } from './clients-client';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const customers = await prisma.customer.findMany({
    include: {
      sales: true,
      subscriptions: true,
    },
    orderBy: { name: 'asc' },
  });

  return <ClientsClient initialCustomers={customers as any} />;
}

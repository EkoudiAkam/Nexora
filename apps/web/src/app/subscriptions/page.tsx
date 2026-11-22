import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SubscriptionsClient } from './subscriptions-client';

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [assignments, company] = await Promise.all([
    prisma.subscriptionAssignment.findMany({
      include: {
        customer: true,
        account: {
          include: { service: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.companySettings.findFirst(),
  ]);

  const serializedAssignments = assignments.map((a) => ({
    id: a.id,
    startDate: a.startDate.toISOString(),
    endDate: a.endDate.toISOString(),
    sellingPrice: Number(a.sellingPrice),
    status: a.status,
    customer: a.customer ? { name: a.customer.name, email: a.customer.email } : undefined,
    account: a.account
      ? {
          id: a.account.id,
          accountIdentifier: a.account.accountIdentifier,
          profileName: a.account.profileName,
          service: a.account.service
            ? {
                name: a.account.service.name,
                category: a.account.service.category,
              }
            : undefined,
        }
      : undefined,
  }));

  return (
    <SubscriptionsClient
      initialAssignments={serializedAssignments}
      businessType={company?.businessType}
      businessName={company?.businessName}
    />
  );
}

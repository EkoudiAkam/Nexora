import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { DocumentsClient } from './documents-client';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [sales, quotes, customers] = await Promise.all([
    prisma.sale.findMany({
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quote.findMany({
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const docs = [
    ...sales.map((s) => ({
      id: s.id,
      ref: s.invoiceNumber || s.reference,
      type: 'FACTURE',
      client: s.customer.name,
      date: s.createdAt,
      amount: Number(s.totalTTC),
      status: s.status,
    })),
    ...quotes.map((q) => ({
      id: q.id,
      ref: q.reference,
      type: 'DEVIS',
      client: q.customer.name,
      date: q.createdAt,
      amount: Number(q.totalTTC),
      status: q.status,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <DocumentsClient initialDocs={docs} customers={customers} />;
}

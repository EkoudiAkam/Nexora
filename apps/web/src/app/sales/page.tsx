import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SalesClient } from './sales-client';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [sales, customers, products, company] = await Promise.all([
    prisma.sale.findMany({
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      select: { sku: true, name: true, sellingPrice: true },
      orderBy: { name: 'asc' },
    }),
    prisma.companySettings.findFirst(),
  ]);

  const formattedProducts = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    price: Number(p.sellingPrice),
  }));

  return (
    <SalesClient 
      initialSales={sales as any} 
      customers={customers} 
      products={formattedProducts} 
      businessType={company?.businessType || 'HYBRID'}
    />
  );
}

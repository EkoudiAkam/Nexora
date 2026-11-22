import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { sku, name, description, category, purchasePrice, sellingPrice, stockQuantity, alertThreshold, unit } = await req.json();
    if (!name || !sku) return NextResponse.json({ error: 'Nom et SKU requis' }, { status: 400 });
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        category: category || 'Général',
        purchasePrice: purchasePrice || 0,
        sellingPrice: sellingPrice || 0,
        stockQuantity: stockQuantity || 0,
        alertThreshold: alertThreshold || 5,
        unit: unit || 'unité',
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.companySettings.findFirst();
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          businessName: 'Entreprise Demo',
          currency: 'FCFA',
          businessType: 'HYBRID',
          enableInventory: true,
          enableDigitalSubs: true,
          enablePurchases: true,
          enableQuotes: true,
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = await prisma.companySettings.findFirst();
    const updated = settings
      ? await prisma.companySettings.update({
          where: { id: settings.id },
          data: body,
        })
      : await prisma.companySettings.create({
          data: {
            businessName: 'Entreprise Demo',
            currency: 'FCFA',
            businessType: 'HYBRID',
            enableInventory: true,
            enableDigitalSubs: true,
            enablePurchases: true,
            enableQuotes: true,
            ...body,
          },
        });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

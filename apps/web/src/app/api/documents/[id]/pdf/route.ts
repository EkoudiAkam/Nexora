import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/pdf-generator';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 1. Chercher dans les ventes / factures
    const sale = await prisma.sale.findFirst({
      where: {
        OR: [
          { id },
          { reference: id },
          { invoiceNumber: id },
        ],
      },
      include: {
        customer: true,
        items: true,
      },
    });

    const company = await prisma.companySettings.findFirst();
    const companyInfo = {
      businessName: company?.businessName || 'NEXORA Entreprise',
      legalName: company?.legalName || company?.businessName || 'NEXORA Entreprise',
      phone: company?.phone || '',
      email: company?.email || '',
      address: company?.address || '',
      taxId: company?.taxId || '',
      currency: company?.currency || 'FCFA',
    };

    if (sale) {
      const pdfBuffer = await generateInvoicePDF({
        reference: sale.reference,
        invoiceNumber: sale.invoiceNumber || sale.reference,
        createdAt: sale.createdAt,
        dueDate: sale.dueDate,
        status: sale.status,
        subtotalHT: Number(sale.subtotalHT),
        taxAmount: Number(sale.taxAmount),
        totalTTC: Number(sale.totalTTC),
        paidAmount: Number(sale.paidAmount),
        remainingBalance: Number(sale.remainingBalance),
        notes: sale.notes,
        customer: sale.customer,
        items: sale.items.map(it => ({
          productName: it.productName,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          totalHT: Number(it.totalHT),
          totalTTC: Number(it.totalTTC),
        })),
      }, companyInfo);

      const fileName = `${sale.invoiceNumber || sale.reference}.pdf`;

      return new NextResponse(pdfBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${fileName}"`,
          'Cache-Control': 'no-cache',
        },
      });
    }

    // 2. Chercher dans les devis si non trouvé dans les ventes
    const quote = await prisma.quote.findFirst({
      where: {
        OR: [
          { id },
          { reference: id },
        ],
      },
      include: {
        customer: true,
        items: true,
      },
    });

    if (quote) {
      const totalTTC = Number(quote.totalTTC);
      const subtotalHT = Math.round(totalTTC / 1.18);
      const taxAmount = totalTTC - subtotalHT;

      const pdfBuffer = await generateInvoicePDF({
        reference: quote.reference,
        invoiceNumber: quote.reference,
        createdAt: quote.createdAt,
        dueDate: quote.validUntil,
        status: quote.status,
        subtotalHT,
        taxAmount,
        totalTTC,
        paidAmount: 0,
        remainingBalance: totalTTC,
        notes: quote.notes,
        customer: quote.customer,
        items: quote.items.map(it => ({
          productName: it.productName,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          totalHT: Number(it.total),
          totalTTC: Number(it.total),
        })),
      }, companyInfo);

      return new NextResponse(pdfBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${quote.reference}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

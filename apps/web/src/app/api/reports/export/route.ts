import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';
// @ts-ignore
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { formatFCFA } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'excel';

    const [sales, payments, expenses, products, company] = await Promise.all([
      prisma.sale.findMany({
        include: { customer: true, items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.findMany({
        include: { sale: { include: { customer: true } } },
        orderBy: { paidAt: 'desc' },
      }),
      prisma.expense.findMany({
        include: { supplier: true },
        orderBy: { expenseDate: 'desc' },
      }),
      prisma.product.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.companySettings.findFirst(),
    ]);

    const totalRevenue = sales.reduce((acc, s) => acc + Number(s.totalTTC), 0);
    const totalReceipts = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const totalDebts = sales.reduce((acc, s) => acc + Number(s.remainingBalance), 0);
    const netCashflow = totalReceipts - totalExpenses;

    // --- 1. EXPORT FORMAT EXCEL (XLSX) ---
    if (format === 'excel' || format === 'xlsx') {
      const wb = XLSX.utils.book_new();

      // Feuille 1 : Synthèse Financière
      const summaryData = [
        ['RAPPORT FINANCIER & CONSOLIDATION GLOBALE - NEXORA ERP'],
        ['Entreprise :', company?.businessName || 'Mon Entreprise'],
        ['Date de génération :', new Date().toLocaleDateString('fr-FR')],
        ['Devise :', 'FCFA'],
        [],
        ['Indicateur Clé', 'Montant (FCFA)', 'Statut / Détail'],
        ['Chiffre d’Affaires Facturé (TTC)', totalRevenue, `${sales.length} ventes émises`],
        ['Total Encaissements Réels', totalReceipts, `${payments.length} règlements reçus`],
        ['Total Dépenses & Charges', totalExpenses, `${expenses.length} charges enregistrées`],
        ['Solde Net de Trésorerie', netCashflow, netCashflow >= 0 ? 'Excédentaire' : 'Déficitaire'],
        ['Créances Clients à Recouvrer', totalDebts, 'Factures en attente de règlement'],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Synthese_Financiere');

      // Feuille 2 : Journal des Ventes
      const salesData = [
        ['Référence', 'Facture', 'Client', 'Date', 'Total HT', 'TVA (18%)', 'Total TTC', 'Payé', 'Solde Dû', 'Statut'],
        ...sales.map((s) => [
          s.reference,
          s.invoiceNumber || '—',
          s.customer?.name || 'Client Direct',
          new Date(s.createdAt).toLocaleDateString('fr-FR'),
          Number(s.subtotalHT),
          Number(s.taxAmount),
          Number(s.totalTTC),
          Number(s.paidAmount),
          Number(s.remainingBalance),
          s.status,
        ]),
      ];
      const wsSales = XLSX.utils.aoa_to_sheet(salesData);
      XLSX.utils.book_append_sheet(wb, wsSales, 'Journal_Ventes');

      // Feuille 3 : Encaissements
      const paymentsData = [
        ['Réf Encaissement', 'Facture', 'Client', 'Date', 'Moyen Paiement', 'Montant (FCFA)'],
        ...payments.map((p) => [
          p.reference,
          p.sale?.invoiceNumber || p.sale?.reference || 'Libre',
          p.sale?.customer?.name || 'Client Direct',
          new Date(p.paidAt).toLocaleDateString('fr-FR'),
          p.method,
          Number(p.amount),
        ]),
      ];
      const wsPayments = XLSX.utils.aoa_to_sheet(paymentsData);
      XLSX.utils.book_append_sheet(wb, wsPayments, 'Encaissements');

      // Feuille 4 : Dépenses
      const expensesData = [
        ['Réf Dépense', 'Catégorie', 'Description', 'Fournisseur', 'Date', 'Moyen', 'Montant (FCFA)'],
        ...expenses.map((e) => [
          e.reference,
          e.category,
          e.description,
          e.supplier?.name || 'Interne',
          new Date(e.expenseDate).toLocaleDateString('fr-FR'),
          e.method,
          Number(e.amount),
        ]),
      ];
      const wsExpenses = XLSX.utils.aoa_to_sheet(expensesData);
      XLSX.utils.book_append_sheet(wb, wsExpenses, 'Depenses');

      // Feuille 5 : Stocks & Articles
      if (products.length > 0) {
        const productsData = [
          ['SKU', 'Désignation', 'Catégorie', 'Prix Achat (FCFA)', 'Prix Vente (FCFA)', 'Stock', 'Seuil Alerte', 'Valeur Stock'],
          ...products.map((p) => [
            p.sku,
            p.name,
            p.category,
            Number(p.purchasePrice),
            Number(p.sellingPrice),
            Number(p.stockQuantity),
            Number(p.alertThreshold),
            Number(p.stockQuantity) * Number(p.sellingPrice),
          ]),
        ];
        const wsProducts = XLSX.utils.aoa_to_sheet(productsData);
        XLSX.utils.book_append_sheet(wb, wsProducts, 'Stocks_Catalogue');
      }

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Rapport_Financier_${company?.businessName ? company.businessName.replace(/\s+/g, '_') : 'NEXORA'}_${new Date().toISOString().slice(0, 10)}.xlsx"`,
        },
      });
    }

    // --- 2. EXPORT FORMAT PDF SYNTHÈSE OHADA ---
    if (format === 'pdf') {
      const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err: Error) => reject(err));

        // En-tête Bilan
        doc.fontSize(16).text(company?.businessName?.toUpperCase() || 'NEXORA ENTREPRISE', { align: 'left' });
        doc.fontSize(9).fillColor('#64748B').text(`BILAN FINANCIER & CONSOLIDATION COMPTABLE OHADA`, { align: 'left' });
        doc.text(`Période générée le : ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'left' });
        doc.moveDown(1.5);

        // Ligne de séparation
        doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(1.5);

        // Tableau des agrégats
        doc.fontSize(12).fillColor('#0F172A').text('1. Tableau Synthétique des Flux de Trésorerie');
        doc.moveDown(0.8);

        const rows = [
          ['Chiffre d’Affaires Facturé (TTC)', formatFCFA(totalRevenue)],
          ['Encaissements Réels Reçus', formatFCFA(totalReceipts)],
          ['Dépenses & Frais Généraux', formatFCFA(totalExpenses)],
          ['Solde Net de Trésorerie', formatFCFA(netCashflow)],
          ['Créances Débitrices à Recouvrer', formatFCFA(totalDebts)],
        ];

        doc.fontSize(10);
        rows.forEach(([label, value]) => {
          doc.fillColor('#475569').text(label, 45, doc.y, { width: 300, continued: true });
          doc.fillColor('#0F172A').text(value, { align: 'right' });
          doc.moveDown(0.5);
        });

        doc.moveDown(2);
        doc.fontSize(12).fillColor('#0F172A').text('2. Certificat de Conformité Système');
        doc.fontSize(9).fillColor('#64748B').text(
          'Document consolidé extrait du grand livre informatique et conforme aux normes du Système Comptable OHADA (SYSCOHADA). Ce relevé fait foi des écritures réelles arrêtées à la date de signature.',
          { align: 'justify', lineGap: 3 }
        );

        doc.moveDown(3);
        doc.fontSize(9).fillColor('#0F172A').text('La Direction Financière / Le Gérant', 350, doc.y, { align: 'center' });
        doc.fontSize(8).fillColor('#94A3B8').text('[Signature & Cachet Électronique]', 350, doc.y + 12, { align: 'center' });

        doc.end();
      });

      return new NextResponse(pdfBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Rapport_Financier_OHADA_${new Date().toISOString().slice(0, 10)}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Format non supporté (utilisez ?format=excel ou ?format=pdf)' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

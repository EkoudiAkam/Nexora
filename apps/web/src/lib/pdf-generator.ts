// @ts-ignore
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';

export interface InvoiceData {
  reference: string;
  invoiceNumber: string;
  createdAt: Date | string;
  dueDate?: Date | string | null;
  status: string;
  subtotalHT: number;
  taxAmount: number;
  totalTTC: number;
  paidAmount: number;
  remainingBalance: number;
  notes?: string | null;
  customer: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    taxId?: string | null;
  };
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalHT: number;
    totalTTC: number;
  }>;
}

export interface CompanyInfo {
  businessName: string;
  legalName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxId?: string | null;
  currency: string;
}

export function generateInvoicePDF(invoice: InvoiceData, company: CompanyInfo): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      const formatMoney = (val: number) => {
        const num = Math.round(Number(val) || 0);
        const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return `${formatted} ${company.currency || 'FCFA'}`;
      };

      // 1. EN-TÊTE DE LA FACTURE
      // Bande décorative supérieure
      doc.rect(40, 40, 515, 6).fill('#4F46E5');

      // Bloc Entreprise (Gauche)
      doc.fillColor('#1E1B4B').fontSize(20).font('Helvetica-Bold').text(company.businessName || 'NEXORA', 40, 60);
      doc.fillColor('#64748B').fontSize(9).font('Helvetica');
      if (company.legalName) doc.text(company.legalName, 40, 85);
      if (company.address) doc.text(company.address, 40, 98);
      if (company.phone) doc.text(`Tél : ${company.phone}`, 40, 111);
      if (company.email) doc.text(`Email : ${company.email}`, 40, 124);
      if (company.taxId) doc.text(`NIF / RCCM : ${company.taxId}`, 40, 137);

      // Bloc Document (Droite)
      doc.fillColor('#4F46E5').fontSize(16).font('Helvetica-Bold').text('FACTURE COMMERCIALE', 330, 60, { align: 'right' });
      doc.fillColor('#1E293B').fontSize(12).font('Helvetica-Bold').text(invoice.invoiceNumber || invoice.reference, 330, 82, { align: 'right' });
      
      doc.fillColor('#64748B').fontSize(9).font('Helvetica');
      const emitDate = new Date(invoice.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Date d'émission : ${emitDate}`, 330, 100, { align: 'right' });
      
      if (invoice.dueDate) {
        const dueDateStr = new Date(invoice.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.text(`Échéance : ${dueDateStr}`, 330, 114, { align: 'right' });
      }

      const statusLabel = invoice.status === 'PAYEE' ? 'PAYÉE' : invoice.status === 'PARTIELLEMENT_PAYEE' ? 'PARTIELLEMENT PAYÉE' : 'EN ATTENTE DE RÈGLEMENT';
      doc.fillColor(invoice.status === 'PAYEE' ? '#059669' : '#D97706').font('Helvetica-Bold').text(`Statut : ${statusLabel}`, 330, 128, { align: 'right' });

      // Ligne de séparation
      doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, 160).lineTo(555, 160).stroke();

      // 2. ENCADRÉ CLIENT (FACTURÉ À)
      doc.rect(40, 175, 515, 65).fill('#F8FAFC');
      doc.rect(40, 175, 515, 65).strokeColor('#E2E8F0').lineWidth(1).stroke();

      doc.fillColor('#4F46E5').fontSize(9).font('Helvetica-Bold').text('FACTURÉ À :', 55, 185);
      doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold').text(invoice.customer.name, 55, 200);
      doc.fillColor('#475569').fontSize(9).font('Helvetica');
      const contactInfo = [invoice.customer.address, invoice.customer.phone, invoice.customer.email].filter(Boolean).join('  ·  ');
      doc.text(contactInfo || 'Client régulier', 55, 218);

      // 3. TABLEAU DES LIGNES DE FACTURATION
      const tableTop = 260;
      doc.rect(40, tableTop, 515, 24).fill('#4F46E5');
      
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
      doc.text('DÉSIGNATION DU PRODUIT OU SERVICE', 50, tableTop + 7);
      doc.text('QTÉ', 320, tableTop + 7, { width: 40, align: 'center' });
      doc.text('PRIX U. HT', 370, tableTop + 7, { width: 80, align: 'right' });
      doc.text('TOTAL HT', 460, tableTop + 7, { width: 85, align: 'right' });

      let currentY = tableTop + 24;
      const itemsList = invoice.items && invoice.items.length > 0 
        ? invoice.items 
        : [{ productName: 'Prestation commerciale', quantity: 1, unitPrice: invoice.subtotalHT, totalHT: invoice.subtotalHT, totalTTC: invoice.totalTTC }];

      itemsList.forEach((item, index) => {
        const bg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        doc.rect(40, currentY, 515, 24).fill(bg);
        doc.rect(40, currentY, 515, 24).strokeColor('#F1F5F9').lineWidth(0.5).stroke();

        doc.fillColor('#1E293B').fontSize(9).font('Helvetica');
        doc.text(item.productName, 50, currentY + 7, { width: 260, lineBreak: false });
        doc.text(String(item.quantity), 320, currentY + 7, { width: 40, align: 'center' });
        doc.text(formatMoney(Number(item.unitPrice)), 370, currentY + 7, { width: 80, align: 'right' });
        doc.font('Helvetica-Bold').text(formatMoney(Number(item.totalHT || (item.quantity * item.unitPrice))), 460, currentY + 7, { width: 85, align: 'right' });

        currentY += 24;
      });

      // 4. RÉCAPITULATIF FINANCIER (TOTAL HT, TVA 18%, TTC, SOLDE RESTANT)
      const summaryY = currentY + 20;
      const summaryX = 320;
      const summaryWidth = 235;

      doc.rect(summaryX, summaryY, summaryWidth, 110).fill('#F8FAFC');
      doc.rect(summaryX, summaryY, summaryWidth, 110).strokeColor('#E2E8F0').lineWidth(1).stroke();

      // Sous-total HT
      doc.fillColor('#64748B').fontSize(9).font('Helvetica').text('Sous-total HT :', summaryX + 15, summaryY + 12);
      doc.fillColor('#1E293B').font('Helvetica-Bold').text(formatMoney(Number(invoice.subtotalHT)), summaryX + 100, summaryY + 12, { width: 120, align: 'right' });

      // TVA 18%
      doc.fillColor('#64748B').font('Helvetica').text('TVA (18%) :', summaryX + 15, summaryY + 30);
      doc.fillColor('#1E293B').font('Helvetica-Bold').text(formatMoney(Number(invoice.taxAmount)), summaryX + 100, summaryY + 30, { width: 120, align: 'right' });

      // Ligne séparatrice
      doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(summaryX + 15, summaryY + 48).lineTo(summaryX + 220, summaryY + 48).stroke();

      // Total TTC
      doc.fillColor('#1E1B4B').fontSize(11).font('Helvetica-Bold').text('Total TTC :', summaryX + 15, summaryY + 56);
      doc.fillColor('#4F46E5').text(formatMoney(Number(invoice.totalTTC)), summaryX + 100, summaryY + 56, { width: 120, align: 'right' });

      // Montant Payé
      doc.fillColor('#059669').fontSize(9).font('Helvetica').text('Montant déjà réglé :', summaryX + 15, summaryY + 76);
      doc.text(formatMoney(Number(invoice.paidAmount)), summaryX + 100, summaryY + 76, { width: 120, align: 'right' });

      // Solde Restant Dû
      const balanceColor = Number(invoice.remainingBalance) > 0 ? '#E11D48' : '#059669';
      doc.fillColor(balanceColor).fontSize(10).font('Helvetica-Bold').text('Solde restant dû :', summaryX + 15, summaryY + 92);
      doc.text(formatMoney(Number(invoice.remainingBalance)), summaryX + 100, summaryY + 92, { width: 120, align: 'right' });

      // Conditions & Coordonnées bancaires / Mobile Money (Gauche)
      doc.rect(40, summaryY, 260, 110).fill('#F8FAFC');
      doc.rect(40, summaryY, 260, 110).strokeColor('#E2E8F0').lineWidth(1).stroke();
      doc.fillColor('#4F46E5').fontSize(9).font('Helvetica-Bold').text('CONDITIONS & MOYENS DE RÈGLEMENT', 50, summaryY + 12);
      doc.fillColor('#475569').fontSize(8.5).font('Helvetica');
      doc.text('• Modes acceptés : Virement bancaire, Chèque, Mobile Money.', 50, summaryY + 30);
      doc.text('• Pour tout règlement par Mobile Money, veuillez indiquer le numéro de facture en référence de transaction.', 50, summaryY + 46, { width: 240 });
      if (invoice.notes) {
        doc.text(`• Note : ${invoice.notes}`, 50, summaryY + 74, { width: 240 });
      }

      // 5. PIED DE PAGE LÉGAL (OHADA)
      const footerY = 750;
      doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, footerY).lineTo(555, footerY).stroke();
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(
        'Document officiel généré par NEXORA · Logiciel de gestion commerciale conforme aux normes comptables OHADA.',
        40,
        footerY + 10,
        { align: 'center', width: 515 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

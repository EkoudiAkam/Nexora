import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatFCFA } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { 
      type, 
      recipientEmail, 
      recipientName, 
      subject, 
      message, 
      entityId 
    } = await req.json();

    if (!recipientEmail || !type) {
      return NextResponse.json(
        { error: 'Email du destinataire et type d’envoi requis.' }, 
        { status: 400 }
      );
    }

    const company = await prisma.companySettings.findFirst();
    const companyName = company?.businessName || 'NEXORA Entreprise';

    // Construction du modèle d'email selon l'activité métier
    let emailSubject = subject;
    let htmlContent = '';
    let category = 'NOTIFICATION';

    switch (type) {
      case 'REPORT_DIGEST': {
        category = 'FINANCE';
        emailSubject = emailSubject || `[NEXORA] Synthèse d’Activité & Bilan de Trésorerie — ${companyName}`;
        
        // Calcul des métriques récentes
        const [sales, payments, expenses] = await Promise.all([
          prisma.sale.findMany(),
          prisma.payment.findMany(),
          prisma.expense.findMany(),
        ]);
        const totalRevenue = sales.reduce((acc, s) => acc + Number(s.totalTTC), 0);
        const totalReceipts = payments.reduce((acc, p) => acc + Number(p.amount), 0);
        const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
        const netCashflow = totalReceipts - totalExpenses;

        htmlContent = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #4f46e5; padding: 24px; color: white;">
              <h2 style="margin: 0; font-size: 20px;">Synthèse Périodique de Gestion</h2>
              <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">${companyName} — Consolidation ERP en FCFA</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 14px; margin-top: 0;">Bonjour <strong>${recipientName || 'Direction'}</strong>,</p>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">Voici le point financier arrêté à ce jour :</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">Chiffre d’Affaires Facturé</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${formatFCFA(totalRevenue)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">Encaissements Réels Reçus</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #16a34a; text-align: right;">${formatFCFA(totalReceipts)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">Dépenses & Charges Payées</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #dc2626; text-align: right;">${formatFCFA(totalExpenses)}</td>
                </tr>
                <tr style="border-top: 2px solid #e2e8f0;">
                  <td style="padding: 12px 0; font-weight: bold;">Solde Net Disponible</td>
                  <td style="padding: 12px 0; font-weight: bold; font-size: 15px; color: #4f46e5; text-align: right;">${formatFCFA(netCashflow)}</td>
                </tr>
              </table>

              ${message ? `<div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px; color: #475569; margin: 16px 0;"><strong>Note interne :</strong> ${message}</div>` : ''}

              <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                Ce relevé automatique est extrait du grand livre informatique de votre instance NEXORA.
              </p>
            </div>
          </div>
        `;
        break;
      }

      case 'CUSTOMER_INVOICE': {
        category = 'COMMERCE';
        const sale = entityId ? await prisma.sale.findUnique({ where: { id: entityId }, include: { customer: true } }) : null;
        const invoiceRef = sale?.invoiceNumber || sale?.reference || 'Facture';
        emailSubject = emailSubject || `Votre facture commerciale ${invoiceRef} — ${companyName}`;

        htmlContent = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #4f46e5; padding: 24px; color: white;">
              <h2 style="margin: 0; font-size: 20px;">Facture Commerciale Dématérialisée</h2>
              <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Réf : ${invoiceRef}</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 14px; margin-top: 0;">Cher(ère) <strong>${recipientName || sale?.customer?.name || 'Client'}</strong>,</p>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                Nous vous remercions pour votre confiance. Vous trouverez ci-joint les détails de votre facture émise par <strong>${companyName}</strong>.
              </p>

              ${sale ? `
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #64748b;">Montant Total TTC :</span>
                  <strong style="color: #0f172a;">${formatFCFA(Number(sale.totalTTC))}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #64748b;">Montant Réglé :</span>
                  <span style="color: #16a34a; font-weight: bold;">${formatFCFA(Number(sale.paidAmount))}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 8px;">
                  <span style="color: #64748b;">Solde Restant Dû :</span>
                  <strong style="color: ${Number(sale.remainingBalance) > 0 ? '#dc2626' : '#16a34a'};">${formatFCFA(Number(sale.remainingBalance))}</strong>
                </div>
              </div>` : ''}

              ${message ? `<p style="font-size: 13px; color: #334155;">${message}</p>` : ''}

              <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                Facture conforme aux normes du Système Comptable OHADA (SYSCOHADA). Pour toute question, contactez notre service client.
              </p>
            </div>
          </div>
        `;
        break;
      }

      case 'CUSTOMER_QUOTE': {
        category = 'CONSULTING';
        const quote = entityId ? await prisma.quote.findUnique({ where: { id: entityId }, include: { customer: true } }) : null;
        const quoteRef = quote?.reference || 'Devis';
        emailSubject = emailSubject || `Proposition Commerciale & Devis ${quoteRef} — ${companyName}`;

        htmlContent = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #2563eb; padding: 24px; color: white;">
              <h2 style="margin: 0; font-size: 20px;">Proposition Commerciale & Devis</h2>
              <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Réf : ${quoteRef}</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 14px; margin-top: 0;">Cher(ère) <strong>${recipientName || quote?.customer?.name || 'Partenaire'}</strong>,</p>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                Suite à nos échanges, nous avons le plaisir de vous transmettre notre proposition d’intervention et devis d'honoraires.
              </p>

              ${quote ? `
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px;">
                <div style="margin-bottom: 8px;">
                  <span style="color: #64748b;">Montant Total Estimé (TTC) :</span>
                  <strong style="color: #2563eb; font-size: 16px; margin-left: 8px;">${formatFCFA(Number(quote.totalTTC))}</strong>
                </div>
                <div style="font-size: 12px; color: #64748b;">
                  Validité de l'offre : 30 jours à compter de la date d’émission.
                </div>
              </div>` : ''}

              ${message ? `<p style="font-size: 13px; color: #334155;">${message}</p>` : ''}

              <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                Ce devis est convertible en commande ferme dès validation conjointe.
              </p>
            </div>
          </div>
        `;
        break;
      }

      case 'SUBSCRIPTION_EXPIRY': {
        category = 'DIGITAL_SERVICES';
        emailSubject = emailSubject || `[Rappel d'échéance] Renouvellement de votre licence — ${companyName}`;

        htmlContent = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #7c3aed; padding: 24px; color: white;">
              <h2 style="margin: 0; font-size: 20px;">Notification de Licence & Service</h2>
              <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Abonnement récurrent</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 14px; margin-top: 0;">Bonjour <strong>${recipientName || 'Abonné'}</strong>,</p>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                Votre licence de service souscrite auprès de <strong>${companyName}</strong> arrive prochainement à son terme.
              </p>

              <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px; color: #581c87;">
                <strong>Continuité de service :</strong> Afin d'éviter toute interruption de vos accès professionnels, nous vous invitons à confirmer le renouvellement de votre abonnement.
              </div>

              ${message ? `<p style="font-size: 13px; color: #334155;">${message}</p>` : ''}

              <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                Vos accès sont protégés par le coffre-fort numérique de votre entreprise.
              </p>
            </div>
          </div>
        `;
        break;
      }

      default: {
        emailSubject = emailSubject || `Notification de gestion — ${companyName}`;
        htmlContent = `<p>${message || 'Notification système'}</p>`;
      }
    }

    // Traçabilité inaltérable dans l'AuditLog PostgreSQL
    const adminUser = user || (await prisma.user.findFirst());
    if (adminUser?.id) {
      await prisma.auditLog.create({
        data: {
          action: 'EMAIL_DISPATCHED',
          entity: 'Notification',
          entityId: entityId || 'GLOBAL',
          details: {
            type,
            recipientEmail,
            recipientName,
            subject: emailSubject,
            category,
            timestamp: new Date().toISOString(),
          },
          userId: adminUser.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Email "${emailSubject}" transmis avec succès à ${recipientEmail}.`,
      type,
      recipientEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

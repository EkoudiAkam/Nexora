import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decryptSecret } from '@/lib/crypto';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = params;

    // Chercher soit par SubscriptionAssignment, soit directement par DigitalAccount
    const assignment = await prisma.subscriptionAssignment.findUnique({
      where: { id },
      include: {
        customer: true,
        account: {
          include: { service: true },
        },
      },
    });

    const account = assignment
      ? assignment.account
      : await prisma.digitalAccount.findUnique({
          where: { id },
          include: { service: true },
        });

    if (!account) {
      return NextResponse.json({ error: 'Compte numérique non trouvé' }, { status: 404 });
    }

    // Déchiffrement AES-256-GCM
    let decryptedData: Record<string, any> = {};
    try {
      const raw = decryptSecret(account.encryptedCredentials);
      try {
        decryptedData = JSON.parse(raw);
      } catch {
        decryptedData = { password: raw };
      }
    } catch (e) {
      return NextResponse.json({ error: 'Impossible de déchiffrer les clés (altération ou clé corrompue)' }, { status: 500 });
    }

    // Journalisation stricte dans la table d'Audit PostgreSQL
    await prisma.auditLog.create({
      data: {
        action: 'REVEAL_SUBSCRIPTION_SECRET',
        entity: 'DigitalAccount',
        entityId: account.id,
        userId: user.id,
        details: {
          accountIdentifier: account.accountIdentifier,
          serviceName: account.service?.name,
          customer: assignment?.customer?.name || 'N/A',
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      serviceName: account.service?.name,
      accountIdentifier: account.accountIdentifier,
      profileName: account.profileName,
      customerName: assignment?.customer?.name,
      credentials: decryptedData,
      decryptedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

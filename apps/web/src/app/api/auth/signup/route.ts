import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/crypto';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password, name, companyName, businessType } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Nom, email et mot de passe requis' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cette adresse email' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'ADMIN';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        active: true,
      },
      include: {
        permissions: { include: { permission: true } }
      }
    });

    // Configuration automatique du profil métier et des modules
    const type = businessType || 'HYBRID';
    const enableInventory = type === 'RETAIL' || type === 'HYBRID';
    const enableDigitalSubs = type === 'DIGITAL_SERVICES' || type === 'HYBRID';
    const enablePurchases = type === 'RETAIL' || type === 'HYBRID';

    const existingSettings = await prisma.companySettings.findFirst();
    if (existingSettings) {
      await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: { 
          businessName: companyName || existingSettings.businessName,
          legalName: companyName || existingSettings.legalName,
          businessType: type,
          enableInventory,
          enableDigitalSubs,
          enablePurchases,
        }
      });
    } else {
      await prisma.companySettings.create({
        data: {
          businessName: companyName || 'Entreprise Demo',
          legalName: companyName || 'Entreprise Demo',
          currency: 'FCFA',
          businessType: type,
          enableInventory,
          enableDigitalSubs,
          enablePurchases,
          enableQuotes: true,
        }
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.userSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        userAgent: req.headers.get('user-agent') || undefined,
      }
    });

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions.map((p: any) => p.permission.code),
    }, { status: 201 });

    response.cookies.set('nexora_session', rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

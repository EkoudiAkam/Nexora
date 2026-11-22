import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/crypto';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { provider, email, name } = await req.json();
    if (!email || !provider) {
      return NextResponse.json({ error: 'Informations de compte requises' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { permissions: { include: { permission: true } } }
    });

    if (!user) {
      const defaultHash = await hashPassword(crypto.randomBytes(16).toString('hex'));
      user = await prisma.user.create({
        data: {
          name: name || `Utilisateur ${provider}`,
          email,
          passwordHash: defaultHash,
          role: 'EMPLOYEE',
          active: true,
        },
        include: { permissions: { include: { permission: true } } }
      });
    }

    if (!user.active) {
      return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 });
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
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions.map((p: any) => p.permission.code),
    });

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

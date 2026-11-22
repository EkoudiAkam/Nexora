import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get('nexora_session')?.value;
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.userSession.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  const response = NextResponse.json({ success: true, message: 'Déconnecté avec succès' });
  response.cookies.delete('nexora_session');
  return response;
}

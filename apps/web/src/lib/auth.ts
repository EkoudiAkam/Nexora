import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from './prisma';

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('nexora_session')?.value;
  if (!token) return null;

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await prisma.userSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            permissions: { include: { permission: true } }
          }
        }
      }
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }

    if (!session.user.active) return null;

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      permissions: session.user.permissions.map((p: any) => p.permission.code),
    };
  } catch {
    return null;
  }
}

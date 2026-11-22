import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SettingsClient } from './settings-client';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const settings = await prisma.companySettings.findFirst();

  return (
    <SettingsClient initialSettings={JSON.parse(JSON.stringify(settings))} />
  );
}

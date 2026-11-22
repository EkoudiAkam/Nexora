import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'UP',
      architecture: 'Next.js 14 App Router + TypeScript',
      database: 'PostgreSQL 18 connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'DEGRADED',
      database: 'PostgreSQL connection failed',
      error: (error as Error).message,
    }, { status: 500 });
  }
}

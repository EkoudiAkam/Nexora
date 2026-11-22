import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { execFile } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execFilePromise = util.promisify(execFile);

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs du système Nexora' },
        { status: 403 }
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `nexora_backup_${timestamp}.sql`;
    const tempFilePath = path.join(os.tmpdir(), filename);

    // Recherche de l'exécutable pg_dump (PostgreSQL 18 ou fallback PATH)
    const possiblePaths = [
      'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
      'pg_dump',
    ];

    let pgDumpExe = possiblePaths[0];
    for (const p of possiblePaths) {
      if (p === 'pg_dump' || fs.existsSync(p)) {
        pgDumpExe = p;
        break;
      }
    }

    // Exécution native de pg_dump
    await execFilePromise(
      pgDumpExe,
      ['-U', 'postgres', '-d', 'nexora', '-f', tempFilePath],
      {
        env: {
          ...process.env,
          PGPASSWORD: process.env.PGPASSWORD || 'Myhero1234',
        },
      }
    );

    const fileContent = await fs.promises.readFile(tempFilePath);
    // Nettoyage du fichier temporaire
    await fs.promises.unlink(tempFilePath).catch(() => {});

    // Inscription stricte dans l'AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'DATABASE_BACKUP_DOWNLOADED',
        entity: 'Database',
        entityId: 'nexora',
        userId: user.id,
        details: {
          filename,
          sizeBytes: fileContent.length,
          databaseEngine: 'PostgreSQL 18',
          downloadedAt: new Date().toISOString(),
        },
      },
    });

    return new NextResponse(fileContent as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileContent.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Erreur lors de la génération de la sauvegarde : ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

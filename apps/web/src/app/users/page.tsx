import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, UserPlus, KeyRound } from 'lucide-react';
import { AuditLogViewer } from '@/components/audit/audit-log-viewer';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [users, auditLogs] = await Promise.all([
    prisma.user.findMany({
      include: {
        permissions: { include: { permission: true } },
        sessions: {
          where: { revokedAt: null, expiresAt: { gt: new Date() } },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.auditLog.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  const serializedAuditLogs = auditLogs.map((l) => ({
    id: l.id,
    action: l.action,
    entity: l.entity,
    entityId: l.entityId,
    createdAt: l.createdAt.toISOString(),
    ipAddress: l.ipAddress,
    details: l.details,
    user: l.user ? { name: l.user.name, email: l.user.email, role: l.user.role } : undefined,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            <span>Utilisateurs & Permissions Granulaires</span>
          </h1>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold">
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          Ajouter un collaborateur
        </Button>
      </div>

      {/* Tableau Utilisateurs */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm">Comptes Utilisateurs ({users.length})</CardTitle>
          <CardDescription className="text-xs">
            Hachage Argon2id, sessions chiffrées en base et révocation instantanée.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Collaborateur</th>
                <th className="py-3 px-4">Adresse Email</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-center">Sessions Actives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => {
                const roleBadge = 
                  u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                  u.role === 'MANAGER' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                  'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[11px]">
                        {u.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`text-[10px] ${roleBadge}`}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.role === 'ADMIN' ? (
                        <span className="font-semibold text-indigo-600">Toutes (33 permissions)</span>
                      ) : (
                        <span>{u.permissions?.length || 0} permissions</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Actif
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {u.sessions.length} active
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Matrice 33 Permissions */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            Matrice des 33 Permissions Granulaires (Indépendantes des Rôles)
          </CardTitle>
          <CardDescription className="text-xs">
            Conforme au Cahier des charges Nexora : les autorisations sont validées dans les Route Handlers Next.js sur chaque requête.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-indigo-600">Commerce</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• DASHBOARD_READ</li>
              <li>• CUSTOMERS_READ / CREATE</li>
              <li>• SUPPLIERS_READ / CREATE</li>
              <li>• SALES_READ / CREATE / CANCEL</li>
              <li>• QUOTES_READ / CREATE / CONVERT</li>
              <li>• DOCUMENTS_READ</li>
            </ul>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-purple-600">Abonnements</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• SUBSCRIPTIONS_READ</li>
              <li>• SUBSCRIPTIONS_MANAGE</li>
              <li>• SUBSCRIPTION_SECRETS_READ (AES)</li>
            </ul>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-emerald-600">Finance & Trésorerie</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• PAYMENTS_READ / CREATE</li>
              <li>• REFUNDS_CREATE</li>
              <li>• EXPENSES_READ / CREATE</li>
              <li>• MONTHLY_CLOSING_MANAGE</li>
              <li>• REPORTS_READ</li>
            </ul>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-amber-600">Stocks & Admin</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• PRODUCTS_READ / CREATE</li>
              <li>• INVENTORY_READ / ADJUST</li>
              <li>• PURCHASES_READ / RECEIVE</li>
              <li>• USERS_MANAGE</li>
              <li>• SETTINGS_MANAGE</li>
              <li>• AUDIT_READ</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Module 3 : Journal d'Audit Système Inaltérable */}
      <AuditLogViewer logs={serializedAuditLogs} />
    </div>
  );
}

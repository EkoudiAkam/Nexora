'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Shield, KeyRound, Database, Lock, UserCheck, Search } from 'lucide-react';

interface AuditItem {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  createdAt: string | Date;
  ipAddress?: string | null;
  details?: any;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export function AuditLogViewer({ logs }: { logs: AuditItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const actionMatches = selectedAction === 'ALL' || log.action === selectedAction;
    const searchMatches =
      log.action.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      (log.user?.name && log.user.name.toLowerCase().includes(q)) ||
      (log.user?.email && log.user.email.toLowerCase().includes(q));
    return actionMatches && searchMatches;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('REVEAL_SUBSCRIPTION')) {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200 gap-1 text-[10px]">
          <KeyRound className="w-3 h-3 text-purple-600" />
          Déchiffrement Secret (AES-256)
        </Badge>
      );
    }
    if (action.includes('CLOSING')) {
      return (
        <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 gap-1 text-[10px]">
          <Lock className="w-3 h-3 text-indigo-600" />
          Clôture & Verrou Comptable
        </Badge>
      );
    }
    if (action.includes('BACKUP')) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-[10px]">
          <Database className="w-3 h-3 text-emerald-600" />
          Sauvegarde Base PostgreSQL
        </Badge>
      );
    }
    if (action.includes('LOGIN')) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 text-[10px]">
          <UserCheck className="w-3 h-3 text-blue-600" />
          Authentification
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px]">
        {action}
      </Badge>
    );
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              Journal d'Audit Système Inaltérable (AuditLog)
            </CardTitle>
            <CardDescription className="text-xs">
              Tracé horodaté et infalsifiable de toutes les actions sensibles (déchiffrements de secrets, clôtures, sauvegardes).
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[11px] py-1 self-start sm:self-auto">
            <Shield className="w-3.5 h-3.5" />
            Traçabilité Actif
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Filtres de recherche */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrer les journaux par utilisateur, action ou entité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs outline-none w-full text-slate-700"
            />
          </div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-1.5 font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">Toutes les actions</option>
            <option value="REVEAL_SUBSCRIPTION_SECRET">Déchiffrement AES-256</option>
            <option value="MONTHLY_CLOSING_LOCKED">Clôtures mensuelles</option>
            <option value="DATABASE_BACKUP_DOWNLOADED">Sauvegardes BD</option>
          </select>
        </div>

        {/* Table Audit */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Date & Heure</th>
                <th className="py-2.5 px-3">Utilisateur</th>
                <th className="py-2.5 px-3">Action Système</th>
                <th className="py-2.5 px-3">Entité Ciblée</th>
                <th className="py-2.5 px-3">Détails de Sécurité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Aucun événement d'audit enregistré pour ces filtres.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {log.user?.name || 'Système'}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {log.user?.email}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {log.entity}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                      {log.details ? (
                        <span title={JSON.stringify(log.details, null, 2)}>
                          {typeof log.details === 'string'
                            ? log.details
                            : JSON.stringify(log.details)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

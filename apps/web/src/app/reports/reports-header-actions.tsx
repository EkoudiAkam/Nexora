'use client';

import React, { useState } from 'react';
import { Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SendEmailModal } from '@/components/modals/SendEmailModal';

export function ReportsHeaderActions() {
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href="/api/reports/export?format=excel"
          download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Exporter Excel (.xlsx)</span>
        </a>
        <a
          href="/api/reports/export?format=pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>Télécharger Bilan PDF</span>
        </a>
        <Button
          onClick={() => setIsEmailOpen(true)}
          variant="outline"
          size="sm"
          className="text-xs font-medium gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Mail className="w-3.5 h-3.5 text-indigo-600" />
          <span>Transmettre par Email</span>
        </Button>
      </div>

      <SendEmailModal
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        defaultType="REPORT_DIGEST"
      />
    </>
  );
}

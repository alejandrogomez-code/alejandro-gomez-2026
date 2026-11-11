'use client';

import { CalendarClock } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeadlineList } from '@/components/agenda/DeadlineList';

export default function VencimientosPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Vencimientos"
        description="Impuestos, informes, cierres y todo lo que tiene fecha. Te aviso por mail antes."
        icon={CalendarClock}
        accent="plum"
      />
      <DeadlineList
        area="trabajo"
        kind="vencimiento"
        title="Próximos vencimientos"
        addLabel="Nuevo vencimiento"
        defaultRecurrence="monthly"
        placeholder="Ej.: Presentación de IVA"
      />
    </div>
  );
}

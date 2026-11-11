'use client';

import { CalendarHeart } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeadlineList } from '@/components/agenda/DeadlineList';

export default function FechasPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Fechas importantes"
        description="Cumpleaños, aniversarios, viajes y vencimientos personales."
        icon={CalendarHeart}
        accent="clay"
      />
      <DeadlineList
        area="personal"
        kind="fecha"
        title="Próximas fechas"
        addLabel="Nueva fecha"
        defaultRecurrence="yearly"
        placeholder="Ej.: Aniversario de casados"
      />
      <DeadlineList
        area="personal"
        kind="vencimiento"
        title="Vencimientos personales"
        description="Seguros, patente, impuestos de la casa, tarjeta."
        addLabel="Nuevo vencimiento"
        defaultRecurrence="monthly"
        placeholder="Ej.: Patente del auto"
      />
    </div>
  );
}

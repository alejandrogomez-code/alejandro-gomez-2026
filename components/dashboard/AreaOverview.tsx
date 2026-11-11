'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { AREAS, GOALS_META } from '@/lib/areas';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface AreaCardProps {
  href: string;
  label: string;
  icon: LucideIcon;
  bg: string;
  value: ReactNode;
  detail: ReactNode;
}

function AreaCard({ href, label, icon: Icon, bg, value, detail }: AreaCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col gap-2 rounded-3xl p-4 text-brand-900 transition hover:-translate-y-0.5 hover:shadow-float sm:p-5',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40',
        bg,
      )}
    >
      <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/50" aria-hidden="true">
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </span>
      <span className="tabular text-3xl font-extrabold leading-none tracking-tight">{value}</span>
      <span className="text-xs font-semibold">{detail}</span>
    </Link>
  );
}

export interface AreaOverviewProps {
  work: { pending: number; dueSoon: number };
  personal: { pending: number; nextDate: string | null };
  health: { habitsLabel: string; stepsLabel: string };
  goals: { active: number; averageProgress: number | null };
}

/** Una tarjeta de color por área, con lo esencial de cada una. */
export function AreaOverview({ work, personal, health, goals }: AreaOverviewProps) {
  return (
    <section aria-label="Resumen por área" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <AreaCard
        href="/trabajo"
        label={AREAS.trabajo.label}
        icon={AREAS.trabajo.icon}
        bg="bg-plum-300"
        value={work.pending}
        detail={
          work.dueSoon > 0
            ? `pendientes · ${work.dueSoon} ${work.dueSoon === 1 ? 'vence' : 'vencen'} pronto`
            : 'pendientes'
        }
      />
      <AreaCard
        href="/personal"
        label={AREAS.personal.label}
        icon={AREAS.personal.icon}
        bg="bg-clay-300"
        value={personal.pending}
        detail={personal.nextDate ? `pendientes · próxima fecha: ${personal.nextDate}` : 'pendientes'}
      />
      <AreaCard
        href="/salud/resumen"
        label={AREAS.salud.label}
        icon={AREAS.salud.icon}
        bg="bg-ocean-300"
        value={health.habitsLabel}
        detail={`hábitos de hoy · ${health.stepsLabel}`}
      />
      <AreaCard
        href="/objetivos"
        label={GOALS_META.label}
        icon={GOALS_META.icon}
        bg="bg-amber-300"
        value={goals.active}
        detail={
          goals.averageProgress === null
            ? 'activos'
            : `activos · ${Math.round(goals.averageProgress)}% de avance promedio`
        }
      />
    </section>
  );
}

import { CalendarDays, Footprints, Heart, LayoutDashboard, ListChecks, Repeat, Scale, Settings, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Prefijo usado para marcar la sección como activa. */
  match: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard, match: '/dashboard' },
  { href: '/objetivos', label: 'Objetivos', icon: Target, match: '/objetivos' },
  {
    href: '/salud/resumen',
    label: 'Salud',
    icon: Heart,
    match: '/salud',
    children: [
      { href: '/salud/resumen', label: 'Resumen', icon: ListChecks, match: '/salud/resumen' },
      { href: '/salud/peso', label: 'Peso', icon: Scale, match: '/salud/peso' },
      { href: '/salud/pasos', label: 'Pasos', icon: Footprints, match: '/salud/pasos' },
      { href: '/salud/habitos', label: 'Hábitos', icon: Repeat, match: '/salud/habitos' },
      { href: '/salud/calendario', label: 'Calendario', icon: CalendarDays, match: '/salud/calendario' },
    ],
  },
  { href: '/configuracion', label: 'Ajustes', icon: Settings, match: '/configuracion' },
];

import { CalendarDays, Footprints, Heart, LayoutDashboard, ListChecks, Repeat, Scale, Settings, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Accent } from '@/lib/accents';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Prefijo usado para marcar la sección como activa. */
  match: string;
  accent: Accent;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard, match: '/dashboard', accent: 'ocean' },
  { href: '/objetivos', label: 'Objetivos', icon: Target, match: '/objetivos', accent: 'plum' },
  {
    href: '/salud/resumen',
    label: 'Salud',
    icon: Heart,
    match: '/salud',
    accent: 'brand',
    children: [
      { href: '/salud/resumen', label: 'Resumen', icon: ListChecks, match: '/salud/resumen', accent: 'brand' },
      { href: '/salud/peso', label: 'Peso', icon: Scale, match: '/salud/peso', accent: 'ocean' },
      { href: '/salud/pasos', label: 'Pasos', icon: Footprints, match: '/salud/pasos', accent: 'brand' },
      { href: '/salud/habitos', label: 'Hábitos', icon: Repeat, match: '/salud/habitos', accent: 'amber' },
      { href: '/salud/calendario', label: 'Calendario', icon: CalendarDays, match: '/salud/calendario', accent: 'plum' },
    ],
  },
  { href: '/configuracion', label: 'Ajustes', icon: Settings, match: '/configuracion', accent: 'neutral' },
];

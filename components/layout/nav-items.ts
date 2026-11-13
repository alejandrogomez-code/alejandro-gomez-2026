import {
  ArrowLeftRight,
  BookOpen,
  CreditCard,
  LineChart,
  PieChart,
  CalendarClock,
  CalendarDays,
  CalendarHeart,
  ClipboardCheck,
  Footprints,
  FolderKanban,
  Home,
  ListChecks,
  ListTodo,
  NotebookPen,
  Repeat,
  Scale,
  Settings,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Accent } from '@/lib/accents';
import { AREAS, FINANCE_META, GOALS_META } from '@/lib/areas';

export interface NavItem {
  href: string;
  label: string;
  /** Etiqueta corta para la barra inferior del celular. */
  short?: string;
  icon: LucideIcon;
  /** Prefijos que marcan la sección como activa. */
  match: string | string[];
  /** Si es true, `match` tiene que coincidir exacto (para la página índice). */
  exact?: boolean;
  accent: Accent;
  children?: NavItem[];
  /** Se muestra en la barra inferior del celular. */
  mobile?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home, match: '/dashboard', accent: 'brand', mobile: true },
  {
    href: '/objetivos',
    label: GOALS_META.label,
    icon: GOALS_META.icon,
    match: ['/objetivos', '/revision'],
    accent: GOALS_META.accent,
    mobile: true,
    children: [
      { href: '/objetivos', label: 'Todos', icon: GOALS_META.icon, match: '/objetivos', accent: 'amber' },
      { href: '/revision', label: 'Revisión semanal', icon: ClipboardCheck, match: '/revision', accent: 'amber' },
    ],
  },
  {
    href: '/trabajo',
    label: AREAS.trabajo.label,
    icon: AREAS.trabajo.icon,
    match: ['/trabajo', '/proyectos'],
    accent: AREAS.trabajo.accent,
    mobile: true,
    children: [
      { href: '/trabajo', label: 'Pendientes', icon: ListTodo, match: '/trabajo', exact: true, accent: 'plum' },
      { href: '/proyectos', label: 'Proyectos', icon: FolderKanban, match: '/proyectos', accent: 'plum' },
      { href: '/trabajo/vencimientos', label: 'Vencimientos', icon: CalendarClock, match: '/trabajo/vencimientos', accent: 'plum' },
      { href: '/trabajo/reuniones', label: 'Reuniones', icon: Users, match: '/trabajo/reuniones', accent: 'plum' },
    ],
  },
  {
    href: '/personal',
    label: AREAS.personal.label,
    icon: AREAS.personal.icon,
    match: '/personal',
    accent: AREAS.personal.accent,
    mobile: true,
    children: [
      { href: '/personal', label: 'Pendientes', icon: ListTodo, match: '/personal', exact: true, accent: 'clay' },
      { href: '/personal/fechas', label: 'Fechas importantes', icon: CalendarHeart, match: '/personal/fechas', accent: 'clay' },
      { href: '/personal/lecturas', label: 'Lecturas', icon: BookOpen, match: '/personal/lecturas', accent: 'clay' },
      { href: '/personal/notas', label: 'Notas', icon: NotebookPen, match: '/personal/notas', accent: 'clay' },
    ],
  },
  {
    href: '/salud/resumen',
    label: AREAS.salud.label,
    icon: AREAS.salud.icon,
    match: '/salud',
    accent: AREAS.salud.accent,
    mobile: true,
    children: [
      { href: '/salud/resumen', label: 'Resumen', icon: ListChecks, match: '/salud/resumen', accent: 'ocean' },
      { href: '/salud/peso', label: 'Peso', icon: Scale, match: '/salud/peso', accent: 'ocean' },
      { href: '/salud/pasos', label: 'Pasos', icon: Footprints, match: '/salud/pasos', accent: 'ocean' },
      { href: '/salud/habitos', label: 'Hábitos', icon: Repeat, match: '/salud/habitos', accent: 'ocean' },
      { href: '/salud/calendario', label: 'Calendario', icon: CalendarDays, match: '/salud/calendario', accent: 'ocean' },
    ],
  },
  {
    href: FINANCE_META.href,
    label: FINANCE_META.label,
    short: FINANCE_META.short,
    icon: FINANCE_META.icon,
    match: '/finanzas',
    accent: FINANCE_META.accent,
    mobile: true,
    children: [
      { href: '/finanzas', label: 'Resumen', icon: PieChart, match: '/finanzas', exact: true, accent: 'leaf' },
      { href: '/finanzas/movimientos', label: 'Ingresos y egresos', icon: ArrowLeftRight, match: '/finanzas/movimientos', accent: 'leaf' },
      { href: '/finanzas/deudas', label: 'Deudas y plan de pago', icon: CreditCard, match: '/finanzas/deudas', accent: 'leaf' },
      { href: '/finanzas/inversiones', label: 'Inversiones', icon: LineChart, match: '/finanzas/inversiones', accent: 'leaf' },
    ],
  },
  { href: '/configuracion', label: 'Ajustes', icon: Settings, match: '/configuracion', accent: 'neutral' },
];

/** ¿La ruta actual pertenece a este ítem? */
export function isNavActive(item: NavItem, pathname: string): boolean {
  const prefixes = Array.isArray(item.match) ? item.match : [item.match];
  return prefixes.some((prefix) =>
    item.exact ? pathname === prefix : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

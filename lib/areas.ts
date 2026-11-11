import { Briefcase, Compass, HeartPulse, Sparkles, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Accent } from '@/lib/accents';
import type { Area, WorkArea } from '@/types/database';

/**
 * Cada área tiene su color, para reconocerla de un vistazo en toda la app:
 * Trabajo violeta, Personal coral, Salud menta y Objetivos amarillo.
 */
export interface AreaMeta {
  label: string;
  accent: Accent;
  icon: LucideIcon;
  href: string;
}

export const AREAS: Record<Area, AreaMeta> = {
  trabajo: { label: 'Trabajo', accent: 'plum', icon: Briefcase, href: '/trabajo' },
  personal: { label: 'Personal', accent: 'clay', icon: Sparkles, href: '/personal' },
  salud: { label: 'Salud', accent: 'ocean', icon: HeartPulse, href: '/salud/resumen' },
  general: { label: 'General', accent: 'amber', icon: Compass, href: '/objetivos' },
};

/** Color y ícono de la sección Objetivos. */
export const GOALS_META = { label: 'Objetivos', accent: 'amber' as Accent, icon: Target };

export const AREA_OPTIONS: { value: Area; label: string }[] = [
  { value: 'trabajo', label: 'Trabajo' },
  { value: 'personal', label: 'Personal' },
  { value: 'salud', label: 'Salud' },
  { value: 'general', label: 'General' },
];

export const WORK_AREA_OPTIONS: { value: WorkArea; label: string }[] = [
  { value: 'trabajo', label: 'Trabajo' },
  { value: 'personal', label: 'Personal' },
];

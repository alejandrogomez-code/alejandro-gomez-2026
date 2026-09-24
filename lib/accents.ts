import type { ProjectColor } from '@/types/database';

/**
 * El verde es el único color de acción. El resto son tintes de estado o de
 * categoría para los chips de icono. Las clases van escritas completas
 * (no interpoladas) para que Tailwind las incluya en el build.
 */
export type Accent = 'brand' | 'ocean' | 'amber' | 'plum' | 'clay' | 'neutral';

interface AccentClasses {
  /** Chip cuadrado del icono en filas y tarjetas. */
  chip: string;
  /** Relleno de la barra de progreso. */
  bar: string;
  /** Texto destacado. */
  text: string;
  /** Píldora de estado. */
  pill: string;
  /** Fondo suave para bloques secundarios. */
  soft: string;
  /** Fondo saturado con texto blanco, para marcas de color. */
  solid: string;
  /** Punto de color, para identificar proyectos en listados. */
  dot: string;
}

export const ACCENTS: Record<Accent, AccentClasses> = {
  brand: {
    chip: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200',
    bar: 'bg-brand-500 dark:bg-brand-300',
    text: 'text-brand-600 dark:text-brand-200',
    pill: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-200',
    soft: 'bg-brand-50 dark:bg-brand-500/10',
    solid: 'bg-brand-500 text-white dark:bg-brand-500',
    dot: 'bg-brand-500 dark:bg-brand-300',
  },
  ocean: {
    chip: 'bg-ocean-50 text-ocean-600 dark:bg-ocean-500/15 dark:text-ocean-200',
    bar: 'bg-ocean-500 dark:bg-ocean-300',
    text: 'text-ocean-600 dark:text-ocean-200',
    pill: 'bg-ocean-50 text-ocean-600 dark:bg-ocean-500/15 dark:text-ocean-200',
    soft: 'bg-ocean-50 dark:bg-ocean-500/10',
    solid: 'bg-ocean-500 text-white dark:bg-ocean-500',
    dot: 'bg-ocean-500 dark:bg-ocean-300',
  },
  amber: {
    chip: 'bg-amber-50 text-amber-600 dark:bg-amber-400/15 dark:text-amber-200',
    bar: 'bg-amber-400 dark:bg-amber-300',
    text: 'text-amber-500 dark:text-amber-200',
    pill: 'bg-amber-50 text-amber-600 dark:bg-amber-400/15 dark:text-amber-200',
    soft: 'bg-amber-50 dark:bg-amber-400/10',
    solid: 'bg-amber-400 text-amber-900 dark:bg-amber-400 dark:text-amber-900',
    dot: 'bg-amber-400 dark:bg-amber-300',
  },
  plum: {
    chip: 'bg-plum-50 text-plum-600 dark:bg-plum-500/15 dark:text-plum-200',
    bar: 'bg-plum-500 dark:bg-plum-300',
    text: 'text-plum-600 dark:text-plum-200',
    pill: 'bg-plum-50 text-plum-600 dark:bg-plum-500/15 dark:text-plum-200',
    soft: 'bg-plum-50 dark:bg-plum-500/10',
    solid: 'bg-plum-500 text-white dark:bg-plum-500',
    dot: 'bg-plum-500 dark:bg-plum-300',
  },
  clay: {
    chip: 'bg-clay-50 text-clay-600 dark:bg-clay-500/15 dark:text-clay-200',
    bar: 'bg-clay-500 dark:bg-clay-300',
    text: 'text-clay-500 dark:text-clay-200',
    pill: 'bg-clay-50 text-clay-500 dark:bg-clay-500/15 dark:text-clay-200',
    soft: 'bg-clay-50 dark:bg-clay-500/10',
    solid: 'bg-clay-500 text-white dark:bg-clay-500',
    dot: 'bg-clay-500 dark:bg-clay-300',
  },
  neutral: {
    chip: 'bg-sand-100 text-sand-600 dark:bg-sand-800 dark:text-sand-400',
    bar: 'bg-sand-400 dark:bg-sand-600',
    text: 'text-sand-900 dark:text-sand-100',
    pill: 'bg-sand-100 text-sand-600 dark:bg-sand-800 dark:text-sand-300',
    soft: 'bg-sand-50 dark:bg-sand-800/50',
    solid: 'bg-sand-700 text-white dark:bg-sand-300 dark:text-sand-900',
    dot: 'bg-sand-400 dark:bg-sand-500',
  },
};

/** Colores que se pueden elegir para un proyecto. */
export const PROJECT_COLORS: ProjectColor[] = ['brand', 'ocean', 'amber', 'plum', 'clay'];

export const PROJECT_COLOR_LABELS: Record<ProjectColor, string> = {
  brand: 'Verde',
  ocean: 'Azul',
  amber: 'Ámbar',
  plum: 'Violeta',
  clay: 'Arcilla',
};

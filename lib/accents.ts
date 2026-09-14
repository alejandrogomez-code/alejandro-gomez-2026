/**
 * Cada área de la app tiene un acento propio. Las clases están escritas
 * completas (no interpoladas) para que Tailwind las incluya en el build.
 */
export type Accent = 'sage' | 'ocean' | 'honey' | 'plum' | 'neutral';

interface AccentClasses {
  /** Chip del icono dentro de las tarjetas de indicador. */
  chip: string;
  /** Relleno de la barra de progreso. */
  bar: string;
  /** Texto destacado. */
  text: string;
  /** Fondo suave para bloques secundarios. */
  soft: string;
  /** Borde marcado, para estados activos. */
  border: string;
}

export const ACCENTS: Record<Accent, AccentClasses> = {
  sage: {
    chip: 'bg-sage-50 text-sage-600 dark:bg-sage-500/15 dark:text-sage-300',
    bar: 'bg-sage-500 dark:bg-sage-400',
    text: 'text-sage-600 dark:text-sage-300',
    soft: 'bg-sage-50 dark:bg-sage-500/10',
    border: 'border-sage-500 dark:border-sage-400',
  },
  ocean: {
    chip: 'bg-ocean-50 text-ocean-600 dark:bg-ocean-500/15 dark:text-ocean-300',
    bar: 'bg-ocean-500 dark:bg-ocean-400',
    text: 'text-ocean-600 dark:text-ocean-300',
    soft: 'bg-ocean-50 dark:bg-ocean-500/10',
    border: 'border-ocean-500 dark:border-ocean-400',
  },
  honey: {
    chip: 'bg-honey-50 text-honey-600 dark:bg-honey-500/15 dark:text-honey-300',
    bar: 'bg-honey-500 dark:bg-honey-400',
    text: 'text-honey-600 dark:text-honey-300',
    soft: 'bg-honey-50 dark:bg-honey-500/10',
    border: 'border-honey-500 dark:border-honey-400',
  },
  plum: {
    chip: 'bg-plum-50 text-plum-600 dark:bg-plum-500/15 dark:text-plum-300',
    bar: 'bg-plum-500 dark:bg-plum-400',
    text: 'text-plum-600 dark:text-plum-300',
    soft: 'bg-plum-50 dark:bg-plum-500/10',
    border: 'border-plum-500 dark:border-plum-400',
  },
  neutral: {
    chip: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
    bar: 'bg-neutral-900 dark:bg-neutral-100',
    text: 'text-neutral-900 dark:text-neutral-100',
    soft: 'bg-neutral-50 dark:bg-neutral-800/50',
    border: 'border-neutral-900 dark:border-neutral-100',
  },
};

/** Acento asignado a cada sección de la navegación. */
export const SECTION_ACCENT: Record<string, Accent> = {
  '/dashboard': 'neutral',
  '/objetivos': 'plum',
  '/salud': 'sage',
  '/configuracion': 'neutral',
};

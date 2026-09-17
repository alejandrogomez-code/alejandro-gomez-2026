/**
 * Cada área de la app tiene un acento propio. Las clases están escritas
 * completas (no interpoladas) para que Tailwind las incluya en el build.
 */
import type { ProjectColor } from '@/types/database';

export type Accent = 'sage' | 'ocean' | 'honey' | 'plum' | 'coral' | 'neutral';

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
  /** Fondo lleno con texto blanco: selección, íconos de encabezado. */
  solid: string;
  /** Ítem de navegación activo. */
  nav: string;
  /** Punto o marcador de color. */
  dot: string;
  /** Borde al pasar el mouse. */
  hoverBorder: string;
}

export const ACCENTS: Record<Accent, AccentClasses> = {
  sage: {
    chip: 'bg-sage-100 text-sage-700 dark:bg-sage-500/20 dark:text-sage-300',
    bar: 'bg-sage-500 dark:bg-sage-400',
    text: 'text-sage-600 dark:text-sage-300',
    soft: 'bg-sage-50 dark:bg-sage-500/10',
    border: 'border-sage-500 dark:border-sage-400',
    solid: 'bg-sage-500 text-white dark:bg-sage-500',
    nav: 'bg-sage-50 text-sage-700 dark:bg-sage-500/15 dark:text-sage-200',
    dot: 'bg-sage-500 dark:bg-sage-400',
    hoverBorder: 'hover:border-sage-400 dark:hover:border-sage-500',
  },
  ocean: {
    chip: 'bg-ocean-100 text-ocean-700 dark:bg-ocean-500/20 dark:text-ocean-300',
    bar: 'bg-ocean-500 dark:bg-ocean-400',
    text: 'text-ocean-600 dark:text-ocean-300',
    soft: 'bg-ocean-50 dark:bg-ocean-500/10',
    border: 'border-ocean-500 dark:border-ocean-400',
    solid: 'bg-ocean-500 text-white dark:bg-ocean-500',
    nav: 'bg-ocean-50 text-ocean-700 dark:bg-ocean-500/15 dark:text-ocean-200',
    dot: 'bg-ocean-500 dark:bg-ocean-400',
    hoverBorder: 'hover:border-ocean-400 dark:hover:border-ocean-500',
  },
  honey: {
    chip: 'bg-honey-100 text-honey-700 dark:bg-honey-500/20 dark:text-honey-300',
    bar: 'bg-honey-500 dark:bg-honey-400',
    text: 'text-honey-600 dark:text-honey-300',
    soft: 'bg-honey-50 dark:bg-honey-500/10',
    border: 'border-honey-500 dark:border-honey-400',
    solid: 'bg-honey-500 text-white dark:bg-honey-500',
    nav: 'bg-honey-50 text-honey-700 dark:bg-honey-500/15 dark:text-honey-200',
    dot: 'bg-honey-500 dark:bg-honey-400',
    hoverBorder: 'hover:border-honey-400 dark:hover:border-honey-500',
  },
  plum: {
    chip: 'bg-plum-100 text-plum-700 dark:bg-plum-500/20 dark:text-plum-300',
    bar: 'bg-plum-500 dark:bg-plum-400',
    text: 'text-plum-600 dark:text-plum-300',
    soft: 'bg-plum-50 dark:bg-plum-500/10',
    border: 'border-plum-500 dark:border-plum-400',
    solid: 'bg-plum-500 text-white dark:bg-plum-500',
    nav: 'bg-plum-50 text-plum-700 dark:bg-plum-500/15 dark:text-plum-200',
    dot: 'bg-plum-500 dark:bg-plum-400',
    hoverBorder: 'hover:border-plum-400 dark:hover:border-plum-500',
  },
  coral: {
    chip: 'bg-coral-100 text-coral-700 dark:bg-coral-500/20 dark:text-coral-300',
    bar: 'bg-coral-500 dark:bg-coral-400',
    text: 'text-coral-600 dark:text-coral-300',
    soft: 'bg-coral-50 dark:bg-coral-500/10',
    border: 'border-coral-500 dark:border-coral-400',
    solid: 'bg-coral-500 text-white dark:bg-coral-500',
    nav: 'bg-coral-50 text-coral-700 dark:bg-coral-500/15 dark:text-coral-200',
    dot: 'bg-coral-500 dark:bg-coral-400',
    hoverBorder: 'hover:border-coral-400 dark:hover:border-coral-500',
  },
  neutral: {
    chip: 'bg-mist-100 text-mist-600 dark:bg-mist-800 dark:text-mist-300',
    bar: 'bg-mist-700 dark:bg-mist-300',
    text: 'text-mist-900 dark:text-mist-100',
    soft: 'bg-mist-50 dark:bg-mist-800/50',
    border: 'border-mist-900 dark:border-mist-100',
    solid: 'bg-mist-700 text-white dark:bg-mist-600',
    nav: 'bg-mist-100 text-mist-900 dark:bg-mist-800 dark:text-mist-100',
    dot: 'bg-mist-400',
    hoverBorder: 'hover:border-mist-300 dark:hover:border-mist-700',
  },
};

/** Colores que se pueden elegir para un proyecto (se guardan en la base). */
export const PROJECT_COLORS: ProjectColor[] = ['coral', 'ocean', 'sage', 'honey', 'plum'];

export const PROJECT_COLOR_LABELS: Record<ProjectColor, string> = {
  coral: 'Coral',
  ocean: 'Azul',
  sage: 'Verde',
  honey: 'Ámbar',
  plum: 'Violeta',
};

/** Acento asignado a cada sección de la navegación. */
export const SECTION_ACCENT: Record<string, Accent> = {
  '/dashboard': 'ocean',
  '/objetivos': 'plum',
  '/proyectos': 'coral',
  '/salud': 'sage',
  '/configuracion': 'neutral',
};

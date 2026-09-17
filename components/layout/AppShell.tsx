'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';

/**
 * Fondo por sección: una franja con degradado detrás del encabezado de la
 * página y un tinte suave del mismo color que se desvanece hacia abajo.
 * Las clases están escritas completas para que Tailwind las incluya.
 */
interface SectionBackground {
  match: string;
  band: string;
  tint: string;
}

const BACKGROUNDS: SectionBackground[] = [
  {
    match: '/dashboard',
    band: 'from-ocean-700 via-ocean-600 to-ocean-500 dark:from-ocean-700/90 dark:via-ocean-700/70 dark:to-ocean-600/50',
    tint: 'from-ocean-100 dark:from-ocean-500/15',
  },
  {
    match: '/objetivos',
    band: 'from-plum-700 via-plum-600 to-plum-500 dark:from-plum-700/90 dark:via-plum-700/70 dark:to-plum-600/50',
    tint: 'from-plum-100 dark:from-plum-500/15',
  },
  {
    match: '/proyectos',
    band: 'from-coral-700 via-coral-600 to-coral-500 dark:from-coral-700/90 dark:via-coral-700/70 dark:to-coral-600/50',
    tint: 'from-coral-100 dark:from-coral-500/15',
  },
  {
    match: '/salud',
    band: 'from-sage-700 via-sage-600 to-sage-500 dark:from-sage-700/90 dark:via-sage-700/70 dark:to-sage-600/50',
    tint: 'from-sage-100 dark:from-sage-500/15',
  },
];

const NEUTRAL_BACKGROUND: SectionBackground = {
  match: '',
  band: 'from-mist-700 via-mist-600 to-mist-500 dark:from-mist-800 dark:via-mist-800/80 dark:to-mist-700/60',
  tint: 'from-mist-200 dark:from-mist-800/40',
};

/**
 * Lo que queda sobre la franja pasa a blanco: título y descripción del
 * encabezado, el ícono de la sección, el enlace "volver" del detalle y las
 * pestañas de Salud. El botón del encabezado pasa a blanco.
 */
const ON_BAND = cn(
  '[&_header_h1]:!text-white',
  '[&_header_p]:!text-white/85',
  '[&_header>div>span:first-child]:!bg-white/20',
  '[&_header>div>span:first-child]:!text-white',
  '[&_header>div>span:first-child]:ring-1',
  '[&_header>div>span:first-child]:ring-white/30',
  '[&>div>a:first-child]:!text-white/90',
  '[&_header_button]:!bg-white',
  '[&_header_button]:!text-mist-900',
  '[&_header_button:hover]:!bg-white/90',
  '[&>div>nav_ul]:!bg-white/20',
  '[&>div>nav_a:not([aria-current])]:!text-white/85',
  '[&>div>nav_a:not([aria-current]):hover]:!text-white',
);

export function AppShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const background =
    BACKGROUNDS.find((entry) => pathname.startsWith(entry.match)) ?? NEUTRAL_BACKGROUND;

  return (
    <div className="flex min-h-screen bg-mist-50 dark:bg-mist-950">
      <Sidebar email={email} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-gradient-to-b to-transparent',
            background.tint,
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-72 rounded-b-[2rem] bg-gradient-to-br sm:h-60 lg:h-56 lg:rounded-b-[2.5rem]',
            background.band,
          )}
        />
        <MobileHeader />
        <main
          className={cn(
            'relative mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10',
            ON_BAND,
          )}
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

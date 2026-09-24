'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/salud/resumen', label: 'Resumen' },
  { href: '/salud/peso', label: 'Peso' },
  { href: '/salud/pasos', label: 'Pasos' },
  { href: '/salud/habitos', label: 'Hábitos' },
  { href: '/salud/calendario', label: 'Calendario' },
];

export function SaludNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones de salud" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 rounded-lg bg-sand-100 p-1 dark:bg-sand-800/70">
        {LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white text-sand-900 shadow-card dark:bg-sand-950 dark:text-sand-100'
                    : 'text-sand-500 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-200',
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

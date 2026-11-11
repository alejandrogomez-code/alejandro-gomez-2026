'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ACCENTS } from '@/lib/accents';
import { NAV_ITEMS, isNavActive } from './nav-items';

/**
 * Subsecciones del área actual en el celular, donde no está la barra lateral.
 * Salud ya trae su propia barra de pestañas, así que se omite.
 */
export function AreaTabs() {
  const pathname = usePathname();
  const group = NAV_ITEMS.find((item) => item.children && isNavActive(item, pathname));
  if (!group?.children || group.href.startsWith('/salud')) return null;
  const theme = ACCENTS[group.accent];

  return (
    <nav aria-label={`Secciones de ${group.label}`} className="-mx-4 mb-4 overflow-x-auto px-4 lg:hidden">
      <ul className="flex min-w-max gap-1.5">
        {group.children.map((child) => {
          const active = isNavActive(child, pathname);
          return (
            <li key={child.href}>
              <Link
                href={child.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-full px-3.5 py-2 text-sm font-bold transition-colors',
                  active ? theme.chip : 'bg-white text-sand-600 dark:bg-sand-900 dark:text-sand-300',
                )}
              >
                {child.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

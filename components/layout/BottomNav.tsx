'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ACCENTS } from '@/lib/accents';
import { NAV_ITEMS } from './nav-items';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-mist-200 bg-white/95 backdrop-blur lg:hidden dark:border-mist-800 dark:bg-mist-900/95"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.match);
          const Icon = item.icon;
          const theme = ACCENTS[item.accent];
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors',
                  active ? cn('font-medium', theme.text) : 'text-mist-400 dark:text-mist-500',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                    active ? theme.chip : '',
                  )}
                  aria-hidden="true"
                >
                  <Icon className={cn('h-5 w-5', active ? 'stroke-[2.2]' : '')} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './nav-items';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white/95 backdrop-blur lg:hidden dark:border-sand-800 dark:bg-sand-900/95"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.match);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors',
                  active
                    ? 'text-brand-600 dark:text-brand-200'
                    : 'text-sand-400 dark:text-sand-500',
                )}
              >
                <Icon
                  className={cn('h-5 w-5', active ? 'stroke-[2.2]' : '')}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

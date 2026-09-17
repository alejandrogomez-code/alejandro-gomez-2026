'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ACCENTS } from '@/lib/accents';
import { VidaMark } from '@/components/ui/VidaMark';
import { NAV_ITEMS } from './nav-items';
import { SignOutButton } from './SignOutButton';

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-mist-200/70 bg-white lg:flex lg:flex-col dark:border-mist-800 dark:bg-mist-900">
      <div className="px-6 py-7">
        <p className="text-xl font-semibold tracking-tight text-mist-900 dark:text-mist-100">
          Vida
        </p>
        <VidaMark className="mt-2 w-20" segmentClassName="h-1" />
        <p className="mt-2 truncate text-xs text-mist-400">{email}</p>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.match);
            const Icon = item.icon;
            const theme = ACCENTS[item.accent];
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors',
                    active
                      ? cn('font-medium', theme.nav)
                      : 'text-mist-500 hover:bg-mist-50 hover:text-mist-900 dark:text-mist-400 dark:hover:bg-mist-800/60 dark:hover:text-mist-100',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                      active ? theme.solid : cn(theme.text, 'bg-transparent'),
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>

                {item.children && active ? (
                  <ul className="mb-2 ml-6 mt-1 space-y-0.5 border-l-2 border-sage-200 pl-3 dark:border-sage-500/30">
                    {item.children.map((child) => {
                      const childActive = pathname.startsWith(child.match);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={childActive ? 'page' : undefined}
                            className={cn(
                              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                              childActive
                                ? 'font-medium text-mist-900 dark:text-mist-100'
                                : 'text-mist-500 hover:text-mist-900 dark:text-mist-400 dark:hover:text-mist-100',
                            )}
                          >
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                childActive ? ACCENTS[child.accent].dot : 'bg-mist-300 dark:bg-mist-700',
                              )}
                              aria-hidden="true"
                            />
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-mist-100 p-3 dark:border-mist-800">
        <SignOutButton />
      </div>
    </aside>
  );
}

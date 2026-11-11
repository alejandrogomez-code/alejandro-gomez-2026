'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCENTS } from '@/lib/accents';
import { useSidebarCounters } from '@/hooks/useSidebarCounters';
import { NAV_ITEMS, isNavActive } from './nav-items';
import { AppearanceControls } from './AppearanceControls';
import { SignOutButton } from './SignOutButton';

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const counters = useSidebarCounters();

  function badgeFor(href: string): number | null {
    if (href === '/objetivos') return counters.activeGoals || null;
    if (href === '/salud/habitos') return counters.pendingHabitsToday || null;
    return null;
  }

  return (
    <aside className="sticky top-4 hidden max-h-[calc(100vh-2rem)] w-60 shrink-0 flex-col overflow-y-auto rounded-3xl bg-white shadow-card lg:flex dark:bg-sand-900">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-clay-300 text-sm font-extrabold text-brand-800">
          V
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-extrabold leading-tight text-sand-900 dark:text-sand-100">Vida</span>
          <span className="block truncate text-xs text-sand-500">Panel personal</span>
        </span>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 px-3 pb-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item, pathname);
            const theme = ACCENTS[item.accent];
            const Icon = item.icon;
            const badge = badgeFor(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active && !item.children ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[44px] items-center gap-2.5 rounded-2xl px-2 text-sm transition-colors',
                    active
                      ? cn('font-extrabold', item.accent === 'neutral' ? 'bg-sand-100 text-sand-900 dark:bg-sand-800 dark:text-sand-100' : theme.chip)
                      : 'font-semibold text-sand-700 hover:bg-sand-50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                      active ? 'bg-white/50 dark:bg-white/40' : theme.chip,
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {badge ? (
                    <span className="tabular rounded-full bg-brand-800 px-2 text-xs font-bold text-white">
                      {badge}
                    </span>
                  ) : null}
                </Link>

                {item.children && active ? (
                  <ul className="mb-2 ml-6 mt-1 space-y-0.5 border-l-2 border-sand-100 pl-2 dark:border-sand-800">
                    {item.children.map((child) => {
                      const childActive = isNavActive(child, pathname);
                      const ChildIcon = child.icon;
                      const childBadge = badgeFor(child.href);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={childActive ? 'page' : undefined}
                            className={cn(
                              'flex min-h-[40px] items-center gap-2 rounded-xl px-2.5 text-sm transition-colors',
                              childActive
                                ? cn('font-bold text-sand-900 dark:text-sand-100', theme.soft)
                                : 'text-sand-600 hover:bg-sand-50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100',
                            )}
                          >
                            <ChildIcon className={cn('h-4 w-4 shrink-0', theme.text)} aria-hidden="true" />
                            <span className="flex-1 truncate">{child.label}</span>
                            {childBadge ? (
                              <span className="tabular rounded-full bg-brand-800 px-2 text-xs font-bold text-white">
                                {childBadge}
                              </span>
                            ) : null}
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

      <div className="border-t border-sand-100 p-4 dark:border-sand-800">
        <AppearanceControls />
        <div className="mt-3 flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand-100 text-[11px] font-medium text-sand-600 dark:bg-sand-800 dark:text-sand-300">
            {email.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-sand-600 dark:text-sand-400">
            {email}
          </span>
          <Link
            href="/configuracion"
            aria-label="Ajustes"
            className="rounded-md p-1 text-sand-400 hover:bg-sand-100 hover:text-sand-700 dark:hover:bg-sand-800"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </Link>
          <SignOutButton compact />
        </div>
      </div>
    </aside>
  );
}

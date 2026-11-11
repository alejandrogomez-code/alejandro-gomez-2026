'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCENTS } from '@/lib/accents';
import { useSidebarCounters } from '@/hooks/useSidebarCounters';
import { NAV_ITEMS } from './nav-items';
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
          <span className="block truncate text-xs text-sand-400">Espacio personal</span>
        </span>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 px-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.match);
            const Icon = item.icon;
            const badge = badgeFor(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[44px] items-center gap-2.5 rounded-2xl px-3 text-sm transition-colors',
                    active
                      ? 'bg-brand-800 font-bold text-white dark:bg-brand-300 dark:text-brand-900'
                      : 'font-semibold text-sand-700 hover:bg-sand-50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {badge ? (
                    <span className="tabular rounded-full bg-clay-300 px-2 text-xs font-bold text-brand-800">
                      {badge}
                    </span>
                  ) : null}
                </Link>

                {item.children ? (
                  <>
                    <p className="mb-1 mt-4 px-3 text-[11px] font-extrabold uppercase tracking-wider text-sand-500">
                      {item.label}
                    </p>
                    <ul className="space-y-0.5">
                      {item.children.map((child) => {
                        const childActive = pathname.startsWith(child.match);
                        const ChildIcon = child.icon;
                        const childBadge = badgeFor(child.href);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={childActive ? 'page' : undefined}
                              className={cn(
                                'flex min-h-[44px] items-center gap-2.5 rounded-2xl px-3 text-sm transition-colors',
                                childActive
                                  ? 'bg-brand-800 font-bold text-white dark:bg-brand-300 dark:text-brand-900'
                                  : 'text-sand-700 hover:bg-sand-50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100',
                              )}
                            >
                              <ChildIcon
                                className={cn(
                                  'h-4 w-4 shrink-0',
                                  childActive ? '' : ACCENTS[child.accent].text,
                                )}
                                aria-hidden="true"
                              />
                              <span className="flex-1 truncate">{child.label}</span>
                              {childBadge ? (
                                <span className="tabular rounded-full bg-ocean-300 px-2 text-xs font-bold text-brand-800">
                                  {childBadge}
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </>
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

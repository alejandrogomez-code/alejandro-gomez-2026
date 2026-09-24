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
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sand-200 bg-white lg:flex dark:border-sand-800 dark:bg-sand-900">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-medium text-white">
          V
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-sand-900 dark:text-sand-100">Vida</span>
          <span className="block truncate text-xs text-sand-400">Espacio personal</span>
        </span>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 px-2">
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
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                    active
                      ? 'bg-brand-50 font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-200'
                      : 'text-sand-600 hover:bg-sand-50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {badge ? (
                    <span className="tabular rounded-full bg-sand-100 px-1.5 text-xs text-sand-600 dark:bg-sand-800 dark:text-sand-300">
                      {badge}
                    </span>
                  ) : null}
                </Link>

                {item.children ? (
                  <>
                    <p className="mb-1 mt-3 px-2.5 text-[11px] uppercase tracking-wider text-sand-400">
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
                                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                                childActive
                                  ? 'bg-brand-50 font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-200'
                                  : 'text-sand-600 hover:bg-sand-50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100',
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
                                <span className="tabular rounded-full bg-sand-100 px-1.5 text-xs text-sand-600 dark:bg-sand-800 dark:text-sand-300">
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

      <div className="border-t border-sand-200 p-3 dark:border-sand-800">
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

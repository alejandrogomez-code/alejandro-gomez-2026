'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './nav-items';
import { SignOutButton } from './SignOutButton';

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-neutral-200/70 bg-white lg:flex lg:flex-col dark:border-neutral-800 dark:bg-neutral-900">
      <div className="px-6 py-7">
        <p className="text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
          Vida
        </p>
        <p className="mt-0.5 truncate text-xs text-neutral-400">{email}</p>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 px-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.match);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>

                {item.children && active ? (
                  <ul className="mb-2 ml-7 mt-1 space-y-0.5 border-l border-neutral-200 pl-3 dark:border-neutral-800">
                    {item.children.map((child) => {
                      const childActive = pathname.startsWith(child.match);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={childActive ? 'page' : undefined}
                            className={cn(
                              'block rounded-md px-2 py-1.5 text-sm transition-colors',
                              childActive
                                ? 'font-medium text-neutral-900 dark:text-neutral-100'
                                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
                            )}
                          >
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

      <div className="border-t border-neutral-100 p-3 dark:border-neutral-800">
        <SignOutButton />
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { NAV_ITEMS } from './nav-items';

function currentTitle(pathname: string): string {
  for (const item of NAV_ITEMS) {
    if (item.children) {
      const child = item.children.find((entry) => pathname.startsWith(entry.match));
      if (child) return `${item.label} · ${child.label}`;
    }
    if (pathname.startsWith(item.match)) return item.label;
  }
  return 'Vida';
}

export function MobileHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200/70 bg-white/90 px-4 py-3 backdrop-blur lg:hidden dark:border-neutral-800 dark:bg-neutral-950/90">
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {currentTitle(pathname)}
      </p>
      <Link
        href="/configuracion"
        aria-label="Ajustes"
        className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
      >
        <Settings className="h-4 w-4" aria-hidden="true" />
      </Link>
    </header>
  );
}

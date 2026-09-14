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
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-mist-200/70 bg-white/90 px-4 py-3 backdrop-blur lg:hidden dark:border-mist-800 dark:bg-mist-950/90">
      <p className="text-sm font-medium text-mist-900 dark:text-mist-100">
        {currentTitle(pathname)}
      </p>
      <Link
        href="/configuracion"
        aria-label="Ajustes"
        className="rounded-lg p-1.5 text-mist-500 hover:bg-mist-100 dark:text-mist-400 dark:hover:bg-mist-800"
      >
        <Settings className="h-4 w-4" aria-hidden="true" />
      </Link>
    </header>
  );
}

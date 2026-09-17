'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCENTS, type Accent } from '@/lib/accents';
import { NAV_ITEMS } from './nav-items';

function currentSection(pathname: string): { title: string; accent: Accent } {
  for (const item of NAV_ITEMS) {
    if (item.children) {
      const child = item.children.find((entry) => pathname.startsWith(entry.match));
      if (child) return { title: `${item.label} · ${child.label}`, accent: child.accent };
    }
    if (pathname.startsWith(item.match)) return { title: item.label, accent: item.accent };
  }
  return { title: 'Vida', accent: 'neutral' };
}

export function MobileHeader() {
  const pathname = usePathname();
  const section = currentSection(pathname);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-mist-200/70 bg-white/90 px-4 py-3 backdrop-blur lg:hidden dark:border-mist-800 dark:bg-mist-950/90">
      <p className="flex items-center gap-2 text-sm font-medium text-mist-900 dark:text-mist-100">
        <span className={cn('h-2.5 w-2.5 rounded-full', ACCENTS[section.accent].dot)} aria-hidden="true" />
        {section.title}
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

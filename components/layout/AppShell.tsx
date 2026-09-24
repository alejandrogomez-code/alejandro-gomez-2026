'use client';

import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';

export function AppShell({ email, children }: { email: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-sand-50 dark:bg-sand-950">
      <Sidebar email={email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

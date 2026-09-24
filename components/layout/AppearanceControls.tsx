'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';
import type { FontSize, ThemePreference } from '@/types/database';

const THEMES: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Tema claro', icon: Sun },
  { value: 'dark', label: 'Tema oscuro', icon: Moon },
  { value: 'system', label: 'Según el sistema', icon: Monitor },
];

const FONT_SIZES: { value: FontSize; label: string; className: string }[] = [
  { value: 'small', label: 'Fuente pequeña', className: 'text-[11px]' },
  { value: 'normal', label: 'Fuente normal', className: 'text-[13px]' },
  { value: 'large', label: 'Fuente grande', className: 'text-[15px]' },
];

/** Tema y tamaño de fuente al pie del menú, siempre a mano. */
export function AppearanceControls() {
  const { theme, fontSize, setTheme, setFontSize } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-lg border border-sand-200 p-0.5 dark:border-sand-800">
        {THEMES.map((option) => {
          const Icon = option.icon;
          const active = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-label={option.label}
              aria-pressed={active}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                active
                  ? 'bg-sand-100 text-sand-800 dark:bg-sand-800 dark:text-sand-100'
                  : 'text-sand-400 hover:text-sand-700 dark:hover:text-sand-200',
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="flex items-baseline gap-1 rounded-lg border border-sand-200 px-2 py-1 dark:border-sand-800">
        {FONT_SIZES.map((option) => {
          const active = fontSize === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFontSize(option.value)}
              aria-label={option.label}
              aria-pressed={active}
              className={cn(
                'leading-none transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                option.className,
                active
                  ? 'font-medium text-brand-600 dark:text-brand-200'
                  : 'text-sand-400 hover:text-sand-700 dark:hover:text-sand-200',
              )}
            >
              A
            </button>
          );
        })}
      </div>
    </div>
  );
}

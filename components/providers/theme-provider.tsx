'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { FontSize, ThemePreference } from '@/types/database';
import { useProfileContext } from './profile-provider';

interface ThemeContextValue {
  theme: ThemePreference;
  fontSize: FontSize;
  setTheme: (theme: ThemePreference) => void;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = 'vida.theme';
const FONT_KEY = 'vida.fontSize';

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.classList.toggle('dark', dark);
}

function applyFontSize(size: FontSize) {
  const root = document.documentElement;
  root.classList.remove('font-small', 'font-normal', 'font-large');
  root.classList.add(`font-${size}`);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useProfileContext();
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');

  // El perfil es la fuente de verdad; localStorage solo evita el parpadeo.
  useEffect(() => {
    if (!profile) return;
    setThemeState(profile.theme);
    setFontSizeState(profile.font_size);
    applyTheme(profile.theme);
    applyFontSize(profile.font_size);
    window.localStorage.setItem(THEME_KEY, profile.theme);
    window.localStorage.setItem(FONT_KEY, profile.font_size);
  }, [profile]);

  // Seguir al sistema en tiempo real cuando el modo es automático.
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme('system');
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = useCallback(
    (next: ThemePreference) => {
      setThemeState(next);
      applyTheme(next);
      window.localStorage.setItem(THEME_KEY, next);
      void updateProfile({ theme: next }).catch(() => undefined);
    },
    [updateProfile],
  );

  const setFontSize = useCallback(
    (next: FontSize) => {
      setFontSizeState(next);
      applyFontSize(next);
      window.localStorage.setItem(FONT_KEY, next);
      void updateProfile({ font_size: next }).catch(() => undefined);
    },
    [updateProfile],
  );

  const value = useMemo(
    () => ({ theme, fontSize, setTheme, setFontSize }),
    [theme, fontSize, setTheme, setFontSize],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
}

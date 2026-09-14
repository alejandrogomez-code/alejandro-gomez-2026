import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Vida · Panel personal',
  description: 'Objetivos, hábitos y salud en un solo lugar.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0f3f7' },
    { media: '(prefers-color-scheme: dark)', color: '#13161b' },
  ],
};

/**
 * Aplica tema y tamaño de fuente antes del primer pintado para evitar
 * el parpadeo de modo claro/oscuro.
 */
const themeScript = `
(function () {
  try {
    var theme = localStorage.getItem('vida.theme') || 'system';
    var font = localStorage.getItem('vida.fontSize') || 'normal';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.remove('font-small', 'font-normal', 'font-large');
    document.documentElement.classList.add('font-' + font);
  } catch (error) {
    document.documentElement.classList.add('font-normal');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

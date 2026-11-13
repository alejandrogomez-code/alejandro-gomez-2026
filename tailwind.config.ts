import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Neutros con un toque lila: el fondo nunca es blanco puro y las
        // tarjetas blancas se despegan sin necesitar sombra.
        sand: {
          50: '#f4f1ff',
          100: '#ece8f8',
          200: '#e0daf0',
          300: '#cfc8e3',
          400: '#8f88a8',
          500: '#6b6487',
          600: '#5a4f78',
          700: '#453c63',
          800: '#2f2848',
          900: '#1e1537',
          950: '#140e26',
        },
        // Violeta profundo: el color de acción de toda la app.
        brand: {
          50: '#f1edff',
          100: '#e4ddff',
          200: '#cfc5f2',
          300: '#b9a4ff',
          400: '#7a62d9',
          500: '#4a2fb5',
          600: '#3a2491',
          700: '#2e1c74',
          800: '#24164f',
          900: '#1a1040',
        },
        // Amarillo sol.
        amber: {
          50: '#fff6d9',
          100: '#ffe8a8',
          200: '#ffd978',
          300: '#ffc94d',
          400: '#f5b524',
          500: '#9a6500',
          600: '#7a4b00',
          700: '#643d00',
          800: '#4f3000',
          900: '#3d2500',
        },
        // Coral.
        clay: {
          50: '#fff1ea',
          100: '#ffdccd',
          200: '#ffc1ac',
          300: '#ff9474',
          400: '#f2704a',
          500: '#c2410c',
          600: '#9a330a',
          700: '#7a2909',
          800: '#5f2008',
          900: '#4a1a07',
        },
        // Turquesa (menta).
        ocean: {
          50: '#e8faf6',
          100: '#c9f5ec',
          200: '#9eeadb',
          300: '#5fd4c0',
          400: '#2fb8a2',
          500: '#16806f',
          600: '#11695b',
          700: '#0f564b',
          800: '#0d4840',
          900: '#0b3b35',
        },
        // Verde lima: Economía y Finanzas.
        leaf: {
          50: '#effbe6',
          100: '#dcf5c8',
          200: '#c2ec9c',
          300: '#a3e06a',
          400: '#7cc63d',
          500: '#3f7d14',
          600: '#336610',
          700: '#29520e',
          800: '#21420c',
          900: '#1a350a',
        },
        // Lavanda.
        plum: {
          50: '#f4eeff',
          100: '#e9e0ff',
          200: '#d9cbff',
          300: '#b9a4ff',
          400: '#9b82f0',
          500: '#6b4fe0',
          600: '#5638c4',
          700: '#452c9e',
          800: '#37237d',
          900: '#2b1c61',
        },
      },
      boxShadow: {
        card: '0 2px 0 0 rgb(36 22 79 / 0.05)',
        float: '0 8px 30px -12px rgb(15 23 42 / 0.18)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};

export default config;

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
        // Cada área de la app tiene su color: pasos y cumplimiento en verde,
        // peso en azul, hábitos en dorado, objetivos en violeta.
        sage: {
          50: '#f1f6f4',
          100: '#dcebe6',
          200: '#bbd7ce',
          300: '#92bcaf',
          400: '#679c8c',
          500: '#4c7c6f',
          600: '#3b6458',
          700: '#325047',
          800: '#2b413a',
          900: '#253632',
        },
        ocean: {
          50: '#f1f5fa',
          100: '#dde8f2',
          200: '#bed3e7',
          300: '#93b5d3',
          400: '#6493ba',
          500: '#41739e',
          600: '#335c80',
          700: '#2b4a67',
          800: '#273e55',
          900: '#233549',
        },
        honey: {
          50: '#faf6ed',
          100: '#f3e9d1',
          200: '#e6d3a5',
          300: '#d4b671',
          400: '#c29a4b',
          500: '#a8813a',
          600: '#8a672f',
          700: '#6e5029',
          800: '#5b4227',
          900: '#4d3823',
        },
        plum: {
          50: '#f6f4fa',
          100: '#ebe7f4',
          200: '#d9d2ea',
          300: '#bdb0da',
          400: '#9c89c5',
          500: '#7f68ad',
          600: '#6a5292',
          700: '#584477',
          800: '#4a3b63',
          900: '#3f3353',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04)',
        float: '0 8px 30px -12px rgb(15 23 42 / 0.18)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
    },
  },
  plugins: [],
};

export default config;

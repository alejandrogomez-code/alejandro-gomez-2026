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
        // Neutro con un toque índigo: el lienzo tiene temperatura propia y el
        // modo oscuro es azul noche en vez de gris plano.
        mist: {
          50: '#f3f5fb',
          100: '#e9edf7',
          200: '#dce2f0',
          300: '#c1c9de',
          400: '#929cb8',
          500: '#687393',
          600: '#4f5977',
          700: '#3a425e',
          800: '#272d45',
          900: '#191d31',
          950: '#0f1224',
        },
        // Cada área de la app tiene su color, ahora con saturación plena:
        // pasos y cumplimiento en esmeralda, peso en azul, hábitos en ámbar,
        // objetivos en violeta y proyectos en coral.
        sage: {
          50: '#ebfbf4',
          100: '#cff5e3',
          200: '#a0eacb',
          300: '#63d8ab',
          400: '#2cbf88',
          500: '#10a472',
          600: '#07845d',
          700: '#08694c',
          800: '#0b533e',
          900: '#0b4434',
        },
        ocean: {
          50: '#eef4ff',
          100: '#dbe7ff',
          200: '#bfd4ff',
          300: '#93b4ff',
          400: '#6390ff',
          500: '#3d6bf5',
          600: '#2c52e0',
          700: '#2541b6',
          800: '#233a8f',
          900: '#223472',
        },
        honey: {
          50: '#fff8eb',
          100: '#ffeec9',
          200: '#ffdb8e',
          300: '#ffc352',
          400: '#ffab2b',
          500: '#f08c0c',
          600: '#d06a06',
          700: '#a84d0a',
          800: '#883d0f',
          900: '#703311',
        },
        plum: {
          50: '#f5f2ff',
          100: '#ece6ff',
          200: '#dbd0ff',
          300: '#c1abff',
          400: '#a27dfc',
          500: '#8855f5',
          600: '#7838e8',
          700: '#652ccb',
          800: '#5427a5',
          900: '#452285',
        },
        coral: {
          50: '#fff1f2',
          100: '#ffe1e5',
          200: '#ffc7d0',
          300: '#ff9daf',
          400: '#fe6887',
          500: '#f43d65',
          600: '#e01c50',
          700: '#bd1143',
          800: '#9e1240',
          900: '#87133d',
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

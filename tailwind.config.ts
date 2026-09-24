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
        // Lienzo cálido tipo papel: el fondo nunca es blanco puro y las
        // tarjetas blancas se despegan sin necesitar sombra.
        sand: {
          50: '#f7f5f1',
          100: '#f2efe9',
          200: '#e7e3db',
          300: '#dcd7cd',
          400: '#a09a90',
          500: '#8a857c',
          600: '#6b6259',
          700: '#55514a',
          800: '#33302d',
          900: '#232120',
          950: '#1a1917',
        },
        // Verde profundo: el único color de acción de toda la app.
        brand: {
          50: '#e6f0ec',
          100: '#d3e5df',
          200: '#aecfc5',
          300: '#7fb3a5',
          400: '#3f8c78',
          500: '#0f6b5a',
          600: '#0f5a4c',
          700: '#0d4a3f',
          800: '#0d3c34',
          900: '#0b312b',
        },
        // Colores de estado, no decorativos.
        amber: {
          50: '#fdf0dc',
          100: '#f9e3c0',
          200: '#efc98c',
          300: '#e0a94f',
          400: '#d99425',
          500: '#b4741a',
          600: '#8a5a0e',
          700: '#6f480c',
          800: '#5a3b0b',
          900: '#4a3109',
        },
        clay: {
          50: '#fdecea',
          100: '#f8d6d1',
          200: '#f0b0a7',
          300: '#e08679',
          400: '#cc5c4c',
          500: '#a3372b',
          600: '#8a2d22',
          700: '#72251c',
          800: '#5d1f18',
          900: '#4d1a14',
        },
        // Tintes suaves para los chips de icono de las filas.
        ocean: {
          50: '#eaf1f7',
          100: '#d7e5f0',
          200: '#b4cde1',
          300: '#85adca',
          400: '#5688ad',
          500: '#2c5a7d',
          600: '#244a68',
          700: '#1f3e57',
          800: '#1d3549',
          900: '#1b2d3d',
        },
        plum: {
          50: '#f3eff7',
          100: '#e8e1f0',
          200: '#d2c6e2',
          300: '#b3a2ce',
          400: '#8e78b3',
          500: '#6e5b96',
          600: '#5b4a7d',
          700: '#4c3e68',
          800: '#413558',
          900: '#372d4a',
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

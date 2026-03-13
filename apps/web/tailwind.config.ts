import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4f3',
          100: '#fce7e4',
          200: '#fad3ce',
          300: '#f5b3aa',
          400: '#ec8578',
          500: '#df604f',
          600: '#cb4534',
          700: '#aa3728',
          800: '#8d3125',
          900: '#762e25',
          950: '#40140f',
        },
        secondary: {
          50: '#f8f7f4',
          100: '#efede5',
          200: '#ded9cb',
          300: '#c9c0aa',
          400: '#b3a388',
          500: '#a3906f',
          600: '#968063',
          700: '#7d6953',
          800: '#665647',
          900: '#54483c',
          950: '#2d251f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        script: ['Great Vibes', 'cursive'],
      },
    },
  },
  plugins: [],
};

export default config;

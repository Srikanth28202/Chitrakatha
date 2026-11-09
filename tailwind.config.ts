import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg-canvas)',
        foreground: 'var(--color-text-main)',
        canvas: {
          DEFAULT: '#FDFBF7',
          warm: '#FAF6F0',
          paper: '#F4EFEA',
          card: '#FFFFFF',
        },
        sage: {
          50: '#F4F6F4',
          100: '#E8ECE8',
          200: '#D2DBD3',
          500: '#7D9080',
          600: '#5E7160',
          700: '#4A5B4C',
          800: '#38453A',
        },
        rose: {
          50: '#FAF4F4',
          100: '#F3E8E7',
          200: '#E4CFCE',
          500: '#C79A98',
          600: '#B87D7B',
          700: '#935A58',
        },
        terracotta: {
          50: '#FAF0EB',
          100: '#F5E3DC',
          200: '#ECC5B6',
          500: '#DF795C',
          600: '#C86446',
          700: '#9D4A32',
          800: '#7B3824',
        },
        espresso: {
          DEFAULT: '#231B15',
          dark: '#1C1611',
          main: '#2E231C',
          muted: '#635449',
          soft: '#8C7A6E',
          faint: '#B8ABA0',
        },
        border: {
          DEFAULT: '#E6DDD4',
          subtle: '#EFE8E1',
          strong: '#D5C7BA',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Rozha One', 'Cormorant Garamond', 'Georgia', 'serif'],
        kannada: ['var(--font-kannada)', 'Noto Serif Kannada', 'Anek Kannada', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 2px 10px rgba(35, 27, 21, 0.03)',
        card: '0 4px 20px -2px rgba(35, 27, 21, 0.05)',
        elevated: '0 12px 36px -4px rgba(35, 27, 21, 0.08)',
        warm: '0 10px 30px -5px rgba(200, 100, 70, 0.12)',
      },
      borderRadius: {
        editorial: '2px',
        paper: '4px',
        warm: '8px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;


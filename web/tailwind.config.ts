import type { Config } from 'tailwindcss';

const config: Config = {
   darkMode: ['class'],
   content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './page-components/**/*.{js,ts,jsx,tsx,mdx}',
      './widgets/**/*.{js,ts,jsx,tsx,mdx}',
      './features/**/*.{js,ts,jsx,tsx,mdx}',
      './entities/**/*.{js,ts,jsx,tsx,mdx}',
      './shared/**/*.{js,ts,jsx,tsx,mdx}',
   ],
   theme: {
      extend: {
         colors: {
            background: 'var(--background)',
            foreground: 'var(--foreground)',
            card: {
               DEFAULT: 'var(--card)',
               foreground: 'var(--card-foreground)',
            },
            popover: {
               DEFAULT: 'var(--popover)',
               foreground: 'var(--popover-foreground)',
            },
            primary: {
               DEFAULT: 'var(--primary)',
               foreground: 'var(--primary-foreground)',
            },
            secondary: {
               DEFAULT: 'var(--secondary)',
               foreground: 'var(--secondary-foreground)',
            },
            muted: {
               DEFAULT: 'hsl(var(--muted))',
               foreground: 'var(--muted-foreground)',
            },
            accent: {
               DEFAULT: 'var(--accent)',
               foreground: 'var(--accent-foreground)',
            },
            destructive: {
               DEFAULT: 'var(--destructive)',
               foreground: 'var(--destructive-foreground)',
            },
            border: 'var(--border)',
            input: 'var(--input)',
            ring: 'var(--ring)',
            chart: {
               '1': 'var(--chart-1)',
               '2': 'var(--chart-2)',
               '3': 'var(--chart-3)',
               '4': 'var(--chart-4)',
               '5': 'var(--chart-5)',
            },
            // ── Brand palette ──────────────────────────────────────────
            // Use these directly in components: bg-brand, text-brand,
            // border-brand, hover:bg-brand-hover, bg-navy, etc.
            brand: {
               DEFAULT: '#FE6702',
               hover: '#FF7E1F',
               dark: '#E55A00',
               light: '#FF944D',
            },
            navy: {
               DEFAULT: '#06275B',
               light: '#0D3A82',
               dark: '#041B40',
            },
         },
         borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)',
         },
         fontFamily: {
            // Loaded via next/font/google in app/layout.tsx
            display: ['var(--font-barlow)', 'sans-serif'],
            sans: ['var(--font-inter)', 'sans-serif'],
         },
         animation: {
            'pulse-glow': 'pulse-glow 2s infinite',
            'bounce-subtle': 'bounce-subtle 3s ease-in-out infinite',
            shimmer: 'shimmer 2s infinite',
            'fade-in': 'fadeIn 0.5s ease-in',
            'slide-in': 'slideIn 0.5s ease-out',
         },
         keyframes: {
            'pulse-glow': {
               '0%, 100%': {
                  opacity: '1',
                  boxShadow: '0 0 0 0 rgba(254, 103, 2, 0.7)',
               },
               '50%': {
                  opacity: '0.8',
                  boxShadow: '0 0 0 8px rgba(254, 103, 2, 0)',
               },
            },
            'bounce-subtle': {
               '0%, 100%': {
                  transform: 'translateY(0)',
               },
               '50%': {
                  transform: 'translateY(-10px)',
               },
            },
            shimmer: {
               '0%': {
                  backgroundPosition: '-1000px 0',
               },
               '100%': {
                  backgroundPosition: '1000px 0',
               },
            },
            fadeIn: {
               from: {
                  opacity: '0',
               },
               to: {
                  opacity: '1',
               },
            },
            slideIn: {
               from: {
                  transform: 'translateY(1rem)',
                  opacity: '0',
               },
               to: {
                  transform: 'translateY(0)',
                  opacity: '1',
               },
            },
         },
         backgroundImage: {
            'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            'gradient-conic':
               'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            'field-pattern':
               'linear-gradient(rgba(254, 103, 2, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(254, 103, 2, 0.05) 1px, transparent 1px)',
         },
         backdropBlur: {
            xs: '2px',
            strong: '24px',
         },
      },
   },
   plugins: [require('tailwindcss-animate')],
};

export default config;

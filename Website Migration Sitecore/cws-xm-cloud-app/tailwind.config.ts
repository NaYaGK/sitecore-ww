import type { Config } from 'tailwindcss';
import animatePlugin from 'tailwindcss-animate';
import typographyPlugin from '@tailwindcss/typography';

// "Decoloring" prose
const proseVars = [
  '--tw-prose-body',
  '--tw-prose-headings',
  '--tw-prose-lead',
  '--tw-prose-bold',
  '--tw-prose-counters',
  '--tw-prose-bullets',
  '--tw-prose-hr',
  '--tw-prose-quotes',
  '--tw-prose-quote-borders',
  '--tw-prose-captions',
  '--tw-prose-kbd',
  '--tw-prose-kbd-shadows',
  '--tw-prose-code',
  '--tw-prose-pre-code',
  '--tw-prose-pre-bg',
  '--tw-prose-th-borders',
  '--tw-prose-td-borders',
];

// NOTE: Brand switching is now handled via CSS variables in tokens.css using [data-brand="..."] attribute.
// See src/assets/styles/tokens.css

export default {
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--color-brand-primary)',
          destructive: 'var(--color-brand-destructive)',
          yellow: 'var(--color-brand-yellow)',
          'text-red': 'var(--color-brand-text-red)',
        },
        accent: {
          DEFAULT: 'var(--color-accent-primary)',
          hover: 'var(--color-accent-hover)',
          soft: 'var(--color-accent-soft)',
          medium: 'var(--color-accent-medium)',
          red: 'var(--color-accent-red)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
          link: 'var(--color-text-link)',
          'link-hover': 'var(--color-text-link-hover)',
        },
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          muted: 'var(--color-bg-muted)',
          dark: 'var(--color-bg-dark)',
          'comparison-left': 'var(--color-bg-comparison-left)',
          'comparison-right': 'var(--color-bg-comparison-right)',
        },
        border: {
          DEFAULT: 'var(--color-border-default)',
          light: 'var(--color-border-light)',
          dark: 'var(--color-border-dark)',
        },
      },
      fontFamily: {
        sans: ['Suisse Intl', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['Suisse Intl', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['Suisse Intl', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontWeight: {
        // font-bold -> Suisse Intl Bold
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'expand-content': 'expand-content 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      aspectRatio: {
        '560/356': '560/356',
        '280/196': '280/196',
        '280/356': '280/356',
        '670/356': '670/356',
      },
      backgroundImage: {
        'img-primary':
          'linear-gradient(to bottom, hsla(var(--colors-primary) / 90%), hsla(var(--colors-primary) / 60%)), var(--bg-img, url("/placeholder.svg"))',
        'img-secondary':
          'linear-gradient(to bottom, hsla(var(--colors-secondary) / 90%), hsla(var(--colors-secondary) / 60%)), var(--bg-img, url("/placeholder.svg"))',
        'img-muted':
          'linear-gradient(to bottom, hsla(var(--colors-muted) / 90%), hsla(var(--colors-muted) / 60%)), var(--bg-img, url("/placeholder.svg"))',
        'img-dark':
          'linear-gradient(to bottom, hsla(var(--colors-foreground) / 90%), hsla(var(--colors-foreground) / 60%)), var(--bg-img, url("/placeholder.svg"))',
        'img-light':
          'linear-gradient(to bottom, hsla(var(--colors-background) / 90%), hsla(var(--colors-background) / 60%)), var(--bg-img, url("/placeholder.svg"))',
        'img-accent':
          'linear-gradient(to bottom, hsla(var(--colors-accent) / 80%), hsla(var(--colors-accent) / 60%)), var(--bg-img, url("/placeholder.svg"))',
      },
      blur: {
        none: 'var(--blur-none)',
        sm: 'var(--blur-sm)',
        default: 'var(--blur-default)',
        md: 'var(--blur-md)',
        lg: 'var(--blur-lg)',
        xl: 'var(--blur-xl)',
        '2xl': 'var(--blur-2xl)',
        '3xl': 'var(--blur-3xl)',
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        default: 'var(--radius-base)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },
      containers: {
        xs: '400px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'expand-content': {
          '0%': {
            opacity: '0',
            maxHeight: '0',
          },
          '40%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
            maxHeight: '500px',
          },
        },
      },
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-links': theme('colors.brand.DEFAULT'),
            ...proseVars.reduce((acc, key) => ({ ...acc, [key]: 'inherit' }), {}),
            h1: {
              fontSize: theme('fontSize.5xl'),
              fontWeight: 'normal',
              '@screen md': {
                fontSize: theme('fontSize.6xl'),
              },
            },

            h2: {
              fontSize: '1.875rem', // 30px
              '@screen lg': {
                fontSize: '2.1875rem', // 35px
              },
              '@screen xl': {
                fontSize: '2.5rem', // 40px
              },
              '@screen 2xl': {
                fontSize: '3.625rem', // 58px
              },
            },
            h3: {
              fontSize: '1.5rem', // 24px
              '@screen lg': {
                fontSize: '1.75rem', // 28px
              },
              '@screen xl': {
                fontSize: '1.875rem', // 30px
              },
              '@screen 2xl': {
                fontSize: '2.75rem', // 44px
              },
            },
            h4: {
              fontSize: '1.25rem', // 20px
              fontWeight: 'normal',
              '@screen lg': {
                fontSize: '1.375rem', // 22px
              },
              '@screen xl': {
                fontSize: '1.5rem', // 24px
              },
              '@screen 2xl': {
                fontSize: '1.75rem', // 28px
              },
            },
          },
        },
      }),
      zIndex: {
        '-z-1': '-1',
      },
    },
  },
  plugins: [
    animatePlugin,
    typographyPlugin,
    // Custom plugin for heading utilities
    function({ addUtilities }: { addUtilities: (utilities: any) => void }) {
      addUtilities({
        '.font-heading-h1': {
          fontFamily: "'Suisse Intl', 'Helvetica Neue', Arial, sans-serif",
          fontSize: '32px',
          lineHeight: '38px',
          fontWeight: '700',
          marginTop: '0px',
          marginBottom: '30px',
          '@media (min-width: 1024px)': {
            fontSize: '44px',
            lineHeight: '48px',
          },
          '@media (min-width: 1280px)': {
            fontSize: '58px',
            lineHeight: '64px',

          },
          '@media (min-width: 1920px)': {
            fontSize: '75px',
            lineHeight: '85px',
          },
        },
        '.font-heading-h2': {
          fontFamily: "'Suisse Intl', 'Helvetica Neue', Arial, sans-serif",
          fontSize: '30px',
          lineHeight: '36px',
          marginBottom: '30px',
          marginTop: '0px',
          fontWeight: '700',
          '@media (min-width: 1024px)': {
            fontSize: '35px',
            lineHeight: '40px',
            marginBottom: '38px',
          },
          '@media (min-width: 1280px)': {
            fontSize: '40px',
            lineHeight: '48px',

          },
          '@media (min-width: 1920px)': {
            fontSize: '58px',
            lineHeight: '64px',
            marginBottom: '38px',
          },
        },
        '.font-heading-h3': {
          fontFamily: "'Suisse Intl', 'Helvetica Neue', Arial, sans-serif",
          fontSize: '24px',
          lineHeight: '32px',
          marginTop: '0px',
          marginBottom: '16px',
          fontWeight: '700',
          '@media (min-width: 1024px)': {
            fontSize: '28px',
            lineHeight: '34px',
            marginBottom: '28px',
          },
          '@media (min-width: 1280px)': {
            fontSize: '30px',
            lineHeight: '36px',
            marginBottom: '30px',
          },
          '@media (min-width: 1920px)': {
            fontSize: '44px',
            lineHeight: '48px',
            marginBottom: '44px',
          },
        },
        '.font-heading-h4': {
          fontFamily: "'Suisse Intl', 'Helvetica Neue', Arial, sans-serif",
          fontSize: '20px',
          lineHeight: '26px',
          fontWeight: '700',
          marginTop: '0px',
          '@media (min-width: 1024px)': {
            fontSize: '22px',
            lineHeight: '28px',
          },
          '@media (min-width: 1280px)': {
            fontSize: '24px',
            lineHeight: '30px',
          },
          '@media (min-width: 1920px)': {
            fontSize: '28px',
            lineHeight: '32px',
          },
        },
        '.font-heading-h5': {
          fontFamily: "'Suisse Intl', 'Helvetica Neue', Arial, sans-serif",
          fontSize: '18px',
          lineHeight: '26px',
          fontWeight: '700',
          marginTop: '0px',
            '@media (min-width: 1024px)': {
            fontSize: '18px',
            lineHeight: '26px',
          },
          '@media (min-width: 1280px)': {
            fontSize: '20px',
            lineHeight: '26px',
          },
          '@media (min-width: 1920px)': {
            fontSize: '22px',
            lineHeight: '28px',
          },
        },
        '.font-heading-h6': {
          fontFamily: "'Suisse Intl', 'Helvetica Neue', Arial, sans-serif",
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: '700',
          marginTop: '0px',
          '@media (min-width: 1024px)': {
            fontSize: '20px',
            lineHeight: '28px',
          },
        },
      });
    },
  ],
} satisfies Config;

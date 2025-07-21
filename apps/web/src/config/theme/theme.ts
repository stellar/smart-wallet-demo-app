import defaultTheme from 'tailwindcss/defaultTheme'

export const THEME_STYLES = {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        accent: 'var(--color-accent)',
        accentBlack: 'var(--color-accent-black)',
        accentWhite: 'var(--color-accent-white)',
        accentMuted: 'var(--color-accent-muted)',
        text: 'var(--color-text)',
        textSecondary: 'var(--color-text-secondary)',
        foreground: 'var(--color-foreground-primary)',
        background: 'var(--color-background)',
        backgroundSecondary: 'var(--color-background-secondary)',
        backgroundTertiary: 'var(--color-background-tertiary)',
        borderPrimary: 'var(--color-border-primary)',
        borderSecondary: 'var(--color-border-secondary)',
        whitish: 'var(--color-whitish)',
        blackish: 'var(--color-blackish)',
        muted: 'var(--color-muted)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        sans: ['var(--font-family)', ...defaultTheme.fontFamily.sans],
        schabo: ['SCHABO-Condensed', 'sans-serif'],
      },
      fontSize: {
        xxxs: 'var(--font-size-xxxs)',
        xxs: 'var(--font-size-xxs)',
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        md: 'var(--font-size-md)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
        '8.5xl': '7rem',
      },
      fontWeight: {
        lighter: 'var(--font-weight-lighter)',
        extralight: 'var(--font-weight-extralight)',
        light: 'var(--font-weight-light)',
        regular: 'var(--font-weight-regular)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
        extrabold: 'var(--font-weight-extrabold)',
        bolder: 'var(--font-weight-bolder)',
      },
      lineHeight: {
        none: 'var(--line-height-none)',
        tight: 'var(--line-height-tight)',
        normal: 'var(--line-height-normal)',
        loose: 'var(--line-height-loose)',
      },
      borderRadius: {
        small: 'var(--border-radius-small)',
        default: 'var(--border-radius-default)',
        large: 'var(--border-radius-large)',
        full: 'var(--border-radius-full)',
      },
      keyframes: {
        'background-move': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 0%' },
        },
      },
      animation: {
        'background-move': 'background-move 60s linear infinite alternate',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwind-scrollbar-hide')],
}

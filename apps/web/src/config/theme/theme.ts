import defaultTheme from 'tailwindcss/defaultTheme'

export const THEME_STYLES = {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        text: 'var(--color-text)',
        background: 'var(--color-background)',
        whitish: 'var(--color-whitish)',
        blackish: 'var(--color-blackish)',
        accent: 'var(--color-accent)',
        muted: 'var(--color-muted)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        sans: ['var(--font-family)', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xxxs: 'var(--font-size-xxxs)',
        xxs: 'var(--font-size-xxs)',
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
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
    },
  },
  plugins: [],
}

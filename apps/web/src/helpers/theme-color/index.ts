import { THEME_COLORS } from 'src/constants/theme/colors'

export const setThemeColor = (color: keyof typeof THEME_COLORS) => {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', THEME_COLORS[color])
}

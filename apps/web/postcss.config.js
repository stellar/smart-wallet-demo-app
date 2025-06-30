import postcssGlobalData from '@csstools/postcss-global-data'
import autoprefixer from 'autoprefixer'
import Color from 'color'
import postcssCustomProperties from 'postcss-custom-properties'
import functions from 'postcss-functions'
import postcssNested from 'postcss-nested'
import tailwindcssNesting from 'tailwindcss/nesting/index.js'

import tailwindcss from 'tailwindcss'

const colorFunctions = {
  darken: (value, frac) => {
    const color = Color(value)
    const lightness = color.lightness()
    return color.lightness(lightness - frac * 100)
  },
  lighten: (value, frac) => {
    const color = Color(value)
    const lightness = color.lightness()
    return color.lightness(lightness + frac * 100)
  },
  alpha: (value, frac) => Color(value).alpha(frac).hsl(),
  saturate: (value, frac) => Color(value).saturate(frac),
}

export default {
  plugins: [
    postcssNested,
    tailwindcssNesting,
    tailwindcss,
    autoprefixer,
    postcssGlobalData({
      files: ['src/config/theme/css-variables.css'],
    }),
    postcssCustomProperties({
      preserve: false,
    }),
    functions({
      functions: colorFunctions,
    }),
  ],
}

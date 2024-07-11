import tailwind from 'tailwindcss'
import tailwindTypography from '@tailwindcss/typography'
import daisyui from 'daisyui'

export default {
  plugins: [
    tailwind({
      content: ['./.vitepress/theme/**/*.vue', './posts/**/*.md'],
      plugins: [tailwindTypography, daisyui],
      darkMode: 'class',
      daisyui: {
        darkTheme: 'light',
        themes: ['light']
      },
    })
  ]
}

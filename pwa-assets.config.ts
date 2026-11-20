import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

const background = '#111012'

export default defineConfig({
  images: ['public/logo.svg'],
  preset: {
    ...minimal2023Preset,
    apple: { ...minimal2023Preset.apple, resizeOptions: { background, fit: 'contain' } },
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background, fit: 'contain' } },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

// If your repo name is rock2000-data-site, Pages URL is /rock2000-data-site/
export default defineConfig({
  plugins: [react(), tailwind()],
  base: '/rock2000-data-site/',
})

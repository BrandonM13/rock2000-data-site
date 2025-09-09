import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  // For a project site at https://<you>.github.io/rock2000-data-site/
  base: '/rock2000-data-site/',
})

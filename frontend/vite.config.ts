import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: false,
    hmr: {
      host: 'localhost',
      port: 3000,
      protocol: 'ws',
    },
  },
  preview: {
    port: 3000,
  },
})

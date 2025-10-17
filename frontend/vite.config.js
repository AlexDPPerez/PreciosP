import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Tu servidor de Express
        changeOrigin: true,
        // Reescribe la petición para quitar /api del path
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  }
})

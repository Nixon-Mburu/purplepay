import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/activity/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3005,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3005,
    allowedHosts: ['localhost', 'activity_app', 'activity-app', 'frontend_gateway', 'frontend-gateway'],
  },
})

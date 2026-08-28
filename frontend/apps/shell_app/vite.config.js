import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
      '/auth': 'http://localhost:3001',
      '/orders': 'http://localhost:3002',
      '/pay': 'http://localhost:3003',
      '/wallet': 'http://localhost:3004',
      '/activity': 'http://localhost:3005',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['localhost', 'shell_app', 'shell-app', 'frontend_gateway', 'frontend-gateway'],
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/pay/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3003,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3003,
    allowedHosts: ['localhost', 'payments_app', 'payments-app', 'frontend_gateway', 'frontend-gateway'],
  },
})

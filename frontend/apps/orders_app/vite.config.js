import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/orders/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3002,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3002,
    allowedHosts: ['localhost', 'orders_app', 'orders-app', 'frontend_gateway', 'frontend-gateway'],
  },
})

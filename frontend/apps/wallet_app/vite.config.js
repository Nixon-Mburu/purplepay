import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/wallet/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3004,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3004,
    allowedHosts: ['localhost', 'wallet_app', 'wallet-app', 'frontend_gateway', 'frontend-gateway'],
  },
})

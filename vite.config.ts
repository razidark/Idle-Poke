import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: './react-version',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5182,
    // Loopback only by default — `host: true` would expose the dev server to
    // every device on the local network. Set HOST=0.0.0.0 to opt in.
    host: process.env.HOST || '127.0.0.1',
    strictPort: true
  }
})

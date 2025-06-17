import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },  server: {
    proxy: {
      '/api': {
        target: 'https://gittimetravel.onrender.com', // Your API server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }  ,
  define: {
    // Make environment variables available to the client code
    'process.env': {
      VITE_API_URL: JSON.stringify(process.env.VITE_API_URL || 'https://gittimetravel.onrender.com'),
    },
  }
})

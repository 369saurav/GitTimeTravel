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
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://gittimetravel.onrender.com', // Local during development
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
  // ,
  // define: {
  //   // Use the API URL from environment variables during production
  //   'process.env': {
  //     VITE_API_URL: JSON.stringify('https://gittimetravel.onrender.com'),
  //   },
  // }
})

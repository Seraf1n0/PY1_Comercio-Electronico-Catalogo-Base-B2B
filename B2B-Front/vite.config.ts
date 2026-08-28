import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: 'https://Seraf1n0.github.io/PY1_Comercio-Electronico-Catalogo-Base-B2B/',
})

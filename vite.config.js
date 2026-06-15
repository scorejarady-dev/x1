import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/x1/', // هذا السطر ضروري جداً لكي تعمل المسارات بشكل صحيح على GitHub Pages
})

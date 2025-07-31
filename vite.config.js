import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Cấu hình base để đảm bảo đường dẫn đúng khi build cho Electron
  base: './', 
})

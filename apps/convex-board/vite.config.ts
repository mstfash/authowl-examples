import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 5174 so this can run next to the blog example (5173) at the same time.
  server: { port: 5174 },
});

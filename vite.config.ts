import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-three': ['@react-three/fiber', '@react-three/drei', '@react-three/rapier'],
          'three': ['three']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@react-three/fiber', '@react-three/drei', '@react-three/rapier', 'three']
  }
});

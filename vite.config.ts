
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Plugin para copiar archivos necesarios a la carpeta dist
const copyAssets = () => {
  return {
    name: 'copy-assets',
    closeBundle() {
      const filesToCopy = ['manifest.json'];
      const distPath = resolve(__dirname, 'dist');
      
      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath);
      }

      filesToCopy.forEach(file => {
        const source = resolve(__dirname, file);
        const dest = resolve(distPath, file);
        if (fs.existsSync(source)) {
          fs.copyFileSync(source, dest);
        }
      });
      
      console.log('\x1b[32m%s\x1b[0m', '✓ Archivos de extensión copiados a dist/');
    }
  };
};

export default defineConfig({
  plugins: [react(), copyAssets()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      },
    },
  },
});
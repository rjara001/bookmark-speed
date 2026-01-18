
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Plugin sencillo para copiar el manifest.json a la carpeta dist automáticamente
const copyManifest = () => {
  return {
    name: 'copy-manifest',
    closeBundle() {
      const manifestPath = resolve(__dirname, 'manifest.json');
      const distPath = resolve(__dirname, 'dist/manifest.json');
      if (fs.existsSync(manifestPath)) {
        fs.copyFileSync(manifestPath, distPath);
        console.log('\x1b[32m%s\x1b[0m', '✓ manifest.json copiado a dist/');
      }
    }
  };
};

export default defineConfig({
  plugins: [react(), copyManifest()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
      },
    },
  },
});

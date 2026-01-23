
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const chromeExtensionHelper = () => {
  return {
    name: 'chrome-extension-helper',
    closeBundle() {
      const distPath = resolve(__dirname, 'dist');
      if (!fs.existsSync(distPath)) fs.mkdirSync(distPath, { recursive: true });

      // Solo copiamos el manifest, los assets se encargará Vite
      ['manifest.json'].forEach(file => {
        const src = resolve(__dirname, file);
        const dest = resolve(distPath, file);
        if (fs.existsSync(src)) fs.copyFileSync(src, dest);
      });
      
      console.log('✓ Manifest copiado a dist/');
    }
  };
};

export default defineConfig({
  plugins: [react(), chromeExtensionHelper()],
  base: './',
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

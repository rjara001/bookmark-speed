import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Utilidad para copiar carpetas de forma recursiva (para los iconos)
 */
function copyFolderSync(from: string, to: string) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  
  fs.readdirSync(from).forEach(element => {
    const srcPath = resolve(from, element);
    const destPath = resolve(to, element);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

const chromeExtensionHelper = () => {
  return {
    name: 'chrome-extension-helper',
    // Se ejecuta al cerrar el bundle de Vite
    closeBundle() {
      const distPath = resolve(__dirname, 'dist');
      if (!fs.existsSync(distPath)) fs.mkdirSync(distPath, { recursive: true });

      // 1. Copiar manifest.json
      const manifestSrc = resolve(__dirname, 'manifest.json');
      const manifestDest = resolve(distPath, 'manifest.json');
      if (fs.existsSync(manifestSrc)) {
        fs.copyFileSync(manifestSrc, manifestDest);
        console.log('\x1b[32m✓ manifest.json copiado a dist/\x1b[0m');
      }

      // 2. Copiar carpeta icons/ completa
      const iconsSrc = resolve(__dirname, 'icons');
      const iconsDest = resolve(distPath, 'icons');
      if (fs.existsSync(iconsSrc)) {
        copyFolderSync(iconsSrc, iconsDest);
        console.log('\x1b[32m✓ Carpeta icons/ copiada a dist/\x1b[0m');
      } else {
        console.log('\x1b[33m! Advertencia: No se encontró la carpeta icons/ en la raíz del proyecto\x1b[0m');
      }
      
      // 3. Copiar privacy.html si existe
      const privacySrc = resolve(__dirname, 'privacy.html');
      const privacyDest = resolve(distPath, 'privacy.html');
      if (fs.existsSync(privacySrc)) {
        fs.copyFileSync(privacySrc, privacyDest);
        console.log('\x1b[32m✓ privacy.html copiado a dist/\x1b[0m');
      }
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
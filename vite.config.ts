
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Función para copiar carpetas recursivamente
 */
function copyFolderSync(from: string, to: string) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(resolve(from, element)).isDirectory()) {
      copyFolderSync(resolve(from, element), resolve(to, element));
    } else {
      fs.copyFileSync(resolve(from, element), resolve(to, element));
    }
  });
}

const chromeExtensionHelper = () => {
  return {
    name: 'chrome-extension-helper',
    // Copia assets finales al terminar el build
    closeBundle() {
      const distPath = resolve(__dirname, 'dist');
      if (!fs.existsSync(distPath)) fs.mkdirSync(distPath, { recursive: true });

      // Copiar Manifest (que ya estará actualizado por el script de sync)
      const manifestSrc = resolve(__dirname, 'manifest.json');
      const manifestDest = resolve(distPath, 'manifest.json');
      if (fs.existsSync(manifestSrc)) {
        fs.copyFileSync(manifestSrc, manifestDest);
        console.log('\x1b[32m✓ manifest.json copiado a dist/\x1b[0m');
      }
      
      // Copiar Carpeta de Iconos completa
      const iconsSrc = resolve(__dirname, 'icons');
      const iconsDest = resolve(distPath, 'icons');
      if (fs.existsSync(iconsSrc)) {
        copyFolderSync(iconsSrc, iconsDest);
        console.log('\x1b[32m✓ Carpeta icons/ copiada a dist/\x1b[0m');
      } else {
        console.log('\x1b[33m! Advertencia: Carpeta icons/ no encontrada en la raíz\x1b[0m');
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

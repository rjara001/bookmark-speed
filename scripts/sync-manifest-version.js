import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// En ES Modules no existe __dirname por defecto, lo definimos manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas absolutas relativas a este script (subiendo un nivel a la raíz)
const rootDir = path.resolve(__dirname, '..');
const packagePath = path.join(rootDir, 'package.json');
const manifestPath = path.join(rootDir, 'manifest.json');

try {
  // Leer los archivos actuales
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  console.log(`\x1b[36m🔄 Sincronizando versiones: package.json (${pkg.version}) -> manifest.json (${manifest.version})\x1b[0m`);
  
  if (manifest.version !== pkg.version) {
    manifest.version = pkg.version;
    // Escribir el cambio en manifest.json manteniendo el formato
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`\x1b[32m✅ manifest.json actualizado exitosamente a la v${pkg.version}\x1b[0m`);
  } else {
    console.log(`\x1b[33mℹ️ Las versiones ya están sincronizadas (v${pkg.version})\x1b[0m`);
  }
} catch (error) {
  console.error('\x1b[31m❌ Error durante la sincronización:\x1b[0m', error.message);
  process.exit(1);
}
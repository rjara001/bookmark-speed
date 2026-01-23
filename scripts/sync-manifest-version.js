
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const packagePath = path.join(rootDir, 'package.json');
const manifestPath = path.join(rootDir, 'manifest.json');

try {
  // Leer archivos
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // Sincronizar versión
  console.log(`\x1b[36m🔄 Sincronizando: manifest.json (${manifest.version}) -> package.json (${pkg.version})\x1b[0m`);
  manifest.version = pkg.version;

  // Guardar cambios
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\x1b[32m✅ Manifest actualizado a la versión ${pkg.version}\x1b[0m`);
} catch (error) {
  console.error('\x1b[31m❌ Error sincronizando versiones:\x1b[0m', error.message);
  process.exit(1);
}

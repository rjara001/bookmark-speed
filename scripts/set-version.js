import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const packagePath = path.join(rootDir, 'package.json');
const manifestPath = path.join(rootDir, 'manifest.json');

// Get version from command line arguments
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('\x1b[31m❌ Error: Debes proporcionar una versión. Ejemplo: npm run publish 1.2.3\x1b[0m');
  process.exit(1);
}

// Basic version format validation (x.y.z)
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.warn('\x1b[33m⚠️ Advertencia: La versión "' + newVersion + '" no sigue el formato estándar x.y.z\x1b[0m');
}

try {
  // Update package.json
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const oldVersion = pkg.version;
  pkg.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`\x1b[32m✅ package.json actualizado: ${oldVersion} -> ${newVersion}\x1b[0m`);

  // Update manifest.json
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  manifest.version = newVersion;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\x1b[32m✅ manifest.json actualizado: ${oldVersion} -> ${newVersion}\x1b[0m`);

} catch (error) {
  console.error('\x1b[31m❌ Error actualizando versiones:\x1b[0m', error.message);
  process.exit(1);
}

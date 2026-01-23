
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script sencillo para comprimir la carpeta dist
 * Nota: Requiere tener el comando 'zip' disponible en el sistema (Mac/Linux)
 * En Windows, este script intentará usar PowerShell si 'zip' no existe.
 */
async function zipDirectory() {
  const manifestPath = path.resolve(__dirname, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const version = manifest.version;
  const outputName = `jetmark-v${version}.zip`;
  const distPath = path.resolve(__dirname, 'dist');

  console.log(`\n\x1b[36m📦 Empaquetando JetMark v${version}...\x1b[0m`);

  try {
    // Intentar usar el comando nativo zip
    if (process.platform !== 'win32') {
      execSync(`cd dist && zip -r ../${outputName} ./*`);
    } else {
      // Alternativa para Windows usando PowerShell
      execSync(`powershell Compress-Archive -Path dist/* -DestinationPath ${outputName} -Force`);
    }
    
    console.log(`\x1b[32m✨ ¡Éxito! Archivo creado: ${outputName}\x1b[0m\n`);
  } catch (error) {
    console.error(`\x1b[31m❌ Error al crear el ZIP: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

zipDirectory();

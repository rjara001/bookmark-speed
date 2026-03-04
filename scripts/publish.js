import { execSync } from 'child_process';

const version = process.argv[2];

if (!version) {
  console.error('\x1b[31m❌ Error: Debes proporcionar una versión. Ejemplo: npm run publish 1.2.3\x1b[0m');
  process.exit(1);
}

try {
  console.log(`\x1b[36m🚀 Iniciando proceso de publicación para la v${version}...\x1b[0m`);

  // 1. Actualizar versiones en package.json y manifest.json
  console.log('\n\x1b[33m1/3 Actualizando versiones...\x1b[0m');
  execSync(`node scripts/set-version.js ${version}`, { stdio: 'inherit' });

  // 2. Construir la extensión
  console.log('\n\x1b[33m2/3 Construyendo extensión (Vite)...\x1b[0m');
  execSync('npm run build', { stdio: 'inherit' });

  // 3. Crear el archivo ZIP
  console.log('\n\x1b[33m3/3 Creando paquete ZIP...\x1b[0m');
  execSync('node zip-build.js', { stdio: 'inherit' });

  console.log(`\n\x1b[32m✅ ¡Proceso de publicación completado para la v${version}!\x1b[0m\n`);

} catch (error) {
  console.error('\n\x1b[31m❌ El proceso de publicación falló.\x1b[0m');
  process.exit(1);
}

import fs from 'fs';
import path from 'path';

const filesToInspect = [
  'src/App.tsx',
  'src/index.css',
  'src/hooks/useTasaBcv.ts',
  'src/lib/supabase.ts',
  'src/components/Header.tsx',
  'src/components/Hero.tsx',
  'src/components/Stats.tsx',
  'src/components/Materials.tsx',
  'src/components/Nosotros.tsx',
  'src/components/InstagramGallery.tsx',
  'src/components/Autocotizador.tsx',
  'src/components/Testimonials.tsx',
  'src/components/Footer.tsx'
];

async function main() {
  console.log('=== VERIFICACIÓN DE LA LEY DE 600 LÍNEAS ===\n');
  let hasInfractions = false;

  filesToInspect.forEach(filePath => {
    const absolutePath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(absolutePath)) {
      const content = fs.readFileSync(absolutePath, 'utf8');
      const lines = content.split('\n').length;
      const status = lines <= 600 ? '✅ CUMPLE' : '❌ INFRACCIÓN';
      
      console.log(`${filePath.padEnd(38)} : ${String(lines).padStart(4)} líneas [${status}]`);
      
      if (lines > 600) {
        hasInfractions = true;
      }
    } else {
      console.log(`${filePath.padEnd(38)} : Archivo no encontrado.`);
    }
  });

  console.log('\n=============================================');
  if (hasInfractions) {
    console.log('⚠️ Alerta: Se detectó al menos una infracción a la Ley de 600 líneas.');
  } else {
    console.log('🎉 ¡Felicidades! Todos los archivos cumplen perfectamente con la Ley de 600 líneas.');
  }
}

main();

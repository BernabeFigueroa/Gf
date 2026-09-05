import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Script utilitario para procesar imágenes en masa desde las nuevas carpetas:
 * - public/images/marmol/
 * - public/images/arquitectura/binnis/
 * - public/images/arquitectura/buffalo/
 * - public/images/arquitectura/rosso/
 * - public/images/arquitecto/
 *
 * Convierte cualquier formato (jpg, png, jpeg, etc.) a .webp optimizado a 1600px de ancho y calidad 82.
 */

const targetDirs = [
  'public/images/marmol',
  'public/images/arquitectura/binnis',
  'public/images/arquitectura/buffalo',
  'public/images/arquitectura/rosso',
  'public/images/arquitecto'
];

async function processFolder(dirPath) {
  const fullPath = path.resolve(dirPath);
  if (!fs.existsSync(fullPath)) return;

  const files = fs.readdirSync(fullPath);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.avif', '.tiff', '.bmp'].includes(ext)) {
      const inputPath = path.join(fullPath, file);
      const outputName = path.basename(file, ext) + '.webp';
      const outputPath = path.join(fullPath, outputName);

      console.log(`Convirtiendo: ${file} -> ${outputName}`);
      try {
        await sharp(inputPath)
          .rotate() // Respeta orientación EXIF
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(outputPath);
        
        console.log(`✓ Generado: ${outputPath}`);
      } catch (err) {
        console.error(`Error procesando ${file}:`, err.message);
      }
    }
  }
}

async function run() {
  for (const dir of targetDirs) {
    await processFolder(dir);
  }
  console.log('¡Procesamiento completo!');
}

run();

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function processNewUploads() {
  // 1. Marmol
  const marmolJpg = path.resolve('public/images/marmol/Mesa Dekton 3.20x1.50.Pedi la tuya al whatsapp 3816382147.jpg');
  if (fs.existsSync(marmolJpg)) {
    const out = path.resolve('public/images/marmol/marmol-3.webp');
    await sharp(marmolJpg)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(out);
    console.log('Generado marmol-3.webp');
  }

  // 2. Binnis
  const binnisJpg1 = path.resolve('public/images/arquitectura/binnis/Mesas fabricadas en piedra natural trabajada a mano, con superficie texturada y bordes suavizado.jpg');
  const binnisJpg2 = path.resolve('public/images/arquitectura/binnis/Mesas fabricadas en piedra natural trabajada a mano, con superficie texturada y bordes suavizado (1).jpg');

  if (fs.existsSync(binnisJpg1)) {
    const out = path.resolve('public/images/arquitectura/binnis/binnis-5.webp');
    await sharp(binnisJpg1)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(out);
    console.log('Generado binnis-5.webp');
  }

  if (fs.existsSync(binnisJpg2)) {
    const out = path.resolve('public/images/arquitectura/binnis/binnis-6.webp');
    await sharp(binnisJpg2)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(out);
    console.log('Generado binnis-6.webp');
  }
}

processNewUploads().catch(console.error);

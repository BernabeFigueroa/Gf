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

  const binnisJpg3 = path.resolve('public/images/arquitectura/binnis/WhatsApp Image 2026-09-08 at 3.01.14 PM.jpeg');
  const binnisJpg4 = path.resolve('public/images/arquitectura/binnis/WhatsApp Image 2026-09-08 at 3.01.17 PM.jpeg');

  if (fs.existsSync(binnisJpg3)) {
    const out = path.resolve('public/images/arquitectura/binnis/binnis-7.webp');
    await sharp(binnisJpg3)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .sharpen({ sigma: 1.0, m1: 0.8, m2: 2.0 })
      .webp({ quality: 85, effort: 6, smartSubsample: true })
      .toFile(out);
    console.log('Generado binnis-7.webp');
  }

  if (fs.existsSync(binnisJpg4)) {
    const out = path.resolve('public/images/arquitectura/binnis/binnis-8.webp');
    await sharp(binnisJpg4)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .sharpen({ sigma: 1.0, m1: 0.8, m2: 2.0 })
      .webp({ quality: 85, effort: 6, smartSubsample: true })
      .toFile(out);
    console.log('Generado binnis-8.webp');
  }

  // 3. Buffalo
  const buffaloJpg = path.resolve('public/images/arquitectura/buffalo/WhatsApp Image 2026-09-15 at 9.46.50 PM.jpeg');
  if (fs.existsSync(buffaloJpg)) {
    const out = path.resolve('public/images/arquitectura/buffalo/buffalo-5.webp');
    await sharp(buffaloJpg)
      .rotate(270)
      .resize({ width: 1600, withoutEnlargement: true })
      .sharpen({ sigma: 1.0, m1: 0.8, m2: 2.0 })
      .webp({ quality: 85, effort: 6, smartSubsample: true })
      .toFile(out);
    console.log('Generado buffalo-5.webp');
  }
}

processNewUploads().catch(console.error);

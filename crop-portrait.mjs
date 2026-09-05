import sharp from 'sharp';
import fs from 'fs';

async function cropTopDeeper() {
  // Leemos desde el archivo original guardado en WhatsApp Image
  const original = 'public/images/arquitecto/WhatsApp Image 2026-09-03 at 11.47.33 AM.webp';
  const meta = await sharp(original).metadata();
  console.log('Original dimensions:', meta.width, 'x', meta.height);

  // El cartel superior "Cloda" / "Giovanni" termina aproximadamente al 14.5% desde el borde superior
  // La reja vertical del local arranca justo debajo de la moldura gris
  const topCrop = Math.round(meta.height * 0.145);
  // Abajo podemos dejar casi todo o recortar apenas el 2% inferior
  const bottomCrop = Math.round(meta.height * 0.02);
  const newHeight = meta.height - topCrop - bottomCrop;
  const newWidth = meta.width;

  console.log(`Recortando desde top: ${topCrop}, nueva altura: ${newHeight}`);

  const output = 'public/images/arquitecto/giovanni-frontini.webp';
  await sharp(original)
    .extract({
      left: 0,
      top: topCrop,
      width: newWidth,
      height: newHeight
    })
    .webp({ quality: 88 })
    .toFile(output);

  // Generamos preview para validar
  await sharp(output)
    .resize({ width: 800 })
    .toFile('public/images/arquitecto/preview-crop.jpg');

  console.log('Recorte completo y preview actualizado.');
}

cropTopDeeper().catch(err => console.error(err));

import fs from 'fs';
import path from 'path';

function copySafe(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  } else {
    console.warn(`Source not found: ${src}`);
  }
}

// Binnis
const binnisDir = path.resolve('public/images/arquitectura/binnis');
if (fs.existsSync(binnisDir)) {
  const binnisFiles = fs.readdirSync(binnisDir).filter(f => f.endsWith('.webp') && !f.startsWith('binnis-'));
  binnisFiles.forEach((file, idx) => {
    copySafe(path.join(binnisDir, file), path.join(binnisDir, `binnis-${idx + 1}.webp`));
  });
}

// Buffalo
const buffaloDir = path.resolve('public/images/arquitectura/buffalo');
if (fs.existsSync(buffaloDir)) {
  const buffaloFiles = fs.readdirSync(buffaloDir).filter(f => f.endsWith('.webp') && !f.startsWith('buffalo-'));
  buffaloFiles.forEach((file, idx) => {
    copySafe(path.join(buffaloDir, file), path.join(buffaloDir, `buffalo-${idx + 1}.webp`));
  });
  copySafe(
    path.join(buffaloDir, 'Subtle_cinemagraph_animation.webm'),
    path.join(buffaloDir, 'buffalo-video.webm')
  );
}

// Rosso
const rossoDir = path.resolve('public/images/arquitectura/rosso');
if (fs.existsSync(rossoDir)) {
  const rossoFiles = fs.readdirSync(rossoDir).filter(f => f.endsWith('.webp') && !f.startsWith('rosso-'));
  if (rossoFiles[0]) {
    copySafe(path.join(rossoDir, rossoFiles[0]), path.join(rossoDir, 'rosso-1.webp'));
  }
  const rossoVideos = fs.readdirSync(rossoDir).filter(f => f.endsWith('.webm') && !f.startsWith('rosso-'));
  if (rossoVideos[0]) {
    copySafe(path.join(rossoDir, rossoVideos[0]), path.join(rossoDir, 'rosso-video.webm'));
  }
}

// Marmol
const marmolDir = path.resolve('public/images/marmol');
if (fs.existsSync(marmolDir)) {
  const marmolWebps = fs.readdirSync(marmolDir).filter(f => f.endsWith('.webp') && !f.startsWith('marmol-'));
  marmolWebps.forEach((file, idx) => {
    copySafe(path.join(marmolDir, file), path.join(marmolDir, `marmol-${idx + 1}.webp`));
  });
  const marmolVideos = fs.readdirSync(marmolDir).filter(f => f.endsWith('.webm') && !f.startsWith('marmol-'));
  if (marmolVideos[0]) {
    copySafe(path.join(marmolDir, marmolVideos[0]), path.join(marmolDir, 'marmol-video.webm'));
  }
}

// Arquitecto
const arqDir = path.resolve('public/images/arquitecto');
if (fs.existsSync(arqDir)) {
  const arqFiles = fs.readdirSync(arqDir).filter(f => f.endsWith('.webp') && !f.startsWith('giovanni-frontini'));
  if (arqFiles[0]) {
    copySafe(path.join(arqDir, arqFiles[0]), path.join(arqDir, 'giovanni-frontini.webp'));
  }
}

// Antes y Despues
const adPath = path.resolve('public/images/AntesYDespues');
if (fs.existsSync(adPath)) {
  const subdirs = fs.readdirSync(adPath);
  for (const sub of subdirs) {
    const fullSub = path.join(adPath, sub);
    if (fs.statSync(fullSub).isDirectory()) {
      const files = fs.readdirSync(fullSub).filter(f => f.endsWith('.webp') && !f.startsWith('bano-'));
      if (files[0]) copySafe(path.join(fullSub, files[0]), path.join(fullSub, 'bano-antes.webp'));
      if (files[1]) copySafe(path.join(fullSub, files[1]), path.join(fullSub, 'bano-despues.webp'));
    }
  }
}

console.log('Todos los archivos normalizados.');

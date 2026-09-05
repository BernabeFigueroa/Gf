import fs from 'fs';
import path from 'path';
import https from 'https';

const projectsPath = path.resolve('public/projects.json');
const rawData = fs.readFileSync(projectsPath, 'utf-8');
const data = JSON.parse(rawData);

const outputDir = path.resolve('public/images/projects');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    // Si la URL es de Unsplash, pedirla optimizada en WebP directamente
    let downloadUrl = url;
    if (url.includes('unsplash.com')) {
      const baseUrl = url.split('?')[0];
      downloadUrl = `${baseUrl}?auto=format&fit=crop&w=1600&q=80&fm=webp`;
    }

    const file = fs.createWriteStream(dest);
    https.get(downloadUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`Failed to download ${url}: status ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function processAll() {
  console.log('Iniciando descarga y optimización WebP de imágenes...');
  
  for (const project of data.projects) {
    const heroDestName = `${project.id}-hero.webp`;
    const heroDestPath = path.join(outputDir, heroDestName);

    console.log(`Descargando portada de: ${project.title}`);
    await downloadFile(project.heroImage, heroDestPath);
    project.heroImage = `/images/projects/${heroDestName}`;

    const newGallery = [];
    for (let i = 0; i < project.gallery.length; i++) {
      const galleryUrl = project.gallery[i];
      const galleryDestName = `${project.id}-gallery-${i + 1}.webp`;
      const galleryDestPath = path.join(outputDir, galleryDestName);

      console.log(`  Descargando galería [${i + 1}/${project.gallery.length}] de: ${project.title}`);
      await downloadFile(galleryUrl, galleryDestPath);
      newGallery.push(`/images/projects/${galleryDestName}`);
    }
    project.gallery = newGallery;
  }

  // Guardar projects.json con las nuevas rutas locales
  fs.writeFileSync(projectsPath, JSON.stringify(data, null, 2), 'utf-8');
  
  // Sincronizar en src/data/projects.json y raíz
  fs.copyFileSync(projectsPath, path.resolve('projects.json'));
  fs.copyFileSync(projectsPath, path.resolve('src/data/projects.json'));

  console.log('¡Proceso completado! Todas las imágenes ahora son .webp locales.');
}

processAll().catch(err => {
  console.error('Error procesando imágenes:', err);
  process.exit(1);
});

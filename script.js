/**
 * GIOVANNI FRONTINI — Architecture & Spatial Design
 * Pure Event-Driven Engine: Single Source of Truth, Decoupled Content,
 * Declarative DOM Listeners, Smooth Momentum Scroll & Responsive Drawer.
 */

// Base URL: detectado automáticamente para GitHub Pages (/Gf/) o raíz local (/)
const BASE_URL = (() => {
  const scripts = document.querySelectorAll('script[src]');
  for (const s of scripts) {
    const src = s.getAttribute('src');
    if (src && src.endsWith('/script.js')) {
      return src.replace('/script.js', '');
    }
  }
  return '';
})();

// Application State
let ARCHITECTURE_DATA = [];
let MARMOL_DATA = [];
let SMALL_PROJECTS_DATA = [];
let CONTENT_I18N = {};
let currentLang = 'ES';
let currentView = 'home';
let currentProject = null;

// Palette & Color Mode State (Only 2 options: default light neutral vs. inverted bold dark)
const PALETTES = ['default', 'invert'];
let currentPaletteIndex = 0;
let currentPalette = 'default';

// DOM Element References
const cursorElem = document.getElementById('custom-cursor');
const cursorTitle = document.getElementById('cursor-title');
const cursorSub = document.getElementById('cursor-sub');
const slideshowTrack = document.getElementById('slideshow-track');
const brandLogo = document.getElementById('brand-logo');
const headerTagline = document.getElementById('header-tagline');

/* --------------------------------------------------------------------------
   1. DATA LAYER (SSOT: /projects.json)
   -------------------------------------------------------------------------- */

// Prefija paths absolutos con BASE_URL para compatibilidad con GitHub Pages subdirectory
function prefixPath(path) {
  if (!path || !path.startsWith('/')) return path;
  return `${BASE_URL}${path}`;
}

function prefixProjectImages(project) {
  if (!project) return project;
  const p = { ...project };
  if (p.heroImage) p.heroImage = prefixPath(p.heroImage);
  if (p.heroVideo) p.heroVideo = prefixPath(p.heroVideo);
  if (Array.isArray(p.homeImages)) p.homeImages = p.homeImages.map(prefixPath);
  if (Array.isArray(p.gallery)) p.gallery = p.gallery.map(prefixPath);
  return p;
}

function prefixMarmolItem(item) {
  if (!item) return item;
  const m = { ...item };
  if (m.image) m.image = prefixPath(m.image);
  if (m.image_before) m.image_before = prefixPath(m.image_before);
  if (m.image_after) m.image_after = prefixPath(m.image_after);
  if (m.video) m.video = prefixPath(m.video);
  if (m.thumbnail) m.thumbnail = prefixPath(m.thumbnail);
  return m;
}

async function loadProjectsData() {
  try {
    const response = await fetch(`${BASE_URL}/projects.json`);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    const data = await response.json();
    ARCHITECTURE_DATA = (data.projects || []).map(prefixProjectImages);
    MARMOL_DATA = (data.marmol || []).map(prefixMarmolItem);
    SMALL_PROJECTS_DATA = (data.small_projects || []).map(prefixMarmolItem);
    CONTENT_I18N = data.about || {};
    if (CONTENT_I18N.portraitImage) {
      CONTENT_I18N.portraitImage = prefixPath(CONTENT_I18N.portraitImage);
    }
  } catch (err) {
    console.error('Critical: Failed to load portfolio data:', err);
    ARCHITECTURE_DATA = [];
    MARMOL_DATA = [];
    SMALL_PROJECTS_DATA = [];
    CONTENT_I18N = {};
  }

  currentProject = ARCHITECTURE_DATA[0] || null;
}

/* --------------------------------------------------------------------------
   2. INITIALIZATION & DECLARATIVE EVENT BINDINGS
   -------------------------------------------------------------------------- */
function ensureViewportReset() {
  if (window.scrollY !== 0 || window.scrollX !== 0) {
    window.scrollTo(0, 0);
  }
  if (document.documentElement.scrollTop !== 0) {
    document.documentElement.scrollTop = 0;
  }
  if (document.body && document.body.scrollTop !== 0) {
    document.body.scrollTop = 0;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  ensureViewportReset();
  initSplashScreen();
  initializePalette();
  await loadProjectsData();
  applyLanguageTranslations(currentLang);
  renderHomeSlideshow();
  renderMarmolShowcase();
  setupCursor();
  setupInfiniteScroll();
  setupProjectScrollSync();
  setupGlobalActionListeners();
  animateLogoTracking();
  updateAboutContent();
  updateViewTheme('home');
  ensureViewportReset();
});

window.addEventListener('load', () => {
  ensureViewportReset();
});

window.addEventListener('resize', () => {
  ensureViewportReset();
});

window.addEventListener('orientationchange', () => {
  setTimeout(ensureViewportReset, 100);
});

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    ensureViewportReset();
  });
}

function initSplashScreen() {
  const splash = document.getElementById('intro-splash');
  if (!splash) return;

  // Si ya se mostró en esta sesión, lo removemos de inmediato
  if (sessionStorage.getItem('gf_intro_shown')) {
    splash.remove();
    ensureViewportReset();
    return;
  }

  const hideSplash = () => {
    sessionStorage.setItem('gf_intro_shown', 'true');
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.remove();
      ensureViewportReset();
    }, 950);
  };

  // Esperar a que los recursos de la página carguen + pausa de lectura cómoda
  window.addEventListener('load', () => {
    setTimeout(hideSplash, 1800);
  });

  // Fallback de seguridad: si la carga se demora más de 3.5s, desvanecer
  setTimeout(hideSplash, 3500);
}

function animateLogoTracking() {
  setTimeout(() => {
    if (brandLogo) brandLogo.classList.add('expanded-tracking');
  }, 150);
}

/* --------------------------------------------------------------------------
   3. DECLARATIVE EVENT DELEGATION (Removes Inline onclick Attributes)
   -------------------------------------------------------------------------- */
function setupGlobalActionListeners() {
  // Navigation & Action Buttons via data-action
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    switch (action) {
      case 'nav-home':
        e.preventDefault();
        navigateTo('home');
        break;
      case 'filter-comercial':
        e.preventDefault();
        filterProjects('comercial');
        break;
      case 'filter-residencial':
        e.preventDefault();
        filterProjects('residencial');
        break;
      case 'filter-marmol':
        e.preventDefault();
        navigateTo('marmol');
        break;
      case 'nav-about':
        e.preventDefault();
        navigateTo('about');
        break;
      case 'toggle-lang':
        e.preventDefault();
        toggleLanguage();
        break;
      case 'toggle-theme':
        e.preventDefault();
        cycleColorPalette();
        break;
      case 'open-mobile-menu':
        e.preventDefault();
        openMobileMenu();
        break;
      case 'close-mobile-menu':
        e.preventDefault();
        closeMobileMenu();
        break;
      case 'open-drawer':
        e.preventDefault();
        openDetailsDrawer();
        break;
      case 'close-drawer':
        e.preventDefault();
        closeDetailsDrawer();
        break;
      case 'open-contact-modal':
        e.preventDefault();
        openContactModal();
        break;
      case 'close-contact-modal':
        e.preventDefault();
        closeContactModal();
        break;
      default:
        break;
    }
  });

  // Cerrar contact modal con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeContactModal();
      closeMobileMenu();
      closeDetailsDrawer();
    }
  });

  // Cerrar menú modal al hacer tap/click en el fondo desenfocado
  const mobileNavModal = document.getElementById('mobile-nav-modal');
  if (mobileNavModal) {
    mobileNavModal.addEventListener('click', (e) => {
      if (e.target === mobileNavModal || e.target.classList.contains('modal-links-container')) {
        closeMobileMenu();
      }
    });
  }

  setupContactForm();
}

function openMobileMenu() {
  const modal = document.getElementById('mobile-nav-modal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeMobileMenu() {
  const modal = document.getElementById('mobile-nav-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function openContactModal() {
  closeMobileMenu();
  const modal = document.getElementById('contact-modal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    const firstInput = modal.querySelector('#contact-nombre');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }
}

function closeContactModal() {
  const modal = document.getElementById('contact-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
  ensureViewportReset();
}

function setupContactForm() {
  const form = document.getElementById('contact-wsp-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = (document.getElementById('contact-nombre')?.value || '').trim();
    const apellido = (document.getElementById('contact-apellido')?.value || '').trim();
    const numero = (document.getElementById('contact-numero')?.value || '').trim();
    const mensaje = (document.getElementById('contact-mensaje')?.value || '').trim();

    if (!nombre || !apellido || !mensaje) return;

    // Formato exacto requerido: "hola soy {nombre} {apellido} y tengo en mente esto {mensaje}"
    let mensajeWsp = `hola soy ${nombre} ${apellido} y tengo en mente esto ${mensaje}`;

    // Si el usuario proporcionó número de contacto, lo agregamos de manera natural
    if (numero) {
      mensajeWsp += ` (Mi número de contacto es: ${numero})`;
    }

    const telefonoWhatsApp = '5493816382147';
    const wspUrl = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeWsp)}`;

    // Abrir WhatsApp en nueva pestaña
    window.open(wspUrl, '_blank', 'noopener,noreferrer');

    // Cerrar modal y limpiar formulario
    closeContactModal();
    form.reset();
  });
}

/* --------------------------------------------------------------------------
   4. VIEW ROUTING & THEME MANAGEMENT
   -------------------------------------------------------------------------- */
function navigateTo(viewId, activeTabId = null) {
  currentView = viewId;
  const targetTab = activeTabId || viewId;

  // Cerrar menú modal al navegar
  closeMobileMenu();

  // View Panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const targetPanel = document.getElementById(`view-${viewId}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Navigation Tabs Desktop Active State
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.target === targetTab) {
      tab.classList.add('active');
    }
  });

  // Modal Links Active State (Muestra subrayado sólido en la sección actual)
  document.querySelectorAll('.modal-nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.target === targetTab) {
      link.classList.add('active');
    }
  });

  updateViewTheme(viewId, targetTab);

  if (viewId === 'home' && slideshowTrack) {
    slideshowTrack.scrollTo({ top: 0, behavior: 'instant' });
  } else if (targetPanel) {
    targetPanel.scrollTo({ top: 0, behavior: 'instant' });
  }
}

function updateViewTheme(viewId, targetTab = null) {
  const isGridCategory = viewId === 'grid' && (targetTab === 'comercial' || targetTab === 'residencial' || targetTab === 'arquitectura');

  if (isGridCategory) {
    const topHeader = document.querySelector('.fixed-top-header');
    if (topHeader) {
      topHeader.style.animation = 'none';
      topHeader.offsetHeight; /* trigger reflow */
      topHeader.style.animation = '';
    }
    document.body.classList.add('view-arquitectura-active');
    if (headerTagline) {
      headerTagline.textContent = 'ideas into spaces';
    }
  } else {
    document.body.classList.remove('view-arquitectura-active');
    if (headerTagline) {
      headerTagline.textContent = 'Architecture & Interiors';
    }
  }

  const isHeaderBarView = viewId === 'marmol' || viewId === 'about';
  if (isHeaderBarView) {
    document.body.classList.add('view-header-bar');
  } else {
    document.body.classList.remove('view-header-bar');
  }

  document.body.setAttribute('data-current-view', viewId);

  if (viewId === 'home' || viewId === 'grid') {
    document.body.classList.remove('theme-light-header');
    document.body.classList.remove('in-project-view');
  } else if (viewId === 'project') {
    document.body.classList.add('theme-light-header');
    document.body.classList.add('in-project-view');
  } else {
    document.body.classList.add('theme-light-header');
    document.body.classList.remove('in-project-view');
  }
}

/* --------------------------------------------------------------------------
   5. VIEW 1: HOME SLIDESHOW & INFINITE SCROLL
   -------------------------------------------------------------------------- */
function renderHomeSlideshow() {
  if (!slideshowTrack) return;
  slideshowTrack.innerHTML = '';

  ARCHITECTURE_DATA.forEach((project, index) => {
    const projType = currentLang === 'ES' ? (project.type_es || project.type) : (project.type_en || project.type);
    const projLoc = currentLang === 'ES' ? (project.location_es || project.location) : (project.location_en || project.location);

    const slide = document.createElement('div');
    slide.className = 'slide-item';
    slide.dataset.id = project.id;
    slide.dataset.title = project.title;
    slide.dataset.meta = `${projType} — ${project.year}`;

    // Multi-image or single-image full-bleed container
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'slide-media-container';

    const imagesToDisplay = (project.homeImages && project.homeImages.length > 0)
      ? project.homeImages
      : [project.heroImage];

    if (imagesToDisplay.length > 1) {
      mediaContainer.classList.add('multi-image-slide');
      imagesToDisplay.forEach((imgSrc) => {
        const itemWrap = document.createElement('div');
        itemWrap.className = 'slide-multi-col';
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = project.title;
        img.className = 'slide-col-img';
        img.loading = index === 0 ? 'eager' : 'lazy';
        img.decoding = 'async';
        itemWrap.appendChild(img);
        mediaContainer.appendChild(itemWrap);
      });
    } else {
      // Single media (image or video)
      if (project.heroVideo) {
        const video = document.createElement('video');
        video.src = project.heroVideo;
        video.poster = project.heroImage;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.className = 'slide-single-media';
        mediaContainer.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = project.heroImage;
        img.alt = project.title;
        img.className = 'slide-single-media';
        img.loading = index === 0 ? 'eager' : 'lazy';
        if (index === 0) img.fetchPriority = 'high';
        img.decoding = 'async';
        mediaContainer.appendChild(img);
      }
    }

    slide.appendChild(mediaContainer);

    const overlay = document.createElement('div');
    overlay.className = 'slide-overlay-mobile';

    const mobileTitle = document.createElement('span');
    mobileTitle.className = 'mobile-slide-title';
    mobileTitle.textContent = project.title;

    const mobileMeta = document.createElement('span');
    mobileMeta.className = 'mobile-slide-meta';
    mobileMeta.textContent = `${projType} · ${project.year} · ${projLoc}`;

    overlay.appendChild(mobileTitle);
    overlay.appendChild(mobileMeta);

    slide.appendChild(overlay);

    slide.addEventListener('click', () => openProject(project.id));
    slide.addEventListener('mouseenter', () => {
      updateCursorContent(project.title, `${projType} — ${project.year}`);
      cursorElem?.classList.add('active');
    });
    slide.addEventListener('mouseleave', () => {
      cursorElem?.classList.remove('active');
    });

    slideshowTrack.appendChild(slide);
  });
}

function setupInfiniteScroll() {
  if (!slideshowTrack) return;

  slideshowTrack.addEventListener('scroll', () => {
    if (currentView !== 'home') return;
    const maxScroll = slideshowTrack.scrollHeight - slideshowTrack.clientHeight;
    if (maxScroll <= 0) return;

    if (slideshowTrack.scrollTop >= maxScroll - 5) {
      setTimeout(() => {
        slideshowTrack.scrollTo({ top: 0, behavior: 'smooth' });
      }, 700);
    }
  });
}

/* --------------------------------------------------------------------------
   6. VIEW 2: CATEGORY FILTERING & HOVER SLIDESHOW
   -------------------------------------------------------------------------- */
function filterProjects(category) {
  const gridContainer = document.getElementById('projects-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = '';

  const filtered = category === 'all'
    ? ARCHITECTURE_DATA
    : ARCHITECTURE_DATA.filter(p => p.category === category);

  filtered.forEach((project, index) => {
    const card = document.createElement('div');
    card.className = 'grid-card';
    card.dataset.id = project.id;

    const img = document.createElement('img');
    img.src = project.heroImage;
    img.alt = project.title;
    img.className = 'grid-card-img';
    img.loading = index < 2 ? 'eager' : 'lazy';
    if (index === 0) img.fetchPriority = 'high';
    img.decoding = 'async';

    const overlay = document.createElement('div');
    overlay.className = 'grid-card-overlay';

    const title = document.createElement('h3');
    title.className = 'grid-card-title';
    title.textContent = project.title;

    const projLoc = currentLang === 'ES' ? (project.location_es || project.location) : (project.location_en || project.location);

    const meta = document.createElement('span');
    meta.className = 'grid-card-meta';
    meta.textContent = `${projLoc} — ${project.year}`;

    overlay.appendChild(title);
    overlay.appendChild(meta);

    card.appendChild(img);
    card.appendChild(overlay);

    // Hover cycling photos (solo imágenes estáticas, filtrando videos para evitar errores)
    const allPhotos = [project.heroImage, ...(project.gallery || [])].filter(url => 
      typeof url === 'string' && !url.endsWith('.webm') && !url.endsWith('.mp4')
    );
    let photoIndex = 0;
    let cycleInterval = null;

    card.addEventListener('mouseenter', () => {
      if (allPhotos.length <= 1 || window.innerWidth < 768) return;
      cycleInterval = setInterval(() => {
        photoIndex = (photoIndex + 1) % allPhotos.length;
        img.style.opacity = '0.7';
        setTimeout(() => {
          img.src = allPhotos[photoIndex];
          img.style.opacity = '1';
        }, 100);
      }, 750);
    });

    card.addEventListener('mouseleave', () => {
      if (cycleInterval) clearInterval(cycleInterval);
      photoIndex = 0;
      img.src = project.heroImage;
      img.style.opacity = '1';
    });

    card.addEventListener('click', () => openProject(project.id));
    gridContainer.appendChild(card);
  });

  // Si la categoría es 'residencial', añadir debajo de las dos casas la barra pegada de "PEQUEÑOS PROYECTOS"
  // y la tarjeta interactiva de Antes/Después sin recortar la imagen
  if (category === 'residencial' && SMALL_PROJECTS_DATA.length > 0) {
    const isEs = currentLang === 'ES';

    // 1. Barra pegada que cruza toda la pantalla
    const divider = document.createElement('div');
    divider.className = 'grid-section-divider';
    
    const dividerTitle = document.createElement('span');
    dividerTitle.className = 'grid-section-divider-title';
    dividerTitle.setAttribute('data-i18n', 'section_small_projects');
    dividerTitle.textContent = isEs ? 'PEQUEÑOS PROYECTOS' : 'SMALL PROJECTS';

    divider.appendChild(dividerTitle);
    gridContainer.appendChild(divider);

    // Contenedor que agrupa a los pequeños proyectos de forma pegada uno a la par del otro
    const smallProjectsRow = document.createElement('div');
    smallProjectsRow.className = 'small-projects-row';

    // 2. Render de cada item de pequeños proyectos (ej. el baño en mármol y showroom)
    SMALL_PROJECTS_DATA.forEach((item) => {
      const smallCard = document.createElement('div');
      smallCard.className = 'grid-small-project-card';

      const stage = document.createElement('div');
      stage.className = 'grid-comparison-stage';

      const imgBefore = document.createElement('img');
      imgBefore.src = item.image_before;
      imgBefore.alt = 'Antes';
      imgBefore.className = 'grid-comparison-base';
      imgBefore.loading = 'lazy';

      const imgAfter = document.createElement('img');
      imgAfter.src = item.image_after;
      imgAfter.alt = 'Después';
      imgAfter.className = 'grid-comparison-overlay-img';
      imgAfter.loading = 'lazy';
      imgAfter.style.opacity = '1';

      const badge = document.createElement('div');
      badge.className = 'grid-comparison-badge';
      badge.textContent = isEs ? 'DESPUÉS' : 'AFTER';

      stage.appendChild(imgBefore);
      stage.appendChild(imgAfter);
      stage.appendChild(badge);
      smallCard.appendChild(stage);

      // Estado de Antes / Después
      let isShowingBefore = false;

      function updateCompareState(showBefore) {
        isShowingBefore = showBefore;
        if (showBefore) {
          smallCard.classList.add('show-before');
          imgAfter.style.opacity = '0';
          badge.textContent = currentLang === 'ES' ? 'ESTADO ANTERIOR' : 'BEFORE STATE';
        } else {
          smallCard.classList.remove('show-before');
          imgAfter.style.opacity = '1';
          badge.textContent = currentLang === 'ES' ? 'DESPUÉS' : 'AFTER';
        }
      }

      // 1. Hover para computadora: al pasar el mouse se ve el antes, al salir el después
      smallCard.addEventListener('mouseenter', () => {
        updateCompareState(true);
      });

      smallCard.addEventListener('mouseleave', () => {
        updateCompareState(false);
      });

      // 2. En celular (< 768px): un clic para alternar entre antes y después.
      // En PC / escritorio: el clic NO alterna (en PC funciona exclusivamente con hover al pasar el mouse)
      smallCard.addEventListener('click', (e) => {
        if (window.innerWidth < 768) {
          e.preventDefault();
          updateCompareState(!isShowingBefore);
        }
      });

      smallProjectsRow.appendChild(smallCard);
    });

    gridContainer.appendChild(smallProjectsRow);
  }

  const activeTabName = category === 'all' ? 'projects' : category;
  navigateTo('grid', activeTabName);
}

/* --------------------------------------------------------------------------
   7. VIEW 3: SINGLE PROJECT & MOMENTUM HORIZONTAL SCROLL
   -------------------------------------------------------------------------- */
function openProject(projectId) {
  const project = ARCHITECTURE_DATA.find(p => p.id === projectId);
  if (!project) return;
  currentProject = project;

  const track = document.getElementById('project-gallery-track');
  if (track) {
    track.innerHTML = '';

    // If project has video, add video slide first
    if (project.heroVideo) {
      const vidSlide = document.createElement('div');
      vidSlide.className = 'project-img-slide';
      const vid = document.createElement('video');
      vid.src = project.heroVideo;
      vid.poster = project.heroImage;
      vid.autoplay = true;
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      vid.style.width = '100%';
      vid.style.height = '100%';
      vid.style.objectFit = 'cover';
      vidSlide.appendChild(vid);
      track.appendChild(vidSlide);
    }

    project.gallery.forEach(mediaUrl => {
      const slide = document.createElement('div');
      slide.className = 'project-img-slide';
      
      if (mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.mp4')) {
        const vid = document.createElement('video');
        vid.src = mediaUrl;
        vid.autoplay = true;
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.className = 'project-slide-media';
        slide.appendChild(vid);
      } else {
        const img = document.createElement('img');
        img.src = mediaUrl;
        img.alt = project.title;
        img.loading = 'lazy';
        img.className = 'project-slide-media';
        slide.appendChild(img);
      }
      track.appendChild(slide);
    });
    track.scrollTo({ left: 0, top: 0, behavior: 'instant' });
    const wrapper = document.querySelector('.project-view-wrapper');
    if (wrapper) {
      wrapper.scrollTop = 0;
    }
  }

  // Populate Desktop Strip
  const pName = document.getElementById('p-name');
  if (pName) pName.textContent = project.title;
  const pYear = document.getElementById('p-year');
  if (pYear) pYear.textContent = project.year;
  const pLoc = document.getElementById('p-loc');
  if (pLoc) pLoc.textContent = currentLang === 'ES' ? (project.location_es || project.location) : (project.location_en || project.location);
  const pSurf = document.getElementById('p-surf');
  if (pSurf) pSurf.textContent = project.surface;
  const pType = document.getElementById('p-type');
  if (pType) pType.textContent = currentLang === 'ES' ? (project.type_es || project.type) : (project.type_en || project.type);
  const pStatus = document.getElementById('p-status');
  if (pStatus) pStatus.textContent = currentLang === 'ES' ? (project.status_es || project.status) : (project.status_en || project.status);
  const pPhoto = document.getElementById('p-photo');
  if (pPhoto) pPhoto.textContent = project.photographer;

  // Populate Mobile Drawer
  const dTitle = document.getElementById('drawer-project-title');
  if (dTitle) dTitle.textContent = project.title;
  const dYear = document.getElementById('d-year');
  if (dYear) dYear.textContent = project.year;
  const dLoc = document.getElementById('d-loc');
  if (dLoc) dLoc.textContent = currentLang === 'ES' ? (project.location_es || project.location) : (project.location_en || project.location);
  const dSurf = document.getElementById('d-surf');
  if (dSurf) dSurf.textContent = project.surface;
  const dType = document.getElementById('d-type');
  if (dType) dType.textContent = currentLang === 'ES' ? (project.type_es || project.type) : (project.type_en || project.type);
  const dStatus = document.getElementById('d-status');
  if (dStatus) dStatus.textContent = currentLang === 'ES' ? (project.status_es || project.status) : (project.status_en || project.status);
  const dPhoto = document.getElementById('d-photo');
  if (dPhoto) dPhoto.textContent = project.photographer;
  const dDesc = document.getElementById('drawer-project-desc');
  if (dDesc) dDesc.textContent = currentLang === 'ES' ? (project.desc_es || project.desc_en) : (project.desc_en || project.desc_es);

  targetScrollLeft = 0;
  isScrollLoopRunning = false;
  updateProjectProgressBar();

  navigateTo('project');
}

let targetScrollLeft = 0;
let isScrollLoopRunning = false;

function setupProjectScrollSync() {
  const track = document.getElementById('project-gallery-track');
  if (!track) return;

  track.addEventListener('scroll', updateProjectProgressBar);

  function scrollAnimationLoop() {
    if (currentView !== 'project') {
      isScrollLoopRunning = false;
      return;
    }

    const currentScroll = track.scrollLeft;
    const diff = targetScrollLeft - currentScroll;

    if (Math.abs(diff) > 0.5) {
      track.scrollLeft += diff * 0.15;
      updateProjectProgressBar();
      requestAnimationFrame(scrollAnimationLoop);
    } else {
      track.scrollLeft = targetScrollLeft;
      updateProjectProgressBar();
      isScrollLoopRunning = false;
    }
  }

  window.addEventListener('wheel', (e) => {
    if (currentView !== 'project') return;
    if (window.innerWidth < 768) return;

    const drawer = document.getElementById('mobile-drawer');
    if (drawer && drawer.classList.contains('active')) return;

    e.preventDefault();
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;

    targetScrollLeft = Math.min(Math.max(targetScrollLeft + e.deltaY * 1.25, 0), maxScroll);

    if (!isScrollLoopRunning) {
      isScrollLoopRunning = true;
      requestAnimationFrame(scrollAnimationLoop);
    }
  }, { passive: false });
}

function updateProjectProgressBar() {
  const track = document.getElementById('project-gallery-track');
  const progressBar = document.getElementById('project-progress-bar');
  if (!track || !progressBar) return;

  const maxScroll = track.scrollWidth - track.clientWidth;
  if (maxScroll <= 0) {
    progressBar.style.transform = 'scaleX(0)';
    return;
  }

  const ratio = Math.min(Math.max(track.scrollLeft / maxScroll, 0), 1);
  progressBar.style.transform = `scaleX(${ratio})`;
}

/* --------------------------------------------------------------------------
   8. MOBILE DRAWER CONTROLS
   -------------------------------------------------------------------------- */
function openProjectDetailsModal(item) {
  const dTitle = document.getElementById('drawer-project-title');
  if (dTitle) dTitle.textContent = currentLang === 'ES' ? (item.title_es || item.title) : (item.title_en || item.title);

  const dYear = document.getElementById('d-year');
  if (dYear) dYear.textContent = item.year || '2024';

  const dLoc = document.getElementById('d-loc');
  if (dLoc) dLoc.textContent = currentLang === 'ES' ? (item.location_es || 'CONCEPCIÓN, TUCUMÁN') : (item.location_en || 'CONCEPCION, TUCUMAN');

  const dSurf = document.getElementById('d-surf');
  if (dSurf) dSurf.textContent = item.surface || '18 M²';

  const dType = document.getElementById('d-type');
  if (dType) dType.textContent = currentLang === 'ES' ? (item.type_es || item.type) : (item.type_en || item.type);

  const dStatus = document.getElementById('d-status');
  if (dStatus) dStatus.textContent = currentLang === 'ES' ? 'CONSTRUIDO' : 'COMPLETED';

  const dPhoto = document.getElementById('d-photo');
  if (dPhoto) dPhoto.textContent = item.photographer || 'GIOVANNI FRONTINI';

  const dDesc = document.getElementById('drawer-project-desc');
  if (dDesc) dDesc.textContent = currentLang === 'ES' ? (item.desc_es || item.desc_en) : (item.desc_en || item.desc_es);

  openDetailsDrawer();
}

function openDetailsDrawer() {
  document.getElementById('mobile-drawer')?.classList.add('active');
  document.getElementById('mobile-drawer-overlay')?.classList.add('active');
}

function closeDetailsDrawer() {
  document.getElementById('mobile-drawer')?.classList.remove('active');
  document.getElementById('mobile-drawer-overlay')?.classList.remove('active');
}

/* --------------------------------------------------------------------------
   9. I18N CONTENT SYNCHRONIZATION & COMPLETE TRANSLATIONS DICTIONARY
   -------------------------------------------------------------------------- */
const UI_TRANSLATIONS = {
  nav_home: {
    ES: 'ARQUITECTURA & INTERIORES',
    EN: 'ARCHITECTURE & INTERIORS'
  },
  nav_comercial: {
    ES: 'COMERCIAL',
    EN: 'COMMERCIAL'
  },
  nav_residencial: {
    ES: 'RESIDENCIAL',
    EN: 'RESIDENTIAL'
  },
  nav_marmol: {
    ES: 'MÁRMOL',
    EN: 'MARBLE'
  },
  nav_about: {
    ES: 'SOBRE MÍ',
    EN: 'ABOUT'
  },
  section_small_projects: {
    ES: 'PEQUEÑOS PROYECTOS',
    EN: 'SMALL PROJECTS'
  },
  compare_hint_desktop: {
    ES: '[ PASAR EL CURSOR PARA VER ANTES / DESPUÉS ]',
    EN: '[ HOVER TO VIEW BEFORE / AFTER ]'
  },
  compare_hint_mobile: {
    ES: '[ TOCAR PARA VER ANTES / DESPUÉS ]',
    EN: '[ TAP TO TOGGLE BEFORE / AFTER ]'
  },
  state_after: {
    ES: 'DESPUÉS',
    EN: 'AFTER'
  },
  state_before: {
    ES: 'ESTADO ANTERIOR',
    EN: 'BEFORE STATE'
  },
  marmol_badge: {
    ES: '[ MARMOLERÍA FRONTINI — EST. 1949 ]',
    EN: '[ FRONTINI MARBLE STUDIO — EST. 1949 ]'
  },
  marmol_title: {
    ES: 'LA PIEDRA COMO ARQUITECTURA',
    EN: 'STONE AS ARCHITECTURE'
  },
  marmol_quote: {
    ES: '“NO SÓLO ESPECIFICO PIEDRA. DISEÑO CON ELLA”',
    EN: '“I DON’T JUST SPECIFY STONE. I DESIGN WITH IT”'
  },
  marmol_body: {
    ES: 'La piedra se incorpora a mis proyectos como arquitectura, mobiliario y detalle — desde mesas monolíticas y vanities escultóricos hasta cocinas, barras, muros y elementos a medida.',
    EN: 'Stone is incorporated into my projects as architecture, furniture and detail — from monolithic tables and sculptural vanities to kitchens, bars, walls and bespoke elements.'
  },
  marmol_heritage_brand: {
    ES: 'MARMOLERÍA FRONTINI',
    EN: 'MARMOLERÍA FRONTINI'
  },
  marmol_heritage_sub: {
    ES: 'Elaboración y oficio en piedra natural desde 1949.',
    EN: 'Stone fabrication & craftsmanship since 1949.'
  },
  marmol_ig_btn: {
    ES: '@MARMOLERIAFRONTINI ↗',
    EN: '@MARMOLERIAFRONTINI ↗'
  },
  details_btn: {
    ES: 'DETALLES',
    EN: 'DETAILS'
  },
  drawer_close: {
    ES: '[ CERRAR ✕ ]',
    EN: '[ CLOSE ✕ ]'
  },
  drawer_brief_label: {
    ES: '[ MEMORIA DESCRIPTIVA ]',
    EN: '[ ARCHITECTURAL BRIEF ]'
  },
  drawer_inquire: {
    ES: '[ CONSULTAR POR ESTE PROYECTO ↗ ]',
    EN: '[ INQUIRE ABOUT THIS PROJECT ↗ ]'
  },
  meta_year: {
    ES: 'AÑO',
    EN: 'YEAR'
  },
  meta_location: {
    ES: 'UBICACIÓN',
    EN: 'LOCATION'
  },
  meta_surface: {
    ES: 'SUPERFICIE',
    EN: 'SURFACE'
  },
  meta_type: {
    ES: 'PROGRAMA',
    EN: 'PROGRAM'
  },
  meta_status: {
    ES: 'ESTADO',
    EN: 'STATUS'
  },
  meta_photography: {
    ES: 'FOTOGRAFÍA',
    EN: 'PHOTOGRAPHY'
  },
  portrait_caption: {
    ES: 'GIOVANNI FRONTINI — FUNDADOR Y ARQUITECTO PRINCIPAL',
    EN: 'GIOVANNI FRONTINI — FOUNDER & PRINCIPAL ARCHITECT'
  },
  label_studio: {
    ES: 'ESTUDIO & TALLER',
    EN: 'STUDIO & WORKSHOP'
  },
  label_services: {
    ES: 'ESPECIALIDAD & ASESORAMIENTO',
    EN: 'SPECIALTY & CONSULTATION'
  },
  label_inquiries: {
    ES: 'CONSULTAS',
    EN: 'INQUIRIES'
  },
  label_social: {
    ES: 'REDES',
    EN: 'SOCIAL'
  },
  contact_modal_tag: {
    ES: '[ INICIAR PROYECTO ]',
    EN: '[ START A PROJECT ]'
  },
  contact_modal_title: {
    ES: 'HABLEMOS DE TU PROYECTO',
    EN: "LET'S TALK ABOUT YOUR PROJECT"
  },
  contact_modal_subtitle: {
    ES: 'Completá tus datos para enviarnos tu consulta directamente a WhatsApp.',
    EN: 'Fill in your details to send your inquiry directly to WhatsApp.'
  },
  contact_label_name: {
    ES: 'NOMBRE *',
    EN: 'FIRST NAME *'
  },
  contact_label_lastname: {
    ES: 'APELLIDO *',
    EN: 'LAST NAME *'
  },
  contact_label_phone: {
    ES: 'NÚMERO DE TELÉFONO',
    EN: 'PHONE NUMBER'
  },
  contact_label_message: {
    ES: '¿QUÉ TENÉS EN MENTE? *',
    EN: 'WHAT DO YOU HAVE IN MIND? *'
  },
  contact_btn_send: {
    ES: 'ENVIAR A WHATSAPP',
    EN: 'SEND TO WHATSAPP'
  }
};

function applyLanguageTranslations(lang) {
  // 1. Update all static data-i18n elements (nav buttons, modal buttons, headers, strip keys, drawer keys)
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (UI_TRANSLATIONS[key] && UI_TRANSLATIONS[key][lang]) {
      el.textContent = UI_TRANSLATIONS[key][lang];
    }
  });

  // 2. Update Toggle Buttons text
  const btn = document.getElementById('lang-toggle-btn');
  if (btn) btn.textContent = lang;

  const modalBtn = document.getElementById('modal-lang-btn');
  if (modalBtn) modalBtn.textContent = lang;

  // 3. Update html lang attribute
  document.documentElement.lang = lang.toLowerCase();

  // 4. Update About Content
  updateAboutContent();

  // 5. Update Current Project (Desktop Strip & Mobile Drawer) if active
  if (currentProject) {
    const pLoc = document.getElementById('p-loc');
    if (pLoc) pLoc.textContent = lang === 'ES' ? (currentProject.location_es || currentProject.location) : (currentProject.location_en || currentProject.location);

    const pType = document.getElementById('p-type');
    if (pType) pType.textContent = lang === 'ES' ? (currentProject.type_es || currentProject.type) : (currentProject.type_en || currentProject.type);

    const pStatus = document.getElementById('p-status');
    if (pStatus) pStatus.textContent = lang === 'ES' ? (currentProject.status_es || currentProject.status) : (currentProject.status_en || currentProject.status);

    const dLoc = document.getElementById('d-loc');
    if (dLoc) dLoc.textContent = lang === 'ES' ? (currentProject.location_es || currentProject.location) : (currentProject.location_en || currentProject.location);

    const dType = document.getElementById('d-type');
    if (dType) dType.textContent = lang === 'ES' ? (currentProject.type_es || currentProject.type) : (currentProject.type_en || currentProject.type);

    const dStatus = document.getElementById('d-status');
    if (dStatus) dStatus.textContent = lang === 'ES' ? (currentProject.status_es || currentProject.status) : (currentProject.status_en || currentProject.status);

    const dDesc = document.getElementById('drawer-project-desc');
    if (dDesc) dDesc.textContent = lang === 'ES' ? (currentProject.desc_es || currentProject.desc_en) : (currentProject.desc_en || currentProject.desc_es);
  }

  // 6. Re-render Home slideshow and Marmol showcase with updated language
  renderHomeSlideshow();
  renderMarmolShowcase();

  // 7. If currently on grid view, re-filter current category to refresh labels
  if (currentView === 'grid') {
    const activeNavTab = document.querySelector('.nav-tab.active');
    const target = activeNavTab ? activeNavTab.dataset.target : 'comercial';
    filterProjects(target);
  }
}

function toggleLanguage() {
  currentLang = currentLang === 'ES' ? 'EN' : 'ES';
  applyLanguageTranslations(currentLang);
}

/* --------------------------------------------------------------------------
   9B. EDITORIAL PALETTE & COLOR THEME ENGINE
   -------------------------------------------------------------------------- */
function initializePalette() {
  const savedPalette = localStorage.getItem('gf_portfolio_palette');
  if (savedPalette && PALETTES.includes(savedPalette)) {
    currentPalette = savedPalette;
    currentPaletteIndex = PALETTES.indexOf(savedPalette);
  } else {
    currentPalette = 'default';
    currentPaletteIndex = 0;
  }
  applyColorPalette(currentPalette);
}

function applyColorPalette(paletteName) {
  const selected = paletteName === 'invert' ? 'invert' : 'default';
  currentPalette = selected;
  currentPaletteIndex = PALETTES.indexOf(selected);
  document.documentElement.setAttribute('data-palette', selected);
  document.body.setAttribute('data-palette', selected);
  localStorage.setItem('gf_portfolio_palette', selected);

  // Synchronize Safari iOS and mobile browser theme-color
  const themeColor = selected === 'invert' ? '#000000' : '#2d1615';
  let themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) {
    themeMeta = document.createElement('meta');
    themeMeta.setAttribute('name', 'theme-color');
    document.head.appendChild(themeMeta);
  }
  themeMeta.setAttribute('content', themeColor);

  // Update knob indicator in mobile modal
  const knob = document.querySelector('.theme-switch-knob');
  if (knob) {
    if (selected === 'invert') {
      knob.style.transform = 'translateX(-16px)';
      knob.style.backgroundColor = '#ffffff';
    } else {
      knob.style.transform = 'translateX(0px)';
      knob.style.backgroundColor = '#e2b8b6';
    }
  }

  // Update theme dot color hint
  const dot = document.querySelector('.nav-theme-dot');
  if (dot) {
    if (selected === 'invert') {
      dot.style.backgroundColor = '#ffffff';
      dot.style.borderColor = '#000000';
      dot.setAttribute('title', 'Modo Blanco & Negro (Click para volver a Marrón & Rosa)');
      dot.setAttribute('aria-label', 'Modo Blanco y Negro activo');
    } else {
      dot.style.backgroundColor = '#e2b8b6';
      dot.style.borderColor = '#2d1615';
      dot.setAttribute('title', 'Modo Marrón & Rosa (Click para cambiar a Blanco & Negro)');
      dot.setAttribute('aria-label', 'Modo Marrón y Rosa activo');
    }
  }
}

function cycleColorPalette() {
  currentPaletteIndex = (currentPaletteIndex + 1) % PALETTES.length;
  const nextPalette = PALETTES[currentPaletteIndex];
  applyColorPalette(nextPalette);
}

function updateAboutContent() {
  const manifestoTitle = document.getElementById('about-manifesto-title');
  const bio1 = document.getElementById('about-bio-p1');
  const bio2 = document.getElementById('about-bio-p2');
  const btnText = document.getElementById('btn-text-lang');
  const studioInfo = document.getElementById('about-studio-info');
  const servicesInfo = document.getElementById('about-services-info');

  if (manifestoTitle) {
    manifestoTitle.textContent = currentLang === 'ES'
      ? (CONTENT_I18N.manifesto_title_es || 'GIOVANNI FRONTINI')
      : (CONTENT_I18N.manifesto_title_en || 'GIOVANNI FRONTINI');
  }

  if (bio1) {
    bio1.textContent = currentLang === 'ES'
      ? (CONTENT_I18N.bio1_es || bio1.textContent)
      : (CONTENT_I18N.bio1_en || bio1.textContent);
  }

  if (bio2) {
    bio2.textContent = currentLang === 'ES'
      ? (CONTENT_I18N.bio2_es || bio2.textContent)
      : (CONTENT_I18N.bio2_en || bio2.textContent);
  }

  const bio3 = document.getElementById('about-bio-p3');
  if (bio3 && (CONTENT_I18N.bio3_es || CONTENT_I18N.bio3_en)) {
    bio3.textContent = currentLang === 'ES'
      ? (CONTENT_I18N.bio3_es || bio3.textContent)
      : (CONTENT_I18N.bio3_en || bio3.textContent);
  }

  const quoteEl = document.getElementById('about-quote');
  if (quoteEl && (CONTENT_I18N.quote_es || CONTENT_I18N.quote_en)) {
    quoteEl.textContent = currentLang === 'ES'
      ? (CONTENT_I18N.quote_es || quoteEl.textContent)
      : (CONTENT_I18N.quote_en || quoteEl.textContent);
  }

  if (btnText) {
    btnText.textContent = currentLang === 'ES'
      ? (CONTENT_I18N.details_btn_es || 'DETALLES')
      : (CONTENT_I18N.details_btn_en || 'DETAILS');
  }

  if (studioInfo && (CONTENT_I18N.location_es || CONTENT_I18N.location_en)) {
    studioInfo.innerHTML = currentLang === 'ES'
      ? CONTENT_I18N.location_es
      : (CONTENT_I18N.location_en || CONTENT_I18N.location_es);
  }

  if (servicesInfo && (CONTENT_I18N.services_es || CONTENT_I18N.services_en)) {
    servicesInfo.innerHTML = currentLang === 'ES'
      ? CONTENT_I18N.services_es
      : (CONTENT_I18N.services_en || CONTENT_I18N.services_es);
  }

  const igLink = document.getElementById('about-instagram-link');
  if (igLink && CONTENT_I18N.instagram) {
    igLink.href = CONTENT_I18N.instagram;
    igLink.textContent = CONTENT_I18N.instagram_handle || '@GIOVANNIFRONTINI';
  }

  const portraitImg = document.getElementById('about-portrait-img');
  if (portraitImg && CONTENT_I18N.portraitImage) {
    portraitImg.src = CONTENT_I18N.portraitImage;
  }
}

/* --------------------------------------------------------------------------
   10. VIEW 2B: MÁRMOL SHOWCASE RENDERER
   -------------------------------------------------------------------------- */
function renderMarmolShowcase() {
  const container = document.getElementById('marmol-grid');
  if (!container) return;
  container.innerHTML = '';

  const isEs = currentLang === 'ES';

  MARMOL_DATA.forEach((item) => {
    const card = document.createElement('div');

    if (item.video) {
      card.className = 'marmol-card-video';
      const video = document.createElement('video');
      video.src = item.video;
      if (item.thumbnail) video.poster = item.thumbnail;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.className = 'marmol-video-element';
      card.appendChild(video);
    } else if (item.image_before && item.image_after) {
      card.className = 'marmol-card-comparison';
      const wrapper = document.createElement('div');
      wrapper.className = 'comparison-wrapper';

      const imgBefore = document.createElement('img');
      imgBefore.src = item.image_before;
      imgBefore.alt = 'Antes';
      imgBefore.className = 'comparison-img';

      const imgAfter = document.createElement('img');
      imgAfter.src = item.image_after;
      imgAfter.alt = 'Después';
      imgAfter.className = 'comparison-overlay-after';
      imgAfter.style.opacity = '1';

      const badge = document.createElement('div');
      badge.className = 'comparison-badge';
      badge.textContent = isEs ? 'DESPUÉS' : 'AFTER';

      wrapper.appendChild(imgBefore);
      wrapper.appendChild(imgAfter);
      wrapper.appendChild(badge);

      card.addEventListener('mouseenter', () => {
        imgAfter.style.opacity = '0';
        badge.textContent = isEs ? 'ESTADO ANTERIOR' : 'BEFORE STATE';
      });
      card.addEventListener('mouseleave', () => {
        imgAfter.style.opacity = '1';
        badge.textContent = isEs ? 'DESPUÉS' : 'AFTER';
      });

      card.appendChild(wrapper);
    } else {
      card.className = 'marmol-card-wide';
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title;
      img.loading = 'lazy';
      card.appendChild(img);
    }

    const meta = document.createElement('div');
    meta.className = 'marmol-card-meta';

    const type = document.createElement('div');
    type.className = 'marmol-card-type';
    type.textContent = isEs ? (item.type_es || item.type) : (item.type_en || item.type);

    const title = document.createElement('h3');
    title.className = 'marmol-card-title';
    title.textContent = isEs ? (item.title_es || item.title) : (item.title_en || item.title);

    const desc = document.createElement('p');
    desc.className = 'marmol-card-desc';
    desc.textContent = isEs ? (item.desc_es || item.desc_en) : (item.desc_en || item.desc_es);

    meta.appendChild(type);
    meta.appendChild(title);
    meta.appendChild(desc);

    card.appendChild(meta);
    container.appendChild(card);
  });
}

/* --------------------------------------------------------------------------
   11. INSTANT CURSOR ENGINE (Zero Delay)
   -------------------------------------------------------------------------- */
function setupCursor() {
  if (!cursorElem) return;

  let hasMoved = false;

  window.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    cursorElem.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

    if (!hasMoved) {
      hasMoved = true;
      cursorElem.classList.add('cursor-ready');
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cursorElem.classList.remove('cursor-ready');
  });

  document.addEventListener('mouseenter', () => {
    if (hasMoved) {
      cursorElem.classList.add('cursor-ready');
    }
  });
}

function updateCursorContent(title, sub) {
  if (cursorTitle) cursorTitle.textContent = title;
  if (cursorSub) cursorSub.textContent = sub;
}



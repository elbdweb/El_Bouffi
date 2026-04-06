const SIDEBAR_FALLBACK = `
<aside class="site-sidebar" aria-label="Navigation principale">
  <div class="sidebar-top">
    <a class="brand home-link" href="index.html" aria-label="Retour à l'accueil">
      <img class="brand-photo" src="FrontPic/186374429.jpg" alt="Photo de Driss El Bouffi" width="88" height="88">
      <span class="brand-copy">
        <span class="brand-first">Driss</span>
        <span class="brand-last">EL BOUFFI</span>
      </span>
    </a>

    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="sidebar-nav">
      <span class="nav-toggle-icon" aria-hidden="true">▼</span>
      <span class="sr-only">Ouvrir la navigation</span>
    </button>
  </div>

  <div class="sidebar-panel" id="sidebar-nav">
    <nav class="sidebar-nav">
      <p class="sidebar-label">Portfolio</p>
      <a href="formation.html" data-nav="formation">Formation</a>
      <a href="pea.html" data-nav="pea">Projets significatifs</a>
    </nav>

    <div class="sidebar-actions">
      <a class="sidebar-button" href="Docs/CV_EL_BOUFFI.pdf" target="_blank" rel="noopener" download="CV_EL_BOUFFI.pdf">Télécharger le CV</a>
      <a class="sidebar-contact" href="contact.html" data-nav="contact">Contact</a>
    </div>

    <div class="sidebar-social" aria-label="Présence en ligne">
      <a class="social-icon" href="https://www.linkedin.com/in/driss-el-bouffi-25a394316" target="_blank" rel="noopener" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.94 8.5H3.56V20h3.38V8.5Zm-1.69-5A1.96 1.96 0 0 0 3.25 5.5c0 1.07.84 1.94 1.97 1.94h.03c1.15 0 1.97-.87 1.97-1.94A1.95 1.95 0 0 0 5.28 3.5h-.03ZM20.75 13.03c0-3.43-1.83-5.03-4.27-5.03-1.97 0-2.85 1.08-3.34 1.84V8.5H9.76c.04.89 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.13-.92.27-.68.9-1.38 1.95-1.38 1.38 0 1.93 1.04 1.93 2.57V20h3.38v-6.97Z"></path>
        </svg>
        <span class="sr-only">LinkedIn</span>
      </a>
      <a class="social-icon" href="https://github.com/elbdweb" target="_blank" rel="noopener" aria-label="GitHub">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.59 2 12.24c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.49 0-.24-.01-1.03-.01-1.87-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.35 1.13 2.92.87.09-.67.35-1.13.63-1.39-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.64 1.03 2.76 0 3.95-2.35 4.82-4.58 5.07.36.32.69.95.69 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.24C22 6.59 17.52 2 12 2Z"></path>
        </svg>
        <span class="sr-only">GitHub</span>
      </a>
    </div>
  </div>
</aside>
`;

async function injectSidebar() {
  const mount = document.querySelector('[data-sidebar-mount]');
  if (!mount) return;

  try {
    const response = await fetch('partials/sidebar.html', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    mount.innerHTML = await response.text();
  } catch (error) {
    mount.innerHTML = SIDEBAR_FALLBACK;
  }

  setupNavigation();
  setupReveal();
}

function setupNavigation() {
  const currentPage = document.body.dataset.page;
  const activeLink = document.querySelector(`[data-nav="${currentPage}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
    activeLink.setAttribute('aria-current', 'page');
  }

  if (currentPage === 'index') {
    const homeLink = document.querySelector('.home-link');
    if (homeLink) {
      homeLink.classList.add('is-home');
      homeLink.setAttribute('aria-current', 'page');
    }
  }

  const toggle = document.querySelector('.nav-toggle');
  const panel = document.querySelector('.sidebar-panel');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function setupReveal() {
  const revealItems = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || !revealItems.length) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
}

injectSidebar();

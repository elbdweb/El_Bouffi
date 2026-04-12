const SIDEBAR_FALLBACK = `
<aside class="barre-laterale-site" aria-label="Navigation principale">
	<div class="haut-barre-laterale">
		<a class="marque lien-accueil" href="index.html" aria-label="Retour à l'accueil">
			<img class="marque-photo" src="FrontPic/186374429.jpg" alt="Photo de Driss El Bouffi" width="88" height="88" decoding="async">
			<span class="marque-texte">
				<span class="marque-prenom">Driss</span>
				<span class="marque-nom">EL BOUFFI</span>
			</span>
		</a>

		<button class="bascule-navigation" type="button" aria-expanded="false" aria-controls="navigation-barre-laterale">
			<span class="icone-bascule-navigation" aria-hidden="true">▼</span>
			<span class="masque-visuel">Ouvrir la navigation</span>
		</button>
	</div>

	<div class="panneau-barre-laterale" id="navigation-barre-laterale">
		<nav class="navigation-barre-laterale">
			<p class="etiquette-barre-laterale">Portfolio</p>
			<a href="competences.html" data-nav="competences">Compétences</a>
			<a href="formation.html" data-nav="formation">Formation</a>
			<a href="projet.html" data-nav="projet">Projets significatifs</a>
		</nav>

		<div class="actions-barre-laterale">
			<a class="bouton-barre-laterale" href="Docs/CV_EL_BOUFFI.pdf" target="_blank" rel="noopener noreferrer" download="CV_EL_BOUFFI.pdf">Télécharger le CV</a>
			<a class="contact-barre-laterale" href="contact.html" data-nav="contact">Contact</a>
		</div>

		<div class="reseaux-barre-laterale" aria-label="Présence en ligne">
			<a class="icone-reseau" href="https://www.linkedin.com/in/driss-el-bouffi-25a394316" target="_blank" rel="noopener noreferrer" referrerpolicy="strict-origin-when-cross-origin" aria-label="LinkedIn">
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M6.94 8.5H3.56V20h3.38V8.5Zm-1.69-5A1.96 1.96 0 0 0 3.25 5.5c0 1.07.84 1.94 1.97 1.94h.03c1.15 0 1.97-.87 1.97-1.94A1.95 1.95 0 0 0 5.28 3.5h-.03ZM20.75 13.03c0-3.43-1.83-5.03-4.27-5.03-1.97 0-2.85 1.08-3.34 1.84V8.5H9.76c.04.89 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.13-.92.27-.68.9-1.38 1.95-1.38 1.38 0 1.93 1.04 1.93 2.57V20h3.38v-6.97Z"></path>
				</svg>
				<span class="masque-visuel">LinkedIn</span>
			</a>
			<a class="icone-reseau" href="https://github.com/elbdweb" target="_blank" rel="noopener noreferrer" referrerpolicy="strict-origin-when-cross-origin" aria-label="GitHub">
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M12 2C6.48 2 2 6.59 2 12.24c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.49 0-.24-.01-1.03-.01-1.87-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.35 1.13 2.92.87.09-.67.35-1.13.63-1.39-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.64 1.03 2.76 0 3.95-2.35 4.82-4.58 5.07.36.32.69.95.69 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.24C22 6.59 17.52 2 12 2Z"></path>
				</svg>
				<span class="masque-visuel">GitHub</span>
			</a>
		</div>
	</div>

	<div class="media-bas-barre-laterale" aria-hidden="true">
		<img class="gif-barre-laterale" src="FrontPic/giphy.gif" alt="" width="500" height="281" loading="lazy" decoding="async">
	</div>
</aside>
`;

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SAFE_IMAGE_PROTOCOLS = new Set(['http:', 'https:', 'data:']);
const FORBIDDEN_TAGS = 'script, iframe, object, embed, style, link[rel="import"], meta[http-equiv="refresh"], base, form';

function mergeRelValues(currentValue, requiredValues) {
	const values = new Set(String(currentValue || '').split(/\s+/).filter(Boolean));
	requiredValues.forEach((value) => values.add(value));
	return Array.from(values).join(' ');
}

function resolveProtocol(url) {
	try {
		return new URL(url, window.location.href).protocol;
	} catch (error) {
		return '';
	}
}

function hasExplicitScheme(value) {
	return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

function isRelativeUrl(value) {
	return !hasExplicitScheme(value) && !String(value).startsWith('//');
}

function isSafeUrl(url, type) {
	if (!url) return false;
	const trimmed = String(url).trim();
	if (!trimmed) return false;
	if (trimmed.startsWith('#') || trimmed.startsWith('?') || trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.startsWith('/')) return true;
	if (isRelativeUrl(trimmed)) return true;

	const protocol = resolveProtocol(trimmed);
	if (!protocol) return false;

	if (type === 'image') {
		if (protocol === 'data:') {
			return /^data:image\//i.test(trimmed);
		}
		return SAFE_IMAGE_PROTOCOLS.has(protocol);
	}

	return SAFE_LINK_PROTOCOLS.has(protocol);
}

function sanitizeElementAttributes(root) {
	root.querySelectorAll('*').forEach((element) => {
		Array.from(element.attributes).forEach((attribute) => {
			const name = attribute.name.toLowerCase();
			const value = attribute.value;

			if (name.startsWith('on')) {
				element.removeAttribute(attribute.name);
				return;
			}

			if (name === 'srcset') {
				element.removeAttribute(attribute.name);
				return;
			}

			if (name === 'href' && !isSafeUrl(value, 'link')) {
				element.removeAttribute(attribute.name);
				return;
			}

			if (name === 'src' && !isSafeUrl(value, 'image')) {
				element.removeAttribute(attribute.name);
				return;
			}

			if (name === 'target' && value !== '_blank') {
				element.removeAttribute(attribute.name);
			}
		});
	});
}

function hardenExternalLinks(root = document) {
	root.querySelectorAll('a[href]').forEach((link) => {
		const href = String(link.getAttribute('href') || '').trim();
		if (!isSafeUrl(href, 'link')) {
			link.removeAttribute('href');
			link.setAttribute('aria-disabled', 'true');
			return;
		}

		const target = link.getAttribute('target');
		if (target === '_blank') {
			link.setAttribute('rel', mergeRelValues(link.getAttribute('rel'), ['noopener', 'noreferrer']));
		}

		if (/^https?:\/\//i.test(href)) {
			link.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
		}
	});
}

function sanitizeSidebarMarkup(markup) {
	const parser = new DOMParser();
	const documentFragment = parser.parseFromString(markup, 'text/html');
	documentFragment.querySelectorAll(FORBIDDEN_TAGS).forEach((element) => element.remove());
	sanitizeElementAttributes(documentFragment.body);
	hardenExternalLinks(documentFragment.body);

	const fragment = document.createDocumentFragment();
	Array.from(documentFragment.body.childNodes).forEach((node) => {
		fragment.appendChild(document.importNode(node, true));
	});
	return fragment;
}

async function injectSidebar() {
	const mount = document.querySelector('[data-sidebar-mount]');
	if (!mount) return;

	let sidebarMarkup = SIDEBAR_FALLBACK;

	try {
		const response = await fetch('partials/sidebar.html', { cache: 'no-store' });
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		sidebarMarkup = await response.text();
	} catch (error) {
		sidebarMarkup = SIDEBAR_FALLBACK;
	}

	const fragment = sanitizeSidebarMarkup(sidebarMarkup);
	mount.replaceChildren(fragment);

	setupNavigation();
	setupSidebarGif();
	setupReveal();
	hardenExternalLinks(document);
}

function setupNavigation() {
	const currentPage = document.body.dataset.page;
	const activeLink = document.querySelector(`[data-nav="${currentPage}"]`);
	if (activeLink) {
		activeLink.classList.add('actif');
		activeLink.setAttribute('aria-current', 'page');
	}

	if (currentPage === 'index') {
		const homeLink = document.querySelector('.lien-accueil');
		if (homeLink) {
			homeLink.classList.add('est-accueil');
			homeLink.setAttribute('aria-current', 'page');
		}
	}

	const toggle = document.querySelector('.bascule-navigation');
	const panneau = document.querySelector('.panneau-barre-laterale');
	if (!toggle || !panneau) return;

	toggle.addEventListener('click', () => {
		const isOpen = panneau.classList.toggle('est-ouvert');
		toggle.setAttribute('aria-expanded', String(isOpen));
	});

	panneau.querySelectorAll('a[href]').forEach((link) => {
		link.addEventListener('click', () => {
			panneau.classList.remove('est-ouvert');
			toggle.setAttribute('aria-expanded', 'false');
		});
	});
}

function setupSidebarGif() {
	const gif = document.querySelector('.gif-barre-laterale');
	const media = document.querySelector('.media-bas-barre-laterale');
	if (!gif || !media) return;

	gif.addEventListener('error', () => {
		media.style.display = 'none';
	}, { once: true });
}

function setupReveal() {
	const revealItems = document.querySelectorAll('[data-reveal]');
	if (!('IntersectionObserver' in window) || !revealItems.length) {
		revealItems.forEach((item) => item.classList.add('est-visible'));
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('est-visible');
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.02 });

	revealItems.forEach((item) => observer.observe(item));
}

hardenExternalLinks(document);
injectSidebar();

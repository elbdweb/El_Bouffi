(function () {
	const portfolio = window.PORTFOLIO_DATA;
	const currentPage = document.body && document.body.dataset ? document.body.dataset.page : '';

	if (!portfolio || !currentPage) return;

	const { skillsData, categoryColors } = portfolio;

	function uniqueCompetences(rows) {
		const seen = new Set();
		return rows.filter((row) => {
			const key = row.competence.toLowerCase();
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	}

	function aggregateByCategory(data) {
		return data.reduce((acc, item) => {
			acc[item.categorie] = (acc[item.categorie] || 0) + 1;
			return acc;
		}, {});
	}

	function aggregateByExperience(data) {
		return data.reduce((acc, item) => {
			if (!acc[item.metier]) acc[item.metier] = {};
			acc[item.metier][item.categorie] = (acc[item.metier][item.categorie] || 0) + 1;
			return acc;
		}, {});
	}

	function normalize(value) {
		return value
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[’']/g, ' ')
			.replace(/[^a-z0-9]+/g, ' ')
			.trim();
	}

	function tokenize(value) {
		return normalize(value).split(/\s+/).filter(Boolean);
	}


	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function safeCssColor(value, fallback = '#123f73') {
		const normalized = String(value || '').trim();
		return /^#([0-9a-f]{3,8})$/i.test(normalized) ? normalized : fallback;
	}

	function animerChargementTableaux(conteneurs) {
		const elements = conteneurs.filter(Boolean);
		if (!elements.length) return;

		elements.forEach((element, index) => {
			element.classList.add('tableau-charge');
			element.style.transitionDelay = `${index * 90}ms`;
		});

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				elements.forEach((element) => element.classList.add('est-visible'));
			});
		});
	}

	function levenshtein(a, b) {
		if (a === b) return 0;
		if (!a.length) return b.length;
		if (!b.length) return a.length;

		const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

		for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
		for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

		for (let i = 1; i <= a.length; i += 1) {
			for (let j = 1; j <= b.length; j += 1) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1;
				matrix[i][j] = Math.min(
					matrix[i - 1][j] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j - 1] + cost
				);
			}
		}

		return matrix[a.length][b.length];
	}

	function fuzzyTokenMatch(token, candidates) {
		return candidates.some((candidate) => {
			if (!candidate || candidate.length < 3) return false;
			if (candidate === token) return true;
			if (token.length >= 4 && candidate.includes(token)) return true;
			if (token.length >= 3 && candidate.startsWith(token)) return true;

			if (Math.abs(candidate.length - token.length) > 2) return false;

			const maxDistance =
				token.length >= 9 ? 2 :
				token.length >= 5 ? 1 :
				0;

			return maxDistance > 0 && levenshtein(token, candidate) <= maxDistance;
		});
	}


	function initPageAccueil() {
		if (currentPage !== 'index') return;

		const cartesTableauxAccueil = Array.from(document.querySelectorAll('.carte-anneau-domaine'));
		animerChargementTableaux(cartesTableauxAccueil);
	}

	function initCompetencesPage() {
		const requiredIds = [
			'domain-chart', 'technical-chart', 'technical-legend', 'experience-chart', 'experience-legend',
			'skills-table-body', 'competences-resultats', 'skills-search', 'competences-reinit', 'skill-modal'
		];

		if (!requiredIds.every((id) => document.getElementById(id))) return;

		const experienceShortLabels = {
			"Licence d'economie": 'Licence',
			"Master - Systeme d\'Information Economique et Financier": 'Master',
			'FinOps (Stage)': 'Septeo'
		};

		const categoryAliases = {
			Finance: [
				'finance', 'financier', 'financiere', 'financiers', 'bancaire', 'banque', 'argent',
				'gestion', 'business', 'budget', 'cout', 'couts', 'comptabilite', 'compta',
				'analyse financiere', 'performance', 'pilotage', 'decision', 'reporting', 'mbfa'
			],
			Data: [
				'data', 'donnee', 'donnees', 'dataset', 'analytics', 'analytique', 'analyse',
				'statistiques', 'stats', 'econometrie', 'machine learning', 'ml', 'ia', 'ai',
				'bi', 'dashboard', 'visualisation', 'dataviz', 'base de donnees', 'bdd',
				'database', 'sql', 'mysql', 'entrepot', 'historisation', 'tracabilite', 'prevision'
			],
			Informatique: [
				'informatique', 'tech', 'technique', 'developpement', 'developpeur', 'dev',
				'programmation', 'code', 'logiciel', 'application', 'web', 'backend',
				'frontend', 'script', 'software', 'algorithmique', 'systeme', 'reseau',
				'securite', 'bases', 'bdd', 'database'
			],
			Cloud: [
				'cloud', 'devops', 'infra', 'infrastructure', 'ops', 'plateforme', 'platform',
				'kubernetes', 'k8s', 'kubectl', 'helm', 'orchestration', 'conteneur',
				'conteneurs', 'container', 'containers', 'deploiement', 'deployment',
				'observabilite', 'run', 'sre'
			],
			Autres: [
				'gestion', 'pilotage', 'decision', 'gouvernance', 'juridique', 'conformite',
				'management', 'organisation', 'tableau de bord', 'dashboard'
			]
		};

		const experienceAliases = {
			"Licence d'economie": [
				'licence', 'universite', 'faculte', 'academique', 'fondamentaux', 'socle',
				'economie', 'eco', 'formation initiale'
			],
			"Master - Systeme d'Information Economique et Financier": [
				'master', 'sief', 'mbfa', 'specialisation', 'avance', 'expertise',
				'universite', 'faculte', 'formation specialisee'
			],
			"FinOps (Stage)": [
				'septeo', 'stage', 'entreprise', 'professionnel', 'pro', 'finops',
				'experience', 'metier', 'infrastructure', 'cloud'
			]
		};

		const serviceAliases = {
			"Faculte d'economie": ['universite', 'academique', 'enseignement', 'faculte', 'campus'],
			'Infrastructure et Cloud': ['infra', 'cloud', 'ops', 'devops', 'production', 'run']
		};

		const establishmentAliases = {
			'Universite de Montpellier': ['universite', 'montpellier', 'enseignement superieur', 'academique'],
			Septeo: ['septeo', 'entreprise', 'professionnel', 'societe', 'business']
		};

		const competenceAliases = {
			Microeconomie: ['economie', 'eco', 'micro', 'analyse economique'],
			Macroeconomie: ['economie', 'macro', 'analyse economique', 'politique economique'],
			"Economie internationale": ['economie', 'international', 'commerce', 'mondialisation'],
			"Droit des affaires": ['droit', 'juridique', 'business law', 'reglementation'],
			"Management des organisations": ['management', 'gestion', 'organisation', 'pilotage'],
			Cybersecurite: ['securite', 'security', 'cyber', 'protection', 'risque'],
			RGPD: ['conformite', 'privacy', 'donnees personnelles', 'reglementation', 'gdpr'],
			"Droit informatique": ['juridique', 'conformite', 'reglementation', 'rgpd'],
			"Aide a la decision": ['decision', 'pilotage', 'analyse', 'management', 'reporting'],
			"Tableaux de bord": ['dashboard', 'reporting', 'pilotage', 'bi', 'visualisation'],
			Kubernetes: ['k8s', 'devops', 'orchestration', 'containers', 'conteneurs', 'cloud'],
			kubectl: ['k8s', 'cli', 'commande', 'terminal', 'cloud'],
			Helm: ['k8s', 'charts', 'package manager', 'deploy', 'cloud'],
			"Orchestration de conteneurs": ['containers', 'conteneurs', 'k8s', 'devops', 'cloud'],
			"Deploiement applicatif": ['deploy', 'deployment', 'release', 'devops', 'mise en production'],
			"Configuration applicative": ['config', 'application', 'settings', 'parametrage'],
			"Persistance des donnees": ['stockage', 'data', 'storage', 'persistency', 'database'],
			Observabilite: ['monitoring', 'logs', 'metriques', 'traces', 'supervision'],
			"Traitement de donnees": ['data processing', 'donnees', 'analyse', 'etl'],
			"Gestion de donnees": ['data management', 'donnees', 'governance', 'quality'],
			"Analyse de donnees": ['analytics', 'data analysis', 'analyse', 'insights'],
			Statistiques: ['stats', 'quantitatif', 'analyse statistique'],
			Probabilites: ['stats', 'mathematiques', 'modele probabiliste'],
			Echantillonnage: ['sampling', 'stats', 'sondage'],
			Econometrie: ['regression', 'modelisation', 'modele', 'quantitatif'],
			Optimisation: ['optimisation mathematique', 'recherche operationnelle'],
			"Entrepot de donnees": ['data warehouse', 'warehouse', 'bdd', 'database'],
			"Big data": ['data engineering', 'donnees massives', 'volume', 'scale'],
			"Data mining": ['fouille de donnees', 'machine learning', 'ml', 'analyse predictive'],
			"Data visualisation": ['dataviz', 'dashboard', 'graphique', 'bi', 'visualisation'],
			"Power BI": ['bi', 'dashboard', 'reporting', 'visualisation'],
			"Intelligence artificielle": ['ia', 'ai', 'machine learning', 'ml'],
			LLM: ['ia', 'ai', 'genai', 'intelligence artificielle', 'language model'],
			"Series temporelles": ['time series', 'forecast', 'prevision'],
			Prevision: ['forecast', 'projection', 'anticipation'],
			SQL: ['bdd', 'database', 'requete', 'query', 'base de donnees'],
			MySQL: ['sql', 'bdd', 'database', 'base de donnees'],
			"Modelisation de donnees": ['data model', 'schema', 'base de donnees'],
			"Historisation des donnees": ['historique', 'versioning', 'data lineage', 'tracabilite'],
			"Tracabilite des calculs": ['audit', 'lineage', 'controle', 'fiabilite'],
			"Analyse financiere": ['finance', 'performance', 'ratios', 'bilan'],
			"Comptabilite generale": ['compta', 'comptabilite', 'gestion', 'finance'],
			"Comptabilite analytique": ['compta', 'couts', 'gestion', 'finance'],
			"Finance internationale": ['banque', 'bancaire', 'international', 'marche'],
			"Economie financiere": ['finance', 'bancaire', 'marche'],
			"Finance de marche": ['trading', 'marche', 'banque', 'finance'],
			"Finance d'entreprise": ['corporate finance', 'entreprise', 'finance'],
			"Modeles financiers": ['finance quantitative', 'modelisation', 'prediction'],
			"Prevision financiere": ['forecast', 'finance', 'projection', 'budget'],
			"Allocation de couts": ['gestion', 'cost allocation', 'finops', 'couts'],
			Amortissement: ['compta', 'finance', 'gestion', 'cout'],
			"Automatisation des calculs financiers": ['automation', 'finance', 'automatisation', 'finops'],
			"Fondamentaux de l'Informatique": ['informatique', 'tech', 'bases', 'fondamentaux'],
			"Base de donnees": ['bdd', 'database', 'sql', 'schema'],
			Algorithmique: ['algo', 'programmation', 'logique', 'code'],
			Programmation: ['code', 'developpement', 'dev', 'software'],
			Python: ['dev', 'developpement', 'programmation', 'script', 'automation', 'automatisation'],
			VBA: ['excel', 'macro', 'automatisation', 'office'],
			JavaScript: ['js', 'web', 'frontend', 'developpement'],
			SAS: ['statistiques', 'analyse', 'data', 'bi'],
			"Systemes d'information": ['si', 'information systems', 'architecture', 'organisation'],
			Linux: ['systeme', 'terminal', 'shell', 'infra', 'ops'],
			"Reseau informatique": ['network', 'reseau', 'tcp ip', 'dns', 'infra'],
			Git: ['github', 'versioning', 'versionnement', 'repository', 'repo'],
			PHP: ['web', 'backend', 'developpement', 'serveur'],
			Twig: ['template', 'php', 'frontend', 'web'],
			"Chart.js": ['graphique', 'charts', 'dashboard', 'visualisation', 'js']
		};

		function buildSearchIndex(row) {
			const aliases = [
				...(categoryAliases[row.categorie] || []),
				...(experienceAliases[row.metier] || []),
				...(serviceAliases[row.service] || []),
				...(establishmentAliases[row.etablissement] || []),
				...(competenceAliases[row.competence] || [])
			];

			const joined = [
				row.competence,
				row.categorie,
				row.metier,
				row.service,
				row.etablissement,
				...aliases
			].join(' ');

			return {
				text: normalize(joined),
				tokens: tokenize(joined)
			};
		}

		const indexedSkills = skillsData.map((skill) => {
			const searchIndex = buildSearchIndex(skill);
			return {
				...skill,
				_searchText: searchIndex.text,
				_searchTokens: searchIndex.tokens,
				_competenceNormalized: normalize(skill.competence),
				_categorieNormalized: normalize(skill.categorie),
				_metierNormalized: normalize(skill.metier),
				_serviceNormalized: normalize(skill.service),
				_etablissementNormalized: normalize(skill.etablissement)
			};
		});

		function compareAlphabetically(a, b) {
			return a.competence.localeCompare(b.competence, 'fr', { sensitivity: 'base' });
		}

		function tokenMatchesField(token, fieldValue) {
			if (!fieldValue) return false;
			if (fieldValue === token) return true;
			if (fieldValue.includes(token)) return true;
			return fuzzyTokenMatch(token, tokenize(fieldValue));
		}

		function rowMatches(row, query) {
			return getSkillMatchScore(row, query) !== null;
		}

		function getSkillMatchScore(row, query) {
			const cleanedQuery = normalize(query);
			if (!cleanedQuery) {
				return {
					priority: 99,
					subPriority: 0,
					label: row.competence.toLowerCase()
				};
			}

			const queryTokens = tokenize(query);
			if (!queryTokens.length) return null;

			const competenceExact = row._competenceNormalized === cleanedQuery;
			const categorieExact = row._categorieNormalized === cleanedQuery;
			const metierExact = row._metierNormalized === cleanedQuery;
			const serviceExact = row._serviceNormalized === cleanedQuery;
			const etablissementExact = row._etablissementNormalized === cleanedQuery;

			if (competenceExact) {
				return {
					priority: 0,
					subPriority: 0,
					label: row.competence.toLowerCase()
				};
			}

			if (categorieExact) {
				return {
					priority: 1,
					subPriority: 0,
					label: row.competence.toLowerCase()
				};
			}

			if (metierExact || serviceExact || etablissementExact) {
				return {
					priority: 2,
					subPriority: 0,
					label: row.competence.toLowerCase()
				};
			}

			const tokenScores = queryTokens.map((token) => {
				if (tokenMatchesField(token, row._competenceNormalized)) return 0;
				if (tokenMatchesField(token, row._categorieNormalized)) return 1;
				if (
					tokenMatchesField(token, row._metierNormalized) ||
					tokenMatchesField(token, row._serviceNormalized) ||
					tokenMatchesField(token, row._etablissementNormalized)
				) return 2;
				if (fuzzyTokenMatch(token, row._searchTokens) || row._searchText.includes(token)) return 3;
				return null;
			});

			if (tokenScores.some((score) => score === null)) return null;

			return {
				priority: Math.min(...tokenScores),
				subPriority: tokenScores.reduce((sum, score) => sum + score, 0),
				label: row.competence.toLowerCase()
			};
		}

		function sortSkillsByRelevance(data, query) {
			const cleanedQuery = normalize(query);
			if (!cleanedQuery) {
				return [...data].sort(compareAlphabetically);
			}

			return [...data].sort((a, b) => {
				const scoreA = getSkillMatchScore(a, query);
				const scoreB = getSkillMatchScore(b, query);

				if (!scoreA && !scoreB) return compareAlphabetically(a, b);
				if (!scoreA) return 1;
				if (!scoreB) return -1;
				if (scoreA.priority !== scoreB.priority) return scoreA.priority - scoreB.priority;
				if (scoreA.subPriority !== scoreB.subPriority) return scoreA.subPriority - scoreB.subPriority;
				return compareAlphabetically(a, b);
			});
		}

		function renderDomainChart() {
			const container = document.getElementById('domain-chart');
			if (!container) return;

			const counts = Object.entries(aggregateByCategory(skillsData)).sort((a, b) => b[1] - a[1]);
			const max = Math.max(...counts.map(([, value]) => value));

			container.innerHTML = counts.map(([label, value]) => `
				<div class="competences-ligne-barre">
					<div class="competences-etiquettes-barre">
						<span>${escapeHtml(label)}</span>
						<strong>${value}</strong>
					</div>
					<div class="competences-piste-barre">
						<span class="competences-barre-remplissage" style="--bar-width:${(value / max) * 100}%; background:${safeCssColor(categoryColors[label], '#123f73')};"></span>
					</div>
				</div>
			`).join('');
		}

		function renderTechnicalChart() {
			const container = document.getElementById('technical-chart');
			const legend = document.getElementById('technical-legend');
			if (!container || !legend) return;

			const labels = ['Data', 'Informatique', 'Cloud'];
			const counts = aggregateByCategory(skillsData);
			const total = labels.reduce((sum, label) => sum + (counts[label] || 0), 0);

			let current = 0;
			const segments = labels.map((label) => {
				const value = counts[label] || 0;
				const angle = total ? (value / total) * 360 : 0;
				const start = current;
				current += angle;

				return {
					label,
					value,
					percentage: total ? (value / total) * 100 : 0,
					start,
					end: current
				};
			});

			const gradient = segments
				.map((segment) => `${safeCssColor(categoryColors[segment.label])} ${segment.start}deg ${segment.end}deg`)
				.join(', ');

			container.style.background = `conic-gradient(${gradient})`;
			container.innerHTML = '<div class="competences-centre-anneau"><strong>' + total + '</strong></div>';

			legend.innerHTML = segments.map((segment) => `
				<div class="competences-element-legende">
					<span class="competences-echantillon-legende" style="background:${safeCssColor(categoryColors[segment.label])};"></span>
					<div>
						<strong>${escapeHtml(segment.label)}</strong>
						<span>${segment.value} · ${segment.percentage.toFixed(1).replace('.', ',')} %</span>
					</div>
				</div>
			`).join('');
		}

		function renderExperienceChart() {
			const container = document.getElementById('experience-chart');
			const legend = document.getElementById('experience-legend');
			if (!container || !legend) return;

			const order = [
				"Licence d'economie",
				"Master - Systeme d'Information Economique et Financier",
				'FinOps (Stage)'
			];

			const categories = ['Finance', 'Data', 'Informatique', 'Cloud', 'Autres'];
			const counts = aggregateByExperience(skillsData);

			const totals = order.map((label) =>
				categories.reduce((sum, category) => sum + ((counts[label] && counts[label][category]) || 0), 0)
			);

			const max = Math.max(...totals);

			container.innerHTML = order.map((label, index) => {
				const total = totals[index];

				const stacks = categories.map((category) => {
					const value = (counts[label] && counts[label][category]) || 0;
					if (!value) return '';
					return `
						<span
							class="competences-partie-pile"
							style="--stack-height:${(value / max) * 100}%; background:${safeCssColor(categoryColors[category])};"
							title="${escapeHtml(category)} : ${value}"
						></span>
					`;
				}).join('');

				return `
					<div class="competences-colonne-pile">
						<div class="competences-barre-pile">${stacks}</div>
						<strong>${total}</strong>
						<span>${escapeHtml(experienceShortLabels[label])}</span>
					</div>
				`;
			}).join('');

			legend.innerHTML = categories.map((category) => `
				<div class="competences-etiquette-legende">
					<span class="competences-echantillon-legende" style="background:${safeCssColor(categoryColors[category])};"></span>
					<span>${escapeHtml(category)}</span>
				</div>
			`).join('');
		}

		const tableBody = document.getElementById('skills-table-body');
		const resultsLabel = document.getElementById('competences-resultats');
		const searchInput = document.getElementById('skills-search');
		const resetButton = document.getElementById('competences-reinit');
		const modal = document.getElementById('skill-modal');

		function openSkillModal(skill) {
			document.getElementById('skill-modal-title').textContent = skill.competence;
			document.getElementById('modal-category').textContent = skill.categorie;
			document.getElementById('modal-metier').textContent = skill.metier;
			document.getElementById('modal-service').textContent = skill.service;
			document.getElementById('modal-etablissement').textContent = skill.etablissement;
			modal.showModal();
		}

		function renderTable(data) {
			if (!tableBody) return;

			if (!data.length) {
				tableBody.innerHTML = `
					<tr>
						<td colspan="2">
							<div class="competences-vide">
								<strong>Aucun résultat</strong>
								<span>Essaie un terme plus large : dev, cloud, banque, gestion, data, sql, python, reporting...</span>
							</div>
						</td>
					</tr>
				`;
				return;
			}

			tableBody.innerHTML = data.map((skill, index) => `
				<tr>
					<td>
						<div class="competences-cellule-competence">
							<span class="competences-nom-competence">${escapeHtml(skill.competence)}</span>
							<span class="competences-pastille-competence">${escapeHtml(skill.categorie)}</span>
						</div>
					</td>
					<td class="competences-cellule-action">
						<button
							class="competences-bouton-info"
							type="button"
							data-index="${index}"
							aria-label="Afficher le détail de ${escapeHtml(skill.competence)}"
						>i</button>
					</td>
				</tr>
			`).join('');

			tableBody.querySelectorAll('.competences-bouton-info').forEach((bouton) => {
				bouton.addEventListener('click', () => {
					openSkillModal(data[Number(bouton.dataset.index)]);
				});
			});
		}

		function updateResultsCount(count) {
			if (!resultsLabel) return;
			resultsLabel.textContent = `${count} compétence${count > 1 ? 's' : ''} affichée${count > 1 ? 's' : ''}`;
		}

		function filterSkills() {
			const query = searchInput.value;
			const filtered = indexedSkills.filter((row) => rowMatches(row, query));
			const sorted = sortSkillsByRelevance(filtered, query);
			renderTable(sorted);
			updateResultsCount(sorted.length);
		}

		function initSummary() {
			document.getElementById('skills-total').textContent = skillsData.length;
			document.getElementById('skills-domains').textContent = new Set(skillsData.map((item) => item.categorie)).size;
			document.getElementById('skills-experiences').textContent = new Set(skillsData.map((item) => item.metier)).size;
		}

		searchInput.addEventListener('input', filterSkills);

		resetButton.addEventListener('click', () => {
			searchInput.value = '';
			filterSkills();
			searchInput.focus();
		});

		modal.addEventListener('click', (event) => {
			const rect = modal.getBoundingClientRect();
			const inDialog = (
				rect.top <= event.clientY &&
				event.clientY <= rect.top + rect.height &&
				rect.left <= event.clientX &&
				event.clientX <= rect.left + rect.width
			);
			if (!inDialog) modal.close();
		});

		initSummary();
		renderDomainChart();
		renderTechnicalChart();
		renderExperienceChart();
		filterSkills();
		animerChargementTableaux([
			document.getElementById('domain-chart') && document.getElementById('domain-chart').closest('.competences-carte-graphe'),
			document.getElementById('technical-chart') && document.getElementById('technical-chart').closest('.competences-carte-graphe'),
			document.getElementById('experience-chart') && document.getElementById('experience-chart').closest('.competences-carte-graphe')
		]);
	}

	function initFormationPage() {
		const formationConfigs = [
			{
				metier: 'FinOps (Stage)',
				prefix: 'stage'
			},
			{
				metier: "Master - Systeme d'Information Economique et Financier",
				prefix: 'master'
			},
			{
				metier: "Licence d'economie",
				prefix: 'licence'
			}
		];

		const macroColors = {
			economie: '#8f1d3f',
			informatique: '#1f6b45'
		};

		const macroLabels = {
			economie: 'Économie / Finance',
			informatique: 'Informatique / Data / Cloud'
		};

		function renderMacroDonut(donutId, legendId, rows) {
			const donut = document.getElementById(donutId);
			const legend = document.getElementById(legendId);
			if (!donut || !legend) return;

			const counts = {
				economie: 0,
				informatique: 0
			};

			rows.forEach((row) => {
				if (['Finance', 'Autres'].includes(row.categorie)) {
					counts.economie += 1;
				} else {
					counts.informatique += 1;
				}
			});

			const total = rows.length || 1;
			const ecoAngle = (counts.economie / total) * 360;
			const infAngle = 360 - ecoAngle;

			donut.style.background = `conic-gradient(
				${macroColors.economie} 0deg ${ecoAngle}deg,
				${macroColors.informatique} ${ecoAngle}deg ${ecoAngle + infAngle}deg
			)`;

			donut.innerHTML = `
				<div class="formation-centre-anneau">
					<strong>${rows.length}</strong>
				</div>
			`;

			const macroData = [
				{
					key: 'economie',
					value: counts.economie
				},
				{
					key: 'informatique',
					value: counts.informatique
				}
			];

			legend.innerHTML = macroData.map((item) => {
				const percentage = rows.length ? ((item.value / rows.length) * 100).toFixed(1).replace('.', ',') : '0,0';
				return `
					<div class="formation-element-legende">
						<span class="formation-pastille-legende" style="background:${macroColors[item.key]};"></span>
						<div>
							<strong>${escapeHtml(macroLabels[item.key])}</strong>
							<span>${item.value} · ${percentage} %</span>
						</div>
					</div>
				`;
			}).join('');
		}

		function renderCategoryBars(containerId, rows) {
			const container = document.getElementById(containerId);
			if (!container) return;

			const categories = ['Finance', 'Data', 'Informatique', 'Cloud', 'Autres'];

			const counts = categories.reduce((acc, category) => {
				acc[category] = rows.filter((row) => row.categorie === category).length;
				return acc;
			}, {});

			container.innerHTML = categories.map((category) => {
				const value = counts[category];
				const percentage = rows.length ? (value / rows.length) * 100 : 0;

				return `
					<div class="formation-ligne-barre">
						<div class="formation-infos-barre">
							<span>${escapeHtml(category)}</span>
							<strong>${value} · ${percentage.toFixed(1).replace('.', ',')} %</strong>
						</div>
						<div class="formation-piste-barre">
							<span class="formation-barre-remplissage" style="--bar-width:${percentage}%; background:${safeCssColor(categoryColors[category])};"></span>
						</div>
					</div>
				`;
			}).join('');
		}

		function renderTags(containerId, rows) {
			const container = document.getElementById(containerId);
			if (!container) return;
			const tags = uniqueCompetences(rows).map((row) => row.competence);
			container.innerHTML = tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
		}

		formationConfigs.forEach((config) => {
			const rows = skillsData.filter((row) => row.metier === config.metier);
			renderMacroDonut(`${config.prefix}-macro-donut`, `${config.prefix}-macro-legend`, rows);
			renderCategoryBars(`${config.prefix}-category-bars`, rows);
			renderTags(`${config.prefix}-tags`, rows);
		});

		animerChargementTableaux(Array.from(document.querySelectorAll('.formation-carte .formation-bloc')));
	}

	if (currentPage === 'index') {
		initPageAccueil();
	}

	if (currentPage === 'competences') {
		initCompetencesPage();
	}

	if (currentPage === 'formation') {
		initFormationPage();
	}
})();

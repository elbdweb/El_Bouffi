(function () {
	const portfolio = window.PORTFOLIO_DATA;
	const currentPage = document.body && document.body.dataset ? document.body.dataset.page : '';
	if (!portfolio || !currentPage) return;

	const { skillsData, categoryColors } = portfolio;
	const chartInstances = [];

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

	function destroyCharts() {
		while (chartInstances.length) {
			const chart = chartInstances.pop();
			if (chart && typeof chart.destroy === 'function') chart.destroy();
		}
	}

	function getCssVariable(name, fallback) {
		const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
		return value || fallback;
	}

	function commonChartOptions() {
		return {
			responsive: true,
			maintainAspectRatio: false,
			animation: {
				duration: 850,
				easing: 'easeOutCubic'
			},
			plugins: {
				legend: { display: false },
				tooltip: {
					backgroundColor: 'rgba(8, 19, 34, 0.92)',
					titleColor: '#f4fbff',
					bodyColor: '#f4fbff',
					padding: 12,
					displayColors: true,
					cornerRadius: 12
				}
			}
		};
	}

	function registerChart(canvas, config) {
		if (!canvas || !window.Chart) return null;
		const instance = new window.Chart(canvas, config);
		chartInstances.push(instance);
		return instance;
	}

	function createZeroData(values) {
		return values.map(() => 0);
	}

	function queueChartAnimation(chart, targetDatasets, delay = 240) {
		if (!chart || !Array.isArray(targetDatasets) || !targetDatasets.length) return;
		const safeTargets = targetDatasets.map((dataset) => dataset.map((value) => Number(value) || 0));
		window.setTimeout(() => {
			chart.data.datasets.forEach((dataset, index) => {
				dataset.data = safeTargets[index].slice();
			});
			chart.update();
		}, delay);
	}

	function renderLegend(container, items, variant) {
		if (!container) return;
		if (variant === 'inline') {
			container.innerHTML = items.map((item) => `
				<div class="competences-etiquette-legende">
					<span class="competences-echantillon-legende" style="background:${item.color};"></span>
					<span>${escapeHtml(item.label)}</span>
				</div>
			`).join('');
			return;
		}
		if (variant === 'formation') {
			container.innerHTML = items.map((item) => `
				<div class="formation-element-legende">
					<span class="formation-pastille-legende" style="background:${item.color};"></span>
					<div>
						<strong>${escapeHtml(item.label)}</strong>
						<span>${escapeHtml(item.value)}</span>
					</div>
				</div>
			`).join('');
			return;
		}
		container.innerHTML = items.map((item) => `
			<div class="competences-element-legende">
				<span class="competences-echantillon-legende" style="background:${item.color};"></span>
				<div>
					<strong>${escapeHtml(item.label)}</strong>
					<span>${escapeHtml(item.value)}</span>
				</div>
			</div>
		`).join('');
	}

	function createCenterTextPlugin(textTop, textBottom) {
		return {
			id: `centerText-${textTop}-${textBottom}`,
			afterDraw(chart) {
				const meta = chart.getDatasetMeta(0);
				if (!meta || !meta.data || !meta.data.length) return;
				const { ctx } = chart;
				const x = meta.data[0].x;
				const y = meta.data[0].y;
				ctx.save();
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = '#102844';
				ctx.font = '800 30px Inter, Segoe UI, sans-serif';
				ctx.fillText(String(textTop), x, y - 8);
				ctx.fillStyle = '#677b91';
				ctx.font = '700 11px Inter, Segoe UI, sans-serif';
				ctx.fillText(String(textBottom), x, y + 18);
				ctx.restore();
			}
		};
	}

	function createIndexDonut(canvasId, values, colors, total) {
		const canvas = document.getElementById(canvasId);
		if (!canvas) return;
		const chart = registerChart(canvas, {
			type: 'doughnut',
			data: {
				labels: ['Licence', 'Master', 'Stage'],
				datasets: [{
					data: createZeroData(values),
					backgroundColor: colors,
					borderWidth: 0,
					hoverOffset: 4
				}]
			},
			options: {
				...commonChartOptions(),
				cutout: '62%'
			},
			plugins: [createCenterTextPlugin(total, 'compétences')]
		});
		queueChartAnimation(chart, [values]);
	}

	function initPageAccueil() {
		if (currentPage !== 'index' || !window.Chart) return;
		createIndexDonut('index-chart-data', [8, 13, 5], ['#2563eb', '#1f6b45', '#f2a007'], 26);
		createIndexDonut('index-chart-informatique', [2, 10, 14], ['#2563eb', '#1f6b45', '#f2a007'], 26);
		createIndexDonut('index-chart-finance', [9, 6, 3], ['#2563eb', '#1f6b45', '#f2a007'], 18);

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
			Finance: ['finance', 'financier', 'financiere', 'financiers', 'bancaire', 'banque', 'argent', 'gestion', 'business', 'budget', 'cout', 'couts', 'comptabilite', 'compta', 'analyse financiere', 'performance', 'pilotage', 'decision', 'reporting', 'mbfa'],
			Data: ['data', 'donnee', 'donnees', 'dataset', 'analytics', 'analytique', 'analyse', 'statistiques', 'stats', 'econometrie', 'machine learning', 'ml', 'ia', 'ai', 'bi', 'dashboard', 'visualisation', 'dataviz', 'base de donnees', 'bdd', 'database', 'sql', 'mysql', 'entrepot', 'historisation', 'tracabilite', 'prevision'],
			Informatique: ['informatique', 'tech', 'technique', 'developpement', 'developpeur', 'dev', 'programmation', 'code', 'logiciel', 'application', 'web', 'backend', 'frontend', 'script', 'software', 'algorithmique', 'systeme', 'reseau', 'securite', 'bases', 'bdd', 'database'],
			Cloud: ['cloud', 'devops', 'infra', 'infrastructure', 'ops', 'plateforme', 'platform', 'kubernetes', 'k8s', 'kubectl', 'helm', 'orchestration', 'conteneur', 'conteneurs', 'container', 'containers', 'deploiement', 'deployment', 'observabilite', 'run', 'sre'],
			Autres: ['gestion', 'pilotage', 'decision', 'gouvernance', 'juridique', 'conformite', 'management', 'organisation', 'tableau de bord', 'dashboard']
		};

		const experienceAliases = {
			"Licence d'economie": ['licence', 'universite', 'faculte', 'academique', 'fondamentaux', 'socle', 'economie', 'eco', 'formation initiale'],
			"Master - Systeme d'Information Economique et Financier": ['master', 'sief', 'mbfa', 'specialisation', 'avance', 'expertise', 'universite', 'faculte', 'formation specialisee'],
			"FinOps (Stage)": ['septeo', 'stage', 'entreprise', 'professionnel', 'pro', 'finops', 'experience', 'metier', 'infrastructure', 'cloud']
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
			const joined = [row.competence, row.categorie, row.metier, row.service, row.etablissement, ...aliases].join(' ');
			return { text: normalize(joined), tokens: tokenize(joined) };
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
					matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
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
				const maxDistance = token.length >= 9 ? 2 : token.length >= 5 ? 1 : 0;
				return maxDistance > 0 && levenshtein(token, candidate) <= maxDistance;
			});
		}

		function tokenMatchesField(token, fieldValue) {
			if (!fieldValue) return false;
			if (fieldValue === token || fieldValue.includes(token)) return true;
			return fuzzyTokenMatch(token, tokenize(fieldValue));
		}

		function getSkillMatchScore(row, query) {
			const cleanedQuery = normalize(query);
			if (!cleanedQuery) return { priority: 99, subPriority: 0 };
			const queryTokens = tokenize(query);
			if (!queryTokens.length) return null;
			if (row._competenceNormalized === cleanedQuery) return { priority: 0, subPriority: 0 };
			if (row._categorieNormalized === cleanedQuery) return { priority: 1, subPriority: 0 };
			if (row._metierNormalized === cleanedQuery || row._serviceNormalized === cleanedQuery || row._etablissementNormalized === cleanedQuery) {
				return { priority: 2, subPriority: 0 };
			}
			const tokenScores = queryTokens.map((token) => {
				if (tokenMatchesField(token, row._competenceNormalized)) return 0;
				if (tokenMatchesField(token, row._categorieNormalized)) return 1;
				if (tokenMatchesField(token, row._metierNormalized) || tokenMatchesField(token, row._serviceNormalized) || tokenMatchesField(token, row._etablissementNormalized)) return 2;
				if (fuzzyTokenMatch(token, row._searchTokens) || row._searchText.includes(token)) return 3;
				return null;
			});
			if (tokenScores.some((score) => score === null)) return null;
			return { priority: Math.min(...tokenScores), subPriority: tokenScores.reduce((sum, score) => sum + score, 0) };
		}

		function rowMatches(row, query) {
			return getSkillMatchScore(row, query) !== null;
		}

		function sortSkillsByRelevance(data, query) {
			const cleanedQuery = normalize(query);
			if (!cleanedQuery) return [...data].sort(compareAlphabetically);
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

		function renderCharts() {
			if (!window.Chart) return;
			const textColor = getCssVariable('--text', '#122033');
			const mutedColor = getCssVariable('--muted', '#5e6f84');
			const gridColor = 'rgba(103, 146, 189, 0.18)';

			const domainEntries = Object.entries(aggregateByCategory(skillsData)).sort((a, b) => b[1] - a[1]);
			const domainLabels = domainEntries.map(([label]) => label);
			const domainValues = domainEntries.map(([, value]) => value);
			const domainChart = registerChart(document.getElementById('domain-chart'), {
				type: 'bar',
				data: {
					labels: domainLabels,
					datasets: [{
						data: createZeroData(domainValues),
						backgroundColor: domainLabels.map((label) => categoryColors[label] || '#123f73'),
						borderRadius: 999,
						barThickness: 18,
						borderSkipped: false
					}]
				},
				options: {
					...commonChartOptions(),
					indexAxis: 'y',
					scales: {
						x: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: mutedColor, precision: 0 } },
						y: { grid: { display: false }, ticks: { color: textColor, font: { weight: '700' } } }
					}
				}
			});
			queueChartAnimation(domainChart, [domainValues]);

			const technicalLabels = ['Data', 'Informatique', 'Cloud'];
			const technicalCounts = aggregateByCategory(skillsData);
			const technicalValues = technicalLabels.map((label) => technicalCounts[label] || 0);
			const technicalTotal = technicalValues.reduce((sum, value) => sum + value, 0);

			const technicalChart = registerChart(document.getElementById('technical-chart'), {
				type: 'doughnut',
				data: {
					labels: technicalLabels,
					datasets: [{
						data: createZeroData(technicalValues),
						backgroundColor: technicalLabels.map((label) => categoryColors[label]),
						borderWidth: 0,
						hoverOffset: 6
					}]
				},
				options: { ...commonChartOptions(), cutout: '66%' },
				plugins: [createCenterTextPlugin(technicalTotal, 'total')]
			});
			queueChartAnimation(technicalChart, [technicalValues]);

			renderLegend(
				document.getElementById('technical-legend'),
				technicalLabels.map((label, index) => ({
					label,
					value: `${technicalValues[index]} · ${technicalTotal ? ((technicalValues[index] / technicalTotal) * 100).toFixed(1).replace('.', ',') : '0,0'} %`,
					color: categoryColors[label]
				}))
			);

			const order = ["Licence d'economie", "Master - Systeme d'Information Economique et Financier", 'FinOps (Stage)'];
			const categories = ['Finance', 'Data', 'Informatique', 'Cloud', 'Autres'];
			const counts = aggregateByExperience(skillsData);
			const datasets = categories.map((category) => ({
				label: category,
				data: order.map((experience) => (counts[experience] && counts[experience][category]) || 0),
				backgroundColor: categoryColors[category] || '#123f73',
				borderRadius: 0,
				borderSkipped: false,
				barThickness: 22,
				categoryPercentage: 0.68,
				barPercentage: 0.96,
				stack: 'experience'
			}));

			const experienceChart = registerChart(document.getElementById('experience-chart'), {
				type: 'bar',
				data: {
					labels: order.map((experience) => experienceShortLabels[experience]),
					datasets: datasets.map((dataset) => ({ ...dataset, data: createZeroData(dataset.data) }))
				},
				options: {
					...commonChartOptions(),
					indexAxis: 'y',
					plugins: {
						...commonChartOptions().plugins,
						legend: { display: false },
						tooltip: {
							...commonChartOptions().plugins.tooltip,
							callbacks: {
								label(context) {
									const value = context.parsed.x || 0;
									return `${context.dataset.label} : ${value}`;
								},
								footer(items) {
									const total = items.reduce((sum, item) => sum + (item.parsed.x || 0), 0);
									return `Total : ${total}`;
								}
							}
						}
					},
					scales: {
						x: {
						beginAtZero: true,
						stacked: true,
						grid: { color: gridColor },
						ticks: { color: mutedColor, precision: 0 },
						border: { display: false }
					},
						y: {
						stacked: true,
						grid: { display: false },
						ticks: { color: textColor, font: { weight: '700' } },
						border: { display: false }
					}
					}
				}
			});
			queueChartAnimation(experienceChart, datasets.map((dataset) => dataset.data));

			renderLegend(
				document.getElementById('experience-legend'),
				categories.map((category) => ({ label: category, color: categoryColors[category] || '#123f73' })),
				'inline'
			);
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
						<button class="competences-bouton-info" type="button" data-index="${index}" aria-label="Afficher le détail de ${escapeHtml(skill.competence)}">i</button>
					</td>
				</tr>
			`).join('');
			tableBody.querySelectorAll('.competences-bouton-info').forEach((button) => {
				button.addEventListener('click', () => openSkillModal(data[Number(button.dataset.index)]));
			});
		}

		function updateResultsCount(count) {
			if (resultsLabel) resultsLabel.textContent = `${count} compétence${count > 1 ? 's' : ''} affichée${count > 1 ? 's' : ''}`;
		}

		function filterSkills() {
			const query = searchInput.value;
			const cleanedQuery = normalize(query);

			if (!cleanedQuery) {
				const sortedAll = sortSkillsByRelevance(indexedSkills, query);
				renderTable(sortedAll);
				updateResultsCount(sortedAll.length);
				return;
			}

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
			const inDialog = rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
			if (!inDialog) modal.close();
		});

		initSummary();
		renderCharts();
		filterSkills();
		animerChargementTableaux([
			document.getElementById('domain-chart') && document.getElementById('domain-chart').closest('.competences-carte-graphe'),
			document.getElementById('technical-chart') && document.getElementById('technical-chart').closest('.competences-carte-graphe'),
			document.getElementById('experience-chart') && document.getElementById('experience-chart').closest('.competences-carte-graphe')
		]);
	}

	function initFormationPage() {
		if (!window.Chart) return;
		const formationConfigs = [
			{ metier: 'FinOps (Stage)', prefix: 'stage' },
			{ metier: "Master - Systeme d'Information Economique et Financier", prefix: 'master' },
			{ metier: "Licence d'economie", prefix: 'licence' }
		];
		const macroColors = { economie: '#8f1d3f', informatique: '#1f6b45' };
		const macroLabels = { economie: 'Économie / Finance', informatique: 'Informatique / Data / Cloud' };
		const gridColor = 'rgba(103, 146, 189, 0.18)';
		const textColor = getCssVariable('--text', '#122033');
		const mutedColor = getCssVariable('--muted', '#5e6f84');
		const categories = ['Finance', 'Data', 'Informatique', 'Cloud', 'Autres'];

		function renderMacroDonut(donutId, legendId, rows) {
			const counts = { economie: 0, informatique: 0 };
			rows.forEach((row) => {
				if (['Finance', 'Autres'].includes(row.categorie)) counts.economie += 1;
				else counts.informatique += 1;
			});
			const macroChart = registerChart(document.getElementById(donutId), {
				type: 'doughnut',
				data: {
					labels: [macroLabels.economie, macroLabels.informatique],
					datasets: [{
						data: createZeroData([counts.economie, counts.informatique]),
						backgroundColor: [macroColors.economie, macroColors.informatique],
						borderWidth: 0,
						hoverOffset: 6
					}]
				},
				options: { ...commonChartOptions(), cutout: '66%' },
				plugins: [createCenterTextPlugin(rows.length, 'total')]
			});
			queueChartAnimation(macroChart, [[counts.economie, counts.informatique]]);
			renderLegend(document.getElementById(legendId), [
				{ label: macroLabels.economie, value: `${counts.economie} · ${rows.length ? ((counts.economie / rows.length) * 100).toFixed(1).replace('.', ',') : '0,0'} %`, color: macroColors.economie },
				{ label: macroLabels.informatique, value: `${counts.informatique} · ${rows.length ? ((counts.informatique / rows.length) * 100).toFixed(1).replace('.', ',') : '0,0'} %`, color: macroColors.informatique }
			], 'formation');
		}

		function renderCategoryBars(containerId, rows) {
			const categoryValues = categories.map((category) => rows.filter((row) => row.categorie === category).length);
			const categoryChart = registerChart(document.getElementById(containerId), {
				type: 'bar',
				data: {
					labels: categories,
					datasets: [{
						data: createZeroData(categoryValues),
						backgroundColor: categories.map((category) => categoryColors[category]),
						borderRadius: 999,
						barThickness: 16,
						borderSkipped: false
					}]
				},
				options: {
					...commonChartOptions(),
					indexAxis: 'y',
					scales: {
						x: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: mutedColor, precision: 0 } },
						y: { grid: { display: false }, ticks: { color: textColor, font: { weight: '700' } } }
					}
				}
			});
			queueChartAnimation(categoryChart, [categoryValues]);
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

	destroyCharts();
	if (currentPage === 'index') initPageAccueil();
	if (currentPage === 'competences') initCompetencesPage();
	if (currentPage === 'formation') initFormationPage();
})();

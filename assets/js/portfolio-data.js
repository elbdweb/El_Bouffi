function deepFreeze(value) {
	if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
	Object.getOwnPropertyNames(value).forEach((property) => {
		deepFreeze(value[property]);
	});
	return Object.freeze(value);
}

const PORTFOLIO_DATA = (() => {
	const categories = [
		{ id_cat: 'AT01', nom: 'Autre' },
		{ id_cat: 'AT02', nom: 'Finance' },
		{ id_cat: 'AT03', nom: 'Data' },
		{ id_cat: 'AT04', nom: 'Informatique' },
		{ id_cat: 'AT05', nom: 'Cloud' }
	];

	const metiers = [
		{ id_met: 'ME01', nom: "Licence d'economie" },
		{ id_met: 'ME02', nom: "Master - Systeme d'Information Economique et Financier" },
		{ id_met: 'ME03', nom: 'FinOps (Stage)' }
	];

	const etablissements = [
		{ id_etab: 'ET01', nom: 'Universite de Montpellier' },
		{ id_etab: 'ET02', nom: 'Septeo' }
	];

	const services = [
		{ id_serv: 'SE01', nom: "Faculte d'economie", id_etab: 'ET01' },
		{ id_serv: 'SE02', nom: 'Infrastructure et Cloud', id_etab: 'ET02' }
	];

	const competences = [
		{ id_comp: 'C001', nom: "Fondamentaux de l'Informatique", id_cat: 'AT04', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C002', nom: 'Base de donnees', id_cat: 'AT04', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C003', nom: 'Traitement de donnees', id_cat: 'AT03', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C004', nom: 'Gestion de donnees', id_cat: 'AT03', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C005', nom: 'Analyse de donnees', id_cat: 'AT03', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C006', nom: 'Statistiques', id_cat: 'AT03', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C007', nom: 'Probabilites', id_cat: 'AT03', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C008', nom: 'Echantillonnage', id_cat: 'AT03', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C009', nom: 'Econometrie', id_cat: 'AT03', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C010', nom: 'Optimisation', id_cat: 'AT03', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C011', nom: 'Analyse financiere', id_cat: 'AT02', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C012', nom: 'Comptabilite generale', id_cat: 'AT02', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C013', nom: 'Comptabilite analytique', id_cat: 'AT02', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C014', nom: 'Finance internationale', id_cat: 'AT02', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C015', nom: 'Microeconomie', id_cat: 'AT02', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C016', nom: 'Macroeconomie', id_cat: 'AT02', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C017', nom: 'Economie internationale', id_cat: 'AT02', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C018', nom: 'Droit des affaires', id_cat: 'AT02', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C019', nom: 'Management des organisations', id_cat: 'AT02', id_met: 'ME01', id_serv: 'SE01' },
		{ id_comp: 'C020', nom: 'Algorithmique', id_cat: 'AT04', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C021', nom: 'Programmation', id_cat: 'AT04', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C022', nom: 'Python', id_cat: 'AT04', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C023', nom: 'VBA', id_cat: 'AT04', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C024', nom: 'JavaScript', id_cat: 'AT04', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C025', nom: 'SAS', id_cat: 'AT04', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C026', nom: "Systemes d'information", id_cat: 'AT04', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C027', nom: 'Base de donnees', id_cat: 'AT04', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C028', nom: 'Entrepot de donnees', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C029', nom: 'Traitement de donnees', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C030', nom: 'Analyse de donnees', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C031', nom: 'Big data', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C032', nom: 'Data mining', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C033', nom: 'Data visualisation', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C034', nom: 'Power BI', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C035', nom: 'Intelligence artificielle', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C036', nom: 'LLM', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C037', nom: 'Statistiques', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C038', nom: 'Econometrie', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C039', nom: 'Series temporelles', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C040', nom: 'Prevision', id_cat: 'AT03', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C041', nom: 'Economie financiere', id_cat: 'AT02', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C042', nom: 'Finance de marche', id_cat: 'AT02', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C043', nom: "Finance d'entreprise", id_cat: 'AT02', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C044', nom: 'Analyse financiere', id_cat: 'AT02', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C045', nom: 'Modeles financiers', id_cat: 'AT02', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C046', nom: 'Prevision financiere', id_cat: 'AT02', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C047', nom: 'Cybersecurite', id_cat: 'AT04', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C048', nom: 'RGPD', id_cat: 'AT04', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C049', nom: 'Droit informatique', id_cat: 'AT01', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C050', nom: 'Aide a la decision', id_cat: 'AT01', id_met: 'ME02', id_serv: 'SE01' },
		{ id_comp: 'C051', nom: 'Linux', id_cat: 'AT04', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C052', nom: 'Reseau informatique', id_cat: 'AT04', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C053', nom: 'Git', id_cat: 'AT04', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C054', nom: 'PHP', id_cat: 'AT04', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C055', nom: 'Twig', id_cat: 'AT04', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C056', nom: 'Chart.js', id_cat: 'AT04', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C057', nom: 'SQL', id_cat: 'AT03', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C058', nom: 'MySQL', id_cat: 'AT03', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C059', nom: 'Modelisation de donnees', id_cat: 'AT03', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C060', nom: 'Historisation des donnees', id_cat: 'AT03', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C061', nom: 'Tracabilite des calculs', id_cat: 'AT03', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C062', nom: 'Kubernetes', id_cat: 'AT05', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C063', nom: 'kubectl', id_cat: 'AT05', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C064', nom: 'Helm', id_cat: 'AT05', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C065', nom: 'Orchestration de conteneurs', id_cat: 'AT05', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C066', nom: 'Deploiement applicatif', id_cat: 'AT05', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C067', nom: 'Configuration applicative', id_cat: 'AT05', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C068', nom: 'Persistance des donnees', id_cat: 'AT05', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C069', nom: 'Observabilite', id_cat: 'AT05', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C070', nom: 'Allocation de couts', id_cat: 'AT02', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C071', nom: 'Amortissement', id_cat: 'AT02', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C072', nom: 'Automatisation des calculs financiers', id_cat: 'AT02', id_met: 'ME03', id_serv: 'SE02' },
		{ id_comp: 'C073', nom: 'Tableaux de bord', id_cat: 'AT01', id_met: 'ME03', id_serv: 'SE02' }
	];

	const categoryColors = {
		Data: '#1d7fe0',
		Finance: '#8f1d3f',
		Informatique: '#1f6b45',
		Cloud: '#f2a007',
		Autres: '#8b98aa'
	};

	const presentationMap = {
		categories: {
			Autre: 'Autres'
		},
		metiers: {
			"Licence d'economie": 'Licence d’économie',
			"Master - Systeme d'Information Economique et Financier": 'Master - Système d’Information Économique et Financier'
		},
		services: {
			"Faculte d'economie": 'Faculte d’économie'
		},
		etablissements: {
			'Universite de Montpellier': 'Université de Montpellier'
		},
		competences: {
			"Fondamentaux de l'Informatique": 'Fondamentaux de l’Informatique',
			'Base de donnees': 'Base de données',
			'Traitement de donnees': 'Traitement de données',
			'Gestion de donnees': 'Gestion de données',
			'Analyse de donnees': 'Analyse de données',
			'Probabilites': 'Probabilités',
			'Echantillonnage': 'Échantillonnage',
			'Econometrie': 'Économétrie',
			'Analyse financiere': 'Analyse financiere',
			'Comptabilite generale': 'Comptabilité générale',
			'Comptabilite analytique': 'Comptabilité analytique',
			'Economie financiere': 'Économie financière',
			"Finance d'entreprise": 'Finance d’entreprise',
			'Modeles financiers': 'Modèles financiers',
			'Prevision financiere': 'Prévision financière',
			'Cybersecurite': 'Cybersécurité',
			"Systemes d'information": 'Systèmes d’information',
			'Entrepot de donnees': 'Entrepôt de données',
			'Series temporelles': 'Séries temporelles',
			'Prevision': 'Prevision',
			'Historisation des donnees': 'Historisation des données',
			'Modelisation de donnees': 'Modélisation de données',
			'Tracabilite des calculs': 'Traçabilité des calculs',
			'Allocation de couts': 'Allocation de coûts',
			'Deploiement applicatif': 'Déploiement applicatif',
			'Persistance des donnees': 'Persistance des données'
		}
	};

	function mapById(rows, key) {
		return rows.reduce((acc, row) => {
			acc[row[key]] = row;
			return acc;
		}, {});
	}

	function cleanLabel(value, dictionary) {
		return dictionary[value] || value;
	}

	function buildSkillsData() {
		const categoriesById = mapById(categories, 'id_cat');
		const metiersById = mapById(metiers, 'id_met');
		const servicesById = mapById(services, 'id_serv');
		const etablissementsById = mapById(etablissements, 'id_etab');
		const seen = new Set();

		return competences.reduce((rows, competence) => {
			const categorieSource = categoriesById[competence.id_cat];
			const metierSource = metiersById[competence.id_met];
			const serviceSource = servicesById[competence.id_serv];
			const etablissementSource = serviceSource ? etablissementsById[serviceSource.id_etab] : null;
			if (!categorieSource || !metierSource || !serviceSource || !etablissementSource) return rows;

			const row = {
				competence: cleanLabel(competence.nom, presentationMap.competences),
				categorie: cleanLabel(categorieSource.nom, presentationMap.categories),
				metier: cleanLabel(metierSource.nom, presentationMap.metiers),
				service: cleanLabel(serviceSource.nom, presentationMap.services),
				etablissement: cleanLabel(etablissementSource.nom, presentationMap.etablissements)
			};

			const dedupeKey = [row.competence, row.categorie, row.metier, row.service, row.etablissement].join('|').toLowerCase();
			if (seen.has(dedupeKey)) return rows;
			seen.add(dedupeKey);
			rows.push(row);
			return rows;
		}, []);
	}

	const skillsData = buildSkillsData();

	return {
		categories,
		metiers,
		services,
		etablissements,
		competences,
		skillsData,
		categoryColors
	};
})();

deepFreeze(PORTFOLIO_DATA);
window.PORTFOLIO_DATA = PORTFOLIO_DATA;

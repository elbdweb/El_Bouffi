

function deepFreeze(value) {
	if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
	Object.getOwnPropertyNames(value).forEach((property) => {
		deepFreeze(value[property]);
	});
	return Object.freeze(value);
}

const PORTFOLIO_DATA = (() => {
	const skillsData = [
			{"competence":"Microeconomie","categorie":"Finance","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Macroeconomie","categorie":"Finance","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Economie internationale","categorie":"Finance","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Droit des affaires","categorie":"Finance","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Management des organisations","categorie":"Finance","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Cybersécurité","categorie":"Informatique","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"RGPD","categorie":"Informatique","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Droit informatique","categorie":"Autres","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Aide a la decision","categorie":"Autres","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Tableaux de bord","categorie":"Autres","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Kubernetes","categorie":"Cloud","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"kubectl","categorie":"Cloud","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Helm","categorie":"Cloud","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Orchestration de conteneurs","categorie":"Cloud","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Déploiement applicatif","categorie":"Cloud","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Configuration applicative","categorie":"Cloud","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Persistance des données","categorie":"Cloud","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Observabilite","categorie":"Cloud","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Traitement de données","categorie":"Data","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Gestion de données","categorie":"Data","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Analyse de données","categorie":"Data","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Statistiques","categorie":"Data","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Probabilités","categorie":"Data","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Échantillonnage","categorie":"Data","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Économétrie","categorie":"Data","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Optimisation","categorie":"Data","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Entrepôt de données","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Traitement de données","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Analyse de données","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Big data","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Data mining","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Data visualisation","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Power BI","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Intelligence artificielle","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"LLM","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Statistiques","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Économétrie","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Séries temporelles","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Prevision","categorie":"Data","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"SQL","categorie":"Data","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"MySQL","categorie":"Data","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Modélisation de données","categorie":"Data","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Historisation des données","categorie":"Data","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Traçabilité des calculs","categorie":"Data","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Analyse financiere","categorie":"Finance","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Comptabilité générale","categorie":"Finance","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Comptabilité analytique","categorie":"Finance","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Finance internationale","categorie":"Finance","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Économie financière","categorie":"Finance","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Finance de marche","categorie":"Finance","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Finance d’entreprise","categorie":"Finance","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Analyse financiere","categorie":"Finance","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Modèles financiers","categorie":"Finance","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Prévision financière","categorie":"Finance","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Allocation de coûts","categorie":"Finance","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Amortissement","categorie":"Finance","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Automatisation des calculs financiers","categorie":"Finance","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Fondamentaux de l’Informatique","categorie":"Informatique","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Base de données","categorie":"Informatique","metier":"Licence d’économie","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Algorithmique","categorie":"Informatique","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Programmation","categorie":"Informatique","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Python","categorie":"Informatique","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"VBA","categorie":"Informatique","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"JavaScript","categorie":"Informatique","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"SAS","categorie":"Informatique","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Systèmes d’information","categorie":"Informatique","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Base de données","categorie":"Informatique","metier":"Master - Système d’Information Économique et Financier","service":"Faculte d’économie","etablissement":"Université de Montpellier"},
			{"competence":"Linux","categorie":"Informatique","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Réseau informatique","categorie":"Informatique","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Git","categorie":"Informatique","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"PHP","categorie":"Informatique","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Twig","categorie":"Informatique","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"},
			{"competence":"Chart.js","categorie":"Informatique","metier":"FinOps (Stage)","service":"Infrastructure et Cloud","etablissement":"Septeo"}
		];

	const categoryColors = {
			Data: '#1d7fe0',
			Finance: '#8f1d3f',
			Informatique: '#1f6b45',
			Cloud: '#f2a007',
			Autres: '#8b98aa'
		};

	return {
		skillsData,
		categoryColors
	};
})();

deepFreeze(PORTFOLIO_DATA);
window.PORTFOLIO_DATA = PORTFOLIO_DATA;

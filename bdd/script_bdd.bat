@if (@CodeSection == @Batch) @then
@echo off
setlocal EnableExtensions DisableDelayedExpansion
cd /d "%~dp0"
cscript //nologo //E:JScript "%~f0" %*
set "RC=%errorlevel%"
echo.
if "%RC%"=="0" (
  echo [OK] Synchronisation terminee.
) else (
  echo [ECHEC] Code retour: %RC%
)
pause
exit /b %RC%
@end

var fso = new ActiveXObject("Scripting.FileSystemObject");

function out(s) { WScript.Echo(String(s)); }
function info(s) { out("[INFO] " + s); }
function die(s, code) { out("[ERREUR] " + s); WScript.Quit(code || 1); }
function trim(s) { return String(s == null ? "" : s).replace(/^\s+|\s+$/g, ""); }
function normalizeEol(s) { return String(s || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n"); }
function abs(p) { return fso.GetAbsolutePathName(p); }

function readTextUtf8(path) {
	var stream = new ActiveXObject("ADODB.Stream");
	stream.Type = 2;
	stream.Charset = "utf-8";
	stream.Open();
	try {
		stream.LoadFromFile(path);
	} catch (e) {
		try { stream.Close(); } catch (ignore) {}
		die("Impossible d'ouvrir le fichier source: " + abs(path) + ". Fermer Excel ou tout logiciel qui le verrouille.", 10);
	}
	var text = stream.ReadText(-1);
	stream.Close();
	if (text.length && text.charCodeAt(0) === 65279) text = text.substring(1);
	return text;
}

function writeTextUtf8Atomic(path, content) {
	var temp = path + ".tmp";
	var stream = new ActiveXObject("ADODB.Stream");
	stream.Type = 2;
	stream.Charset = "utf-8";
	stream.Open();
	stream.WriteText(content);
	stream.Position = 0;
	stream.SaveToFile(temp, 2);
	stream.Close();
	if (fso.FileExists(path)) fso.DeleteFile(path, true);
	fso.MoveFile(temp, path);
}

function pad2(v) { return v < 10 ? "0" + v : String(v); }
function stamp() {
	var d = new Date();
	return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds());
}

function resolveInputFile(dir, base) {
	var candidates = [base + ".csv", base + ".CSV", base];
	for (var i = 0; i < candidates.length; i += 1) {
		var path = fso.BuildPath(dir, candidates[i]);
		if (fso.FileExists(path)) return path;
	}
	die("Fichier source introuvable pour '" + base + "' dans " + abs(dir) + ".", 11);
}

function parseCsv(text, headers, label) {
	var clean = normalizeEol(text);
	if (!trim(clean)) return [];
	var rows = [], row = [], value = "", inQuotes = false, i, ch, next;
	for (i = 0; i < clean.length; i += 1) {
		ch = clean.charAt(i);
		next = clean.charAt(i + 1);
		if (inQuotes) {
			if (ch === '"') {
				if (next === '"') { value += '"'; i += 1; }
				else inQuotes = false;
			} else value += ch;
			continue;
		}
		if (ch === '"') { inQuotes = true; continue; }
		if (ch === ';') { row.push(value); value = ""; continue; }
		if (ch === '\n') { row.push(value); rows.push(row); row = []; value = ""; continue; }
		value += ch;
	}
	if (inQuotes) die("Guillemets non fermes dans " + label + ".", 12);
	if (value.length || row.length) { row.push(value); rows.push(row); }
	while (rows.length) {
		var last = rows[rows.length - 1], hasData = false;
		for (i = 0; i < last.length; i += 1) if (trim(last[i]) !== "") { hasData = true; break; }
		if (hasData) break;
		rows.pop();
	}
	if (!rows.length) return [];
	var head = [];
	for (i = 0; i < rows[0].length; i += 1) head.push(trim(rows[0][i]));
	if (head.length !== headers.length) die("En-tete invalide dans " + label + ". Attendu: " + headers.join(";"), 13);
	for (i = 0; i < headers.length; i += 1) {
		if (head[i] !== headers[i]) die("En-tete invalide dans " + label + " colonne " + (i + 1) + ": attendu '" + headers[i] + "', trouve '" + head[i] + "'.", 14);
	}
	var list = [];
	for (var r = 1; r < rows.length; r += 1) {
		var current = rows[r], blank = true, obj = {};
		for (i = 0; i < current.length; i += 1) if (trim(current[i]) !== "") { blank = false; break; }
		if (blank) continue;
		if (current.length !== headers.length) die("Nombre de colonnes invalide dans " + label + " a la ligne " + (r + 1) + ".", 15);
		for (i = 0; i < headers.length; i += 1) obj[headers[i]] = trim(current[i]);
		list.push(obj);
	}
	return list;
}

function requireFields(rows, fields, label) {
	for (var i = 0; i < rows.length; i += 1) {
		for (var j = 0; j < fields.length; j += 1) {
			if (trim(rows[i][fields[j]]) === "") die("Champ obligatoire vide dans " + label + " ligne CSV " + (i + 2) + " : " + fields[j], 16);
		}
	}
}

function uniqueMap(rows, field, label) {
	var seen = {};
	for (var i = 0; i < rows.length; i += 1) {
		var key = rows[i][field];
		if (seen[key]) die("Doublon detecte dans " + label + " pour " + field + "='" + key + "'.", 17);
		seen[key] = rows[i];
	}
	return seen;
}

function validateFk(rows, field, targetMap, label, targetLabel) {
	for (var i = 0; i < rows.length; i += 1) {
		var key = rows[i][field];
		if (!targetMap[key]) die("Cle etrangere invalide dans " + label + " ligne CSV " + (i + 2) + " : " + field + "='" + key + "' absent de " + targetLabel + ".", 18);
	}
}

function jsStringAscii(value) {
	var s = String(value == null ? "" : value);
	var outText = "'";
	for (var i = 0; i < s.length; i += 1) {
		var c = s.charCodeAt(i);
		var ch = s.charAt(i);
		if (ch === "\\") outText += "\\\\";
		else if (ch === "'") outText += "\\'";
		else if (ch === "\r") outText += "\\r";
		else if (ch === "\n") outText += "\\n";
		else if (c < 32 || c > 126) {
			var hex = c.toString(16).toUpperCase();
			while (hex.length < 4) hex = "0" + hex;
			outText += "\\u" + hex;
		} else outText += ch;
	}
	outText += "'";
	return outText;
}

function renderArray(name, rows, fields) {
	var lines = ["\tconst " + name + " = ["];
	for (var i = 0; i < rows.length; i += 1) {
		var parts = [];
		for (var j = 0; j < fields.length; j += 1) parts.push(fields[j] + ": " + jsStringAscii(rows[i][fields[j]]));
		lines.push("\t\t{ " + parts.join(", ") + " },");
	}
	lines.push("\t];");
	return lines.join("\r\n");
}

function renderMap(name, mapObject) {
	var keys = [];
	for (var k in mapObject) if (mapObject.hasOwnProperty(k)) keys.push(k);
	var lines = ["\t\t" + name + ": {"];
	for (var i = 0; i < keys.length; i += 1) {
		var key = keys[i];
		lines.push("\t\t\t" + jsStringAscii(key) + ": " + jsStringAscii(mapObject[key]) + (i < keys.length - 1 ? "," : ""));
	}
	lines.push("\t\t}");
	return lines.join("\r\n");
}

function generatePresentationMap(data) {
	var map = {
		categories: { "Autre": "Autres" },
		metiers: {},
		services: {},
		etablissements: {},
		competences: {}
	};
	for (var i = 0; i < data.metiers.length; i += 1) map.metiers[data.metiers[i].nom] = data.metiers[i].nom;
	for (i = 0; i < data.services.length; i += 1) map.services[data.services[i].nom] = data.services[i].nom;
	for (i = 0; i < data.etablissements.length; i += 1) map.etablissements[data.etablissements[i].nom] = data.etablissements[i].nom;
	for (i = 0; i < data.competences.length; i += 1) map.competences[data.competences[i].nom] = data.competences[i].nom;
	return map;
}

function generateJs(data) {
	var presentationMap = generatePresentationMap(data);
	var parts = [];
	parts.push("function deepFreeze(value) {");
	parts.push("\tif (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;");
	parts.push("\tObject.getOwnPropertyNames(value).forEach((property) => {");
	parts.push("\t\tdeepFreeze(value[property]);");
	parts.push("\t});");
	parts.push("\treturn Object.freeze(value);");
	parts.push("}");
	parts.push("");
	parts.push("const PORTFOLIO_DATA = (() => {");
	parts.push(renderArray("categories", data.categories, ["id_cat", "nom"]));
	parts.push("");
	parts.push(renderArray("metiers", data.metiers, ["id_met", "nom"]));
	parts.push("");
	parts.push(renderArray("etablissements", data.etablissements, ["id_etab", "nom"]));
	parts.push("");
	parts.push(renderArray("services", data.services, ["id_serv", "nom", "id_etab"]));
	parts.push("");
	parts.push(renderArray("competences", data.competences, ["id_comp", "nom", "id_cat", "id_met", "id_serv"]));
	parts.push("");
	parts.push("\tconst categoryColors = {");
	parts.push("\t\tData: '#1d7fe0',");
	parts.push("\t\tFinance: '#8f1d3f',");
	parts.push("\t\tInformatique: '#1f6b45',");
	parts.push("\t\tCloud: '#f2a007',");
	parts.push("\t\tAutres: '#8b98aa'");
	parts.push("\t};");
	parts.push("");
	parts.push("\tconst presentationMap = {");
	parts.push(renderMap("categories", presentationMap.categories) + ",");
	parts.push(renderMap("metiers", presentationMap.metiers) + ",");
	parts.push(renderMap("services", presentationMap.services) + ",");
	parts.push(renderMap("etablissements", presentationMap.etablissements) + ",");
	parts.push(renderMap("competences", presentationMap.competences));
	parts.push("\t};");
	parts.push("");
	parts.push("\tfunction mapById(rows, key) {");
	parts.push("\t\treturn rows.reduce((acc, row) => {");
	parts.push("\t\t\tacc[row[key]] = row;");
	parts.push("\t\t\treturn acc;");
	parts.push("\t\t}, {});");
	parts.push("\t}");
	parts.push("");
	parts.push("\tfunction cleanLabel(value, dictionary) {");
	parts.push("\t\treturn dictionary[value] || value;");
	parts.push("\t}");
	parts.push("");
	parts.push("\tfunction buildSkillsData() {");
	parts.push("\t\tconst categoriesById = mapById(categories, 'id_cat');");
	parts.push("\t\tconst metiersById = mapById(metiers, 'id_met');");
	parts.push("\t\tconst servicesById = mapById(services, 'id_serv');");
	parts.push("\t\tconst etablissementsById = mapById(etablissements, 'id_etab');");
	parts.push("\t\tconst seen = new Set();");
	parts.push("");
	parts.push("\t\treturn competences.reduce((rows, competence) => {");
	parts.push("\t\t\tconst categorieSource = categoriesById[competence.id_cat];");
	parts.push("\t\t\tconst metierSource = metiersById[competence.id_met];");
	parts.push("\t\t\tconst serviceSource = servicesById[competence.id_serv];");
	parts.push("\t\t\tconst etablissementSource = serviceSource ? etablissementsById[serviceSource.id_etab] : null;");
	parts.push("\t\t\tif (!categorieSource || !metierSource || !serviceSource || !etablissementSource) return rows;");
	parts.push("");
	parts.push("\t\t\tconst row = {");
	parts.push("\t\t\t\tcompetence: cleanLabel(competence.nom, presentationMap.competences),");
	parts.push("\t\t\t\tcategorie: cleanLabel(categorieSource.nom, presentationMap.categories),");
	parts.push("\t\t\t\tmetier: cleanLabel(metierSource.nom, presentationMap.metiers),");
	parts.push("\t\t\t\tservice: cleanLabel(serviceSource.nom, presentationMap.services),");
	parts.push("\t\t\t\tetablissement: cleanLabel(etablissementSource.nom, presentationMap.etablissements)");
	parts.push("\t\t\t};");
	parts.push("");
	parts.push("\t\t\tconst dedupeKey = [row.competence, row.categorie, row.metier, row.service, row.etablissement].join('|').toLowerCase();");
	parts.push("\t\t\tif (seen.has(dedupeKey)) return rows;");
	parts.push("\t\t\tseen.add(dedupeKey);");
	parts.push("\t\t\trows.push(row);");
	parts.push("\t\t\treturn rows;");
	parts.push("\t\t}, []);");
	parts.push("\t}");
	parts.push("");
	parts.push("\tconst skillsData = buildSkillsData();");
	parts.push("");
	parts.push("\treturn {");
	parts.push("\t\tcategories,");
	parts.push("\t\tmetiers,");
	parts.push("\t\tservices,");
	parts.push("\t\tetablissements,");
	parts.push("\t\tcompetences,");
	parts.push("\t\tskillsData,");
	parts.push("\t\tcategoryColors");
	parts.push("\t};");
	parts.push("})();");
	parts.push("");
	parts.push("deepFreeze(PORTFOLIO_DATA);");
	parts.push("window.PORTFOLIO_DATA = PORTFOLIO_DATA;");
	return parts.join("\r\n");
}

function updateScriptVersion(htmlPath, fileName, version) {
	if (!fso.FileExists(htmlPath)) return;
	var html = readTextUtf8(htmlPath);
	var escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	var pattern = new RegExp(escaped + "(?:\\?v=[^\"']*)?", "g");
	var updated = html.replace(pattern, fileName + "?v=" + version);
	if (updated !== html) {
		writeTextUtf8Atomic(htmlPath, updated);
		info("Cache-busting mis a jour dans " + abs(htmlPath));
	}
}

(function main() {
	var csvDir = abs(".");
	var projectRoot = abs(fso.GetParentFolderName(csvDir));
	var paths = {
		categories: resolveInputFile(csvDir, "categorie"),
		metiers: resolveInputFile(csvDir, "metier"),
		etablissements: resolveInputFile(csvDir, "etablissement"),
		services: resolveInputFile(csvDir, "service"),
		competences: resolveInputFile(csvDir, "competences")
	};

	info("Script: " + abs(WScript.ScriptFullName));
	info("Racine projet : " + projectRoot);
	info("Dossier CSV : " + csvDir);
	info("Source categorie : " + paths.categories);
	info("Source metier : " + paths.metiers);
	info("Source etablissement : " + paths.etablissements);
	info("Source service : " + paths.services);
	info("Source competences : " + paths.competences);

	var data = {
		categories: parseCsv(readTextUtf8(paths.categories), ["id_cat", "nom"], "categorie"),
		metiers: parseCsv(readTextUtf8(paths.metiers), ["id_met", "nom"], "metier"),
		etablissements: parseCsv(readTextUtf8(paths.etablissements), ["id_etab", "nom"], "etablissement"),
		services: parseCsv(readTextUtf8(paths.services), ["id_serv", "nom", "id_etab"], "service"),
		competences: parseCsv(readTextUtf8(paths.competences), ["id_comp", "nom", "id_cat", "id_met", "id_serv"], "competences")
	};

	requireFields(data.categories, ["id_cat", "nom"], "categorie");
	requireFields(data.metiers, ["id_met", "nom"], "metier");
	requireFields(data.etablissements, ["id_etab", "nom"], "etablissement");
	requireFields(data.services, ["id_serv", "nom", "id_etab"], "service");
	requireFields(data.competences, ["id_comp", "nom", "id_cat", "id_met", "id_serv"], "competences");

	var categoryMap = uniqueMap(data.categories, "id_cat", "categorie");
	var metierMap = uniqueMap(data.metiers, "id_met", "metier");
	var etablissementMap = uniqueMap(data.etablissements, "id_etab", "etablissement");
	var serviceMap = uniqueMap(data.services, "id_serv", "service");
	uniqueMap(data.competences, "id_comp", "competences");

	validateFk(data.services, "id_etab", etablissementMap, "service", "etablissement");
	validateFk(data.competences, "id_cat", categoryMap, "competences", "categorie");
	validateFk(data.competences, "id_met", metierMap, "competences", "metier");
	validateFk(data.competences, "id_serv", serviceMap, "competences", "service");

	info("categorie : " + data.categories.length + " ligne(s)");
	info("metier : " + data.metiers.length + " ligne(s)");
	info("etablissement : " + data.etablissements.length + " ligne(s)");
	info("service : " + data.services.length + " ligne(s)");
	info("competences : " + data.competences.length + " ligne(s)");

	var outputPath = fso.BuildPath(projectRoot, "assets\\js\\portfolio-data.js");
	var js = generateJs(data);
	writeTextUtf8Atomic(outputPath, js);
	info("portfolio-data.js regenere : " + abs(outputPath));

	var version = stamp();
	updateScriptVersion(fso.BuildPath(projectRoot, "index.html"), "assets/js/portfolio-data.js", version);
	updateScriptVersion(fso.BuildPath(projectRoot, "competences.html"), "assets/js/portfolio-data.js", version);
	updateScriptVersion(fso.BuildPath(projectRoot, "formation.html"), "assets/js/portfolio-data.js", version);
	updateScriptVersion(fso.BuildPath(projectRoot, "index.html"), "assets/js/page-modules.js", version);
	updateScriptVersion(fso.BuildPath(projectRoot, "competences.html"), "assets/js/page-modules.js", version);
	updateScriptVersion(fso.BuildPath(projectRoot, "formation.html"), "assets/js/page-modules.js", version);

	WScript.Quit(0);
})();

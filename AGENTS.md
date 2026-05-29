# Guide pour les Agents IA (AGENTS.md)

Ce document fournit le contexte, l'architecture et les règles de conception du projet afin de permettre à une IA de s'y retrouver très rapidement et d'être immédiatement opérationnelle.

## 1. Stack Technique
- **Technologies Core** : HTML5, CSS3 (Vanilla) et JavaScript (Vanilla). 
- **Aucun Bundler** : Il n'y a pas de Webpack, Vite, React ou Node.js (en dehors d'outils utilitaires locaux). L'application s'exécute directement dans le navigateur.
- **Styling** : Tailwind CSS est importé via CDN.
- **Icônes** : Lucide Icons est utilisé via CDN. 

## 2. Architecture du Projet
- `index.html` : Fichier racine servant de Hub/Dashboard.
- `1a.html`, `1b.html` : Modules "Ateliers" individuels (les logiques métier et de gamification sont embarquées directement dans les balises `<script>` de ces fichiers).
- `*.json` (`1a.json`, `1b.json`, `ux.json`) : Fichiers agissant comme une base de données "en lecture seule". Le front-end effectue un `fetch` dessus. 
  - *Note : Lors de la modification des JSON, ne pas oublier que le navigateur peut utiliser le cache. Un timestamp est utilisé dans l'URL (`fetch('1b.json?v=' + ...`) pour l'éviter.*

## 3. Directives de Développement (Frontend & UI)
- **Design System** : Utilisation d'un thème "Glassmorphism" avec des bordures subtiles (`border-slate-200/60`, `bg-white/90`, `backdrop-blur`).
- **Couleurs** : Prédominance des tons `slate`, `emerald` et `blue`. Les styles sont épurés et visent une expérience utilisateur premium. Éviter d'introduire des couleurs génériques ou qui brisent l'harmonie.
- **Micro-interactions** : Utiliser des classes Tailwind natives (`transition-all`, `duration-300`, `hover:scale-105`) pour rendre l'interface dynamique.
- **Icônes** : Toujours utiliser Lucide Icons (`<i data-lucide="icon-name"></i>`).
  - **TRÈS IMPORTANT** : Chaque fois que du HTML contenant des icônes est injecté dynamiquement dans le DOM (via `innerHTML`), la fonction `lucide.createIcons()` **doit impérativement être rappelée** sinon les icônes n'apparaîtront pas.

## 4. Règles de Manipulation du Code
- **Pas de modifications architecturales complexes** : Maintenir l'approche Vanilla. Ne pas transformer le projet en React/Vue.
- **Scripting pour la maintenance** : Pour effectuer des remplacements en masse dans le code ou des migrations JSON, il est recommandé d'écrire de petits scripts Node.js locaux (comme on le faisait avec les `fix-*.js`) plutôt que d'utiliser des expressions régulières (Regex) instables directement dans des bash.
- **Scripts de nettoyage** : Les scripts jetables (`fix-*.js`) ne doivent pas être conservés une fois la modification commitée. Ils peuvent être supprimés pour garder le répertoire propre.

## 5. Workflow Recommandé pour l'IA
1. **Comprendre la demande** : Lire la requête de l'utilisateur.
2. **Recherche de fichiers** : Utiliser `Get-ChildItem` ou la recherche de fichiers existante pour s'assurer des noms de fichiers.
3. **Modification (HTML/JS)** : Repérer les identifiants DOM (`getElementById`). Faire très attention aux ID manquants (qui peuvent générer des erreurs `Cannot set properties of null (setting 'innerHTML')`).
4. **Validation de la logique dynamique** : Toute modification de rendu (ex: Phase 1 vers Phase 2) doit s'assurer que le contenu JSON sous-jacent est robuste et contient les clés nécessaires.
5. **Nettoyage et Commit** : Utiliser Git pour valider les modifications (`git add`, `git commit`, `git push`) et informer l'utilisateur.

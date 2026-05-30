# Guide pour les Agents IA (AGENTS.md)

Ce document fournit le contexte, l'architecture et les règles de conception du projet afin de permettre à une IA de s'y retrouver très rapidement et d'être immédiatement opérationnelle.

## 1. Stack Technique
- **Technologies Core** : HTML5, CSS3 (Vanilla) et JavaScript (Vanilla). 
- **Aucun Bundler** : Il n'y a pas de Webpack, Vite, React ou Node.js (en dehors d'outils utilitaires locaux). L'application s'exécute directement dans le navigateur.
- **Styling** : Tailwind CSS est importé via CDN.
- **Icônes** : Lucide Icons est utilisé via CDN. 

## 2. Architecture du Projet
- `index.html` : Fichier racine servant de Hub/Dashboard. Contient la modal de contextualisation "Comprendre" animée par `1-0.json`.
- `1-a.html`, `1-b.html` : Modules "Ateliers" individuels (les logiques métier et de gamification sont embarquées directement dans les balises `<script>` de ces fichiers).
- `*.json` (`1-0.json`, `1-a.json`, `1-b.json`) : Fichiers agissant comme une base de données "en lecture seule". Le front-end effectue un `fetch` dessus. 
  - *Note : Lors de la modification des JSON, ne pas oublier que le navigateur peut utiliser le cache. Un timestamp est utilisé dans l'URL (`fetch('1-b.json?v=' + ...`) pour l'éviter.*

## 3. Directives de Développement (Frontend & UI)
- **Design System** : Utilisation d'un thème "Glassmorphism" avec des bordures subtiles (`border-slate-200/60`, `bg-white/90`, `backdrop-blur`).
- **Couleurs** : Prédominance des tons `slate`, `emerald` et `blue`. Les styles sont épurés et visent une expérience utilisateur premium. Éviter d'introduire des couleurs génériques ou qui brisent l'harmonie.
- **Micro-interactions** : Utiliser des classes Tailwind natives (`transition-all`, `duration-300`, `hover:scale-105`) pour rendre l'interface dynamique.
- **Icônes** : Toujours utiliser Lucide Icons (`<i data-lucide="icon-name"></i>`).
  - **TRÈS IMPORTANT** : Chaque fois que du HTML contenant des icônes est injecté dynamiquement dans le DOM (via `innerHTML`), la fonction `lucide.createIcons()` **doit impérativement être rappelée** sinon les icônes n'apparaîtront pas.
- **Optimisation des schémas (SVG Box & Zoom)** : 
  - Tous les schémas explicatifs complexes et diagrammes doivent adopter un format vectoriel SVG (`viewBox="0 0 W H"`), sans hauteur ni largeur figées, pour s'adapter automatiquement aux viewports.
  - Sur mobile, les paddings de la modal comprendre sont réduits à `5px` vertical et `0px` horizontal, et les SVGs se voient appliquer `margin: 0` et `max-height: 55vh` pour éviter le chevauchement ou le masquage des éléments supérieurs.
  - La logique globale du projet prend en charge le zoom interactif plein écran au clic sur les SVGs. Le zoom s'affiche dans une surcouche (`zoom-overlay`) noire translucide avec flou d'arrière-plan.

## 4. Règles de Manipulation du Code
- **Pas de modifications architecturales complexes** : Maintenir l'approche Vanilla. Ne pas transformer le projet en React/Vue.
- **Scripting pour la maintenance** : Pour effectuer des remplacements en masse dans le code ou des migrations JSON, il est recommandé d'écrire de petits scripts Node.js locaux (comme on le faisait avec les `fix-*.js`) plutôt que d'utiliser des expressions régulières (Regex) instables directement dans des bash.
- **Scripts de nettoyage** : Les scripts jetables (`fix-*.js`) ne doivent pas être conservés une fois la modification commitée. Ils peuvent être supprimés pour garder le répertoire propre.

## 5. Workflow Recommandé pour l'IA
1. **Comprendre la demande** : Lire la requête de l'utilisateur.
2. **Recherche de fichiers** : Utiliser `Get-ChildItem` ou la recherche de fichiers existante pour s'assurer des noms de fichiers.
3. **Modification (HTML/JS)** : Repérer les identifiants DOM (`getElementById`). Faire très attention aux ID manquants (qui peuvent générer des erreurs `Cannot set properties of null (setting 'innerHTML')`).
4. **Validation de la logique dynamique** : Toute modification de rendu (ex: Phase 1 vers Phase 2) doit s'assurer que le contenu JSON sous-jacent est robuste et contient les clés nécessaires.
5. **Nettoyage et Commit** : Effectuer des commits locaux (`git add`, `git commit`). **TRÈS IMPORTANT** : Ne **JAMAIS** faire de `git push` vers le serveur distant sauf si l'utilisateur le demande explicitement. Informer l'utilisateur des modifications locales effectuées.
6. **Déploiement** : Ne **JAMAIS** lancer de déploiement automatique (`firebase deploy`, `git push`, etc.) sans demande **expresse et explicite** de l'utilisateur. Après chaque modification, se contenter d'informer l'utilisateur que les changements sont prêts et disponibles en local, et lui proposer de déployer si il le souhaite. Le projet de déploiement Firebase est **`goepico`** (URL : https://goepico.web.app) — toujours utiliser `firebase deploy --project goepico`.

## 6. Structure Commune des Ateliers (Template de Cours)
Les ateliers (`1-a.html` et `1-b.html`) partagent un pattern d'architecture identique. Toute création d'un nouvel atelier doit suivre ce template standardisé pour assurer la cohérence esthétique et technique.

### A. Disposition de l'Écran (Grid Layout)
L'écran de jeu est un flex conteneur de hauteur fixe (`h-[calc(100vh-70px)]`) divisé en deux zones principales :
1. **Zone Gauche (1/3 ou 5/12 de largeur)** :
   - **Haut** : Une carte descriptive de situation (`#scenario-card`) qui s'adapte en hauteur (`flex-grow`).
   - **Bas** : Le volet de rappel `#phase2-question-container` (masqué en phase 1, visible en phase 2) qui s'adapte au contenu (`style="height: auto !important;"`).
2. **Zone Droite (2/3 ou 7/12 de largeur)** :
   - Un conteneur parent flexible (`#options-container`) hébergeant les différentes phases :
     - **Phase 1** : La grille de sélection des réflexes de base (`#reflex-grid`).
     - **Phase 2** : Le choix d'une question type (`#questions-wrapper` pour 1-a) ou l'identification de la maquette d'interface correspondante (`#ui-grid` pour 1-b).
     - **Phase 3** : La carte explicative finale (`#debriefing-card`).

### B. Cycle de Vie d'un Défi (Étape)
Chaque étape suit une progression stricte en 3 phases gérées par les variables `currentPhase` (1, 2 ou 3) :
- **Phase 1 (Identification du Réflexe)** : L'utilisateur lit la situation et sélectionne le réflexe UX/Stratégique approprié parmi 4 choix (1 correct, 3 distracteurs).
- **Phase 2 (Traduction Pratique)** : Le réflexe s'ancre à gauche dans `#phase2-question-container` avec son icône. À droite, l'utilisateur identifie l'application pratique (soit la question clé dans `1-a`, soit la maquette d'écran dans `1-b`).
- **Phase 3 (Débriefing)** : La solution correcte est validée, la progression locale s'enregistre (`localStorage`), et le panneau de débriefing final s'affiche avec les explications détaillées et l'impact métier ESIS-3D.

### C. Structure de Données (Fichier JSON)
Les données sont chargées dynamiquement depuis un fichier JSON :
- **Atelier 1-a (Posture/Besoins)** : Chaque scénario propose une liste de `questions` (la bonne question est déterminée par l'indice du niveau actuel).
- **Atelier 1-b (Conception/UI)** : Chaque scénario propose une structure `correct` (maquette, explication et icône spécifique) et un tableau `wrong` de distracteurs graphiques.
- Tout nouveau format de cours doit stocker son contenu dans un JSON structuré de façon similaire à `1-a.json` ou `1-b.json`.

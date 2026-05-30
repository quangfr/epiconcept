# AGENTS.md - Guide IA Ultra-Compact

## 1. Stack & Architecture
- **Stack** : HTML5, CSS3, JS Vanilla. **Aucun Bundler/Framework** (pas de React/Vite/Webpack/Node.js en prod). Tailwind CDN & Lucide CDN.
- **Fichiers** : `index.html` (Hub, modal "Comprendre" + `1-0.json`). `1-a.html` & `1-b.html` (Ateliers, logique/jeu dans `<script>`).
- **Data** : Lecture seule via `fetch` sur les fichiers JSON (`1-0.json`, `1-a.json`, `1-b.json`). Éviter le cache avec `?v=` + timestamp.

## 2. Directives UI & Frontend
- **Design System** : Glassmorphism (`border-slate-200/60`, `bg-white/90`, `backdrop-blur`). Palette : `slate`, `emerald`, `blue`. Micro-interactions via Tailwind (`transition-all duration-300 hover:scale-105`).
- **Icônes Lucide** : `<i data-lucide="icon-name"></i>`. **TRÈS IMPORTANT** : Toujours appeler `lucide.createIcons()` après avoir injecté du HTML dynamique avec `innerHTML`.
- **Modèle SVG Box & Zoom** : 
  - SVGs responsives (`viewBox="0 0 W H"`), sans dimensions fixes. Zoom interactif plein écran au clic (`zoom-overlay`).
  - Mobile : Modal paddings `5px` vert. / `0px` horiz. SVGs : `margin: 0` et `max-height: 55vh`.
  - **Séparation Sémantique** :
    - `content` : **Uniquement** le SVG brut (pas de `<div>` ou `<p>`).
    - `footer` : Légendes/textes complexes. Rendu : si commence par `"<div"`, injecté dans un bloc flex, sinon habillé dans `<p>`. Ne jamais insérer `<div>` dans `<p>`.

## 3. Workflow & Remplacement
- **Vanilla** : Pas de refacto complexe React/Vue.
- **Scripts de maintenance** : Utiliser des scripts Node.js locaux temporaires (`fix-*.js`) pour modifications massives (les supprimer après commit).
- **Workflow** : Vérifier DOM IDs pour éviter les erreurs `innerHTML` sur élément `null`. Valider les structures JSON.
- **Git & Déploiement** : Commits locaux uniquement. **NE JAMAIS faire de `git push` ou de déploiement sans demande expresse**. Firebase project : `goepico` (https://goepico.web.app). Commande : `firebase deploy --project goepico`.

## 4. Template Ateliers (1-a & 1-b)
- **Layout Grid** (`h-[calc(100vh-70px)]`) :
  - **Gauche (1/3 ou 5/12)** : Haut `#scenario-card` (`flex-grow`) ; Bas `#phase2-question-container` (auto height, visible en phase 2).
  - **Droite (2/3 ou 7/12)** : `#options-container` englobant Phase 1 (`#reflex-grid`), Phase 2 (`#questions-wrapper` ou `#ui-grid`), Phase 3 (`#debriefing-card`).
- **Cycle en 3 Phases** :
  - **Phase 1** : Sélection du réflexe (1 correct, 3 faux) dans `#reflex-grid`.
  - **Phase 2** : Réflexe ancré à gauche. Sélection pratique à droite (question pour `1-a`, maquette pour `1-b`).
  - **Phase 3** : Validation, sauvegarde `localStorage`, affichage `#debriefing-card` (explications + impact ESIS-3D).
- **Structures JSON** :
  - `1-a.json` : `questions` (la bonne est à l'index du niveau).
  - `1-b.json` : `correct` (maquette, explication, icône) + tableau `wrong` (distracteurs).

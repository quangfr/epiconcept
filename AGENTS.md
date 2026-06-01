# AGENTS.md - Guide IA Ultra-Compact

## 1. Stack & Architecture
- **Stack** : HTML5, CSS3, JS Vanilla. Aucun framework/bundler en prod. Tailwind CDN & Lucide CDN.
- **Fichiers** : `index.html` (Hub + Modal "Lesson" + Réf réflexes). Ateliers `1-a.html`, `1-b.html`, `2-c.html`, `2-d.html` (logique dans `<script>`).
- **Data** : JSON en lecture seule via `fetch` (`1-a.json`...). Bypass cache : `?v=` + timestamp.
- **Slides** : `1-0.md`, `2-0.md` (format Marp-like, séparateur `\n---\n`).

## 2. Directives UI & Frontend

### A. Directives de Style des Fichiers .html (Hub & Ateliers)
- **CSS & CDN** : Tailwind CSS (via CDN) pour le prototypage rapide. Les styles partagés et réutilisables (secousse `.shake`, réussite `.correct`, grilles d'options et mockups interactifs) sont factorisés dans `style.css`.
- **Thème Visual Design (Glassmorphism)** :
  - Utiliser la transparence floutée : `bg-white/90 border border-slate-200/60 backdrop-blur shadow-sm rounded-xl`.
  - Nuancier harmonieux : Gris/Bleu ardoise (`slate`), Bleu/Indigo (`blue`/`indigo`) pour les focus et sélections, Vert émeraude (`emerald`) pour les validations et succès, Rose/Rouge (`rose`/`red`) pour les erreurs et frictions.
- **Interactions & Feedback** : Micro-animations au survol (`hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200`). Animation de secousse `@keyframes shake` pour l'échec et vibration.
- **Lucide Icons** : Appeler impérativement `lucide.createIcons()` après chaque modification dynamique du DOM (`innerHTML`) pour restituer les icônes à la volée.

### B. Gestion Responsive des Slides "Lesson" & SVGs (Marp / index.html)
- **Responsive Layout** : `.lesson-slide` est un conteneur flex vertical (`display: flex; flex-direction: column; overflow: hidden`) qui remplit l'espace de la modal sans provoquer de barre de défilement interne.
- **Adaptabilité Typographique** : Les titres de slides utilisent un dimensionnement fluide (`font-size: clamp(2.8rem, 5.2vw, 4rem); font-weight: 900; margin-bottom: 0.3rem`).
- **Gestion des SVGs Bruts** :
  - **Règle d'or** : Les SVGs doivent obligatoirement posséder un attribut `viewBox="0 0 W H"` pour rester extensibles, sans dimensions fixes (`width`/`height` en pixels) codées en dur.
  - Ajustement automatique : Le CSS force `.lesson-slide svg { max-height: 100% !important; max-width: 100% !important; height: auto !important; width: auto !important; display: block; }` pour s'étirer parfaitement dans l'espace disponible.
- **Zoom Interactif au Clic** : Tout clic sur un SVG de slide déclenche l'affichage d'un clone dans un overlay plein écran flouté (`.zoom-overlay` avec `backdrop-filter: blur(10px)`) avec bouton de fermeture (icône Lucide `x`) et fermeture par touche Échap (`Escape`).
- **Mobile** : Sur écran inférieur à 768px, les marges horizontales tombent à 0, et la hauteur maximale des SVGs est limitée à `70vh` pour libérer de l'espace pour le titre et le texte de conclusion.

### C. Slides Récapitulatifs de Fin ("Réflexes")
- **Layout Adapté** : Les slides de fin (type "Récapitulatif des Réflexes") reçoivent un alignement étiré (`align-items: stretch` au lieu de `center`) pour maximiser la largeur d'affichage des grilles et colonnes.
- **Mise en Page** : Utiliser des structures en grille ou cartes horizontales flex avec fond neutre (`bg-slate-50 border border-slate-200`), icônes Lucide sémantiques et contrastées, et badges pour résumer les notions apprises sans surcharger.

## 3. Workflow, Économie de Tokens & Structure
- **Structure** : `index.html` centralise le Hub et le chargement des référentiels via `showRef(id)`. Chaque fichier `{X}-{y}.html` contient la logique de jeu de son atelier respectif, et consomme `{X}-{y}.json` qui contient les questions, scénarios et visuels HTML.
- **Économie de Tokens** :
  - **Ne pas lire de gros fichiers JSON** en entier ! Préférer des scripts Node de recherche ciblés (`fix-*.js`) ou `grep` pour inspecter des fragments.
  - Utiliser `replace_file_content` sur des blocs ultra-ciblés de lignes au lieu de lire ou réécrire de larges portions d'un fichier.
  - Ne jamais charger `index.html` en entier si non requis ; cibler uniquement les blocs de script via des plages de lignes précises.
- **Scripts** : Utiliser des scripts Node temporaires `fix-*.js` pour les modifications de masse (les supprimer immédiatement après exécution).

## 4. Template Ateliers (Cycle 3 Phases)
- **Layout Grid** (`h-[calc(100vh-70px)]`) : Gauche (1/3) = `#scenario-card` + `#phase2-question-container` (auto). Droite (2/3) = `#options-container` (Phase 1: `#reflex-grid`, Phase 2: `#questions-wrapper`/`#ui-grid`, Phase 3: `#debriefing-card`).
- **localStorage** : `{po,ux,cso,evo}-progress-lv{level}-reflex{id}` et `{po,ux,cso,evo}-score-lv{level}`.

## 5. Structures JSON

| Fichier | Top-level | `icon` | `questions` | `scenarios[]` | `subOptions[]` | `explVisual` |
|---------|-----------|--------|-------------|---------------|----------------|--------------|
| **1-a (PO)** | `[]` | Non | `[{text}]` | `{text, explanation, visual}` | N/A | Oui |
| **1-b (UX)** | `[]` | Non | N/A | `{text, problemVisual, correct, wrong, expl}` | N/A | Non |
| **2-c (Support)** | `{value:[]}` | Oui | `[string]` | `{text, explanation, visual, subOptions[]}` | `{text, isCorrect}` (3/scénario) | Oui |
| **2-d (Specs)** | `[]` | Oui | `[string]` | `{text, explanation, visual, subOptions[]}` | `{text, isCorrect}` (3/scénario) | Oui |
| **3-e (Roadmap)**| `[]` | Oui | Optionnel | `{text, problemVisual, correct, wrong}` | N/A | Non |
| **3-f (Features)**| `[]` | Oui | Optionnel | `{text, problemVisual, correct, wrong}` | N/A | Non |

- `1-a.json` : `questions` index = niveau (0,1,2).
- `1-b.json`, `3-e.json`, `3-f.json` : `correct` & `wrong[]` (2 dist.) ont la structure `{title, visual, expl, debriefExpl, icon}`.
- `2-c/2-d` : 1 correct et 2 faux dans `subOptions`.

## 6. Références (index.html - Ref-Modal)
`showRef(reflexId)` charge les JSONs et dispatch :
- **A** (PO) : badge `"Réflexe PO (Posture)"`, icône `"target"`. Questions = `q.text`. Exemples = 3 visuels de scénarios.
- **B** (UX) : badge `"Réflexe UX (Conception)"`, icône `"mouse-pointer-click"`. Pas de questions. Visuels = `scenarios[].correct.visual`.
- **C** (Support) : badge `"Réflexe Support & Client"`, icône `icon || "headset"`. Questions = string. Titres visuels = `correct.subOption.text`.
- **D** (Specs) : badge `"Réflexe Spécs & Évolutions"`, icône `icon || "sparkles"`. Questions = string. Titres visuels = `correct.subOption.text`.
- **E** (Roadmap) : badge `"Réflexe Roadmap (Vision)"`, icône `icon || "mountain"`. Questions = `sci.title : sci.expl`. Visuels = `sci.visual`.
- **F** (Features) : badge `"Réflexe Features (Discovery)"`, icône `icon || "telescope"`. Questions = `sci.title : sci.expl`. Visuels = `sci.visual`.

**Modal DOM** : `#ref-examples-container` -> `#ref-examples-list`. `#ref-visuals-container` -> `#ref-visuals-list`.

## 7. Slides "Lesson" & Hub
- **Slides** : `openLesson(atelierId)` charge `{atelierId}-0.md`. Séparateur `\n---\n`. Rend `<div class="lesson-slide">` + navigation + localStorage.
- **Hub click handlers** : `#po-card` (`./1-a.html`), `#ux-card` (`./1-b.html`), `#evo-card` (`./2-d.html`), `#cso-card` (`./2-c.html`).

## 8. Guide des Visuels (HTML Tailwind)
- Mockups HTML compacts injectés dans le JSON via `innerHTML`.
- **Règles** : Police `text-[6px]` à `text-[9px]`, icônes avec `data-lucide` (puis `createIcons()`). Wrapper : `<div class="visual-mockup"><div class="mockup-container">...</div></div>`. Pas de commentaires HTML. Échapper `"` -> `\"` et `'` -> `&#39;`.
- **explVisual** : PO = étapes connectées ; Support = matrice/dashboard ; Specs = couches/workflow.
- **scenario.visual** : PO = interface métier ; Support = ticket ; Specs = mockup design/process. UX = 3 rendus côte-à-côte (correct + 2 wrong).

## 9. Bump, Commit & Déploiement
- **Bump** : Incrémenter `APP_VERSION` dans `index.html` (format `YYYY.MM.DD.NN`). `NN` = 01 le jour même, puis 02, 03...
- **Commit** : `git add index.html [fichiers modifiés]; if ($?) { git commit -m "bump vYYYY.MM.DD.NN - <description>" }`
- **Push & Deploy** : **INTERDICTION** de push ou de déployer (`git push` et `firebase deploy`) automatiquement. Ces actions doivent être exécutées **UNIQUEMENT sur demande explicite** de l'utilisateur.
- Ne jamais commiter `.firebase/hosting..cache`.

## 10. Code Utile (Cheat Sheet)
```js
// Injection + Lucide
el.innerHTML = html; lucide.createIcons();
// Options Phase 2 (PO)
const opts = reflex.questions.map((q, i) => ({ text: q.text || q, isCorrect: i === lv })).sort(() => Math.random() - 0.5);
```

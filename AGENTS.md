# AGENTS.md - Guide IA Ultra-Compact

## 1. Stack & Architecture
- **Stack** : HTML5, CSS3, JS Vanilla. Aucun framework/bundler en prod. Tailwind CDN & Lucide CDN.
- **Fichiers** : `index.html` (Hub + Modal "Lesson" + Réf réflexes). Ateliers `1-a.html`, `1-b.html`, `2-c.html`, `2-d.html` (logique dans `<script>`).
- **Data** : JSON en lecture seule via `fetch` (`1-a.json`...). Bypass cache : `?v=` + timestamp.
- **Slides** : `1-0.md`, `2-0.md` (format Marp-like, séparateur `\n---\n`).

## 2. Directives UI & Frontend
- **Design** : Glassmorphism (`border-slate-200/60`, `bg-white/90`, `backdrop-blur`). Couleurs : `slate`, `emerald`, `blue`. Transition-all Tailwind.
- **Lucide** : Appeler `lucide.createIcons()` après chaque injection `innerHTML`.
- **SVG & Zoom** : Responsives (`viewBox="0 0 W H"`), sans tailles fixes. Zoom plein écran au clic (`zoom-overlay`).
- **Mobile** : Marges vert 5px / horiz 0px. Max-height SVG : 55vh.
- **Sémantique** : `content` = SVG brut uniquement. `footer` = Légende (si commence par `"<div"` -> flex, sinon `<p>`).

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

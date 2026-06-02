# AGENTS.md - Guide IA Ultra-Compact

## 1. Stack & Architecture
- **Stack** : HTML5, CSS3, JS Vanilla. Aucun framework/bundler en prod. Tailwind CDN & Lucide CDN.
- **Hub** : `index.html` (Hub + Lesson Modal + Ref Modal). Tous les ateliers via `exo.html?id={X}-{y}`.
- **Data** : JSON en lecture seule via `fetch`. Bypass cache : `?v=` + timestamp.
- **Slides** : `{1..6}-0.md` (format Marp-like, séparateur `\n---\n`).

## 2. Directives UI & Frontend
- **Style** : Tailwind CSS (CDN) + `style.css` (partagés, `.shake`, `.correct`).
- **Glassmorphism** : `bg-white/90 border border-slate-200/60 backdrop-blur shadow-sm rounded-xl`. Palette : `slate` (gris), `blue/indigo` (focus), `emerald` (succès), `rose/red` (erreurs).
- **Interactions** : Micro-animations (hover shadow/translate) et `@keyframes shake`. Appeler `lucide.createIcons()` après chaque `innerHTML`.
- **Slides / SVGs** : `.lesson-slide` flex sans scroll. Titres fluides (`clamp`). SVGs avec `viewBox` (zéro dimension fixe), forcés en `max-size: 100%`.
- **Zoom/Mobile** : Zoom overlay flouté sur clic. Mobile (<768px) : marges 0, `max-height: 70vh` pour les SVGs.
- **Réflexes** : Layout étiré (`align-items: stretch`), cartes `bg-slate-50`, badges sémantiques.

## 3. Workflow, Économie de Tokens & Structure
- **Structure** : `index.html` centralise le Hub et le chargement des référentiels via `showRef(id)`. Chaque fichier `{X}-{y}.json` contient les scénarios et visuels HTML. `exo.html` est le template unique d'exercice.
- **Économie de Tokens** :
  - **Ne pas lire de gros fichiers JSON** en entier ! Préférer des scripts Node de recherche ciblés (`fix-*.js`) ou `grep` pour inspecter des fragments.
  - Utiliser `edit` sur des blocs ultra-ciblés de lignes au lieu de lire ou réécrire de larges portions d'un fichier.
  - Ne jamais charger `index.html` en entier si non requis ; cibler uniquement les blocs de script via des plages de lignes précises.
  - **Efficacité d'exécution** : Résoudre les tâches en un minimum d'étapes possibles.
  - **Réponses ultra-synthétiques** : Rédiger des réponses de fin de tour extrêmement courtes et condensées pour économiser les tokens.
- **Scripts** : Utiliser des scripts Node temporaires `fix-*.js` pour les modifications de masse (les supprimer immédiatement après exécution).

### 3.1 Directives pour éditions rapides (SVG/slides)

- **Slide reordering** : Utiliser `git show HEAD:file.md` pour récupérer l'original, puis un script Node qui `split(/\n---\n/)` pour réarranger les slides par indice. Ne jamais réécrire de gros blocs SVG à la main.
- **SVG edits** : Pour modifier un SVG existant, utiliser `grep` avec le texte SVG unique (ex. `viewBox=`) pour trouver la ligne, puis `read -o offset -n 3` pour cibler la zone exacte. Préférer `edit` sur des chaînes uniques à l'intérieur du SVG plutôt que de remplacer tout le bloc.
- **Éditions parallèles** : Quand 2+ sections indépendantes d'un même fichier doivent être modifiées, faire les `edit` en un seul message (appels parallèles) pour gagner un tour.
- **Nouveau slide** : Ajouter un slide en faisant `edit` qui remplace le séparateur `\n---\n` entre deux slides existants par `\n---\n<new slide>\n---\n` — pas besoin de réécrire le fichier entier.
- **Restauration** : Pour restaurer un slide écrasé, utiliser `git show HEAD:file.md | sed -n '/^# Title/,/^---$/p'` pour en extraire le contenu exact sans le stocker en mémoire de la conversation.

## 4. Template Ateliers (Cycle 3 Phases)
- **Layout Grid** (`h-[calc(100vh-70px)]`) : Gauche (1/3) = `#scenario-card` + `#phase2-question-container` (auto). Droite (2/3) = `#options-container` (Phase 1: `#reflex-grid`, Phase 2: `#ui-grid`, Phase 3: `#debriefing-card`).
- **localStorage** : `{key}-progress-lv{level}-reflex{id}` et `{key}-score-lv{level}` où `key` ∈ `{po,ux,cso,evo,road,feat,gsup,ticketing,veille,tln,analytics,kpi}`.
- **ATELIERS_CONFIG** dans `exo.html` : mapping `{X}-{y}` → `{key, title, badge, levelNames, levelDescriptions, ...}`. Score localStorage = `{CONFIG.key}-score-lv{level}`.

## 5. Structures JSON

| Fichier | Top-level | `icon` | `scenarios[]` | `explVisual` |
|---------|-----------|--------|---------------|--------------|
| **1-a (PO)** | `[]` | Non | `{text, problemVisual, correct, wrong, expl}` | Oui |
| **1-b (UX)** | `[]` | Non | `{text, problemVisual, correct, wrong, expl}` | Non |
| **2-c (Support)** | `[]` | Oui | `{text, problemVisual, correct, wrong, expl}` | Oui |
| **2-d (Specs)** | `[]` | Oui | `{text, problemVisual, correct, wrong, expl}` | Oui |
| **3-e (Roadmap)** | `[]` | Oui | `{text, problemVisual, correct, wrong}` | Non |
| **3-f (Features)** | `[]` | Oui | `{text, problemVisual, correct, wrong}` | Non |
| **4-g (Diag)** | `[]` | Non | `{text, problemVisual, correct, wrong, expl}` | Non |
| **4-h (Assist)** | `[]` | Oui | `{text, problemVisual, correct, wrong, expl}` | Non |
| **5-i (Veille)** | `[]` | Non | `{text, problemVisual, correct, wrong, expl}` | Non |
| **5-j (Test&Learn)**| `[]` | Non | `{text, problemVisual, correct, wrong, expl}` | Non |
| **6-k (Analytics)**| `[]` | Non | `{text, problemVisual, correct, wrong, expl}` | Non |
| **6-l (KPIs)**    | `[]` | Oui | `{text, problemVisual, correct, wrong, expl}` | Non |

- Tous : 1 `correct` + 2 `wrong[]` par scénario, chaque `{title, visual, expl, debriefExpl, icon}`.
- Chaque scénario a son propre `expl` (principe générique, pas spécifique au scénario).

### 5.1 Règles métier des champs textuels

**`expl`** (générique) : Description du **principe**, pas de la situation. Affiché dans le **référentiel réflexe** et dans le **choix de réponse (QCM)**.
- Ne doit pas mentionner le scénario concret.
- Pour `wrong[]` : description **neutre** de l'approche, **sans jugement** ni critique.

**`debriefExpl`** (contextuel) : Description **plus longue**, **adaptée au scénario**. Affiché en **phase de debrief** après validation.
- Doit expliquer *pourquoi* le choix (correct ou wrong) s'applique à la situation concrète.
- **Jamais identique** à `expl`.

**`correct.title`** : Titre du choix correct, affiché dans le QCM.
- Commence par un **verbe** (sauf rares exceptions comme "Démarrer une refonte...").
- **3 à 5 mots** idéalement, 7 max si nécessaire à la clarté.
- Langage simple et concret.

**Public cible** : Population **métier et fonctionnelle** (pas technique). Éviter jargon dev.

### 5.2 Scénarios & Visuels

**`scenario.text`** : Situation concrète vécue par un utilisateur métier (CRDC, médecin, gestionnaire). Doit être crédible, contextualisée, et exposer un problème tangible.

**`problemVisual`** : État du problème **avant** résolution. Tons : rouge/ambre, bordures `red-200`, fonds `red-50`.

**`correct.visual`** : Solution recommandée. **Après** application du réflexe. Tons : emeraude, bordure `emerald-500/200`.

**`wrong[].visual`** : Approche alternative non optimale.
  **Couleurs : majorité slate** : tons slate/gris (`border-slate-200`, `bg-slate-50`, `text-slate-500`). 0 à 2 éléments par visuel peuvent être en `blue` (`text-blue-500` pour icône unique, `text-blue-600` pour titre de section, `bg-blue-600/700` pour badge/bouton). Aucune autre couleur primaire.
  **Pas de rouge/ambre** — les visuels wrong doivent sembler aussi crédibles que les corrects visuellement.

**Règle stricte** : Les visuels `correct.visual` et `wrong[].visual` ne doivent **jamais** contenir de texte ou d'indicateur visuel signalant la vérité ou la fausseté de la réponse (pas de badge `CONSEILLÉ`, pas de coche/checkmark, pas de `✅`/`❌`, pas de couleur de fond distinctive). Seul le conteneur du QCM (badge/encadré) distingue correct de wrong.

## 6. Références (showRef dans index.html)
`showRef(reflexId)` charge **tous** les JSONs en une promesse, dispatch :
- **A** (PO) : badge `"Réflexe PO"`, icône `"target"`. Visuels = scénarios.
- **B** (UX) : badge `"Réflexe UX"`, icône `"mouse-pointer-click"`.
- **C** (Support) : badge `"Réflexe Support"`, icône `icon \|\| "headset"`.
- **D** (Specs) : badge `"Réflexe Spécs"`, icône `icon \|\| "sparkles"`.
- **E** (Roadmap) : badge `"Réflexe Roadmap"`, icône `icon \|\| "mountain"`.
- **F** (Features) : badge `"Réflexe Features"`, icône `icon \|\| "telescope"`.
- **G** (Diag) : badge `"Réflexe G - Diagnostic & Résolution"`, icône `icon \|\| "headset"`.
- **H** (Assist) : badge `"Réflexe H - Assistance & Connaissance"`, icône `icon \|\| "book-open"`.
- **I** (Veille) : badge `"Réflexe Veille & Benchmark"`, icône `"search"`.
- **J** (Test & Learn) : badge `"Réflexe Test & Learn"`, icône `"flask"`.
- **K** (Analytics) : badge `"Réflexe Analytics & Productivité"`, icône `"bar-chart-2"`.
- **L** (KPIs) : badge `"Réflexe KPIs & Dashboard"`, icône `"database"`.

**Modal DOM** : `#ref-examples-container` → `#ref-examples-list`. `#ref-visuals-container` → `#ref-visuals-list`.

## 7. Slides "Lesson" & Hub
- **Slides** : `openLesson(atelierId, startSlide = null)` charge `{atelierId}-0.md`. Parse Marp (`\n---\n`). Navigation, localStorage (lsKey = `{thème}-last-slide`).
- **Hub cards** : chaque card a un clic principal et un bouton info (`openLesson`). Le badge de progression est géré par `updateCardStatusBadge(labelEl, x, y)`.
- **Cards Hub existantes** : `#po-card` (1-a), `#ux-card` (1-b), `#backlog-card` (slides 1), `#dt-card` (slides 1), `#mvp-card` (slides 2), `#cso-card` (2-c), `#evo-card` (2-d), `#road-card` (3-e), `#feat-card` (3-f), `#gsup-card` (4-g), `#ticketing-card` (4-h), `#veille-card` (5-i), `#lean-card` (slides 5), `#poc-card` (5-j), `#data-driven-card` (slides 6), `#analytics-card` (6-k), `#kpi-card` (6-l).
- **Alignement des Titres** : Les intitulés dans les slides `.md` doivent correspondre aux `title` des `.json`.

## 8. Guide des Visuels (HTML Tailwind)
- Mockups HTML compacts injectés dans le JSON via `innerHTML`.
- **Règles** : Police `text-[6px]` à `text-[9px]`, icônes avec `data-lucide` (puis `createIcons()`). Wrapper : `<div class="visual-mockup"><div class="mockup-container">...</div></div>`. Pas de commentaires HTML. Échapper `"` -> `\"` et `'` -> `&#39;`.
- `explVisual` : PO = étapes connectées ; Support = matrice/dashboard ; Specs = couches/workflow.
- `scenario.visual` : PO = interface métier ; Support = ticket ; Specs = mockup design/process. UX = 3 rendus côte-à-côte.

## 9. Bump, Commit & Déploiement
- **Strictes restrictions** : **INTERDICTION** d'incrémenter la version (Bump), de commiter (Commit), de push ou de déployer (`git push` et `firebase deploy`) de manière automatique.
- **Bump** (Sur demande) : Incrémenter `APP_VERSION` dans `index.html` (format `YYYY.MM.DD.NN`). `NN` = 01, 02...
- **Commit** (Sur demande) : `git add index.html [fichiers modifiés]; if ($?) { git commit -m "bump vYYYY.MM.DD.NN - <description>" }`
- **Push & Deploy** (Sur demande) : `git push` et/ou `firebase deploy`.

## 10. Code Utile (Cheat Sheet)
```js
// Injection + Lucide
el.innerHTML = html; lucide.createIcons();
// updateCardStatusBadge(labelEl, x, y) — affiche "x / y" avec couleur (rouge=0, jaune, vert=100%)
// Pour les slides badge, ajouter l'id à isLessonLabel[] pour vert sur les 2 dernières slides
```

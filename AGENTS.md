# AGENTS.md - Guide IA Ultra-Compact

## 1. Stack & Architecture
- **Stack** : HTML5, CSS3, JS Vanilla. **Aucun Bundler/Framework** (pas de React/Vite/Webpack/Node.js en prod). Tailwind CDN & Lucide CDN.
- **Fichiers** : `index.html` (Hub, modal "Comprendre" + référence reflexes). `1-a.html`, `1-b.html`, `2-c.html`, `2-d.html` (Ateliers, logique/jeu dans `<script>`).
- **Data** : Lecture seule via `fetch` sur les fichiers JSON (`1-a.json`, `1-b.json`, `2-c.json`, `2-d.json`). Éviter le cache avec `?v=` + timestamp.
- **Fichiers slides** : `1-0.md`, `2-0.md` pour les slides "Comprendre" (format Marp-like, séparateur `\n---\n`).

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

## 4. Template Ateliers
- **Layout Grid** (`h-[calc(100vh-70px)]`) :
  - **Gauche (1/3 ou 5/12)** : Haut `#scenario-card` (`flex-grow`) ; Bas `#phase2-question-container` (auto height, visible en phase 2).
  - **Droite (2/3 ou 7/12)** : `#options-container` englobant Phase 1 (`#reflex-grid`), Phase 2 (`#questions-wrapper` ou `#ui-grid`), Phase 3 (`#debriefing-card`).
- **Cycle en 3 Phases** :
  - **Phase 1** : Sélection du réflexe (1 correct, 3 faux) dans `#reflex-grid`.
  - **Phase 2** : Réflexe ancré à gauche. Sélection pratique à droite.
  - **Phase 3** : Validation, sauvegarde `localStorage`, affichage `#debriefing-card` (explications + impact ESIS-3D).
- **localStorage keys** : `{po,ux,cso,evo}-progress-lv{level}-reflex{id}`, `{po,ux,cso,evo}-score-lv{level}`.

## 5. Structures JSON - Tableau Récapitulatif

| Champ | 1-a (PO) | 1-b (UX) | 2-c (Support) | 2-d (Specs) |
|-------|----------|----------|---------------|-------------|
| Top-level | `[]` array | `[]` array | `{value: []}` | `[]` array |
| `icon` | Non | Non (dans `scenarios[].correct`) | Oui (`icon`) | Oui (`icon`) |
| `questions` | `[{text}]` | N/A | `[string]` | `[string]` |
| `scenarios[]` | `{text, explanation, visual}` | `{text, problemVisual, correct, wrong, expl}` | `{text, explanation, visual, subOptions[]}` | `{text, explanation, visual, subOptions[]}` |
| `subOptions[]` | N/A | N/A | `{text, isCorrect}` (3/scenario) | `{text, isCorrect}` (3/scenario) |
| `explVisual` | Oui | Non | Oui | Oui |

**Règles** :
- `1-a.json` : `questions` = objets avec `text` uniquement. La bonne question est à l'index = niveau (0,1,2).
- `1-b.json` : `scenarios[].correct` = objet avec `{title, visual, expl, debriefExpl, icon}`. `wrong[]` = 2 distracteurs même structure.
- `2-c.json` / `2-d.json` : Toujours wrapper `{value: []}` pour C, tableau direct pour D. `subOptions` = options de phase 2 (1 `isCorrect: true`, 2 `false`).

## 6. Intégration index.html - Ref-Modal

La fonction `showRef(reflexId)` (ligne ~2098) charge les 4 JSONs et dispatch par préfixe :

| Préfixe | Source | Badge | Icône |
|---------|--------|-------|-------|
| `A` | `reflexesData.po` (1-a.json) | `"Réflexe PO (Posture)"` | `"target"` |
| `B` | `reflexesData.ux` (1-b.json) | `"Réflexe UX (Conception)"` | `"mouse-pointer-click"` |
| `C` | `reflexesData.c` (2-c.json) | `"Réflexe Support & Client"` | `item.icon \|\| "headset"` |
| `D` | `reflexesData.d` (2-d.json) | `"Réflexe Spécs & Évolutions"` | `item.icon \|\| "sparkles"` |

**Sections du modal** :
- **Questions** (section texte) : Pour A = `item.questions` (objets), rendu `q.text \|\| q`. Pour C/D = `item.questions` (strings). Label = `"Questions"`.
- **Exemples** (section visuelle) : Affiche 3 visuels de scénario (`scenarios[0..2].visual`). Pour C/D, le titre du visuel = `correct.subOption.text` (pas le nom du niveau). Label = `"Exemples"`.
- **UX (B)** : Pas de section Questions. Section visuelle = `scenarios[].correct.visual` avec classe `ref-visual-card-ux`.

**Structure HTML du modal** (dans `#ref-modal`) :
```html
<div id="ref-examples-container">  <!-- Questions / Approches -->
  <h4 id="ref-examples-label">Questions</h4>
  <ul id="ref-examples-list"></ul>
</div>
<div id="ref-visuals-container">  <!-- Exemples -->
  <h4>Exemples</h4>
  <div id="ref-visuals-list"></div>
</div>
```

**Pour ajouter un nouveau type de réflexe** :
1. Ajouter le JSON dans `showRef()` via `Promise.all` + entrée dans `reflexesData`
2. Ajouter un `else if (reflexId.startsWith('X'))` avec `examples`, `visuals`, `badgeText`, `iconName`, `isCD = true/false`
3. Si le type a une structure particulière, ajouter une branche dans `openRefModal()`

## 7. Intégration index.html - Slides "Comprendre"

- **Déclencheur** : Boutons "Comprendre l'Atelier" sur le hub (cartes atelier)
- **Fonction** : `openComprendre(atelierId)` (ligne ~1759)
- **Data** : Fichier Markdown `{atelierId}-0.md` (ex: `1-0.md`, `2-0.md`)
- **Parsing** : `parseMarp()` sépare sur `\n---\n`, extrait `# Title`, `<!-- description: ... -->`, `<!-- footer: ... -->`
- **Rendu** : `renderDynamicSlides()` crée des `<div class="comprendre-slide">` avec titre + visuel + footer optionnel
- **Navigation** : Flèches + swipe tactile + dots de progression + localStorage pour la dernière slide vue

**Pour ajouter un nouveau jeu de slides** :
1. Créer `{id}-0.md` avec des slides séparées par `\n---\n`
2. Dans `openComprendre()`, ajouter un `atelierId` et charger le bon fichier
3. Ajouter un bouton "Comprendre" sur la carte hub correspondante
4. Optionnel : ajouter un `lsKey` spécifique pour le localStorage

## 8. Hub index.html - Cartes Atelier

Chaque atelier a une carte cliquable dans le hub. Routage dans `DOMContentLoaded` (ligne ~1532) :

| Carte | Click handler | Cible |
|-------|--------------|-------|
| `#po-card` | `window.location.href = './1-a.html'` | Atelier PO |
| `#ux-card` | `window.location.href = './1-b.html'` | Atelier UX |
| `#evo-card` | `window.location.href = './2-d.html'` | Atelier Évolutions |
| `#cso-card` | `window.location.href = './2-c.html'` | Atelier Support |

**Pour ajouter un atelier** :
1. Créer `{n-x}.html` avec le template atelier (3 phases)
2. Créer `{n-x}.json` avec la structure correspondante
3. Ajouter une carte dans le hub (section des ateliers dans index.html)
4. Ajouter le click handler dans `DOMContentLoaded`
5. Ajouter le chargement JSON dans `showRef()` si le type doit apparaître dans la ref-modal
6. Si l'atelier a des slides "Comprendre", créer `{n-0}.md` et ajouter l'appel dans `openComprendre()`

## 9. Guide de Conception des Visuels (Tailwind Mockups)

Les visuels ne sont **plus des SVG** mais du HTML Tailwind. Ils sont stockés comme strings dans les JSON et injectés via `innerHTML`.

### Formats standards par type de visuel

**Visuel concept (explVisual)** — 1 par réflexe, illustre la solution abstraite en phase 3 :
- **1-a (PO)** : Panneau concept compact `max-w-[240px]` avec titre métier + contenu simulé (métriques, listes, flux). Montre la **posture/analyse**.
- **2-c (Support)** : Mockup de ticket/interface avec badges de priorité, métriques dashboard, bannières d'alerte. Montre l'**application support**.
- **2-d (Specs)** : Mockup d'architecture/désign — couches système, workflow, validation de formulaire, matrices de permission. Montre l'**impact structurel**.
- **1-b (UX)** : Mockup d'interface UI complet — comparaison visuelle entre `correct.visual` (bonne solution) et `wrong[].visual` (2 distracteurs). Montre le **principe d'ergonomie** en action (formulaire, carte, layout, navigation).

**Visuel scenario (1-a, 2-c, 2-d)** — Mockup de cas d'usage :
```html
<div class="w-full max-w-xs border border-slate-200 rounded-xl bg-white p-3 shadow-sm">
  <div class="flex items-center gap-1 mb-1.5">
    <div class="w-3.5 h-3.5 rounded bg-slate-200"></div>
    <span class="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Titre</span>
  </div>
  <div class="bg-slate-50 rounded-lg p-2 text-[7px] text-slate-700 leading-tight">
    Contenu du mockup...
  </div>
</div>
```

### Structure détaillée par type

#### 1-a (PO) — explVisual
Panneau concept `max-w-[240px]` avec un titre métier et une séquence d'étapes/flux montrant la posture PO.

```
<div class="w-full max-w-[240px] bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
  <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Titre Métier</div>
  <div class="flex flex-col gap-1.5">
    <!-- Étapes connectées par des flèches -->
    <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2">
      <div class="w-5 h-5 rounded-full bg-{couleur}-100 flex items-center justify-center shrink-0">
        <i data-lucide="{icone}" class="w-3 h-3 text-{couleur}-700"></i>
      </div>
      <div class="text-[9px] font-bold text-slate-800">Action / Constat</div>
    </div>
    <div class="flex justify-center"><i data-lucide="arrow-down" class="w-3 h-3 text-slate-300"></i></div>
    <div class="flex items-center gap-2 bg-{couleur}-50 border border-{couleur}-200 rounded-lg p-2">
      <div class="w-5 h-5 rounded-full bg-{couleur}-100 ...">
        <i data-lucide="{icone}" class="w-3 h-3 text-{couleur}-700"></i>
      </div>
      <div class="text-[9px] text-{couleur}-700 font-bold">Question / Réflexion</div>
    </div>
    <!-- Étape finale emphase -->
  </div>
</div>
```
**Astuces** : Utiliser une séquence de 3 boîtes connectées par des `arrow-down`. Changer la couleur par étape (`slate` → `indigo` → `emerald`). Icônes : `message-circle`, `help-circle`, `search`, `target`, `lightbulb`, `arrow-right`.

#### 2-c (Support) — explVisual
Mockup d'interface support : matrice, tableau de bord, ou carte de ticket.

```
<div class="w-full max-w-[240px] bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
  <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Titre Dashboard</div>
  <div class="grid grid-cols-2 gap-1 text-[7px] font-bold text-center mb-2">
    <div class="bg-slate-100 p-1 rounded text-slate-500">En-tête 1</div>
    <div class="bg-slate-100 p-1 rounded text-slate-500">En-tête 2</div>
    <div class="bg-{couleur}-100 p-1.5 rounded text-{couleur}-800">Valeur 1</div>
    <div class="bg-{couleur}-100 p-1.5 rounded text-{couleur}-800">Valeur 2</div>
  </div>
  <div class="mt-2 text-center text-[8px] text-slate-500">Légende / note</div>
</div>
```
**Variantes** : Matrice (grille 2×2 ou 2×3), liste de métriques (icône + libellé + valeur), barres de progression, badges de statut. Icônes : `alert-triangle`, `clock`, `users`, `check-circle`, `trending-up`.

#### 2-d (Specs) — explVisual
Mockup d'architecture : couches système, workflow, ou matrice de règles.

```
<div class="w-full max-w-[240px] bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
  <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Titre Architecture</div>
  <div class="space-y-1">
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-1.5 text-[8px] font-bold text-blue-800 text-center">Couche 1</div>
    <div class="flex justify-center"><i data-lucide="chevron-down" class="w-2.5 h-2.5 text-slate-300"></i></div>
    <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-1.5 text-[8px] font-bold text-indigo-800 text-center">Couche 2</div>
    <div class="flex justify-center"><i data-lucide="chevron-down" class="w-2.5 h-2.5 text-slate-300"></i></div>
    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-[8px] font-bold text-emerald-800 text-center">Couche 3</div>
  </div>
</div>
```
**Variantes** : Couches verticales empilées, workflow horizontal avec flèches, tableau de règles (2 colonnes), zones de formulaire avec validation (check/erreur). Icônes : `layers`, `git-branch`, `shield`, `settings`, `check`, `x`.

#### 1-b (UX) — scenario.visual (correct & wrong)
Comparaison UI : les visuels sont rendus directement dans les boutons de phase 2, pas dans un overlay.

```
<!-- correct.visual — la bonne solution, souvent avec bordure bleue -->
<div class="flex gap-2 w-full">
  <button class="flex-1 bg-blue-50 border-2 border-blue-600 text-blue-800 rounded-lg text-center py-2 text-xs font-black">Option A</button>
  <button class="flex-1 bg-white border border-slate-200 text-slate-500 rounded-lg text-center py-2 text-xs font-bold">Option B</button>
</div>

<!-- wrong[].visual — les distracteurs, aspect incomplet ou mauvais -->
<div class="w-full border border-slate-300 bg-white rounded p-2 text-xs text-slate-600 flex justify-between items-center">
  <span>-- Élément non fonctionnel --</span><span>▼</span>
</div>
```
**Variantes** : Sélecteur d'options, carte de contenu, layout de formulaire, barre de navigation, liste déroulante.

### Règles des mockups
- **Tailles de police** : Toujours petites (`text-[6px]` à `text-[9px]`) pour rester compact dans le conteneur
- **Icônes Lucide** : Toujours avec `data-lucide` + appel à `lucide.createIcons()` après injection (sauf dans `mockup-container` qui a `pointer-events: none`)
- **Conteneur** : Toujours wrapper `<div class="visual-mockup"><div class="mockup-container">...</div></div>`
- **Pas de commentaires HTML** dans les strings JSON (casserait l'injection)
- **Échappement HTML** : `"` → `\"`, `«` → `\u00ab`, `»` → `\u00bb`, `'` → `&#39;`
- **Couleurs** : Palette `slate` / `blue` / `emerald` / `red-50` selon le contexte sémantique
- **Largeur** : `max-w-xs` ou `w-full` selon le contenant (dans ref-modal = `w-full`, dans phase 2 = `w-full sm:w-48`)

### Où chaque visuel est rendu
- `scenarios[].visual` → ref-modal (Exemples), `#scenario-visual` en phase 1
- `explVisual` → `#debrief-visual` en phase 3 (débriefing)

**Champs supprimés** : `questions[].visual` (1-a.json) et `subOptions[].visual` (2-c, 2-d.json) — retirés car plus utilisés après la suppression des mockups en phase 2.

## 10. Patterns de Code Récuments

### Injection HTML sécurisée
```javascript
container.innerHTML = htmlContent;
lucide.createIcons();  // Toujours après innerHTML si des data-lucide sont présents
```

### Parsing questions selon le type
```javascript
// 1-a : questions sont des objets {text, visual}
reflex.questions.forEach(q => {
  const text = q.text || q;  // fallback si string
  // ...
});

// 2-c, 2-d : questions sont des strings
reflex.questions.forEach(q => {
  // q est déjà une string
});
```

### Construction des options de phase 2
```javascript
const options = reflex.questions.map((q, idx) => ({
  text: q.text || q,
  isCorrect: (idx === lv)  // niveau 0,1,2
})).sort(() => Math.random() - 0.5);
```

### Mapping questions → options (sans visual)
```javascript
const options = r.questions.map((q, idx) => ({
  text: q.text,
  isCorrect: (idx === lv)
})).sort(() => Math.random() - 0.5);
```

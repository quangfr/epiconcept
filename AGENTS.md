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

Les visuels sont du HTML Tailwind (pas de SVG). Stockés comme strings dans les JSON, injectés via `innerHTML`.

### Types de visuels

| Visuel | Où | Rôle |
|--------|----|------|
| `explVisual` | Débriefing phase 3 | 1 par réflexe, illustre le concept |
| `scenarios[].visual` | Ref-modal "Exemples" + phase 1 | Mockup du cas d'usage |

### Par atelier

**1-a (PO)** — `explVisual` : panneau concept avec titre métier + séquence d'étapes connectées (3 boîtes, flèches, changements de couleur `slate`→`indigo`→`emerald`). Icônes : `help-circle`, `target`, `search`, `lightbulb`.  
`scenario.visual` : mockup compact d'interface métier (ex: viewer radio, tableau de bord, liste).

**2-c (Support)** — `explVisual` : matrice de priorité, métriques dashboard, badges de statut, alertes. Icônes : `alert-triangle`, `clock`, `users`, `trending-up`.  
`scenario.visual` : carte de ticket avec en-tête, métadonnées (priorité, gravité, impact), badge de statut.

**2-d (Specs)** — `explVisual` : couches système empilées, workflow, matrice de règles, validation de formulaire. Icônes : `layers`, `git-branch`, `shield`, `settings`.  
`scenario.visual` : mockup d'architecture ou de design (workflow, permissions, étapes).

**1-b (UX)** — `correct.visual` : UI fonctionnelle (bouton bleu actif, options cohérentes). `wrong[].visual` : UI cassée/incomplète (select vide, placeholder grisé, layout cassé). Les 3 sont rendus côte à côte en phase 2.

### Règles
- Polices : `text-[6px]` à `text-[9px]` (compact)
- Icônes Lucide avec `data-lucide` + appeler `lucide.createIcons()` après injection
- Wrapper : `<div class="visual-mockup"><div class="mockup-container">...</div></div>`
- Pas de commentaires HTML dans les strings JSON
- Échapper : `"` → `\"`, `«` → `\u00ab`, `»` → `\u00bb`, `'` → `&#39;`
- Couleurs : palette `slate` / `blue` / `emerald` / `red-50` selon le contexte

### Supprimés
`questions[].visual` (1-a.json) et `subOptions[].visual` (2-c, 2-d.json) — plus utilisés depuis la suppression des mockups en phase 2.

## 10. Patterns de Code Récuments

### Injection HTML sécurisée
```javascript
container.innerHTML = htmlContent;
lucide.createIcons();  // Toujours après innerHTML si des data-lucide sont présents
```

### Parsing questions selon le type
```javascript
// 1-a : questions sont des objets {text}
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

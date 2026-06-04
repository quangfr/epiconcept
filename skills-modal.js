const REFLEX_WORKSHOP_MAP = {
    'A': { file: '1-a', key: 'po', title: 'PO - Besoins Utilisateurs', badge: 'Réflexe PO', icon: 'target' },
    'B': { file: '1-b', key: 'ux', title: 'UX - Ergonomie UX/UI', badge: 'Réflexe UX', icon: 'mouse-pointer-click' },
    'C': { file: '2-c', key: 'c', title: 'Support & Client', badge: 'Réflexe Support', icon: 'headset' },
    'D': { file: '2-d', key: 'd', title: 'Évolutions & Specs', badge: 'Réflexe Spécs', icon: 'sparkles' },
    'E': { file: '3-e', key: 'e', title: 'Pilotage & Roadmap', badge: 'Réflexe Roadmap', icon: 'mountain' },
    'F': { file: '3-f', key: 'f', title: 'Exploration terrain', badge: 'Réflexe Features', icon: 'telescope' },
    'G': { file: '4-g', key: 'g', title: 'Diagnostic & Résolution', badge: 'Réflexe Diagnostic & Résolution', icon: 'headset' },
    'H': { file: '4-h', key: 'h', title: 'Assistance & Connaissance', badge: 'Réflexe Assistance & Connaissance', icon: 'book-open' },
    'I': { file: '5-i', key: 'i', title: 'Veille & Adoption', badge: 'Réflexe Veille & Adoption', icon: 'search' },
    'J': { file: '5-j', key: 'j', title: 'Test & Learn', badge: 'Réflexe Test & Learn', icon: 'flask' },
    'K': { file: '6-k', key: 'k', title: 'Usage & Productivité', badge: 'Réflexe Usage & Productivité', icon: 'bar-chart-2' },
    'L': { file: '6-l', key: 'l', title: 'Suivi & Données', badge: 'Réflexe KPIs & Dashboard', icon: 'database' }
};

const LETTERS = Object.keys(REFLEX_WORKSHOP_MAP);
const _reflexDataCache = {};
let _currentLetter = null;
let _modalInjected = false;

function _injectReflexBrowser() {
    if (_modalInjected) return;
    _modalInjected = true;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
<div id="reflex-browser-modal" class="fixed inset-0 z-[10002] bg-slate-900/60 backdrop-blur-sm hidden flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden relative">
        <button onclick="closeReflexBrowser()" class="absolute top-3 right-3 z-10 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold" aria-label="Fermer">✕</button>
        <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 bg-slate-50 shrink-0 flex flex-col gap-2">
            <div>
                <select id="reflex-browser-title" onchange="switchReflexBrowserWorkshop(this.value)" class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-black text-slate-800 uppercase tracking-tight shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer"></select>
            </div>
            <select id="reflex-browser-selector" onchange="scrollToReflex(this.value)" class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800">
                <option value="">-- Aller au Réflexe --</option>
            </select>
        </div>
        <div id="reflex-browser-content" class="p-3 sm:p-4 overflow-y-auto flex-grow flex flex-col gap-4 sm:gap-6 bg-slate-100/50 relative"></div>
    </div>
</div>`;
    document.body.appendChild(wrapper.firstElementChild);
}

async function openReflexBrowser(letter, focusRefId) {
    _injectReflexBrowser();
    const modal = document.getElementById('reflex-browser-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const ws = REFLEX_WORKSHOP_MAP[letter];
    if (!ws) return;

    if (!_reflexDataCache[letter]) {
        try {
            const res = await fetch('./' + ws.file + '.json?v=' + Date.now());
            _reflexDataCache[letter] = await res.json();
        } catch (e) {
            console.warn('Failed to load workshop', ws.file);
            return;
        }
    }

    _currentLetter = letter;
    _renderReflexContent(letter, focusRefId);

    // Escape key handler
    var escHandler = function(e) {
        if (e.key === 'Escape') {
            closeReflexBrowser();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function _renderReflexContent(letter, focusRefId) {
    const container = document.getElementById('reflex-browser-content');
    const titleSel = document.getElementById('reflex-browser-title');
    const selector = document.getElementById('reflex-browser-selector');
    const data = _reflexDataCache[letter];
    const ws = REFLEX_WORKSHOP_MAP[letter];
    if (!container || !data || !ws) return;

    if (titleSel) {
        titleSel.innerHTML = LETTERS.map(function(l) {
            return '<option value="' + l + '">' + REFLEX_WORKSHOP_MAP[l].title + '</option>';
        }).join('');
        titleSel.value = letter;
    }

    if (selector) {
        selector.innerHTML = '<option value="">-- Aller au Réflexe --</option>';
    }

    container.innerHTML = '';
    for (var i = 0; i < data.length; i++) {
        var r = data[i];
        if (selector) {
            var opt = document.createElement('option');
            opt.value = r.id;
            opt.innerText = r.id + ' - ' + r.title;
            selector.appendChild(opt);
        }

        var html = '';
        html += '<div id="ref-' + r.id + '" class="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200">';
        html += '  <div class="flex items-center gap-2 mb-1">';
        html += '    <span class="text-2xl shrink-0"><i data-lucide="' + (r.icon || ws.icon) + '" class="w-6 h-6 text-slate-800"></i></span>';
        html += '    <h3 class="text-base font-black uppercase text-slate-800 tracking-tight">' + r.id + ' - ' + r.title + '</h3>';
        html += '  </div>';
        html += '  <p class="text-[11px] text-slate-500 font-semibold mb-2.5 pb-1.5 border-b border-slate-100">' + (r.intent || '') + '</p>';
        html += '  <div class="space-y-2">';

        for (var j = 0; j < r.scenarios.length; j++) {
            var scen = r.scenarios[j];
            html += '    <div class="bg-slate-50 rounded-lg p-2.5 border border-slate-200 flex flex-col md:flex-row gap-3 items-center">';
            html += '      <div class="w-full md:w-4/12 flex items-center justify-center mockup-container p-1.5 bg-white border border-emerald-100 rounded-md shadow-sm relative overflow-hidden min-h-[80px] shrink-0">';
            html += '        <div class="absolute inset-0 bg-emerald-500/[0.01] z-0"></div>';
            html += '        <div class="w-full relative z-10 transform scale-90">' + scen.correct.visual + '</div>';
            html += '      </div>';
            html += '      <div class="w-full md:w-8/12 flex flex-col gap-1.5">';
            html += '        <div class="flex items-center gap-1.5">';
            html += '          <span class="bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>';
            html += '          <span class="text-sm font-black text-emerald-800 uppercase tracking-tight">' + scen.correct.title + '</span>';
            html += '        </div>';
            html += '        <p class="text-xs text-slate-600 font-semibold leading-relaxed">' + scen.correct.expl + '</p>';
            html += '      </div>';
            html += '    </div>';
        }

        html += '  </div>';
        html += '</div>';
        container.innerHTML += html;
    }

    if (window.lucide) { lucide.createIcons(); }

    if (focusRefId) {
        setTimeout(function() {
            var el = document.getElementById('ref-' + focusRefId);
            if (el) {
                container.scrollTo({ top: el.offsetTop - 24, behavior: 'smooth' });
            }
        }, 150);
    }
}

async function switchReflexBrowserWorkshop(letter) {
    if (!letter || letter === _currentLetter) return;
    var ws = REFLEX_WORKSHOP_MAP[letter];
    if (!ws) return;

    if (!_reflexDataCache[letter]) {
        try {
            var res = await fetch('./' + ws.file + '.json?v=' + Date.now());
            _reflexDataCache[letter] = await res.json();
        } catch (e) {
            console.warn('Failed to load workshop', ws.file);
            return;
        }
    }

    _currentLetter = letter;
    _renderReflexContent(letter, null);
    var content = document.getElementById('reflex-browser-content');
    if (content) content.scrollTop = 0;
}

function scrollToReflex(id) {
    if (!id) return;
    var el = document.getElementById('ref-' + id);
    var container = document.getElementById('reflex-browser-content');
    if (el && container) {
        container.scrollTo({ top: el.offsetTop - 24, behavior: 'smooth' });
    }
}

function closeReflexBrowser() {
    var modal = document.getElementById('reflex-browser-modal');
    if (modal) modal.classList.add('hidden');
    _currentLetter = null;
}

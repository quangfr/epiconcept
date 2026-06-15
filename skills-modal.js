const REFLEX_WORKSHOP_MAP = {
    'A': { file: '1-a', key: 'po', title: 'PO - Besoins Utilisateurs', label: 'A - PO - Besoins Utilisateurs', badge: 'Réflexe PO', icon: 'target' },
    'B': { file: '1-b', key: 'ux', title: 'UX - Ergonomie UX/UI', label: 'B - UX - Ergonomie UX/UI', badge: 'Réflexe UX', icon: 'mouse-pointer-click' },
    'C': { file: '2-c', key: 'c', title: 'Support & Client', label: 'C - Support & Client', badge: 'Réflexe Support', icon: 'headset' },
    'D': { file: '2-d', key: 'd', title: 'Évolutions & Specs', label: 'D - Évolutions & Specs', badge: 'Réflexe Spécs', icon: 'sparkles' },
    'E': { file: '3-e', key: 'e', title: 'Pilotage & Roadmap', label: 'E - Pilotage & Roadmap', badge: 'Réflexe Roadmap', icon: 'mountain' },
    'F': { file: '3-f', key: 'f', title: 'Exploration terrain', label: 'F - Exploration terrain', badge: 'Réflexe Features', icon: 'telescope' },
    'G': { file: '4-g', key: 'g', title: 'Diagnostic & Résolution', label: 'G - Diagnostic & Résolution', badge: 'Réflexe Diagnostic & Résolution', icon: 'headset' },
    'H': { file: '4-h', key: 'h', title: 'Assistance & Connaissance', label: 'H - Assistance & Connaissance', badge: 'Réflexe Assistance & Connaissance', icon: 'book-open' },
    'I': { file: '5-i', key: 'i', title: 'Veille & Adoption', label: 'I - Veille & Adoption', badge: 'Réflexe Veille & Adoption', icon: 'search' },
    'J': { file: '5-j', key: 'j', title: 'Test & Learn', label: 'J - Test & Learn', badge: 'Réflexe Test & Learn', icon: 'flask' },
    'K': { file: '6-k', key: 'k', title: 'Usage & Productivité', label: 'K - Usage & Productivité', badge: 'Réflexe Usage & Productivité', icon: 'bar-chart-2' },
    'L': { file: '6-l', key: 'l', title: 'Suivi & Données', label: 'L - Suivi & Données', badge: 'Réflexe KPIs & Dashboard', icon: 'database' }
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
            <div class="flex items-center justify-between gap-3 flex-wrap mr-8">
                <div class="flex-grow">
                    <select id="reflex-browser-title" onchange="switchReflexBrowserWorkshop(this.value)" class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-black text-slate-800 uppercase tracking-tight shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer"></select>
                </div>
                <button onclick="downloadWordExport()" class="bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0">
                    <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                    Télécharger Word
                </button>
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
            return '<option value="' + l + '">' + REFLEX_WORKSHOP_MAP[l].label + '</option>';
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

        var actualLevel = localStorage.getItem('progress-grid-' + r.id) || 'none';

        var html = '';
        html += '<div id="ref-' + r.id + '" class="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200">';
        html += '  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-100">';
        html += '    <div class="flex items-center gap-2">';
        html += '      <span class="text-2xl shrink-0"><i data-lucide="' + (r.icon || ws.icon) + '" class="w-6 h-6 text-slate-800"></i></span>';
        html += '      <h3 class="text-base font-black uppercase text-slate-800 tracking-tight">' + r.id + ' - ' + r.title + '</h3>';
        html += '    </div>';
        html += '    <div class="flex items-center gap-1.5 text-xs font-bold shrink-0">';
        html += '      <button onclick="toggleModalEval(\'' + r.id + '\', \'decouverte\')" id="btn-modal-decouverte-' + r.id + '" class="px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all cursor-pointer ' + (actualLevel === 'decouverte' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100') + '">Je découvre</button>';
        html += '      <button onclick="toggleModalEval(\'' + r.id + '\', \'encours\')" id="btn-modal-encours-' + r.id + '" class="px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all cursor-pointer ' + (actualLevel === 'encours' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100') + '">Je progresse</button>';
        html += '      <button onclick="toggleModalEval(\'' + r.id + '\', \'maitrise\')" id="btn-modal-maitrise-' + r.id + '" class="px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all cursor-pointer ' + (actualLevel === 'maitrise' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100') + '">Je maîtrise</button>';
        html += '    </div>';
        html += '  </div>';
        html += '  <p class="text-[11px] text-slate-500 font-semibold mb-2.5 pb-1.5 border-b border-slate-100">' + (r.intent || '') + '</p>';
        html += '  <div class="space-y-2">';

        for (var j = 0; j < r.scenarios.length; j++) {
            var scen = r.scenarios[j];
            html += '    <div class="bg-slate-50 rounded-lg p-2.5 border border-slate-200 flex flex-col gap-1.5">';
            html += '      <div class="flex items-center gap-1.5">';
            html += '        <span class="text-sm font-black text-slate-900 uppercase tracking-tight">' + scen.correct.title + '</span>';
            html += '      </div>';
            html += '      <p class="text-xs text-slate-600 font-semibold leading-relaxed">' + scen.correct.expl + '</p>';
            html += '    </div>';
        }

        html += '  </div>';
        
        // Note input
        var noteKey = 'note-ref-' + r.id;
        var savedNote = localStorage.getItem(noteKey) || '';
        html += '  <div class="mt-3 pt-2 border-t border-slate-100">';
        html += '    <textarea id="note-input-' + r.id + '" placeholder="Note ' + r.id + ' - ' + r.title + '" class="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-800" style="resize: vertical; min-height: 40px;" oninput="localStorage.setItem(\'' + noteKey + '\', this.value)">' + savedNote + '</textarea>';
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

window.toggleModalEval = function(refId, level) {
    const current = localStorage.getItem('progress-grid-' + refId);
    let newLevel = 'none';
    if (current !== level) {
        newLevel = level;
    }
    localStorage.setItem('progress-grid-' + refId, newLevel);
    
    // Update button styles in modal
    const btnDecouverte = document.getElementById('btn-modal-decouverte-' + refId);
    const btnEncours = document.getElementById('btn-modal-encours-' + refId);
    const btnMaitrise = document.getElementById('btn-modal-maitrise-' + refId);
    
    if (btnDecouverte && btnEncours && btnMaitrise) {
        btnDecouverte.className = "px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all cursor-pointer bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
        btnEncours.className = "px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all cursor-pointer bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
        btnMaitrise.className = "px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all cursor-pointer bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
        
        if (newLevel === 'decouverte') {
            btnDecouverte.className = "px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all cursor-pointer bg-blue-900 text-white border-blue-900";
        } else if (newLevel === 'encours') {
            btnEncours.className = "px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all cursor-pointer bg-amber-500 text-white border-amber-500";
        } else if (newLevel === 'maitrise') {
            btnMaitrise.className = "px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all cursor-pointer bg-emerald-600 text-white border-emerald-600";
        }
    }
    
    if (window.renderProfileGrid) { window.renderProfileGrid(); }
};

window.downloadWordExport = async function() {
    let exportHtml = `
    <html xmlns:o="urn:schemas-microsoft-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="utf-8">
        <title>Référentiel des Compétences</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #333; }
            h1 { color: #1e3a8a; font-size: 22px; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; }
            h2 { color: #0f172a; font-size: 16px; margin-top: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .comp-card { border: 1px solid #cbd5e1; padding: 10px; margin-bottom: 12px; border-radius: 6px; background-color: #f8fafc; }
            .comp-title { font-weight: bold; font-size: 13px; color: #1e293b; }
            .comp-level { font-style: italic; font-size: 11px; color: #2563eb; margin-bottom: 6px; }
            .sub-comp { margin-left: 12px; margin-bottom: 6px; padding-left: 6px; border-left: 2px solid #cbd5e1; }
            .sub-title { font-weight: bold; font-size: 12px; color: #334155; }
            .sub-desc { font-size: 11px; color: #475569; }
            .note-box { margin-top: 6px; padding: 6px; background-color: #f1f5f9; border: 1px solid #cbd5e1; font-size: 11px; color: #334155; font-style: italic; }
        </style>
    </head>
    <body>
        <h1>Référentiel des Compétences - GO EPICO</h1>
    `;

    for (let letter of LETTERS) {
        const ws = REFLEX_WORKSHOP_MAP[letter];
        if (!ws) continue;
        
        if (!_reflexDataCache[letter]) {
            try {
                const res = await fetch('./' + ws.file + '.json?v=' + Date.now());
                _reflexDataCache[letter] = await res.json();
            } catch (e) {
                console.warn('Failed to load workshop', ws.file);
                continue;
            }
        }
        
        const data = _reflexDataCache[letter];
        exportHtml += '<div class="theme-section">';
        exportHtml += '<h2>' + ws.label + '</h2>';
        
        for (let r of data) {
            var actualLevel = localStorage.getItem('progress-grid-' + r.id) || 'none';
            var levelStr = "Non évalué";
            if (actualLevel === 'decouverte') levelStr = "Je découvre";
            else if (actualLevel === 'encours') levelStr = "Je progresse";
            else if (actualLevel === 'maitrise') levelStr = "Je maîtrise";
            
            var noteKey = 'note-ref-' + r.id;
            var savedNote = localStorage.getItem(noteKey) || '';
            
            exportHtml += '<div class="comp-card">';
            exportHtml += '  <div class="comp-title">' + r.id + ' - ' + r.title + '</div>';
            exportHtml += '  <div class="comp-level">Statut : ' + levelStr + '</div>';
            
            for (let scen of r.scenarios) {
                exportHtml += '  <div class="sub-comp">';
                exportHtml += '    <div class="sub-title">' + scen.correct.title + '</div>';
                exportHtml += '    <div class="sub-desc">' + scen.correct.expl + '</div>';
                exportHtml += '  </div>';
            }
            
            if (savedNote) {
                exportHtml += '  <div class="note-box"><strong>Note :</strong> ' + savedNote.replace(/\n/g, '<br>') + '</div>';
            }
            exportHtml += '</div>';
        }
        
        exportHtml += '</div>';
    }
    
    exportHtml += `
    </body>
    </html>
    `;
    
    var blob = new Blob(['\ufeff' + exportHtml], {
        type: 'application/msword'
    });
    
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'referentiel_competences.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

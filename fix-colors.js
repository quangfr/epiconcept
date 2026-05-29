const fs = require('fs');

function processHtml(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Make primary color a bit more blue: replace slate-700 (#334155) with blue-800 (#1e40af)
    content = content.replace(/#334155/gi, '#1e40af'); // primary blue-800
    content = content.replace(/rgba\(51, 65, 85/g, 'rgba(30, 64, 175');

    // Replace slate with blue utilities
    content = content.replace(/slate-700/g, 'blue-800');
    
    // Hover effects: a lighter blue (no violet blue), e.g., blue-500 (#3b82f6)
    content = content.replace(/hover:border-slate-500/g, 'hover:border-blue-500');
    content = content.replace(/hover:border-slate-400/g, 'hover:border-blue-400');
    content = content.replace(/hover:text-slate-700/g, 'hover:text-blue-500');
    content = content.replace(/hover:bg-slate-900/g, 'hover:bg-blue-600');
    content = content.replace(/hover:bg-slate-800/g, 'hover:bg-blue-500');
    content = content.replace(/hover:bg-slate-700/g, 'hover:bg-blue-500');

    // Update CSS hovers in <style>
    // These were previously changed to #334155 (which was just replaced by #1e40af above)
    // We want hovers to be lighter blue #3b82f6
    content = content.replace(/\.reflex-btn:hover:not\(:disabled\) \{ transform: translateY\(-2px\); border-color: #1e40af;/g, '.reflex-btn:hover:not(:disabled) { transform: translateY(-2px); border-color: #3b82f6;');
    content = content.replace(/box-shadow: 0 10px 15px -3px rgba\(30, 64, 175, 0\.1\); \}/g, 'box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.15); }');
    content = content.replace(/\.info-btn:hover \{ transform: scale\(1\.2\); color: #1e40af; \}/g, '.info-btn:hover { transform: scale(1.2); color: #3b82f6; }');
    content = content.replace(/\.level-card:hover \{ transform: scale\(1\.02\); border-color: #1e40af; \}/g, '.level-card:hover { transform: scale(1.02); border-color: #3b82f6; }');

    fs.writeFileSync(file, content);
}

['1a.html', '1b.html'].forEach(processHtml);

function processIndex() {
    let content = fs.readFileSync('index.html', 'utf8');

    // Update primary color from Slate 700 to Blue 800
    content = content.replace(/--color-primary: #334155;/g, '--color-primary: #1e40af;');
    content = content.replace(/--color-primary-glow: rgba\(51, 65, 85, 0\.08\);/g, '--color-primary-glow: rgba(30, 64, 175, 0.08);');

    // Score pill counter badge
    content = content.replace(/\.score-pill \{\s*background: rgba\(99, 102, 241, 0\.06\);\s*border: 1px solid rgba\(99, 102, 241, 0\.15\);\s*padding: 0\.1rem 0\.5rem;\s*border-radius: 6px;\s*font-family: monospace;\s*font-size: 0\.75rem;\s*color: #4f46e5;/g, `.score-pill {
            background: rgba(30, 64, 175, 0.06);
            border: 1px solid rgba(30, 64, 175, 0.15);
            padding: 0.1rem 0.5rem;
            border-radius: 6px;
            font-family: monospace;
            font-size: 0.75rem;
            color: var(--color-primary);`);

    // Status: Revert to green, yellow, red
    content = content.replace(/\.card-status \{\s*font-size: 0\.7rem;\s*font-weight: 800;\s*text-transform: uppercase;\s*letter-spacing: 0\.05em;\s*display: flex;\s*align-items: center;\s*gap: 0\.3rem;\s*background: rgba\(51, 65, 85, 0\.06\);\s*color: var\(--color-primary\);\s*border: 1px solid rgba\(51, 65, 85, 0\.15\);/g, `.card-status {
            font-size: 0.7rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: flex;
            align-items: center;
            gap: 0.3rem;
            background: rgba(16, 185, 129, 0.06);
            color: #047857;
            border: 1px solid rgba(16, 185, 129, 0.15);`);

    content = content.replace(/\.card-status span\.status-dot \{\s*width: 5px;\s*height: 5px;\s*background: var\(--color-primary\);\s*border-radius: 50%;\s*display: inline-block;\s*box-shadow: 0 0 6px var\(--color-primary\);\s*\}/g, `.card-status span.status-dot {
            width: 5px;
            height: 5px;
            background: var(--color-emerald);
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 6px var(--color-emerald);
        }`);

    content = content.replace(/\.card-status\.coming \{\s*background: rgba\(100, 116, 139, 0\.06\);\s*color: var\(--text-low\);\s*border: 1px solid rgba\(100, 116, 139, 0\.2\);\s*\}/g, `.card-status.coming {
            background: rgba(245, 158, 11, 0.06);
            color: #92400e;
            border: 1px solid rgba(245, 158, 11, 0.2);
        }`);

    content = content.replace(/\.card-status\.coming span\.status-dot \{\s*background: var\(--text-low\);\s*box-shadow: none;\s*animation: none;\s*\}/g, `.card-status.coming span.status-dot {
            background: #f59e0b;
            box-shadow: 0 0 6px #f59e0b;
            animation: none;
        }`);

    // Update index hover CTA to lighter blue #3b82f6 (Blue 500)
    content = content.replace(/\.cta-button:hover \{\s*background: #4338ca;\s*box-shadow: 0 8px 20px rgba\(79, 70, 229, 0\.2\);/g, `.cta-button:hover {
            background: #3b82f6;
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);`);

    // Fix backlight and icon-wrapper rgb values which were previously set to 79, 70, 229 or 51, 65, 85
    content = content.replace(/rgba\(79, 70, 229/g, 'rgba(30, 64, 175');
    content = content.replace(/rgba\(51, 65, 85/g, 'rgba(30, 64, 175');

    // Fix logo-badge hover or any other missed elements
    fs.writeFileSync('index.html', content);
}

processIndex();
console.log('Script completed.');

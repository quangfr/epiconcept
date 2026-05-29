const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Remove the dark border-bottom from card-header
content = content.replace(/border-bottom:\s*1px solid rgba\(15,\s*23,\s*42,\s*0\.05\);/g, '');

// 2. Change var(--card-border) to a light transparent white so cards don't have black borders
content = content.replace(/--card-border:\s*rgba\(15,\s*23,\s*42,\s*0\.06\);/g, '--card-border: rgba(255, 255, 255, 0.6);');
content = content.replace(/border:\s*1px solid rgba\(30,\s*58,\s*138,\s*0\.15\);/g, 'border: 1px solid rgba(255, 255, 255, 0.8);');

// 3. Ensure the active Theory card (Atelier 1) has a clearly visible primary icon. 
// If primary is too dark, maybe they want it to match the Explorer button. The Explorer button is primary.
// They said "l'icone pour la card théorie reste noir également". Let's force it to var(--color-primary).
content = content.replace(/<div class="card-icon-wrapper" aria-hidden="true" style="background: rgba\(30,58,138,0\.1\); color: var\(--color-primary\);">/g, '<div class="card-icon-wrapper" aria-hidden="true" style="background: var(--color-primary); color: white;">');

// Let's also do that for the locked theory cards if they meant those? No, they probably meant Atelier 1. 
// Actually, let's just make the active theory card icon have a solid primary background and white icon, so it pops and is definitely not black.
// Or just color: var(--color-primary); but maybe the user meant the border of the card.
// Let's remove any explicit black borders on .simulator-card inline
content = content.replace(/border-top:\s*4px solid var\(--color-primary\);/g, 'border-top: 4px solid var(--color-primary); border-left: none; border-right: none; border-bottom: none;');

fs.writeFileSync('index.html', content);
console.log('Fixed borders and icon color');

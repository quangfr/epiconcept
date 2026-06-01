// fix-1a.js - batch replace arrow-right with chevron-right and add h-32 to visual containers in 1-a.json
const fs = require('fs');
const path = 'C:/Users/tranx/Documents/Github/epiconcept/1-a.json';
let content = fs.readFileSync(path, 'utf8');
// Replace arrow-right icons with chevron-right
content = content.replace(/"arrow-right"/g, '"chevron-right"');
// Add h-32 height class to visual container divs (class="w-full ...")
// Look for class="w-full" and ensure h-32 is present
content = content.replace(/class=\\\"w-full([^\\\"]*)\\\"/g, (match, p1) => {
  if (p1.includes(' h-32')) return match; // already present
  return `class=\\\"w-full h-32${p1}\\\"`;
});
fs.writeFileSync(path, content, 'utf8');
console.log('fix-1a.js executed: replacements applied');

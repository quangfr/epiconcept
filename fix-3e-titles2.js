// fix-3e-titles2.js
const fs = require('fs');
const path = 'C:/Users/tranx/Documents/Github/epiconcept/3-e.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));
function truncateTitle(title) {
  // Remove any leading identifiers like "E1.2." etc.
  title = title.replace(/^E\d+(?:\.\d+)*\.\s*/, '').trim();
  // Split into words, keep first 4 (verb + up to 3 others)
  const words = title.split(/\s+/).filter(Boolean);
  const max = 4; // 4 words => within 3-5 range
  return words.slice(0, Math.min(words.length, max)).join(' ');
}
function traverse(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(traverse);
  } else if (obj && typeof obj === 'object') {
    if (obj.title && typeof obj.title === 'string') {
      obj.title = truncateTitle(obj.title);
    }
    Object.values(obj).forEach(traverse);
  }
}
traverse(data);
fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Titles truncated to 4 words in 3-e.json');

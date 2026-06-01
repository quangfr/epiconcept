// fix-3e.js
const fs = require('fs');
const path = 'C:/Users/tranx/Documents/Github/epiconcept/3-e.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));
function cleanTitle(title) {
  // Remove leading E prefixes like "E1.", "E1.1.", "E2.", etc.
  return title.replace(/^E\d+(?:\.\d+)*\.\s*/, '').trim();
}
function traverse(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(traverse);
  } else if (obj && typeof obj === 'object') {
    if (obj.title && typeof obj.title === 'string') {
      obj.title = cleanTitle(obj.title);
    }
    // Recursively process nested objects
    Object.values(obj).forEach(traverse);
  }
}
traverse(data);
fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Titles cleaned in 3-e.json');

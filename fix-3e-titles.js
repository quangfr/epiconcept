// fix-3e-titles.js
const fs = require('fs');
const path = 'C:/Users/tranx/Documents/Github/epiconcept/3-e.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));
function shortenTitle(title) {
  // Split into words, keep first 3 words
  const words = title.split(/\s+/).filter(Boolean);
  // If less than 3 words, return as is
  if (words.length <= 3) return title;
  return words.slice(0, 3).join(' ');
}
function traverse(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(traverse);
  } else if (obj && typeof obj === 'object') {
    if (obj.title && typeof obj.title === 'string') {
      obj.title = shortenTitle(obj.title);
    }
    Object.values(obj).forEach(traverse);
  }
}
traverse(data);
fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Titles shortened in 3-e.json');

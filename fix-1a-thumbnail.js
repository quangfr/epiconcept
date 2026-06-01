// fix-1a-thumbnail.js
const fs = require('fs');
const path = 'C:/Users/tranx/Documents/Github/epiconcept/1-a.json';
let content = fs.readFileSync(path, 'utf8');
// Remove "h-32" class occurrences (including preceding space)
content = content.replace(/\s+h-32\b/g, '');
// Collapse multiple spaces in class attributes
content = content.replace(/class=\\"\s+/g, 'class=\\"');
fs.writeFileSync(path, content, 'utf8');
console.log('Removed h-32 classes from 1-a.json');

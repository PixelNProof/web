import fs from 'node:fs';

const file = 'd:/PixelNproof/textWeb/src/style.css';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('/* ====' + '========================================\r\n   RESPONSIVE BREAKPOINTS');
const startIdxFallback = content.indexOf('/* ====' + '========================================\n   RESPONSIVE BREAKPOINTS');
const actualStart = startIdx !== -1 ? startIdx : startIdxFallback;

const endIdx = content.indexOf('/* ====' + '=======================================\r\n   PHASE 33');
const endIdxFallback = content.indexOf('/* ====' + '=======================================\n   PHASE 33');
const actualEnd = endIdx !== -1 ? endIdx : endIdxFallback;

if (actualStart !== -1 && actualEnd !== -1) {
    content = content.substring(0, actualStart) + content.substring(actualEnd);
    console.log('Successfully purged legacy media queries chunk.');
} else {
    console.log('Could not find media query markers. Start:', actualStart, 'End:', actualEnd);
}

// Remove the max-width and internal padding from inner grids
content = content.replace(/max-width:\s*var\(--container-max-width\);\s*padding-left:\s*4rem;\s*padding-right:\s*4rem;/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('CSS Cleanup completed.');

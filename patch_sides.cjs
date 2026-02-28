const fs = require('fs');
let content = fs.readFileSync('src/data/menu.js', 'utf8');

// remove image property from sides
content = content.replace(/\{ id: 's_\d+', categoryId: 'sides', [^\}]+}/g, match => {
    return match.replace(/,\s*image:\s*'[^']+'(\s*)/g, '$1');
});

// also add 'popular' category to menuCategories
if (!content.includes("id: 'popular'")) {
    content = content.replace(
        /export const menuCategories = \[/,
        "export const menuCategories = [\n  { id: 'popular', name: 'Popular', color: 'var(--color-specials)' },"
    );
}

fs.writeFileSync('src/data/menu.js', content);
console.log('Done');

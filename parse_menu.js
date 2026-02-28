import fs from 'fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('scrape.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

const items = {};
const itemDivs = document.querySelectorAll('.single-item');

itemDivs.forEach(div => {
    const nameEl = div.querySelector('h4');
    const imgEl = div.querySelector('.item-img img');
    if (nameEl && imgEl) {
        items[nameEl.textContent.trim()] = imgEl.src;
    }
});

fs.writeFileSync('menu_images.json', JSON.stringify(items, null, 2));
console.log("Found", Object.keys(items).length, "items.");

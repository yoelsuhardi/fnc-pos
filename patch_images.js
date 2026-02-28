import fs from 'fs';

let menuRaw = fs.readFileSync('src/data/menu.js', 'utf8');
const images = JSON.parse(fs.readFileSync('menu_images.json', 'utf8'));

// Normalizer to help match dictionary keys to menuItems entries
function normalize(str) {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/[^a-z0-sequence]/g, '')
        .replace('chicko', 'chiko')
        .replace('fritters', 'fritter')
        .replace('crabstick', 'crab stick')
        .replace('battered mussels 6', '6 mussels')
        .replace('oysters 6', '6 battered oysters')
        .trim();
}

const imgNormalized = {};
for (const [k, v] of Object.entries(images)) {
    imgNormalized[normalize(k)] = v;
}

// Special overrides map
const overrides = {
    "fish of the day": "Fish of The Day",
    "king snapper": "King Snapper",
    "gummy shark": "Gummy Shark",
    "oysters (6)": "6 Battered Oysters",
    "squid rings (6)": "6 Squid Rings",
    "chicken nuggets (6)": "6 Chicken Nuggets",
    "battered mussels (6)": "6 Mussels",
    "battered prawns (6)": "6 Battered Prawns",
    "dim sim": "Dim Sim",
    "crab stick": "Crabstick",
    "pineapple fritter": "Pineapple Fritters",
    "potato scallop": "Potato Scallop",
    "pickled onion (1 tub)": "Pickled Onion",
    "battered mars bar": "Battered Mars Bar",
    "spring roll": "Spring Roll",
    "chicko roll": "Chiko Roll",
    "cornjack": "Cornjack",
    "fish cake": "Fish Cake",
    "cheese sausage": "Cheese Sausage",
    "beef sausage": "Beef Sausage",
    "battered frank": "Battered Frank",
    "hamburger patty": "Hamburger Patty",
    "hash brown": "Hash Brown",
    "onion rings (6)": "6 Onion Rings",
    "family special": "Family Special",
    "half family special": "Half Family Special",
    "fisherman's basket": "Fisherman&#039;s Basket",
    "$4.00 chips": "Chips Only",
    "$8.00 chips": "Chips Only",
    "$12.00 chips": "Chips Only",
    "$16.00 chips": "Chips Only"
};

// Regex to find each item block: { id: ..., name: '...', price: ... }
let updatedMenu = menuRaw;
const regex = /{([^}]+name:\s*'([^']+)'[^}]+)}/g;

updatedMenu = updatedMenu.replace(regex, (match, inner, name) => {
    // If it already has an image, skip
    if (inner.includes('image:')) return match;

    const queryKey = normalize(name);
    let url = imgNormalized[queryKey];

    // try overrides
    const overrideKey = name.toLowerCase();
    if (overrides[overrideKey] && images[overrides[overrideKey]]) {
        url = images[overrides[overrideKey]];
    }

    if (url) {
        // insert image right before the closing bracket
        return `{${inner}, image: '${url}' }`;
    }
    return match;
});

fs.writeFileSync('src/data/menu.js', updatedMenu);
console.log("Updated menu.js with images!");

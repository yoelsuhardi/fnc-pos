export const menuCategories = [
  { id: 'popular', name: 'Popular', color: 'var(--color-specials)' },
  { id: 'specials', name: 'Specials', color: 'var(--color-specials)' },
  { id: 'fish', name: 'Fish Menu', color: 'var(--color-fish)' },
  { id: 'chips', name: 'Chips', color: 'var(--color-chips)' },
  { id: 'sides', name: 'Sides', color: 'var(--color-sides)' },
  { id: 'extras', name: 'Extras', color: 'var(--color-extras, var(--color-sides))' },
];

export const menuItems = [
  // Specials
  {
    id: 'sp_1',
    categoryId: 'specials',
    name: 'Family Special',
    price: 74.00,
    hasComplexModifiers: true,
    fishCount: 4,
    sideChoicesCount: 4,
    inherentItems: 'Large Chips',
    requiresSeasoning: true
    , image: 'https://fishnchipswa.com/uploads/thumb/42eac750d6fcb816d981bf8acd56b4bd.jpg'
  },
  {
    id: 'sp_2',
    categoryId: 'specials',
    name: 'Half Family Special',
    price: 37.00,
    hasComplexModifiers: true,
    fishCount: 2,
    sideChoicesCount: 2,
    inherentItems: 'Small Chips',
    requiresSeasoning: true
    , image: 'https://fishnchipswa.com/uploads/thumb/6f157773b0b03cf876130d6b6d509c58.jpeg'
  },
  {
    id: 'sp_3',
    categoryId: 'specials',
    name: 'Fisherman\'s Basket',
    price: 28.00,
    requiresSeasoning: true,
    inherentItems: '1 Kid\'s Box, 4 Squid Rings, 1 Crab Stick, 2 Crumbed Prawns, 1 Sea Scallop',
    image: 'https://fishnchipswa.com/uploads/thumb/88cd3be11567832bf0a26ed47a02545b.jpg'
  },
  {
    id: 'sp_4',
    categoryId: 'specials',
    name: 'Fish and Chips',
    price: 17.00,
    hasComplexModifiers: true,
    fishCount: 1,
    sideChoicesCount: 0,
    inherentItems: '1 $4.00 Chips',
    requiresSeasoning: true,
    image: 'https://fishnchipswa.com/uploads/thumb/87726f1cce23be962ed86dad9b7b4f34.jpg'
  },

  // Fish (Supports Modifiers)
  { id: 'f_1', categoryId: 'fish', name: 'Fish of the Day', price: 13.00, hasModifiers: true, requiresSeasoning: true, image: 'https://fishnchipswa.com/uploads/thumb/87726f1cce23be962ed86dad9b7b4f34.jpg' },
  { id: 'f_2', categoryId: 'fish', name: 'King Snapper', price: 19.00, hasModifiers: true, requiresSeasoning: true, image: 'https://fishnchipswa.com/uploads/thumb/b258073177c8b76b0f7443e5810adc5f.jpg' },
  { id: 'f_3', categoryId: 'fish', name: 'Gummy Shark', price: 17.50, hasModifiers: true, requiresSeasoning: true, image: 'https://fishnchipswa.com/uploads/thumb/nxzu8kwj1713448694-300_350.jpg' },

  // Chips
  { id: 'c_1', categoryId: 'chips', name: '$4.00 Chips', price: 4.00, requiresSeasoning: true, image: 'https://fishnchipswa.com/uploads/thumb/1EuLhoAj1713369131-300_350.jpg' },
  { id: 'c_2', categoryId: 'chips', name: '$8.00 Chips', price: 8.00, requiresSeasoning: true, image: 'https://fishnchipswa.com/uploads/thumb/1EuLhoAj1713369131-300_350.jpg' },
  { id: 'c_3', categoryId: 'chips', name: '$12.00 Chips', price: 12.00, requiresSeasoning: true, image: 'https://fishnchipswa.com/uploads/thumb/1EuLhoAj1713369131-300_350.jpg' },
  { id: 'c_4', categoryId: 'chips', name: '$16.00 Chips', price: 16.00, requiresSeasoning: true, image: 'https://fishnchipswa.com/uploads/thumb/1EuLhoAj1713369131-300_350.jpg' },

  // Sides (sorted cheapest → most expensive)
  { id: 's_10', categoryId: 'sides', name: 'Potato Scallop', price: 1.70 },
  { id: 's_7', categoryId: 'sides', name: 'Dim Sim', price: 2.80 },
  { id: 's_8', categoryId: 'sides', name: 'Crabstick', price: 2.80 },
  { id: 's_9', categoryId: 'sides', name: 'Pineapple Fritter', price: 2.80 },
  { id: 's_22', categoryId: 'sides', name: 'Hash Brown', price: 3.00 },
  { id: 's_21', categoryId: 'sides', name: 'Crumbed Prawns', price: 3.50 },
  { id: 's_12', categoryId: 'sides', name: 'Battered Mars Bar', price: 4.00 },
  { id: 's_6', categoryId: 'sides', name: 'Sea Scallop', price: 4.50 },
  { id: 's_13', categoryId: 'sides', name: 'Spring Roll', price: 5.00 },
  { id: 's_14', categoryId: 'sides', name: 'Chicko Roll', price: 5.00 },
  { id: 's_15', categoryId: 'sides', name: 'Cornjack', price: 5.00 },
  { id: 's_16', categoryId: 'sides', name: 'Fish Cake', price: 5.00 },
  { id: 's_17', categoryId: 'sides', name: 'Cheese Sausage', price: 5.00, hasModifiers: true, modifierType: 'sausage' },
  { id: 's_18', categoryId: 'sides', name: 'Beef Sausage', price: 5.00, hasModifiers: true, modifierType: 'sausage' },
  { id: 's_19', categoryId: 'sides', name: 'Battered Frank', price: 5.00, hasModifiers: true, modifierType: 'sausage' },
  { id: 's_23', categoryId: 'sides', name: 'Onion Rings (6)', price: 6.00 },
  { id: 's_11', categoryId: 'extras', name: 'Pickled Onion (1 Tub)', price: 6.00 },
  { id: 's_20', categoryId: 'sides', name: 'Hamburger Patty', price: 7.00 },
  { id: 's_3', categoryId: 'sides', name: 'Chicken Nuggets (6)', price: 8.00 },
  { id: 's_4', categoryId: 'sides', name: 'Battered Mussels (6)', price: 8.00 },
  { id: 's_2', categoryId: 'sides', name: 'Squid Rings (6)', price: 11.00 },
  { id: 's_1', categoryId: 'sides', name: 'Oysters (6)', price: 24.00 },
  { id: 's_5', categoryId: 'sides', name: 'Battered Prawns (6)', price: 24.00 },

  // Extras
  { id: 'e_can', categoryId: 'extras', name: 'Can', price: 3.50 },
  { id: 'e_bottle', categoryId: 'extras', name: 'Bottle', price: 5.50 },
];

export const fishModifiers = [
  { id: 'mod_1', name: 'Grilled', price: 2.50 },
  { id: 'mod_2', name: 'Crumbed', price: 1.50 },
];

export const sausageModifiers = [
  { id: 'smod_1', name: 'Grilled', price: 0.00 },
];

export const specialSideChoices = [
  { id: 'ch_1', name: 'Dim Sim', image: 'https://fishnchipswa.com/uploads/thumb/c122d17cba674fdded161749b62e729a.jpeg' },
  { id: 'ch_2', name: 'Pineapple Fritter', image: 'https://fishnchipswa.com/uploads/thumb/ae210ca2186bf862d9d7a2b33d001662.jpeg' },
  { id: 'ch_3', name: 'Crab Stick', image: 'https://fishnchipswa.com/uploads/thumb/2c5a01747a226715b8fbd104816eed7c.jpeg' },
];

export const seasoningOptions = [
  { id: 'season_1', name: 'No Salt' },
  { id: 'season_2', name: 'Salt' },
  { id: 'season_3', name: 'Chicken Salt' },
  { id: 'season_4', name: 'Vinegar' },
  { id: 'season_5', name: 'Chicken Salt & Vinegar' },
  { id: 'season_6', name: 'Salt & Vinegar' },
];

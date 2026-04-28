import { Product } from './supabase'

// ─── Shared image paths ────────────────────────────────────────────────────────
const LIFESTYLE = '/sofas/sofa_lifestyle_room.png'

// Royal Maharaja fabric images
const ROYAL: Record<string, string> = {
  'Emerald Velvet':    '/sofas/sofa_emerald_velvet.png',
  'Burgundy Velvet':   '/sofas/sofa_burgundy_velvet.png',
  'Navy Blue Velvet':  '/sofas/sofa_navy_velvet.png',
  'Charcoal Grey':     '/sofas/sofa_charcoal_grey.png',
  'Gold Silk Brocade': '/sofas/sofa_gold_silk.png',
  'Royal Purple Silk': '/sofas/sofa_royal_purple.png',
  'Ivory Cotton':      '/sofas/sofa_ivory_cream.png',
  'Terracotta':        '/sofas/sofa_terracotta.png',
}

// Chesterfield fabric images
const CHESTER: Record<string, string> = {
  'Emerald Velvet':    '/sofas/chesterfield_emerald.png',
  'Burgundy Velvet':   '/sofas/chesterfield_burgundy.png',
  'Navy Blue Velvet':  '/sofas/chesterfield_navy.png',
  'Gold Mustard':      '/sofas/chesterfield_gold.png',
  'Ivory Cream':       '/sofas/chesterfield_ivory.png',
  'Charcoal Grey':     '/sofas/chesterfield_charcoal.png',
  // Use royal variants as fallback for colours not separately shot
  'Royal Purple Silk': '/sofas/sofa_royal_purple.png',
  'Terracotta':        '/sofas/sofa_terracotta.png',
}

// Loveseat fabric images
const LOVE: Record<string, string> = {
  'Blush Rose':        '/sofas/loveseat_rose_pink.png',
  'Royal Purple Silk': '/sofas/loveseat_purple.png',
  // re-use royal/chester for remaining colours
  'Gold Silk Brocade': '/sofas/chesterfield_gold.png',
  'Ivory Cotton':      '/sofas/chesterfield_ivory.png',
  'Emerald Velvet':    '/sofas/chesterfield_emerald.png',
  'Navy Blue Velvet':  '/sofas/chesterfield_navy.png',
}

export const mockProducts: Product[] = [

  // ═══════════════════════════════════════════════════════════════
  //  CATEGORY: Sofa (3-Seater)
  // ═══════════════════════════════════════════════════════════════
  {
    id: '1',
    name: 'Royal Maharaja 3-Seater',
    slug: 'royal-maharaja-3-seater',
    description: 'Handcrafted with premium Sheesham wood and luxurious velvet upholstery. Features intricate carved details inspired by Rajasthani palaces. Each piece is a work of art — 6 weeks to craft by master artisans.',
    base_price: 89999,
    category: 'Sofa',
    collection: 'Royal Heritage',
    material: 'Sheesham Wood',
    seating_capacity: 3,
    style: 'Traditional',
    dimensions: { length: 210, width: 90, height: 95 },
    fabric_options: {
      standard: ['Emerald Velvet', 'Burgundy Velvet', 'Navy Blue Velvet', 'Charcoal Grey'],
      premium: ['Gold Silk Brocade', 'Royal Purple Silk', 'Ivory Cotton', 'Terracotta'],
    },
    premium_upcharge: 25000,
    images: {
      main:     ROYAL['Emerald Velvet'],
      front:    ROYAL['Emerald Velvet'],
      angle_45: ROYAL['Burgundy Velvet'],
      side:     ROYAL['Navy Blue Velvet'],
      back:     ROYAL['Charcoal Grey'],
      closeup:  ROYAL['Gold Silk Brocade'],
      lifestyle: [LIFESTYLE],
    },
    fabric_images: ROYAL,
    in_stock: true,
    featured: true,
    reviews: [
      { id: 'r1', user_name: 'Vikram Singh', rating: 5, comment: 'Absolutely stunning craftsmanship. The emerald velvet is even richer in person.', date: '2023-11-15', verified_purchase: true },
      { id: 'r2', user_name: 'Anita Roy', rating: 4, comment: 'Very comfortable and luxurious. The gold silk version is breathtaking.', date: '2023-12-02', verified_purchase: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ═══════════════════════════════════════════════════════════════
  //  CATEGORY: Chesterfield (Tufted 3-Seater)
  // ═══════════════════════════════════════════════════════════════
  {
    id: '4',
    name: 'Imperial Chesterfield 3-Seater',
    slug: 'imperial-chesterfield-3-seater',
    description: 'A masterpiece of British-Indian fusion — deeply button-tufted Chesterfield silhouette rendered in the finest Indian velvets and silks. Rolled arms, brass stud detailing, and hand-carved mahogany legs with 24-karat gold leaf finish.',
    base_price: 109999,
    category: 'Chesterfield',
    collection: 'Imperial Collection',
    material: 'Mahogany Wood',
    seating_capacity: 3,
    style: 'Classic',
    dimensions: { length: 220, width: 95, height: 88 },
    fabric_options: {
      standard: ['Emerald Velvet', 'Burgundy Velvet', 'Navy Blue Velvet', 'Charcoal Grey'],
      premium: ['Gold Mustard', 'Ivory Cream', 'Royal Purple Silk', 'Terracotta'],
    },
    premium_upcharge: 30000,
    images: {
      main:     CHESTER['Emerald Velvet'],
      front:    CHESTER['Emerald Velvet'],
      angle_45: CHESTER['Burgundy Velvet'],
      side:     CHESTER['Navy Blue Velvet'],
      back:     CHESTER['Gold Mustard'],
      closeup:  CHESTER['Ivory Cream'],
      lifestyle: [LIFESTYLE],
    },
    fabric_images: CHESTER,
    in_stock: true,
    featured: true,
    reviews: [
      { id: 'r5', user_name: 'Arjun Mehta', rating: 5, comment: 'The burgundy velvet Chesterfield is the most impressive piece of furniture I have ever owned.', date: '2024-01-20', verified_purchase: true },
      { id: 'r6', user_name: 'Priya Nair', rating: 5, comment: 'It looks like it belongs in a palace. The navy blue with gold studs is extraordinary.', date: '2024-02-05', verified_purchase: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Regent Chesterfield 2-Seater',
    slug: 'regent-chesterfield-2-seater',
    description: 'The Regent is an intimate 2-seater Chesterfield perfect for master suites, private libraries, and boutique lobbies. Same deep-tufting and mahogany craftsmanship as the Imperial, scaled for elegance in tighter spaces.',
    base_price: 74999,
    category: 'Chesterfield',
    collection: 'Imperial Collection',
    material: 'Mahogany Wood',
    seating_capacity: 2,
    style: 'Classic',
    dimensions: { length: 160, width: 90, height: 88 },
    fabric_options: {
      standard: ['Charcoal Grey', 'Ivory Cream', 'Emerald Velvet'],
      premium: ['Gold Mustard', 'Burgundy Velvet', 'Royal Purple Silk'],
    },
    premium_upcharge: 22000,
    images: {
      main:     CHESTER['Charcoal Grey'],
      front:    CHESTER['Charcoal Grey'],
      angle_45: CHESTER['Ivory Cream'],
      side:     CHESTER['Emerald Velvet'],
      back:     CHESTER['Gold Mustard'],
      closeup:  CHESTER['Burgundy Velvet'],
      lifestyle: [LIFESTYLE],
    },
    fabric_images: {
      'Charcoal Grey':     CHESTER['Charcoal Grey'],
      'Ivory Cream':       CHESTER['Ivory Cream'],
      'Emerald Velvet':    CHESTER['Emerald Velvet'],
      'Gold Mustard':      CHESTER['Gold Mustard'],
      'Burgundy Velvet':   CHESTER['Burgundy Velvet'],
      'Royal Purple Silk': CHESTER['Royal Purple Silk'],
    },
    in_stock: true,
    featured: false,
    reviews: [
      { id: 'r7', user_name: 'Rohit Sharma', rating: 4, comment: 'Perfect for my study. The charcoal grey is very versatile and understated luxury.', date: '2024-03-10', verified_purchase: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ═══════════════════════════════════════════════════════════════
  //  CATEGORY: Loveseat (2-Seater Ornate)
  // ═══════════════════════════════════════════════════════════════
  {
    id: '6',
    name: 'Mughal Loveseat Settee',
    slug: 'mughal-loveseat-settee',
    description: 'Inspired by the intimate seating chambers of Mughal palaces, this ornate 2-seater settee features gilded carved legs, button-tufted back, and sumptuous silk upholstery. Perfect for bridal suites, dressing rooms, and luxury bedrooms.',
    base_price: 64999,
    category: 'Loveseat',
    collection: 'Mughal Series',
    material: 'Teak Wood',
    seating_capacity: 2,
    style: 'Traditional',
    dimensions: { length: 145, width: 80, height: 92 },
    fabric_options: {
      standard: ['Blush Rose', 'Ivory Cotton', 'Emerald Velvet'],
      premium: ['Royal Purple Silk', 'Gold Silk Brocade', 'Navy Blue Velvet'],
    },
    premium_upcharge: 20000,
    images: {
      main:     LOVE['Blush Rose'],
      front:    LOVE['Blush Rose'],
      angle_45: LOVE['Royal Purple Silk'],
      side:     LOVE['Ivory Cotton'],
      back:     LOVE['Gold Silk Brocade'],
      closeup:  LOVE['Emerald Velvet'],
      lifestyle: [LIFESTYLE],
    },
    fabric_images: LOVE,
    in_stock: true,
    featured: true,
    reviews: [
      { id: 'r8', user_name: 'Deepika Rao', rating: 5, comment: 'The blush rose settee is absolutely dreamy. My bridal suite looks like a Mughal palace now.', date: '2024-01-30', verified_purchase: true },
      { id: 'r9', user_name: 'Meera Kapoor', rating: 5, comment: 'The purple silk version is jaw-dropping. Worth every rupee.', date: '2024-03-15', verified_purchase: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Rani Loveseat — Blush Edition',
    slug: 'rani-loveseat-blush',
    description: 'A smaller, dainty loveseat crafted especially for dressing rooms and boutique hotel lobbies. The Rani is a statement piece — gilded ornate legs, ultra-soft blush and pastel silk options, cascading fringe bottom trim.',
    base_price: 54999,
    category: 'Loveseat',
    collection: 'Mughal Series',
    material: 'Mango Wood',
    seating_capacity: 2,
    style: 'Traditional',
    dimensions: { length: 130, width: 78, height: 88 },
    fabric_options: {
      standard: ['Blush Rose', 'Ivory Cotton'],
      premium: ['Royal Purple Silk', 'Gold Silk Brocade'],
    },
    premium_upcharge: 16000,
    images: {
      main:     LOVE['Blush Rose'],
      front:    LOVE['Blush Rose'],
      angle_45: LOVE['Royal Purple Silk'],
      side:     LOVE['Ivory Cotton'],
      back:     LOVE['Gold Silk Brocade'],
      closeup:  LOVE['Emerald Velvet'],
      lifestyle: [LIFESTYLE],
    },
    fabric_images: {
      'Blush Rose':        LOVE['Blush Rose'],
      'Ivory Cotton':      LOVE['Ivory Cotton'],
      'Royal Purple Silk': LOVE['Royal Purple Silk'],
      'Gold Silk Brocade': LOVE['Gold Silk Brocade'],
    },
    in_stock: true,
    featured: false,
    reviews: [
      { id: 'r10', user_name: 'Ananya Singh', rating: 4, comment: 'The perfect accent piece for my dressing room. Very elegant.', date: '2024-04-01', verified_purchase: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ═══════════════════════════════════════════════════════════════
  //  CATEGORY: Sofa (existing — L-Shape & Heritage)
  // ═══════════════════════════════════════════════════════════════
  {
    id: '2',
    name: 'Modern Elegance L-Shape',
    slug: 'modern-elegance-l-shape',
    description: 'Contemporary L-shaped sofa with sleek lines and premium foam cushioning. Perfect for modern Indian homes that want a blend of luxury and contemporary style.',
    base_price: 124999,
    category: 'Sofa',
    collection: 'Contemporary',
    material: 'Teak Wood',
    seating_capacity: 5,
    style: 'Modern',
    dimensions: { length: 280, width: 180, height: 85 },
    fabric_options: {
      standard: ['Charcoal Grey', 'Navy Blue Velvet', 'Emerald Velvet'],
      premium: ['Gold Silk Brocade', 'Royal Purple Silk', 'Ivory Cotton'],
    },
    premium_upcharge: 45000,
    images: {
      main:     ROYAL['Charcoal Grey'],
      front:    ROYAL['Charcoal Grey'],
      angle_45: ROYAL['Navy Blue Velvet'],
      side:     ROYAL['Emerald Velvet'],
      back:     ROYAL['Ivory Cotton'],
      closeup:  ROYAL['Gold Silk Brocade'],
      lifestyle: [LIFESTYLE],
    },
    fabric_images: {
      'Charcoal Grey':     ROYAL['Charcoal Grey'],
      'Navy Blue Velvet':  ROYAL['Navy Blue Velvet'],
      'Emerald Velvet':    ROYAL['Emerald Velvet'],
      'Gold Silk Brocade': ROYAL['Gold Silk Brocade'],
      'Royal Purple Silk': ROYAL['Royal Purple Silk'],
      'Ivory Cotton':      ROYAL['Ivory Cotton'],
    },
    in_stock: true,
    featured: true,
    reviews: [
      { id: 'r3', user_name: 'Karan Malhotra', rating: 5, comment: 'Sleek design, fits perfectly in my modern apartment. The charcoal grey is very versatile.', date: '2024-01-10', verified_purchase: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Heritage 2-Seater Loveseat',
    slug: 'heritage-2-seater-loveseat',
    description: 'Compact yet luxurious 2-seater with brass accents and traditional Indian motifs. Perfect for a reading nook, master bedroom, or intimate seating area.',
    base_price: 54999,
    category: 'Loveseat',
    collection: 'Classic',
    material: 'Teak Wood',
    seating_capacity: 2,
    style: 'Traditional',
    dimensions: { length: 150, width: 85, height: 90 },
    fabric_options: {
      standard: ['Terracotta', 'Ivory Cotton', 'Emerald Velvet'],
      premium: ['Royal Purple Silk', 'Gold Silk Brocade', 'Burgundy Velvet'],
    },
    premium_upcharge: 18000,
    images: {
      main:     ROYAL['Terracotta'],
      front:    ROYAL['Terracotta'],
      angle_45: ROYAL['Ivory Cotton'],
      side:     ROYAL['Emerald Velvet'],
      back:     ROYAL['Burgundy Velvet'],
      closeup:  ROYAL['Royal Purple Silk'],
      lifestyle: [LIFESTYLE],
    },
    fabric_images: {
      'Terracotta':        ROYAL['Terracotta'],
      'Ivory Cotton':      ROYAL['Ivory Cotton'],
      'Emerald Velvet':    ROYAL['Emerald Velvet'],
      'Royal Purple Silk': ROYAL['Royal Purple Silk'],
      'Gold Silk Brocade': ROYAL['Gold Silk Brocade'],
      'Burgundy Velvet':   ROYAL['Burgundy Velvet'],
    },
    in_stock: true,
    featured: false,
    reviews: [
      { id: 'r4', user_name: 'Sneha Gupta', rating: 3, comment: 'Looks good but a bit firm for my liking. Beautiful brass accents though.', date: '2024-02-28', verified_purchase: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

/**
 * Stadium Configuration
 * Constants and configuration for football stadium layout
 * @description Configuration for 30K capacity football stadium
 */

import type { BlockGroup } from '@/types/seating/block.types';

// ============================================
// STADIUM DIMENSIONS
// ============================================

/**
 * Stadyum boyutları (px cinsinden)
 */
export const STADIUM_DIMENSIONS = {
  WIDTH: 2000,
  HEIGHT: 1600,
  CENTER_X: 1000,
  CENTER_Y: 800,
  FIELD_WIDTH: 600, // Saha genişliği
  FIELD_HEIGHT: 400, // Saha yüksekliği
} as const;

/**
 * Blok yarıçapları (stadyum merkezi baz alınarak)
 */
export const BLOCK_RADII = {
  LOWER_INNER: 350, // Alt kat iç yarıçap
  LOWER_OUTER: 520, // Alt kat dış yarıçap
  UPPER_INNER: 540, // Üst kat iç yarıçap
  UPPER_OUTER: 700, // Üst kat dış yarıçap
} as const;

// ============================================
// PRICING & CATEGORIES
// ============================================

/**
 * Fiyat kategorileri (TL)
 */
export const PRICE_CATEGORIES = {
  west_lower_center: {
    name: 'Batı Alt Orta Bloklar',
    price: 2500,
    color: '#8B5CF6', // Mor (en pahalı)
    order: 1,
  },
  east_lower_center: {
    name: 'Doğu Alt Orta Bloklar',
    price: 2000,
    color: '#EC4899', // Pembe
    order: 2,
  },
  west_lower_corner: {
    name: 'Batı Alt Köşe Bloklar',
    price: 1750,
    color: '#F97316', // Turuncu
    order: 3,
  },
  east_lower_corner: {
    name: 'Doğu Alt Köşe Bloklar',
    price: 1750,
    color: '#F97316', // Turuncu
    order: 3,
  },
  east_upper_center: {
    name: 'Doğu Üst Orta Bloklar',
    price: 1500,
    color: '#10B981', // Yeşil
    order: 4,
  },
  west_upper_corner: {
    name: 'Batı Üst Köşe Bloklar',
    price: 1250,
    color: '#06B6D4', // Cyan
    order: 5,
  },
  east_upper_corner: {
    name: 'Doğu Üst Köşe Bloklar',
    price: 1250,
    color: '#06B6D4', // Cyan
    order: 5,
  },
  north_goal: {
    name: 'Kuzey Kale Arkası',
    price: 900,
    color: '#3B82F6', // Mavi (en ucuz)
    order: 6,
  },
  south_goal: {
    name: 'Güney Kale Arkası',
    price: 900,
    color: '#3B82F6', // Mavi (en ucuz)
    order: 6,
  },
} as const;

/**
 * Fiyat kategorisine göre bilgi al
 */
export function getPriceCategory(group: BlockGroup) {
  return PRICE_CATEGORIES[group];
}

// ============================================
// BLOCK LAYOUT
// ============================================

/**
 * Blok açı aralıkları (derece cinsinden)
 * 0° = Sağ (Doğu), 90° = Aşağı (Güney), 180° = Sol (Batı), 270° = Yukarı (Kuzey)
 */
export const BLOCK_ANGLES = {
  // DOĞU BLOKLARI (0° - 90°)
  EAST_LOWER_CORNER_SOUTH: { start: 0, end: 25 }, // 101-103
  EAST_LOWER_CENTER: { start: 25, end: 65 }, // 104-107
  EAST_LOWER_CORNER_NORTH: { start: 65, end: 90 }, // 108-110

  EAST_UPPER_CORNER_SOUTH: { start: 0, end: 25 }, // 120-122
  EAST_UPPER_CENTER: { start: 25, end: 65 }, // 123-127
  EAST_UPPER_CORNER_NORTH: { start: 65, end: 90 }, // 128-130

  // GÜNEY BLOKLARI (90° - 180°)
  SOUTH_GOAL_EAST: { start: 90, end: 125 }, // 228-231
  SOUTH_GOAL_CENTER: { start: 125, end: 145 }, // 301, 331, 201, 231 (protokol)
  SOUTH_GOAL_WEST: { start: 145, end: 180 }, // 202-204

  // BATI BLOKLARI (180° - 270°)
  WEST_LOWER_CORNER_SOUTH: { start: 180, end: 205 }, // 212-214
  WEST_LOWER_CENTER: { start: 205, end: 245 }, // 215-218
  WEST_LOWER_CORNER_NORTH: { start: 245, end: 270 }, // 219-220

  WEST_UPPER_CORNER_SOUTH: { start: 180, end: 205 }, // (Üst kat varsa)
  WEST_UPPER_CENTER: { start: 205, end: 245 }, // (Üst kat varsa)
  WEST_UPPER_CORNER_NORTH: { start: 245, end: 270 }, // (Üst kat varsa)

  // KUZEY BLOKLARI (270° - 360°)
  NORTH_GOAL_WEST: { start: 270, end: 305 }, // 106-109
  NORTH_GOAL_CENTER: { start: 305, end: 325 }, // 110-112
  NORTH_GOAL_EAST: { start: 325, end: 360 }, // 113-115
} as const;

// ============================================
// SEAT CONFIGURATION
// ============================================

/**
 * Koltuk boyutları
 */
export const SEAT_DIMENSIONS = {
  WIDTH: 8, // px
  HEIGHT: 8, // px
  SPACING_ROW: 10, // Sıra arası boşluk
  SPACING_COL: 10, // Koltuk arası boşluk
} as const;

/**
 * Blok tiplerine göre koltuk sayıları
 */
export const SEATS_PER_BLOCK = {
  // Alt kat
  lower_center: { rows: 25, cols: 30 }, // 750 koltuk
  lower_corner: { rows: 20, cols: 25 }, // 500 koltuk
  
  // Üst kat
  upper_center: { rows: 30, cols: 35 }, // 1050 koltuk
  upper_corner: { rows: 25, cols: 30 }, // 750 koltuk
  
  // Kale arkası
  goal_side: { rows: 35, cols: 40 }, // 1400 koltuk
} as const;

// ============================================
// CAPACITY CALCULATION
// ============================================

/**
 * Toplam kapasite hesaplama
 * Target: ~30.000 kişi
 */
export const CAPACITY_BREAKDOWN = {
  // Batı Alt Orta (4 blok): 4 x 750 = 3.000
  west_lower_center: 4,
  
  // Doğu Alt Orta (4 blok): 4 x 750 = 3.000
  east_lower_center: 4,
  
  // Batı Alt Köşe (6 blok): 6 x 500 = 3.000
  west_lower_corner: 6,
  
  // Doğu Alt Köşe (6 blok): 6 x 500 = 3.000
  east_lower_corner: 6,
  
  // Doğu Üst Orta (5 blok): 5 x 1050 = 5.250
  east_upper_center: 5,
  
  // Batı Üst Köşe (4 blok): 4 x 750 = 3.000
  west_upper_corner: 4,
  
  // Doğu Üst Köşe (4 blok): 4 x 750 = 3.000
  east_upper_corner: 4,
  
  // Kuzey Kale Arkası (3 blok): 3 x 1400 = 4.200
  north_goal: 3,
  
  // Güney Kale Arkası (3 blok): 3 x 1400 = 4.200
  south_goal: 3,
} as const;

// Toplam blok sayısı: 43 blok
// Tahmini toplam kapasite: ~31.650 kişi

// ============================================
// BLOCK NAMING
// ============================================

/**
 * Blok numaralandırma şablonları
 */
export const BLOCK_NUMBERING = {
  // Alt kat - Doğu (100'ler)
  east_lower: { start: 101, prefix: '' },
  
  // Alt kat - Güney (200'ler + 300'ler)
  south_lower: { start: 228, prefix: '' },
  south_protocol: ['301', '331', '201', '231'], // Protokol blokları
  
  // Alt kat - Batı (210'lar)
  west_lower: { start: 212, prefix: '' },
  
  // Üst kat - Doğu (120'ler)
  east_upper: { start: 120, prefix: '' },
  
  // Kuzey (110'lar)
  north_goal: { start: 113, prefix: '' },
} as const;
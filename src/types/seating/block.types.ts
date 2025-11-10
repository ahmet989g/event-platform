/**
 * Block Types
 * Stadium/venue block structure definitions
 * @description Type definitions for seating blocks
 */

import type { Shape, ShapeStyle, SeatGridConfig, Viewport } from './geometry.types';
import { Seat } from './seat.types';

// ============================================
// BLOCK ENUMS
// ============================================

/**
 * Blok pozisyon/bölge tipleri
 */
export const BlockSection = {
  NORTH: 'north', // Kuzey (Kale Arkası)
  SOUTH: 'south', // Güney (Kale Arkası)
  EAST: 'east', // Doğu
  WEST: 'west', // Batı
  CORNER: 'corner', // Köşe
} as const;
export type BlockSection = (typeof BlockSection)[keyof typeof BlockSection];

/**
 * Blok katman tipi
 */
export const BlockTier = {
  LOWER: 'lower', // Alt kat
  UPPER: 'upper', // Üst kat
  MID: 'mid', // Orta kat (varsa)
} as const;
export type BlockTier = (typeof BlockTier)[keyof typeof BlockTier];

/**
 * Blok grubu (fiyatlandırma kategorisi için)
 */
export const BlockGroup = {
  WEST_LOWER_CENTER: 'west_lower_center', // Batı Alt Orta
  EAST_LOWER_CENTER: 'east_lower_center', // Doğu Alt Orta
  WEST_LOWER_CORNER: 'west_lower_corner', // Batı Alt Köşe
  EAST_LOWER_CORNER: 'east_lower_corner', // Doğu Alt Köşe
  EAST_UPPER_CENTER: 'east_upper_center', // Doğu Üst Orta
  WEST_UPPER_CORNER: 'west_upper_corner', // Batı Üst Köşe
  EAST_UPPER_CORNER: 'east_upper_corner', // Doğu Üst Köşe
  NORTH_GOAL: 'north_goal', // Kuzey Kale Arkası
  SOUTH_GOAL: 'south_goal', // Güney Kale Arkası
} as const;
export type BlockGroup = (typeof BlockGroup)[keyof typeof BlockGroup];

// ============================================
// BLOCK METADATA
// ============================================

/**
 * Blok metadata (JSONB)
 */
export interface BlockMetadata {
  section: BlockSection;
  tier: BlockTier;
  group: BlockGroup;
  isCorner?: boolean;
  isGoalSide?: boolean;
  viewQuality?: 1 | 2 | 3 | 4 | 5; // 1=En kötü, 5=En iyi
  distanceToCenter?: number; // Saha merkezine uzaklık (metre)
  notes?: string;
}

/**
 * Viewport data (zoom yapıldığında gösterilecek alan)
 */
export interface BlockViewportData {
  center: { x: number; y: number };
  zoomScale: number; // Bu zoom seviyesinde koltuklar görünsün
  seatGrid?: SeatGridConfig;
}

// ============================================
// BLOCK INTERFACE
// ============================================

/**
 * Blok (Database table)
 */
export interface Block {
  id: string;
  session_id: string;
  block_number: string; // "101", "102", "215", "C101"
  block_name: string; // "Batı Alt Orta - 101"
  shape: Shape; // Geometric shape
  style: ShapeStyle; // Renk, stroke vb.
  viewport_data: BlockViewportData;
  total_capacity: number;
  available_capacity: number;
  display_order: number; // Render sırası
  metadata: BlockMetadata;
  created_at: string;
  updated_at: string;
}

// ============================================
// EXTENDED TYPES
// ============================================

/**
 * Blok + koltuklar
 */
export interface BlockWithSeats extends Block {
  seats?: Seat[];
}

/**
 * Blok + session category (fiyat bilgisi)
 */
export interface BlockWithPricing extends Block {
  session_category?: {
    id: string;
    price: number;
    color: string;
    category_name: string;
  };
}

// ============================================
// BLOCK GENERATOR CONFIG
// ============================================

/**
 * Blok oluşturma konfigürasyonu (mock data için)
 */
export interface BlockGeneratorConfig {
  blockNumber: string;
  blockName: string;
  group: BlockGroup;
  section: BlockSection;
  tier: BlockTier;
  arcConfig: {
    centerX: number;
    centerY: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
  };
  seatGridConfig: {
    rows: number;
    cols: number;
    rowSpacing: number;
    colSpacing: number;
  };
  price: number;
  color: string;
}
/**
 * Seat Types
 * Individual seat structure definitions
 * @description Type definitions for individual seats
 */

import type { Point } from './geometry.types';

// ============================================
// SEAT ENUMS
// ============================================

/**
 * Koltuk tipi
 */
export const SeatType = {
  REGULAR: 'regular', // Normal koltuk
  WHEELCHAIR: 'wheelchair', // Engelli koltuğu
  COMPANION: 'companion', // Refakatçi koltuğu
  VIP: 'vip', // VIP koltuk
  STAGE: 'stage', // Sahne göstergesi
  LABEL: 'label', // Etiket/Gösterge (Çıkış, WC)
} as const;
export type SeatType = (typeof SeatType)[keyof typeof SeatType];

/**
 * Koltuk durumu
 */
export const SeatStatus = {
  AVAILABLE: 'available', // Müsait
  RESERVED: 'reserved', // Rezerve (sepette ama ödenmemiş)
  SOLD: 'sold', // Satıldı
  BLOCKED: 'blocked', // Kapalı
} as const;
export type SeatStatus = (typeof SeatStatus)[keyof typeof SeatStatus];

// ============================================
// SEAT METADATA
// ============================================

/**
 * Koltuk metadata (JSONB)
 */
export interface SeatMetadata {
  isAisle?: boolean; // Koridor kenarı mı?
  hasObstruction?: boolean; // Görüş engeli var mı?
  viewRating?: 1 | 2 | 3 | 4 | 5; // Görüş kalitesi
  notes?: string;
  [key: string]: unknown;
}

// ============================================
// SEAT INTERFACE
// ============================================

/**
 * Koltuk (Database table)
 */
export interface Seat {
  id: string;
  session_id: string;
  block_id: string | null;
  seat_number: string; // "101-A-15" (blok-sıra-koltuk)
  row_number: string; // "A", "B", "C"
  row_index: number; // 0, 1, 2 (hesaplama için)
  col_index: number; // 0, 1, 2 (hesaplama için)
  position: Point; // { x, y } koordinatları
  seat_type: SeatType;
  status: SeatStatus;
  width: number; // px
  height: number; // px
  rotation: number; // Derece (0-360)
  label_text: string | null; // Gösterge metni (varsa)
  metadata: SeatMetadata;
  created_at: string;
  updated_at: string;
}

// ============================================
// EXTENDED TYPES
// ============================================

/**
 * Koltuk + kategori bilgisi
 */
export interface SeatWithCategory extends Seat {
  category?: {
    id: string;
    name: string;
    price: number;
    color: string;
  };
}

/**
 * Koltuk + blok bilgisi
 */
export interface SeatWithBlock extends Seat {
  block?: {
    id: string;
    block_number: string;
    block_name: string;
  };
}

// ============================================
// SEAT SELECTION
// ============================================

/**
 * Seçili koltuk (Frontend state için)
 */
export interface SelectedSeat {
  seatId: string;
  seatNumber: string;
  blockName: string;
  categoryId: string;
  price: number;
  color: string;
}

// ============================================
// SEAT GENERATOR CONFIG
// ============================================

/**
 * Koltuk oluşturma konfigürasyonu
 */
export interface SeatGeneratorConfig {
  blockId: string;
  blockNumber: string;
  startPosition: Point;
  rowCount: number;
  colCount: number;
  rowSpacing: number;
  colSpacing: number;
  seatWidth: number;
  seatHeight: number;
  startRowLetter: string; // "A"
}

/**
 * Seat grid cell (oluşturma sırasında kullanılan)
 */
export interface SeatGridCell {
  row: number;
  col: number;
  rowLetter: string;
  seatNumber: string; // "101-A-15"
  position: Point;
}
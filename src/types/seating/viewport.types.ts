/**
 * Viewport Types
 * Zoom, pan, and rendering viewport definitions
 * @description Type definitions for viewport and LOD system
 */

import type { Transform, Viewport } from './geometry.types';

// ============================================
// ZOOM & LOD
// ============================================

/**
 * Zoom seviyeleri (LOD - Level of Detail)
 */
export const ZoomLevel = {
  FAR: 1, // Uzak: Sadece bloklar görünür
  MEDIUM: 2, // Orta: Bloklar + numaralar
  CLOSE: 3, // Yakın: Koltuklar görünür
} as const;
export type ZoomLevel = (typeof ZoomLevel)[keyof typeof ZoomLevel];

/**
 * Render modu
 */
export const RenderMode = {
  BLOCK_ONLY: 'block_only', // Sadece blok şekilleri
  BLOCK_WITH_LABELS: 'block_with_labels', // Bloklar + numaralar
  SEATS_GRID: 'seats_grid', // Koltuk grid'i
} as const;
export type RenderMode = (typeof RenderMode)[keyof typeof RenderMode];

// ============================================
// ZOOM CONFIG
// ============================================

/**
 * Zoom konfigürasyonu (session'dan gelir)
 */
export interface ZoomConfig {
  minZoom: number; // Minimum zoom (örn: 0.5)
  maxZoom: number; // Maximum zoom (örn: 4.0)
  initialZoom: number; // Başlangıç zoom (örn: 1.0)
  zoomStep: number; // Zoom adım büyüklüğü (örn: 0.2)
  seatVisibilityThreshold: number; // Bu zoom'dan sonra koltuklar görünsün (örn: 1.8)
  enablePinch: boolean; // Pinch zoom aktif mi?
  enableScroll: boolean; // Scroll zoom aktif mi?
  transitionDuration: number; // Zoom animasyon süresi (ms)
}

/**
 * Varsayılan zoom config
 */
export const DEFAULT_ZOOM_CONFIG: ZoomConfig = {
  minZoom: 0.5,
  maxZoom: 4.0,
  initialZoom: 1.0,
  zoomStep: 0.2,
  seatVisibilityThreshold: 1.8,
  enablePinch: true,
  enableScroll: true,
  transitionDuration: 300,
};

// ============================================
// MINIMAP
// ============================================

/**
 * Minimap pozisyonu
 */
export const MinimapPosition = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
} as const;
export type MinimapPosition = (typeof MinimapPosition)[keyof typeof MinimapPosition];

/**
 * Minimap konfigürasyonu
 */
export interface MinimapConfig {
  enabled: boolean;
  position: MinimapPosition;
  width: number; // px
  height: number; // px
  showViewport: boolean; // Viewport'u göster mi?
  clickable: boolean; // Tıklanabilir mi?
  opacity: number; // 0-1
}

/**
 * Varsayılan minimap config
 */
export const DEFAULT_MINIMAP_CONFIG: MinimapConfig = {
  enabled: true,
  position: 'bottom-right',
  width: 200,
  height: 150,
  showViewport: true,
  clickable: true,
  opacity: 0.8,
};

// ============================================
// VIEWPORT STATE
// ============================================

/**
 * Viewport state (Frontend)
 */
export interface ViewportState {
  viewport: Viewport;
  transform: Transform;
  zoomLevel: ZoomLevel;
  renderMode: RenderMode;
  isDragging: boolean;
  isZooming: boolean;
}

/**
 * Viewport değişiklik eventi
 */
export interface ViewportChangeEvent {
  viewport: Viewport;
  transform: Transform;
  zoomLevel: ZoomLevel;
  renderMode: RenderMode;
}

// ============================================
// CAMERA CONTROL
// ============================================

/**
 * Kamera kontrol aksiyonları
 */
export type CameraAction =
  | { type: 'ZOOM_IN' }
  | { type: 'ZOOM_OUT' }
  | { type: 'ZOOM_TO'; scale: number }
  | { type: 'PAN'; deltaX: number; deltaY: number }
  | { type: 'RESET' }
  | { type: 'FIT_TO_BOUNDS'; minX: number; maxX: number; minY: number; maxY: number }
  | { type: 'FOCUS_BLOCK'; blockId: string }
  | { type: 'FOCUS_SEAT'; seatId: string };

/**
 * Kamera hedef pozisyon
 */
export interface CameraTarget {
  x: number;
  y: number;
  scale: number;
  duration?: number; // Animasyon süresi (ms)
}
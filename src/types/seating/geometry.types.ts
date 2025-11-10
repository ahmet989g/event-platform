/**
 * Seating Geometry Types
 * Shape, coordinate, and spatial calculation types
 * @description Geometric primitives for seating layout system
 */

// ============================================
// SHAPE TYPES
// ============================================

/**
 * Temel geometri tipleri
 */
export const GeometryType = {
  RECTANGLE: 'rectangle',
  POLYGON: 'polygon',
  CIRCLE: 'circle',
  ARC: 'arc',
  CUSTOM_PATH: 'custom_path',
} as const;
export type GeometryType = (typeof GeometryType)[keyof typeof GeometryType];

/**
 * 2D Koordinat
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Dikdörtgen şekil
 */
export interface RectangleShape {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Çokgen şekil (polygon)
 */
export interface PolygonShape {
  type: 'polygon';
  points: Point[];
}

/**
 * Daire şekil
 */
export interface CircleShape {
  type: 'circle';
  centerX: number;
  centerY: number;
  radius: number;
}

/**
 * Yay şekil (stadyum tribünleri için)
 */
export interface ArcShape {
  type: 'arc';
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number; // Derece (0-360)
  endAngle: number; // Derece (0-360)
}

/**
 * Özel SVG path
 */
export interface CustomPathShape {
  type: 'custom_path';
  path: string; // SVG path string
}

/**
 * Birleşik shape type
 */
export type Shape = RectangleShape | PolygonShape | CircleShape | ArcShape | CustomPathShape;

// ============================================
// STYLE TYPES
// ============================================

/**
 * Şekil stil özellikleri
 */
export interface ShapeStyle {
  fill?: string; // Hex color
  stroke?: string; // Hex color
  strokeWidth?: number;
  opacity?: number;
}

/**
 * Render edilebilir şekil (shape + style)
 */
export interface RenderableShape {
  shape: Shape;
  style: ShapeStyle;
}

// ============================================
// VIEWPORT & TRANSFORM
// ============================================

/**
 * Viewport (görünür alan)
 */
export interface Viewport {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Transform (zoom/pan)
 */
export interface Transform {
  scale: number;
  translateX: number;
  translateY: number;
}

/**
 * Bounding box
 */
export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// ============================================
// GRID SYSTEM
// ============================================

/**
 * Koltuk grid yapılandırması
 */
export interface SeatGridConfig {
  rows: number;
  cols: number;
  rowSpacing: number; // px
  colSpacing: number; // px
  startX: number; // Grid başlangıç X koordinatı
  startY: number; // Grid başlangıç Y koordinatı
  seatWidth: number; // Tek koltuk genişliği (px)
  seatHeight: number; // Tek koltuk yüksekliği (px)
}

/**
 * Grid cell (tek bir hücre)
 */
export interface GridCell {
  row: number;
  col: number;
  x: number;
  y: number;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Koordinat dönüşümü için helper
 */
export interface CoordinateTransform {
  fromScreen: (screenX: number, screenY: number) => Point;
  toScreen: (worldX: number, worldY: number) => Point;
}
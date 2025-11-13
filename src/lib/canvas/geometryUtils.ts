/**
 * Canvas Geometry Utilities
 * Koordinat hesaplamaları ve geometrik işlemler
 */

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

// ============================================
// POLYGON UTILITIES
// ============================================

/**
 * Polygon'un merkezini hesapla (centroid)
 */
export function getPolygonCenter(points: Point[]): Point {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }

  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
    }),
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}

/**
 * Polygon'un bounding box'ını hesapla
 */
export function getPolygonBounds(points: Point[]): BoundingBox {
  if (points.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Point-in-polygon test (Ray casting algorithm)
 * Bir noktanın polygon içinde olup olmadığını kontrol eder
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Rengi açıklaştır/koyulaştır
 * @param color - Hex color (#RRGGBB)
 * @param percent - Pozitif: açık, Negatif: koyu
 */
export function adjustColor(color: string, percent: number): string {
  // # karakterini kaldır
  const hex = color.replace('#', '');
  
  // RGB değerlerini ayır
  const num = parseInt(hex, 16);
  const r = (num >> 16) + percent;
  const g = ((num >> 8) & 0x00ff) + percent;
  const b = (num & 0x0000ff) + percent;

  // 0-255 arası sınırla
  const newR = Math.max(0, Math.min(255, r));
  const newG = Math.max(0, Math.min(255, g));
  const newB = Math.max(0, Math.min(255, b));

  // Hex'e geri çevir
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB)
    .toString(16)
    .slice(1)}`;
}

// ============================================
// DISTANCE CALCULATIONS
// ============================================

/**
 * İki nokta arası mesafe (Euclidean distance)
 */
export function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Noktanın polygon'a olan minimum mesafesi
 */
export function getDistanceToPolygon(point: Point, polygon: Point[]): number {
  let minDistance = Infinity;

  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    const distance = getDistanceToLineSegment(point, p1, p2);
    minDistance = Math.min(minDistance, distance);
  }

  return minDistance;
}

/**
 * Noktanın line segment'e olan mesafesi
 */
function getDistanceToLineSegment(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return getDistance(point, lineStart);
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared
    )
  );

  const projection = {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy,
  };

  return getDistance(point, projection);
}

// ============================================
// COORDINATE PARSING
// ============================================

/**
 * Supabase'den gelen koordinatları parse et
 * Input: [{"x":250,"y":50},{"x":450,"y":50},...] (JSONB)
 * Output: Point[]
 */
export function parseCoordinates(coords: unknown): Point[] {
  if (!coords) return [];
  
  try {
    // Eğer string ise JSON parse et
    const parsed = typeof coords === 'string' ? JSON.parse(coords) : coords;
    
    // Array kontrolü
    if (!Array.isArray(parsed)) return [];
    
    // Point array'e dönüştür
    return parsed
      .filter((item) => item && typeof item.x === 'number' && typeof item.y === 'number')
      .map((item) => ({ x: item.x, y: item.y }));
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return [];
  }
}

// ============================================
// GRID CALCULATIONS
// ============================================

/**
 * Seat grid pozisyonlarını hesapla
 */
export function calculateSeatGridPositions(config: {
  bounds: BoundingBox;
  rows: number;
  cols: number;
  padding: number;
}): Point[][] {
  const { bounds, rows, cols, padding } = config;
  
  const availableWidth = bounds.width - padding * 2;
  const availableHeight = bounds.height - padding * 2;
  
  const seatWidth = availableWidth / cols;
  const seatHeight = availableHeight / rows;
  
  const positions: Point[][] = [];
  
  for (let row = 0; row < rows; row++) {
    const rowPositions: Point[] = [];
    
    for (let col = 0; col < cols; col++) {
      rowPositions.push({
        x: bounds.minX + padding + col * seatWidth + seatWidth / 2,
        y: bounds.minY + padding + row * seatHeight + seatHeight / 2,
      });
    }
    
    positions.push(rowPositions);
  }
  
  return positions;
}

// ============================================
// ANIMATION EASING
// ============================================

/**
 * Ease in-out cubic easing function
 * t: 0-1 arası progress
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Ease out quad
 */
export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Point interpolation
 */
export function lerpPoint(start: Point, end: Point, t: number): Point {
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t),
  };
}
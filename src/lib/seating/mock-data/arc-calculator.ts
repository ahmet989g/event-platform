/**
 * Arc Calculator
 * Geometric calculations for arc-shaped blocks (stadium tribunes)
 * @description Calculate points and shapes for circular/arc segments
 */

import type { Point, ArcShape } from '@/types/seating/geometry.types';

// ============================================
// ARC CALCULATIONS
// ============================================

/**
 * Polar koordinattan Cartesian koordinata dönüşüm
 * @param centerX - Merkez X koordinatı
 * @param centerY - Merkez Y koordinatı
 * @param radius - Yarıçap
 * @param angleDegrees - Açı (derece)
 * @returns Cartesian koordinat
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number
): Point {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
  
  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY + radius * Math.sin(angleRadians),
  };
}

/**
 * Yay şeklindeki bloğun köşe noktalarını hesapla
 * @param arc - Arc shape config
 * @returns Polygon points (saat yönünde)
 */
export function calculateArcPoints(arc: {
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
}): Point[] {
  const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } = arc;
  
  const points: Point[] = [];
  const segmentCount = 20; // Yay pürüzsüzlüğü için segment sayısı
  const angleStep = (endAngle - startAngle) / segmentCount;
  
  // Dış yay (saat yönünde)
  for (let i = 0; i <= segmentCount; i++) {
    const angle = startAngle + angleStep * i;
    points.push(polarToCartesian(centerX, centerY, outerRadius, angle));
  }
  
  // İç yay (saat yönünün tersi)
  for (let i = segmentCount; i >= 0; i--) {
    const angle = startAngle + angleStep * i;
    points.push(polarToCartesian(centerX, centerY, innerRadius, angle));
  }
  
  return points;
}

/**
 * Arc'ın merkez noktasını hesapla
 * @param arc - Arc shape config
 * @returns Merkez nokta
 */
export function getArcCenter(arc: {
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
}): Point {
  const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } = arc;
  
  const midAngle = (startAngle + endAngle) / 2;
  const midRadius = (innerRadius + outerRadius) / 2;
  
  return polarToCartesian(centerX, centerY, midRadius, midAngle);
}

/**
 * Arc'ın bounding box'ını hesapla
 * @param arc - Arc shape config
 * @returns Bounding box { minX, maxX, minY, maxY }
 */
export function getArcBoundingBox(arc: {
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
}): { minX: number; maxX: number; minY: number; maxY: number } {
  const points = calculateArcPoints(arc);
  
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

// ============================================
// SEAT GRID IN ARC
// ============================================

/**
 * Arc içinde koltuk grid'i oluştur
 * Koltuklar arc'ın şekline uygun olarak dağıtılır
 * @param arc - Arc shape config
 * @param rows - Sıra sayısı
 * @param cols - Sütun sayısı
 * @param seatWidth - Koltuk genişliği
 * @param seatHeight - Koltuk yüksekliği
 * @returns Koltuk pozisyonları
 */
export function generateSeatsInArc(
  arc: {
    centerX: number;
    centerY: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
  },
  rows: number,
  cols: number,
  seatWidth: number,
  seatHeight: number
): { row: number; col: number; position: Point }[] {
  const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } = arc;
  
  const seats: { row: number; col: number; position: Point }[] = [];
  const radiusStep = (outerRadius - innerRadius) / rows;
  const angleStep = (endAngle - startAngle) / (cols - 1);
  
  for (let row = 0; row < rows; row++) {
    const radius = innerRadius + radiusStep * (row + 0.5);
    
    for (let col = 0; col < cols; col++) {
      const angle = startAngle + angleStep * col;
      const position = polarToCartesian(centerX, centerY, radius, angle);
      
      seats.push({ row, col, position });
    }
  }
  
  return seats;
}

/**
 * Verilen nokta arc içinde mi kontrol et
 * @param point - Kontrol edilecek nokta
 * @param arc - Arc shape config
 * @returns Arc içinde mi?
 */
export function isPointInArc(
  point: Point,
  arc: {
    centerX: number;
    centerY: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
  }
): boolean {
  const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } = arc;
  
  // Merkeze uzaklık
  const dx = point.x - centerX;
  const dy = point.y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Yarıçap kontrolü
  if (distance < innerRadius || distance > outerRadius) {
    return false;
  }
  
  // Açı kontrolü
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  if (angle < 0) angle += 360;
  
  // Normalize edilmiş açı aralığı
  const normalizedStart = startAngle % 360;
  const normalizedEnd = endAngle % 360;
  
  if (normalizedStart <= normalizedEnd) {
    return angle >= normalizedStart && angle <= normalizedEnd;
  } else {
    return angle >= normalizedStart || angle <= normalizedEnd;
  }
}

/**
 * Arc SVG path string'i oluştur
 * @param arc - Arc shape config
 * @returns SVG path string
 */
export function createArcPath(arc: {
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
}): string {
  const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } = arc;
  
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}
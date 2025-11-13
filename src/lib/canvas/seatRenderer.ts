/**
 * Seat Renderer
 * Canvas'ta koltukları çizen fonksiyonlar
 */

import type { Block, Seat } from '@/types/session.types';
import { getPolygonBounds, parseCoordinates } from './geometryUtils';

// ============================================
// CONSTANTS
// ============================================

const SEAT_COLORS = {
  available: '#10b981', // green-500
  reserved: '#f59e0b', // amber-500
  sold: '#ef4444', // red-500
  blocked: '#6b7280', // gray-500
  selected: '#3b82f6', // blue-500
  hover: '#8b5cf6', // violet-500
} as const;

const SEAT_SIZE = {
  MIN: 2,
  MAX: 8,
  DEFAULT: 4,
} as const;

// ============================================
// SEAT DRAWING
// ============================================

/**
 * Tek bir koltuğu çiz
 */
export function drawSeat(
  ctx: CanvasRenderingContext2D,
  seat: Seat,
  options: {
    isSelected?: boolean;
    isHovered?: boolean;
    zoom: number;
  }
): void {
  const { isSelected = false, isHovered = false, zoom } = options;

  // Seat size (zoom'a göre)
  const radius = calculateSeatRadius(zoom);

  // Skip if too small
  if (radius * zoom < 1) return;

  // Color
  let color = SEAT_COLORS[seat.status] || SEAT_COLORS.available;
  
  if (isSelected) {
    color = SEAT_COLORS.selected;
  } else if (isHovered) {
    color = SEAT_COLORS.hover;
  }

  // Draw circle
  ctx.beginPath();
  ctx.arc(seat.position_x, seat.position_y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Stroke (zoom > 4 ise)
  if (zoom > 4) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Seat label (zoom > 6 ise)
  if (zoom > 6) {
    drawSeatLabel(ctx, seat, radius);
  }
}

/**
 * Seat label çiz (çok yakın zoom'da)
 */
function drawSeatLabel(
  ctx: CanvasRenderingContext2D,
  seat: Seat,
  radius: number
): void {
  ctx.fillStyle = '#ffffff';
  ctx.font = `${radius * 1.2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Sadece koltuk numarasının son kısmı
  const label = seat.seat_number.split('-').pop() || seat.seat_number;
  
  ctx.fillText(label, seat.position_x, seat.position_y);
}

/**
 * Zoom seviyesine göre koltuk radius'unu hesapla
 */
function calculateSeatRadius(zoom: number): number {
  if (zoom < 2.5) return SEAT_SIZE.MIN;
  if (zoom < 4) return SEAT_SIZE.DEFAULT * 0.7;
  if (zoom < 6) return SEAT_SIZE.DEFAULT;
  return SEAT_SIZE.MAX;
}

// ============================================
// BATCH DRAWING
// ============================================

/**
 * Bir bloğun tüm koltukları çiz
 */
export function drawBlockSeats(
  ctx: CanvasRenderingContext2D,
  block: Block,
  seats: Seat[],
  options: {
    selectedSeatIds?: Set<string>;
    hoveredSeatId?: string | null;
    zoom: number;
  }
): void {
  const { selectedSeatIds = new Set(), hoveredSeatId, zoom } = options;

  // Zoom çok düşükse koltukları çizme
  if (zoom < 2.5) return;

  seats.forEach((seat) => {
    drawSeat(ctx, seat, {
      isSelected: selectedSeatIds.has(seat.id),
      isHovered: seat.id === hoveredSeatId,
      zoom,
    });
  });
}

/**
 * Koltuk grid preview çiz (koltuklar yüklenmeden önce)
 * Blok içinde ufak noktalar göster
 */
export function drawSeatGridPreview(
  ctx: CanvasRenderingContext2D,
  block: Block,
  zoom: number
): void {
  // Sadece orta zoom seviyesinde göster
  if (zoom < 1.5 || zoom > 4) return;

  const coordinates = parseCoordinates(block.shape_data?.coordinates);
  if (coordinates.length === 0) return;

  const bounds = getPolygonBounds(coordinates);
  
  // Grid config (eğer varsa)
  const gridConfig = block.viewport_data?.seat_grid;
  if (!gridConfig) return;

  const { rows, columns } = gridConfig;
  
  // Basit grid hesapla
  const padding = 10;
  const cellWidth = (bounds.width - padding * 2) / columns;
  const cellHeight = (bounds.height - padding * 2) / rows;
  
  ctx.fillStyle = 'rgba(156, 163, 175, 0.3)'; // gray-400 with alpha
  
  // Her hücre için küçük bir dot
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = bounds.minX + padding + col * cellWidth + cellWidth / 2;
      const y = bounds.minY + padding + row * cellHeight + cellHeight / 2;
      
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ============================================
// SEAT STATUS INDICATORS
// ============================================

/**
 * Koltuk durum legend'ını çiz (Canvas'ın dışında, ayrı bir component olarak kullanılabilir)
 */
export function getSeatStatusLegend(): Array<{
  status: keyof typeof SEAT_COLORS;
  color: string;
  label: string;
}> {
  return [
    { status: 'available', color: SEAT_COLORS.available, label: 'Müsait' },
    { status: 'selected', color: SEAT_COLORS.selected, label: 'Seçili' },
    { status: 'reserved', color: SEAT_COLORS.reserved, label: 'Rezerve' },
    { status: 'sold', color: SEAT_COLORS.sold, label: 'Satıldı' },
    { status: 'blocked', color: SEAT_COLORS.blocked, label: 'Kapalı' },
  ];
}

/**
 * Seat highlight circle (selection için)
 */
export function highlightSeat(
  ctx: CanvasRenderingContext2D,
  seat: Seat,
  zoom: number,
  color: string = 'rgba(59, 130, 246, 0.3)' // blue-500 with alpha
): void {
  const radius = calculateSeatRadius(zoom);
  
  ctx.beginPath();
  ctx.arc(seat.position_x, seat.position_y, radius * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// ============================================
// SEAT INTERACTION
// ============================================

/**
 * Bir noktanın hangi koltuk üzerinde olduğunu bul
 */
export function findSeatAtPosition(
  point: { x: number; y: number },
  seats: Seat[],
  zoom: number
): Seat | null {
  const radius = calculateSeatRadius(zoom);
  const hitRadius = radius * 1.2; // Biraz daha geniş hit area

  for (const seat of seats) {
    const dx = point.x - seat.position_x;
    const dy = point.y - seat.position_y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= hitRadius) {
      return seat;
    }
  }

  return null;
}

/**
 * Viewport içindeki koltukları filtrele (performance için)
 */
export function filterSeatsInViewport(
  seats: Seat[],
  viewport: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  }
): Seat[] {
  return seats.filter(
    (seat) =>
      seat.position_x >= viewport.minX &&
      seat.position_x <= viewport.maxX &&
      seat.position_y >= viewport.minY &&
      seat.position_y <= viewport.maxY
  );
}
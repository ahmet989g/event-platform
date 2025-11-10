/**
 * Seat Renderer
 * Render individual seats on canvas
 * @description Event Ticketing Platform - Seat drawing functions
 */

import type { Seat } from '@/types/seating/seat.types';
import { drawCircle, drawRect, drawText, type DrawStyle } from './canvas-utils';

// ============================================
// TYPES
// ============================================

interface RenderSeatOptions {
  /** Seçili mi? */
  isSelected?: boolean;
  /** Hover edilmiş mi? */
  isHovered?: boolean;
  /** Minimum zoom seviyesi (altında koltukları gösterme) */
  minRenderZoom?: number;
  /** Current zoom level */
  currentZoom?: number;
  /** Seat size multiplier */
  sizeMultiplier?: number;
}

interface RenderSeatsOptions extends RenderSeatOptions {
  /** Seçili koltuk ID'leri */
  selectedSeatIds?: Set<string>;
  /** Hover edilen koltuk ID */
  hoveredSeatId?: string | null;
  /** Filter: Sadece belirli block'taki koltukları göster */
  blockId?: string | null;
}

// ============================================
// SEAT STATUS COLORS
// ============================================

const SEAT_COLORS = {
  available: '#10B981', // Green
  reserved: '#F59E0B', // Amber
  sold: '#EF4444', // Red
  blocked: '#6B7280', // Gray
} as const;

// ============================================
// MAIN RENDER FUNCTION
// ============================================

/**
 * Tek bir koltuğu çiz
 */
export function renderSeat(
  ctx: CanvasRenderingContext2D,
  seat: Seat,
  options: RenderSeatOptions = {}
): void {
  const {
    isSelected = false,
    isHovered = false,
    minRenderZoom = 2,
    currentZoom = 1,
    sizeMultiplier = 1,
  } = options;

  // Minimum zoom kontrolü - Koltuklar sadece yakın zoom'da görünür
  if (currentZoom < minRenderZoom) return;

  // Seat type'a göre render etme
  if (seat.seat_type === 'stage' || seat.seat_type === 'label') {
    renderSpecialSeat(ctx, seat, currentZoom);
    return;
  }

  // Style hesapla
  const style = calculateSeatStyle(seat, { isSelected, isHovered });

  // Seat size (zoom'a göre ayarlanır)
  const baseSize = Math.max(seat.width, seat.height);
  const size = baseSize * sizeMultiplier;

  // Koltuk şekli (circle veya rectangle)
  if (seat.seat_type === 'wheelchair') {
    // Engelli koltuğu - farklı şekil
    renderWheelchairSeat(ctx, seat, size, style);
  } else {
    // Normal koltuk - circle
    drawCircle(ctx, seat.position.x, seat.position.y, size / 2, style);
  }

  // Seat number (sadece çok yakın zoom'da)
  if (currentZoom > 4 && (isHovered || isSelected)) {
    renderSeatNumber(ctx, seat, currentZoom);
  }
}

// ============================================
// SPECIAL SEATS
// ============================================

/**
 * Özel koltuklar (sahne, label)
 */
function renderSpecialSeat(
  ctx: CanvasRenderingContext2D,
  seat: Seat,
  zoom: number
): void {
  if (seat.seat_type === 'stage') {
    // Sahne göstergesi
    drawRect(
      ctx,
      seat.position.x - seat.width / 2,
      seat.position.y - seat.height / 2,
      seat.width,
      seat.height,
      {
        fill: '#1F2937',
        stroke: '#FFFFFF',
        strokeWidth: 2,
        opacity: 0.8,
      }
    );

    if (zoom > 1 && seat.label_text) {
      drawText(ctx, seat.label_text, seat.position.x, seat.position.y, {
        font: '14px Inter, sans-serif',
        fill: '#FFFFFF',
        align: 'center',
        baseline: 'middle',
      });
    }
  } else if (seat.seat_type === 'label') {
    // Label (Çıkış, WC, vb.)
    if (zoom > 1 && seat.label_text) {
      drawText(ctx, seat.label_text, seat.position.x, seat.position.y, {
        font: 'bold 12px Inter, sans-serif',
        fill: '#9CA3AF',
        align: 'center',
        baseline: 'middle',
      });
    }
  }
}

/**
 * Engelli koltuğu
 */
function renderWheelchairSeat(
  ctx: CanvasRenderingContext2D,
  seat: Seat,
  size: number,
  style: DrawStyle
): void {
  // Engelli koltuğu için farklı şekil (square with rounded corners)
  const rectSize = size * 1.2;
  const x = seat.position.x - rectSize / 2;
  const y = seat.position.y - rectSize / 2;

  drawRect(ctx, x, y, rectSize, rectSize, style);

  // Wheelchair icon (basit versiyon - sadece çok yakın zoom'da)
  // TODO: İkon ekle
}

// ============================================
// LABEL RENDERING
// ============================================

/**
 * Seat number çiz
 */
function renderSeatNumber(
  ctx: CanvasRenderingContext2D,
  seat: Seat,
  zoom: number
): void {
  const fontSize = Math.max(8, Math.min(12 / zoom, 16));

  drawText(ctx, seat.seat_number, seat.position.x, seat.position.y, {
    font: `bold ${fontSize}px Inter, sans-serif`,
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
    align: 'center',
    baseline: 'middle',
  });
}

// ============================================
// STYLE CALCULATION
// ============================================

/**
 * Seat style hesapla
 */
function calculateSeatStyle(
  seat: Seat,
  state: {
    isSelected: boolean;
    isHovered: boolean;
  }
): DrawStyle {
  // Base color (status'e göre)
  const baseColor = SEAT_COLORS[seat.status] || SEAT_COLORS.blocked;

  // Selected state
  if (state.isSelected) {
    return {
      fill: baseColor,
      stroke: '#FFD700', // Gold
      strokeWidth: 3,
      opacity: 1,
    };
  }

  // Hovered state
  if (state.isHovered) {
    return {
      fill: baseColor,
      stroke: '#FFFFFF',
      strokeWidth: 2,
      opacity: 1,
    };
  }

  // Normal state
  return {
    fill: baseColor,
    stroke: '#1F2937',
    strokeWidth: 1,
    opacity: seat.status === 'available' ? 1 : 0.6,
  };
}

// ============================================
// BATCH RENDERING
// ============================================

/**
 * Birden fazla koltuğu render et
 */
export function renderSeats(
  ctx: CanvasRenderingContext2D,
  seats: Seat[],
  options: RenderSeatsOptions = {}
): void {
  const {
    selectedSeatIds = new Set(),
    hoveredSeatId = null,
    blockId = null,
    ...renderOptions
  } = options;

  // Filter seats by block (if specified)
  const filteredSeats = blockId
    ? seats.filter((seat) => seat.block_id === blockId)
    : seats;

  // Render order: Normal → Hovered → Selected
  const sortedSeats = [...filteredSeats].sort((a, b) => {
    if (selectedSeatIds.has(a.id)) return 1;
    if (selectedSeatIds.has(b.id)) return -1;
    if (a.id === hoveredSeatId) return 1;
    if (b.id === hoveredSeatId) return -1;
    return 0;
  });

  // Render all seats
  sortedSeats.forEach((seat) => {
    renderSeat(ctx, seat, {
      ...renderOptions,
      isSelected: selectedSeatIds.has(seat.id),
      isHovered: seat.id === hoveredSeatId,
    });
  });
}

/**
 * Grid-based rendering (performance optimization)
 * Sadece viewport içindeki koltukları render et
 */
export function renderSeatsInViewport(
  ctx: CanvasRenderingContext2D,
  seats: Seat[],
  viewport: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  },
  options: RenderSeatsOptions = {}
): void {
  // Filter seats in viewport
  const visibleSeats = seats.filter(
    (seat) =>
      seat.position.x >= viewport.minX &&
      seat.position.x <= viewport.maxX &&
      seat.position.y >= viewport.minY &&
      seat.position.y <= viewport.maxY
  );

  renderSeats(ctx, visibleSeats, options);
}

// ============================================
// LEGEND RENDERING
// ============================================

/**
 * Seat legend çiz (durum açıklamaları)
 */
export function renderSeatLegend(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1
): void {
  const legendItems = [
    { label: 'Müsait', color: SEAT_COLORS.available },
    { label: 'Rezerve', color: SEAT_COLORS.reserved },
    { label: 'Satıldı', color: SEAT_COLORS.sold },
    { label: 'Kapalı', color: SEAT_COLORS.blocked },
  ];

  const itemHeight = 24 * scale;
  const circleSize = 8 * scale;
  const spacing = 12 * scale;

  legendItems.forEach((item, index) => {
    const itemY = y + index * itemHeight;

    // Color circle
    drawCircle(ctx, x + circleSize, itemY + circleSize, circleSize, {
      fill: item.color,
      stroke: '#374151',
      strokeWidth: 1,
    });

    // Label
    drawText(ctx, item.label, x + circleSize * 3 + spacing, itemY + circleSize, {
      font: `${12 * scale}px Inter, sans-serif`,
      fill: '#F3F4F6',
      align: 'left',
      baseline: 'middle',
    });
  });
}
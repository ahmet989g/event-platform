/**
 * Block Renderer
 * Canvas'ta blokları çizen fonksiyonlar
 */

import type { Block } from '@/types/session.types';
import {
  parseCoordinates,
  getPolygonCenter,
  adjustColor,
  type Point,
} from './geometryUtils';

// ============================================
// BLOCK DRAWING
// ============================================

/**
 * Bloğu canvas'a çiz
 */
export function drawBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  options: {
    isHovered?: boolean;
    isSelected?: boolean;
    zoom: number;
  }
): void {
  const { isHovered = false, isSelected = false, zoom } = options;

  // Koordinatları parse et
  const coordinates = parseCoordinates(block.coordinates);
  
  if (coordinates.length === 0) {
    console.warn(`Block ${block.block_number} has no valid coordinates`);
    return;
  }

  // Path oluştur
  const path = new Path2D();
  path.moveTo(coordinates[0].x, coordinates[0].y);
  
  for (let i = 1; i < coordinates.length; i++) {
    path.lineTo(coordinates[i].x, coordinates[i].y);
  }
  
  path.closePath();

  // Fill color (hover/selected durumuna göre)
  let fillColor = block.fill_color || '#6b7280';
  
  if (isSelected) {
    fillColor = adjustColor(fillColor, 40);
  } else if (isHovered) {
    fillColor = adjustColor(fillColor, 20);
  }
  
  if (zoom > 2.5) {
    fillColor = fillColor+'30';
  }

  // Fill
  ctx.fillStyle = fillColor;
  ctx.globalAlpha = 0.9;
  ctx.fill(path);
  ctx.globalAlpha = 1;

  // Stroke (kenarlık)
  ctx.strokeStyle = isHovered ? '#ffffff' : '#e5e7eb';
  ctx.lineWidth = isHovered ? 3 : 2;
  ctx.stroke(path);


  // Block numarası (zoom > 1.5 ise)
  if (zoom > 1.5) {
    drawBlockLabel(ctx, block, coordinates, zoom);
  }
}

/**
 * Block label'ı çiz (numara + kapasite)
 */
function drawBlockLabel(
  ctx: CanvasRenderingContext2D,
  block: Block,
  coordinates: Point[],
  zoom: number
): void {
  const center = getPolygonCenter(coordinates);

  // Font size zoom'a göre
  const fontSize = Math.min(24, Math.max(12, 16 * zoom));
  
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Shadow (okunabilirlik için)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  // Block numarası
  ctx.fillText(block.block_number, center.x, center.y - 8);

  // Kapasite (zoom > 2.5 ise)
  if (zoom > 2.5) {
    ctx.font = `${fontSize * 0.7}px Arial`;
    ctx.fillText(
      `${block.available_capacity}/${block.total_capacity}`,
      center.x,
      center.y + 12
    );
  }

  // Shadow sıfırla
  ctx.shadowBlur = 0;
}

// ============================================
// BLOCK UTILITIES
// ============================================

/**
 * Block outline çiz (debug için)
 */
export function drawBlockOutline(
  ctx: CanvasRenderingContext2D,
  block: Block,
  color: string = '#ff0000'
): void {
  const coordinates = parseCoordinates(block.shape_data?.coordinates);
  
  if (coordinates.length === 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  ctx.beginPath();
  ctx.moveTo(coordinates[0].x, coordinates[0].y);
  
  for (let i = 1; i < coordinates.length; i++) {
    ctx.lineTo(coordinates[i].x, coordinates[i].y);
  }
  
  ctx.closePath();
  ctx.stroke();
  
  ctx.setLineDash([]); // Reset
}

/**
 * Block merkez noktası çiz (debug için)
 */
export function drawBlockCenter(
  ctx: CanvasRenderingContext2D,
  block: Block,
  radius: number = 5
): void {
  const coordinates = parseCoordinates(block.shape_data?.coordinates);
  
  if (coordinates.length === 0) return;

  const center = getPolygonCenter(coordinates);

  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Block'un tıklanabilir alanını highlight et
 */
export function highlightBlockArea(
  ctx: CanvasRenderingContext2D,
  block: Block,
  color: string = 'rgba(59, 130, 246, 0.2)' // blue-500 with alpha
): void {
  const coordinates = parseCoordinates(block.shape_data?.coordinates);
  
  if (coordinates.length === 0) return;

  const path = new Path2D();
  path.moveTo(coordinates[0].x, coordinates[0].y);
  
  for (let i = 1; i < coordinates.length; i++) {
    path.lineTo(coordinates[i].x, coordinates[i].y);
  }
  
  path.closePath();

  ctx.fillStyle = color;
  ctx.fill(path);
}

// ============================================
// BATCH DRAWING
// ============================================

/**
 * Birden fazla bloğu çiz (performans için)
 */
export function drawBlocks(
  ctx: CanvasRenderingContext2D,
  blocks: Block[],
  options: {
    hoveredBlockId?: string | null;
    selectedBlockIds?: Set<string>;
    zoom: number;
  }
): void {
  const { hoveredBlockId, selectedBlockIds = new Set(), zoom } = options;

  blocks.forEach((block) => {
    drawBlock(ctx, block, {
      isHovered: block.id === hoveredBlockId,
      isSelected: selectedBlockIds.has(block.id),
      zoom,
    });
  });
}
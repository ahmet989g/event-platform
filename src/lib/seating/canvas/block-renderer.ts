/**
 * Block Renderer
 * Render stadium blocks (arcs, polygons, rectangles)
 * @description Event Ticketing Platform - Block drawing functions
 */

import type { Block } from '@/types/seating/block.types';
import {
  drawArc,
  drawPolygon,
  drawRect,
  drawCircle,
  drawText,
  type DrawStyle,
} from './canvas-utils';

// ============================================
// TYPES
// ============================================

interface RenderBlockOptions {
  /** Highlight edilmiş mi? */
  isHighlighted?: boolean;
  /** Seçili mi? */
  isSelected?: boolean;
  /** Hover edilmiş mi? */
  isHovered?: boolean;
  /** Block numarasını göster */
  showLabel?: boolean;
  /** Kapasiteyi göster */
  showCapacity?: boolean;
  /** Minimum zoom seviyesi (altında render etme) */
  minRenderZoom?: number;
  /** Current zoom level */
  currentZoom?: number;
}

// ============================================
// MAIN RENDER FUNCTION
// ============================================

/**
 * Block'u canvas'a çiz
 */
export function renderBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  options: RenderBlockOptions = {}
): void {
  const {
    isHighlighted = false,
    isSelected = false,
    isHovered = false,
    showLabel = true,
    showCapacity = false,
    minRenderZoom = 0.5,
    currentZoom = 1,
  } = options;

  // Minimum zoom kontrolü
  if (currentZoom < minRenderZoom) return;

  // Style hesapla
  const style = calculateBlockStyle(block, {
    isHighlighted,
    isSelected,
    isHovered,
  });

  // Shape type'a göre çiz
  switch (block.shape.type) {
    case 'arc':
      renderArcBlock(ctx, block, style);
      break;
    case 'polygon':
      renderPolygonBlock(ctx, block, style);
      break;
    case 'rectangle':
      renderRectangleBlock(ctx, block, style);
      break;
    case 'circle':
      renderCircleBlock(ctx, block, style);
      break;
    default:
      console.warn('Unknown block shape type:', block.shape.type);
  }

  // Label çiz
  if (showLabel && currentZoom > 0.7) {
    renderBlockLabel(ctx, block, showCapacity, currentZoom);
  }
}

// ============================================
// SHAPE RENDERERS
// ============================================

/**
 * Arc block çiz (stadyum tribünleri)
 */
function renderArcBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  style: DrawStyle
): void {
  if (block.shape.type !== 'arc') return;

  const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } =
    block.shape;

  drawArc(
    ctx,
    centerX,
    centerY,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    style
  );
}

/**
 * Polygon block çiz
 */
function renderPolygonBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  style: DrawStyle
): void {
  if (block.shape.type !== 'polygon') return;

  drawPolygon(ctx, block.shape.points, style);
}

/**
 * Rectangle block çiz
 */
function renderRectangleBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  style: DrawStyle
): void {
  if (block.shape.type !== 'rectangle') return;

  const { x, y, width, height } = block.shape;

  drawRect(ctx, x, y, width, height, style);
}

/**
 * Circle block çiz
 */
function renderCircleBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  style: DrawStyle
): void {
  if (block.shape.type !== 'circle') return;

  const { centerX, centerY, radius } = block.shape;

  drawCircle(ctx, centerX, centerY, radius, style);
}

// ============================================
// LABEL RENDERING
// ============================================

/**
 * Block label çiz (numara ve kapasite)
 */
function renderBlockLabel(
  ctx: CanvasRenderingContext2D,
  block: Block,
  showCapacity: boolean,
  zoom: number
): void {
  // Label pozisyonunu hesapla (block merkezi)
  const labelPos = getBlockCenter(block);

  // Font size zoom'a göre ayarla
  const baseFontSize = 16;
  const fontSize = Math.max(12, Math.min(baseFontSize / zoom, 24));

  // Block numarası
  drawText(ctx, block.block_number, labelPos.x, labelPos.y - (showCapacity ? 8 : 0), {
    font: `bold ${fontSize}px Inter, sans-serif`,
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 3,
    align: 'center',
    baseline: 'middle',
  });

  // Kapasite (opsiyonel)
  if (showCapacity && zoom > 1) {
    const capacityText = `${block.available_capacity}/${block.total_capacity}`;
    const smallFontSize = fontSize * 0.7;

    drawText(ctx, capacityText, labelPos.x, labelPos.y + 8, {
      font: `${smallFontSize}px Inter, sans-serif`,
      fill: '#CCCCCC',
      stroke: '#000000',
      strokeWidth: 2,
      align: 'center',
      baseline: 'middle',
    });
  }
}

// ============================================
// STYLE CALCULATION
// ============================================

/**
 * Block style'ını hesapla (hover, select durumlarına göre)
 */
function calculateBlockStyle(
  block: Block,
  state: {
    isHighlighted: boolean;
    isSelected: boolean;
    isHovered: boolean;
  }
): DrawStyle {
  const baseStyle: DrawStyle = {
    fill: block.style.fill,
    stroke: block.style.stroke,
    strokeWidth: block.style.strokeWidth,
    opacity: block.style.opacity,
  };

  // Selected state
  if (state.isSelected) {
    return {
      ...baseStyle,
      stroke: '#FFD700', // Gold
      strokeWidth: 4,
      opacity: 1,
    };
  }

  // Hovered state
  if (state.isHovered) {
    return {
      ...baseStyle,
      stroke: '#FFFFFF',
      strokeWidth: 3,
      opacity: 1,
    };
  }

  // Highlighted state (available seats)
  if (state.isHighlighted) {
    return {
      ...baseStyle,
      opacity: 1,
    };
  }

  // Sold out blocks (dim)
  if (block.available_capacity === 0) {
    return {
      ...baseStyle,
      opacity: 0.4,
      fill: '#666666',
    };
  }

  return baseStyle;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Block'un merkez noktasını hesapla
 */
function getBlockCenter(block: Block): { x: number; y: number } {
  switch (block.shape.type) {
    case 'arc': {
      const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } =
        block.shape;
      const midRadius = (innerRadius + outerRadius) / 2;
      const midAngle = (startAngle + endAngle) / 2;
      return {
        x: centerX + Math.cos(midAngle) * midRadius,
        y: centerY + Math.sin(midAngle) * midRadius,
      };
    }

    case 'polygon': {
      const points = block.shape.points;
      const sumX = points.reduce((sum, p) => sum + p.x, 0);
      const sumY = points.reduce((sum, p) => sum + p.y, 0);
      return {
        x: sumX / points.length,
        y: sumY / points.length,
      };
    }

    case 'rectangle': {
      return {
        x: block.shape.x + block.shape.width / 2,
        y: block.shape.y + block.shape.height / 2,
      };
    }

    case 'circle': {
      return {
        x: block.shape.centerX,
        y: block.shape.centerY,
      };
    }

    default:
      return { x: 0, y: 0 };
  }
}

/**
 * Block'un bounding box'ını hesapla
 */
export function getBlockBounds(block: Block): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  switch (block.shape.type) {
    case 'arc': {
      const { centerX, centerY, outerRadius } = block.shape;
      return {
        minX: centerX - outerRadius,
        minY: centerY - outerRadius,
        maxX: centerX + outerRadius,
        maxY: centerY + outerRadius,
      };
    }

    case 'polygon': {
      const points = block.shape.points;
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }

    case 'rectangle': {
      return {
        minX: block.shape.x,
        minY: block.shape.y,
        maxX: block.shape.x + block.shape.width,
        maxY: block.shape.y + block.shape.height,
      };
    }

    case 'circle': {
      const { centerX, centerY, radius } = block.shape;
      return {
        minX: centerX - radius,
        minY: centerY - radius,
        maxX: centerX + radius,
        maxY: centerY + radius,
      };
    }

    default:
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
}

/**
 * Tüm blockları render et
 */
export function renderBlocks(
  ctx: CanvasRenderingContext2D,
  blocks: Block[],
  options: RenderBlockOptions & {
    selectedBlockId?: string | null;
    hoveredBlockId?: string | null;
  } = {}
): void {
  const { selectedBlockId, hoveredBlockId, ...renderOptions } = options;

  // Render order: Normal → Hovered → Selected
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.id === selectedBlockId) return 1;
    if (b.id === selectedBlockId) return -1;
    if (a.id === hoveredBlockId) return 1;
    if (b.id === hoveredBlockId) return -1;
    return 0;
  });

  sortedBlocks.forEach((block) => {
    renderBlock(ctx, block, {
      ...renderOptions,
      isSelected: block.id === selectedBlockId,
      isHovered: block.id === hoveredBlockId,
    });
  });
}
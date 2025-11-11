/**
 * Block Canvas Component
 * Main canvas component for block-based seating visualization
 * @description Event Ticketing Platform - Interactive canvas viewer for blocks
 */

'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useViewport } from '@/lib/seating/canvas/useViewport';
import {
  clearCanvas,
  setupHighDPICanvas,
  applyViewportTransform,
  screenToWorld,
  isPointInArc,
  isPointInPolygon,
  isPointInCircle,
  distance,
} from '@/lib/seating/canvas/canvas-utils';
import { renderBlocks } from '@/lib/seating/canvas/block-renderer';
import { renderSeats, renderSeatLegend } from '@/lib/seating/canvas/seat-renderer';
import type { Block } from '@/types/seating/block.types';
import type { Seat } from '@/types/seating/seat.types';

// ============================================
// TYPES
// ============================================

export interface BlockCanvasProps {
  /** Blocks data */
  blocks: Block[];
  /** Seats data */
  seats: Seat[];
  /** Canvas genişliği */
  width?: number;
  /** Canvas yüksekliği */
  height?: number;
  /** Seçili block ID */
  selectedBlockId?: string | null;
  /** Seçili seat ID'leri */
  selectedSeatIds?: string[];
  /** Block seçildiğinde */
  onBlockSelect?: (blockId: string | null) => void;
  /** Seat seçildiğinde */
  onSeatSelect?: (seatId: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Show seat legend */
  showLegend?: boolean;
  /** Show block labels */
  showBlockLabels?: boolean;
  /** Show capacity */
  showCapacity?: boolean;
  /** Background color */
  backgroundColor?: string;
}

// ============================================
// COMPONENT
// ============================================

export function BlockCanvas({
  blocks,
  seats,
  width = 800,
  height = 600,
  selectedBlockId = null,
  selectedSeatIds = [],
  onBlockSelect,
  onSeatSelect,
  isLoading = false,
  showLegend = true,
  showBlockLabels = true,
  showCapacity = false,
  backgroundColor = '#1a1a1a',
}: BlockCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [hoveredSeatId, setHoveredSeatId] = useState<string | null>(null);
  const selectedSeatIdsSet = new Set(selectedSeatIds);

  // Calculate bounds and initial viewport
  const bounds = calculateSceneBounds(blocks);
  const initialViewport = calculateInitialViewport(bounds, width, height);

  // Viewport management
  const viewport = useViewport(width, height, {
    minZoom: 0.1,
    maxZoom: 10,
    initialZoom: initialViewport.zoom,
    initialCenter: initialViewport.center,
  });

  // ============================================
  // RENDER FUNCTION
  // ============================================

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    clearCanvas(ctx, width, height, backgroundColor);

    // Apply viewport transformation
    ctx.save();
    applyViewportTransform(ctx, viewport.viewport);

    // Filter out stage/field blocks - sadece tribünleri render et
    const seatingBlocks = blocks.filter(
      (block) =>
        block.block_name.toLowerCase() !== 'sahne' &&
        block.block_name.toLowerCase() !== 'stage' &&
        block.block_name.toLowerCase() !== 'field' &&
        block.block_name.toLowerCase() !== 'saha'
    );

    // Render blocks (tribünler)
    renderBlocks(ctx, seatingBlocks, {
      selectedBlockId,
      hoveredBlockId,
      showLabel: showBlockLabels,
      showCapacity,
      currentZoom: viewport.viewport.scale,
    });

    // Render stage/field label (basit text olarak)
    const stageBlock = blocks.find(
      (block) =>
        block.block_name.toLowerCase() === 'sahne' ||
        block.block_name.toLowerCase() === 'stage' ||
        block.block_name.toLowerCase() === 'field' ||
        block.block_name.toLowerCase() === 'saha'
    );
    if (stageBlock) {
      renderStageLabel(ctx, stageBlock);
    }

    // Render seats (only if zoomed in)
    if (viewport.viewport.scale > 1.5) {
      // Filter out stage seats
      const seatingSeats = seats.filter((seat) => {
        const block = blocks.find((b) => b.id === seat.block_id);
        if (!block) return true;

        const blockName = block.block_name.toLowerCase();
        return (
          blockName !== 'sahne' &&
          blockName !== 'stage' &&
          blockName !== 'field' &&
          blockName !== 'saha'
        );
      });

      renderSeats(ctx, seatingSeats, {
        selectedSeatIds: selectedSeatIdsSet,
        hoveredSeatId,
        currentZoom: viewport.viewport.scale,
        minRenderZoom: 2,
      });
    }

    ctx.restore();

    // Render UI elements (legend)
    if (showLegend) {
      renderSeatLegend(ctx, 20, height - 120, 1);
    }

    // Render loading overlay
    if (isLoading) {
      renderLoadingOverlay(ctx, width, height);
    }
  }, [
    width,
    height,
    viewport.viewport,
    blocks,
    seats,
    selectedBlockId,
    selectedSeatIds,
    hoveredBlockId,
    hoveredSeatId,
    isLoading,
    showLegend,
    showBlockLabels,
    showCapacity,
    backgroundColor,
    selectedSeatIdsSet,
  ]);

  // ============================================
  // SETUP & RENDER LOOP
  // ============================================

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setupHighDPICanvas(canvas, width, height);
  }, [width, height]);

  // Render on state change
  useEffect(() => {
    render();
  }, [render]);

  // ============================================
  // INTERACTION HANDLERS
  // ============================================

  /**
   * Canvas click handler
   */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Convert to world coordinates
      const worldPos = screenToWorld(mouseX, mouseY, viewport.viewport);

      // Check block click (only if not zoomed in too much)
      if (viewport.viewport.scale < 3 && onBlockSelect) {
        // Filter out stage blocks from click detection
        const seatingBlocks = blocks.filter(
          (block) =>
            block.block_name.toLowerCase() !== 'sahne' &&
            block.block_name.toLowerCase() !== 'stage' &&
            block.block_name.toLowerCase() !== 'field' &&
            block.block_name.toLowerCase() !== 'saha'
        );

        const clickedBlock = findBlockAtPoint(seatingBlocks, worldPos);
        if (clickedBlock) {
          onBlockSelect(clickedBlock.id);

          // Zoom to block
          const blockCenter = getBlockCenter(clickedBlock);
          viewport.zoomToPoint(blockCenter.x, blockCenter.y, 3);
          return;
        }
      }

      // Check seat click (only if zoomed in)
      if (viewport.viewport.scale > 2 && onSeatSelect) {
        // Filter out stage seats from click detection
        const seatingSeats = seats.filter((seat) => {
          const block = blocks.find((b) => b.id === seat.block_id);
          if (!block) return true;

          const blockName = block.block_name.toLowerCase();
          return (
            blockName !== 'sahne' &&
            blockName !== 'stage' &&
            blockName !== 'field' &&
            blockName !== 'saha'
          );
        });

        const clickedSeat = findSeatAtPoint(seatingSeats, worldPos);
        if (clickedSeat && clickedSeat.status === 'available') {
          onSeatSelect(clickedSeat.id);
        }
      }
    },
    [blocks, seats, viewport, onBlockSelect, onSeatSelect]
  );

  /**
   * Mouse move handler (hover detection)
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      viewport.handleMouseMove(e);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldPos = screenToWorld(mouseX, mouseY, viewport.viewport);

      // Block hover (low zoom)
      if (viewport.viewport.scale < 3) {
        // Filter out stage blocks from hover detection
        const seatingBlocks = blocks.filter(
          (block) =>
            block.block_name.toLowerCase() !== 'sahne' &&
            block.block_name.toLowerCase() !== 'stage' &&
            block.block_name.toLowerCase() !== 'field' &&
            block.block_name.toLowerCase() !== 'saha'
        );

        const hoveredBlock = findBlockAtPoint(seatingBlocks, worldPos);
        setHoveredBlockId(hoveredBlock?.id || null);
        setHoveredSeatId(null);
      }
      // Seat hover (high zoom)
      else if (viewport.viewport.scale > 2) {
        // Filter out stage seats from hover detection
        const seatingSeats = seats.filter((seat) => {
          const block = blocks.find((b) => b.id === seat.block_id);
          if (!block) return true;

          const blockName = block.block_name.toLowerCase();
          return (
            blockName !== 'sahne' &&
            blockName !== 'stage' &&
            blockName !== 'field' &&
            blockName !== 'saha'
          );
        });

        const hoveredSeat = findSeatAtPoint(seatingSeats, worldPos);
        setHoveredSeatId(hoveredSeat?.id || null);
        setHoveredBlockId(null);
      }
    },
    [blocks, seats, viewport]
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        onWheel={viewport.handleWheel}
        onMouseDown={viewport.handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={viewport.handleMouseUp}
        onMouseLeave={() => {
          viewport.handleMouseUp();
          setHoveredBlockId(null);
          setHoveredSeatId(null);
        }}
        onTouchStart={viewport.handleTouchStart}
        onTouchMove={viewport.handleTouchMove}
        onTouchEnd={viewport.handleTouchEnd}
        className="border border-gray-700 rounded-lg cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={viewport.zoomIn}
          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors"
          title="Zoom In"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        <button
          onClick={viewport.zoomOut}
          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors"
          title="Zoom Out"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>

        <button
          onClick={() => {
            viewport.zoomToPoint(
              initialViewport.center.x,
              initialViewport.center.y,
              initialViewport.zoom
            );
          }}
          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors"
          title="Fit to Screen"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      </div>

      {/* Info Tooltip */}
      {(hoveredBlockId || hoveredSeatId) && (
        <div className="absolute bottom-4 left-4 bg-gray-800/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
          {hoveredBlockId && (
            <div>
              <strong>Block:</strong>{' '}
              {blocks.find((b) => b.id === hoveredBlockId)?.block_name}
            </div>
          )}
          {hoveredSeatId && (
            <div>
              <strong>Seat:</strong>{' '}
              {seats.find((s) => s.id === hoveredSeatId)?.seat_number}
            </div>
          )}
        </div>
      )}

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 bg-gray-800/90 text-white px-3 py-1 rounded-lg text-xs">
        {Math.round(viewport.viewport.scale * 100)}%
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sahne bounds hesapla (tüm blockları kapsayan alan)
 */
function calculateSceneBounds(blocks: Block[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} {
  if (blocks.length === 0) {
    return {
      minX: -500,
      minY: -500,
      maxX: 500,
      maxY: 500,
      width: 1000,
      height: 1000,
      centerX: 0,
      centerY: 0,
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  blocks.forEach((block) => {
    if (block.shape.type === 'arc') {
      const { centerX, centerY, outerRadius } = block.shape;
      minX = Math.min(minX, centerX - outerRadius);
      minY = Math.min(minY, centerY - outerRadius);
      maxX = Math.max(maxX, centerX + outerRadius);
      maxY = Math.max(maxY, centerY + outerRadius);
    } else if (block.shape.type === 'polygon') {
      block.shape.points.forEach((p) => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
    } else if (block.shape.type === 'rectangle') {
      const { x, y, width, height } = block.shape;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    } else if (block.shape.type === 'circle') {
      const { centerX, centerY, radius } = block.shape;
      minX = Math.min(minX, centerX - radius);
      minY = Math.min(minY, centerY - radius);
      maxX = Math.max(maxX, centerX + radius);
      maxY = Math.max(maxY, centerY + radius);
    }
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return { minX, minY, maxX, maxY, width, height, centerX, centerY };
}

/**
 * Initial viewport hesapla (fit to screen)
 */
function calculateInitialViewport(
  bounds: ReturnType<typeof calculateSceneBounds>,
  canvasWidth: number,
  canvasHeight: number
): {
  center: { x: number; y: number };
  zoom: number;
} {
  // Add padding (10%)
  const padding = 1.1;
  const sceneWidth = bounds.width * padding;
  const sceneHeight = bounds.height * padding;

  // Calculate zoom to fit
  const zoomX = canvasWidth / sceneWidth;
  const zoomY = canvasHeight / sceneHeight;
  const zoom = Math.min(zoomX, zoomY);

  return {
    center: { x: bounds.centerX, y: bounds.centerY },
    zoom: Math.max(0.1, Math.min(zoom, 2)), // Clamp between 0.1 and 2
  };
}

/**
 * Sahne/Saha label'ı çiz (basit text)
 */
function renderStageLabel(ctx: CanvasRenderingContext2D, block: Block): void {
  const center = getBlockCenter(block);

  // Stage area background (optional, very subtle)
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;

  // Simple rectangle for stage
  if (block.shape.type === 'rectangle') {
    const { x, y, width, height } = block.shape;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  } else if (block.shape.type === 'circle') {
    const { centerX, centerY, radius } = block.shape;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Stage text
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.font = 'bold 48px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Stroke (outline)
  ctx.strokeText(block.block_name, center.x, center.y);
  // Fill (main text)
  ctx.fillText(block.block_name, center.x, center.y);

  ctx.restore();
}

/**
 * Loading overlay çiz
 */
function renderLoadingOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, width, height);

  ctx.font = '20px Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Yükleniyor...', width / 2, height / 2);
}

/**
 * Point'te block bul - Tüm shape tiplerini destekler
 */
function findBlockAtPoint(
  blocks: Block[],
  point: { x: number; y: number }
): Block | null {
  for (const block of blocks) {
    if (block.shape.type === 'arc') {
      const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } =
        block.shape;
      if (
        isPointInArc(
          point,
          centerX,
          centerY,
          innerRadius,
          outerRadius,
          startAngle,
          endAngle
        )
      ) {
        return block;
      }
    } else if (block.shape.type === 'polygon') {
      if (isPointInPolygon(point, block.shape.points)) {
        return block;
      }
    } else if (block.shape.type === 'circle') {
      const { centerX, centerY, radius } = block.shape;
      if (isPointInCircle(point, centerX, centerY, radius)) {
        return block;
      }
    } else if (block.shape.type === 'rectangle') {
      const { x, y, width, height } = block.shape;
      if (
        point.x >= x &&
        point.x <= x + width &&
        point.y >= y &&
        point.y <= y + height
      ) {
        return block;
      }
    }
  }

  return null;
}

/**
 * Point'te seat bul
 */
function findSeatAtPoint(
  seats: Seat[],
  point: { x: number; y: number }
): Seat | null {
  for (const seat of seats) {
    const dist = distance(point, seat.position);
    const seatRadius = Math.max(seat.width, seat.height) / 2;

    if (dist <= seatRadius) {
      return seat;
    }
  }

  return null;
}

/**
 * Block center hesapla
 */
function getBlockCenter(block: Block): { x: number; y: number } {
  if (block.shape.type === 'arc') {
    const { centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } =
      block.shape;
    const midRadius = (innerRadius + outerRadius) / 2;
    const midAngle = (startAngle + endAngle) / 2;
    return {
      x: centerX + Math.cos(midAngle) * midRadius,
      y: centerY + Math.sin(midAngle) * midRadius,
    };
  } else if (block.shape.type === 'polygon') {
    const points = block.shape.points;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    return {
      x: sumX / points.length,
      y: sumY / points.length,
    };
  } else if (block.shape.type === 'rectangle') {
    return {
      x: block.shape.x + block.shape.width / 2,
      y: block.shape.y + block.shape.height / 2,
    };
  } else if (block.shape.type === 'circle') {
    return {
      x: block.shape.centerX,
      y: block.shape.centerY,
    };
  }

  return { x: 0, y: 0 };
}
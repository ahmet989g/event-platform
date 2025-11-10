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
  backgroundColor = '#ffffff',
}: BlockCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [hoveredSeatId, setHoveredSeatId] = useState<string | null>(null);
  const selectedSeatIdsSet = new Set(selectedSeatIds);

  // Viewport management
  const viewport = useViewport(width, height, {
    minZoom: 0.5,
    maxZoom: 10,
    initialZoom: 1,
    initialCenter: { x: 0, y: 0 },
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

    // Render blocks
    renderBlocks(ctx, blocks, {
      selectedBlockId,
      hoveredBlockId,
      showLabel: showBlockLabels,
      showCapacity,
      currentZoom: viewport.viewport.scale,
    });

    // Render seats (only if zoomed in)
    if (viewport.viewport.scale > 1.5) {
      renderSeats(ctx, seats, {
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
        const clickedBlock = findBlockAtPoint(blocks, worldPos);
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
        const clickedSeat = findSeatAtPoint(seats, worldPos);
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
        const hoveredBlock = findBlockAtPoint(blocks, worldPos);
        setHoveredBlockId(hoveredBlock?.id || null);
        setHoveredSeatId(null);
      }
      // Seat hover (high zoom)
      else if (viewport.viewport.scale > 2) {
        const hoveredSeat = findSeatAtPoint(seats, worldPos);
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
          onClick={viewport.resetView}
          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors"
          title="Reset View"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
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
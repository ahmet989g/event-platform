"use client";

/**
 * Block Canvas Component
 * Canvas-based interactive stadium seating map
 * 
 * Features:
 * - Zoom: Mouse wheel (0.5x - 8x)
 * - Pan: Click & drag
 * - Block click: Auto zoom to block
 * - Seat selection: Click seats when zoomed in (>4.0x)
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setZoom,
  setPan,
  setBlocks,
  setBlocksLoading,
  setBlockSeats,
  setSeatsLoading,
  toggleSeat,
  setHoveredBlock,
  setHoveredSeat,
} from '@/store/features/ticket/ticketSlice';
import { toast } from 'react-hot-toast';
import type { Block, Seat } from '@/types/session.types';
import { drawBlock as drawBlockUtil } from '@/lib/canvas/blockRenderer';
import {
  drawBlockSeats as drawBlockSeatsUtil,
  drawSeatGridPreview,
  findSeatAtPosition
} from '@/lib/canvas/seatRenderer';
import {
  isPointInPolygon,
  parseCoordinates,
  getPolygonCenter
} from '@/lib/canvas/geometryUtils';
import { useZoomAnimation } from '@/lib/hooks/useZoomAnimation';

// Canvas config
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 800;
const FIELD_CONFIG = {
  x: 300,
  y: 250,
  width: 400,
  height: 300,
};

interface BlockCanvasProps {
  sessionId: string;
  blocks: Block[];
}

export default function BlockCanvas({ sessionId, blocks }: BlockCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useAppDispatch();

  // Redux state
  const { zoom, pan, seats, hoveredBlockId, hoveredSeatId, selectedSeats } = useAppSelector(
    (state) => state.ticket.block
  );

  console.log('blocks in BlockCanvas:', blocks);

  // Local state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Zoom animation hook
  const { animateZoomToPoint, cancelAnimation } = useZoomAnimation();

  // ============================================
  // DATA LOADING
  // ============================================

  /**
   * Blokları yükle (initial load)
   */
  useEffect(() => {
    const loadBlocks = async () => {
      try {
        dispatch(setBlocksLoading(true));

        dispatch(setBlocks(blocks || []));

      } catch (error) {
        console.error('Error loading blocks:', error);
        toast.error('Bloklar yüklenemedi');
      }
    };

    loadBlocks();
  }, [sessionId, dispatch]);

  /**
   * Bir bloğun koltukları yükle (lazy loading)
   */
  const loadBlockSeats = useCallback(async (blockId: string) => {
    // Zaten yüklü mü?
    if (seats[blockId]) return;

    try {
      dispatch(setSeatsLoading({ blockId, loading: true }));


      //dispatch(setBlockSeats({ blockId, seats: data.seats || [] }));

    } catch (error) {
      console.error('Error loading seats:', error);
      toast.error('Koltuklar yüklenemedi');
    }
  }, [seats, dispatch]);

  // ============================================
  // CANVAS RENDERING
  // ============================================

  /**
   * Canvas'ı render et
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transform
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Background
    ctx.fillStyle = '#f9fafb'; // gray-50
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Field (Saha)
    drawField(ctx);

    // 3. Blocks
    blocks.forEach((block) => {
      drawBlock(ctx, block, block.id === hoveredBlockId);

      // Seat grid preview (zoom 1.5-4 arası)
      if (zoom > 1.5 && zoom <= 4) {
        drawSeatGridPreview(ctx, block, zoom);
      }
    });

    // 4. Seats (zoom > 2.5 ve koltuklar yüklü ise)
    if (zoom > 2.5) {
      blocks.forEach((block) => {
        if (seats[block.id]) {
          drawSeats(ctx, block, seats[block.id]);
        }
      });
    }

    ctx.restore();

    // Cleanup: Cancel any ongoing animation when component unmounts
    return () => {
      cancelAnimation();
    };
  }, [zoom, pan, blocks, seats, hoveredBlockId, hoveredSeatId, selectedSeats, cancelAnimation]);

  /**
   * Saha çiz
   */
  const drawField = (ctx: CanvasRenderingContext2D) => {
    // Yeşil saha
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(FIELD_CONFIG.x, FIELD_CONFIG.y, FIELD_CONFIG.width, FIELD_CONFIG.height);

    // Beyaz kenarlık
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(FIELD_CONFIG.x, FIELD_CONFIG.y, FIELD_CONFIG.width, FIELD_CONFIG.height);

    // "SAHA" text
    if (zoom > 0.8) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.8;
      ctx.fillText('SAHA', FIELD_CONFIG.x + FIELD_CONFIG.width / 2, FIELD_CONFIG.y + FIELD_CONFIG.height / 2);
      ctx.globalAlpha = 1;
    }
  };

  /**
   * Blok çiz (utilities kullanarak)
   */
  const drawBlock = (ctx: CanvasRenderingContext2D, block: Block, isHovered: boolean) => {
    drawBlockUtil(ctx, block, {
      isHovered,
      isSelected: false,
      zoom,
    });
  };

  /**
   * Koltukları çiz (utilities kullanarak)
   */
  const drawSeats = (ctx: CanvasRenderingContext2D, block: Block, blockSeats: Seat[]) => {
    const selectedSeatIds = new Set(selectedSeats.map((s) => s.seatId));

    drawBlockSeatsUtil(ctx, block, blockSeats, {
      selectedSeatIds,
      hoveredSeatId, // Hover effect için
      zoom,
    });
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Mouse wheel: Zoom
   */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(8, zoom * delta));
    dispatch(setZoom(newZoom));
  }, [zoom, dispatch]);

  /**
   * Mouse down: Drag başlat
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  /**
   * Mouse move: Drag veya hover
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Dragging
    if (isDragging) {
      dispatch(setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
      return;
    }

    // Hover detection
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Hangi blok üzerindeyiz?
    let foundBlockId: string | null = null;
    let foundSeatId: string | null = null;

    for (const block of blocks) {
      const coordinates = parseCoordinates(block.shape_data?.coordinates);
      if (coordinates.length > 0 && isPointInPolygon({ x, y }, coordinates)) {
        foundBlockId = block.id;

        // Eğer zoom yeterli ve koltuklar yüklüyse, hangi koltuk üzerinde?
        if (zoom >= 4.0 && seats[block.id]) {
          const hoveredSeat = findSeatAtPosition({ x, y }, seats[block.id], zoom);
          if (hoveredSeat) {
            foundSeatId = hoveredSeat.id;
          }
        }

        break;
      }
    }

    dispatch(setHoveredBlock(foundBlockId));
    dispatch(setHoveredSeat(foundSeatId));
  }, [isDragging, dragStart, pan, zoom, blocks, seats, dispatch]);

  /**
   * Mouse up: Drag bitir
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Click: Blok veya koltuk seç
   */
  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Hangi blok tıklandı?
    let clickedBlock: Block | null = null;

    for (const block of blocks) {
      const coordinates = parseCoordinates(block.shape_data?.coordinates);
      if (coordinates.length > 0 && isPointInPolygon({ x, y }, coordinates)) {
        clickedBlock = block;
        break;
      }
    }

    if (!clickedBlock) return;

    // Zoom yeterli mi? (> 4.0 = Koltuk seçim seviyesi)
    if (zoom < 4.0) {
      // ============================================
      // BLOK TIKLANDI → SMOOTH ZOOM
      // ============================================

      // Bloğun merkezini hesapla
      const coordinates = parseCoordinates(clickedBlock.shape_data?.coordinates);
      const blockCenter = getPolygonCenter(coordinates);

      // Canvas merkezi
      const canvasCenter = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      };

      // Smooth zoom animation başlat
      animateZoomToPoint(zoom, pan, {
        targetZoom: 5.0,
        targetCenter: blockCenter,
        canvasCenter,
        duration: 600,
      });

      toast.success(`Blok ${clickedBlock.block_number} - Zoom yapılıyor...`);

      // Koltukları yükle (lazy loading)
      if (!seats[clickedBlock.id]) {
        loadBlockSeats(clickedBlock.id);
      }

      return;
    }

    // ============================================
    // ZOOM YETERLİ → KOLTUK SEÇİMİ
    // ============================================

    // Hangi koltuk tıklandı?
    const blockSeats = seats[clickedBlock.id];
    if (!blockSeats) return;

    const clickedSeat = findSeatAtPosition({ x, y }, blockSeats, zoom);

    if (!clickedSeat) return;

    // Koltuk müsait mi?
    if (clickedSeat.status !== 'available') {
      toast.error('Bu koltuk müsait değil');
      return;
    }

    // Koltuk seç/kaldır (toggle)
    dispatch(toggleSeat({
      seatId: clickedSeat.id,
      blockId: clickedBlock.id,
      blockNumber: clickedBlock.block_number,
      blockName: clickedBlock.name,
      rowLabel: clickedSeat.row_number || '',
      seatNumber: clickedSeat.seat_number,
      price: 1500, // TODO: Get from session_category
      color: clickedBlock.color,
    }));

  }, [blocks, seats, zoom, pan, dispatch, loadBlockSeats, animateZoomToPoint]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Koltuk Haritası
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Zoom: {zoom.toFixed(1)}x
        </div>
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={`mx-auto ${isDragging
            ? 'cursor-grabbing'
            : hoveredSeatId && zoom >= 4.0
              ? 'cursor-pointer'
              : hoveredBlockId && zoom < 4.0
                ? 'cursor-pointer'
                : 'cursor-grab'
            }`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
        />
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
        <p>🖱️ Scroll: Zoom | Sürükle: Kaydır | Tıkla: Seç</p>
        {zoom < 4.0 ? (
          <p className="mt-1 text-amber-600 dark:text-amber-400">
            💡 Bloğa tıklayarak zoom yapın veya koltuk seçmek için daha fazla zoom yapın
          </p>
        ) : (
          <p className="mt-1 text-green-600 dark:text-green-400">
            ✅ Koltuklar seçilebilir - Müsait koltuklara tıklayın
          </p>
        )}
        {selectedSeats.length > 0 && (
          <p className="mt-1 text-blue-600 dark:text-blue-400">
            🎫 {selectedSeats.length} koltuk seçildi
          </p>
        )}
      </div>
    </div>
  );
}
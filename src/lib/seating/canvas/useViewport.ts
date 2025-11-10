/**
 * Viewport Hook
 * Manage canvas viewport (zoom, pan)
 * @description Event Ticketing Platform - Viewport management
 */

'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import type { Viewport } from './canvas-utils';
import type { Point } from '@/types/seating/geometry.types';
import { screenToWorld } from './canvas-utils';

// ============================================
// TYPES
// ============================================

interface ViewportConfig {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  initialCenter?: Point;
  zoomSpeed?: number;
  panSpeed?: number;
}

interface UseViewportReturn {
  viewport: Viewport;
  setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  zoomToPoint: (worldX: number, worldY: number, targetZoom: number) => void;
  panTo: (worldX: number, worldY: number) => void;
  handleWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: () => void;
  handleTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  handleTouchEnd: () => void;
}

// ============================================
// HOOK
// ============================================

/**
 * Viewport yönetimi için hook
 * Zoom, pan ve touch gesture'ları destekler
 */
export function useViewport(
  canvasWidth: number,
  canvasHeight: number,
  config: ViewportConfig = {}
): UseViewportReturn {
  const {
    minZoom = 0.1,
    maxZoom = 10,
    initialZoom = 1,
    initialCenter = { x: 0, y: 0 },
    zoomSpeed = 0.001,
    panSpeed = 1,
  } = config;

  // Viewport state
  const [viewport, setViewport] = useState<Viewport>({
    x: initialCenter.x,
    y: initialCenter.y,
    scale: initialZoom,
    canvasWidth,
    canvasHeight,
  });

  // Pan state
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef<Point>({ x: 0, y: 0 });

  // Touch state (pinch zoom için)
  const lastTouchDistanceRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Canvas boyutu değişince viewport'u güncelle
  useEffect(() => {
    setViewport((prev) => ({
      ...prev,
      canvasWidth,
      canvasHeight,
    }));
  }, [canvasWidth, canvasHeight]);

  // ============================================
  // ZOOM FUNCTIONS
  // ============================================

  /**
   * Zoom in
   */
  const zoomIn = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, maxZoom),
    }));
  }, [maxZoom]);

  /**
   * Zoom out
   */
  const zoomOut = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, minZoom),
    }));
  }, [minZoom]);

  /**
   * Reset viewport
   */
  const resetView = useCallback(() => {
    setViewport({
      x: initialCenter.x,
      y: initialCenter.y,
      scale: initialZoom,
      canvasWidth,
      canvasHeight,
    });
  }, [initialCenter, initialZoom, canvasWidth, canvasHeight]);

  /**
   * Belirli bir noktaya zoom yap
   */
  const zoomToPoint = useCallback(
    (worldX: number, worldY: number, targetZoom: number) => {
      setViewport((prev) => ({
        ...prev,
        x: worldX,
        y: worldY,
        scale: Math.max(minZoom, Math.min(targetZoom, maxZoom)),
      }));
    },
    [minZoom, maxZoom]
  );

  /**
   * Belirli bir noktaya pan yap
   */
  const panTo = useCallback((worldX: number, worldY: number) => {
    setViewport((prev) => ({
      ...prev,
      x: worldX,
      y: worldY,
    }));
  }, []);

  // ============================================
  // MOUSE HANDLERS
  // ============================================

  /**
   * Mouse wheel (zoom)
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Mouse pozisyonundaki world koordinatı
      const worldPos = screenToWorld(mouseX, mouseY, viewport);

      // Zoom faktörü
      const zoomFactor = 1 - e.deltaY * zoomSpeed;
      const newScale = Math.max(
        minZoom,
        Math.min(viewport.scale * zoomFactor, maxZoom)
      );

      // Zoom yaparken mouse pozisyonunu sabit tut
      const scaleDiff = newScale / viewport.scale;
      const newX = worldPos.x - (mouseX - canvasWidth / 2) / newScale;
      const newY = worldPos.y - (mouseY - canvasHeight / 2) / newScale;

      setViewport({
        x: newX,
        y: newY,
        scale: newScale,
        canvasWidth,
        canvasHeight,
      });
    },
    [viewport, canvasWidth, canvasHeight, minZoom, maxZoom, zoomSpeed]
  );

  /**
   * Mouse down (pan başlat)
   */
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Sadece sol tık

    isPanningRef.current = true;
    lastMousePosRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    e.currentTarget.style.cursor = 'grabbing';
  }, []);

  /**
   * Mouse move (pan)
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isPanningRef.current) {
        // Hover için cursor değiştir
        e.currentTarget.style.cursor = 'grab';
        return;
      }

      const deltaX = (e.clientX - lastMousePosRef.current.x) * panSpeed;
      const deltaY = (e.clientY - lastMousePosRef.current.y) * panSpeed;

      setViewport((prev) => ({
        ...prev,
        x: prev.x - deltaX / prev.scale,
        y: prev.y - deltaY / prev.scale,
      }));

      lastMousePosRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    },
    [panSpeed]
  );

  /**
   * Mouse up (pan bitir)
   */
  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // ============================================
  // TOUCH HANDLERS
  // ============================================

  /**
   * Touch start
   */
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      // Single touch - pan
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      // Two fingers - pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      lastTouchDistanceRef.current = distance;
    }
  }, []);

  /**
   * Touch move
   */
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      if (e.touches.length === 1 && touchStartRef.current) {
        // Pan
        const deltaX = (e.touches[0].clientX - touchStartRef.current.x) * panSpeed;
        const deltaY = (e.touches[0].clientY - touchStartRef.current.y) * panSpeed;

        setViewport((prev) => ({
          ...prev,
          x: prev.x - deltaX / prev.scale,
          y: prev.y - deltaY / prev.scale,
        }));

        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      } else if (e.touches.length === 2) {
        // Pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        if (lastTouchDistanceRef.current > 0) {
          const zoomFactor = distance / lastTouchDistanceRef.current;
          
          setViewport((prev) => ({
            ...prev,
            scale: Math.max(
              minZoom,
              Math.min(prev.scale * zoomFactor, maxZoom)
            ),
          }));
        }

        lastTouchDistanceRef.current = distance;
      }
    },
    [panSpeed, minZoom, maxZoom]
  );

  /**
   * Touch end
   */
  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    lastTouchDistanceRef.current = 0;
  }, []);

  // ============================================
  // RETURN
  // ============================================

  return {
    viewport,
    setViewport,
    zoomIn,
    zoomOut,
    resetView,
    zoomToPoint,
    panTo,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
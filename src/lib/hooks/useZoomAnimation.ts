/**
 * useZoomAnimation Hook
 * Smooth zoom animation for canvas
 */

import { useRef, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setZoom, setPan } from '@/store/features/ticket/ticketSlice';
import { easeInOutCubic, lerpPoint, type Point } from '@/lib/canvas/geometryUtils';

interface ZoomAnimationConfig {
  targetZoom: number;
  targetCenter: Point;
  canvasCenter: Point;
  duration?: number; // ms (default: 500)
}

export function useZoomAnimation() {
  const dispatch = useAppDispatch();
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  /**
   * Cancel any ongoing animation
   */
  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      startTimeRef.current = null;
    }
  }, []);

  /**
   * Animate zoom to a specific point
   */
  const animateZoomToPoint = useCallback(
    (
      currentZoom: number,
      currentPan: Point,
      config: ZoomAnimationConfig
    ) => {
      const {
        targetZoom,
        targetCenter,
        canvasCenter,
        duration = 500,
      } = config;

      // Cancel any existing animation
      cancelAnimation();

      // Start values
      const startZoom = currentZoom;
      const startPan = { ...currentPan };

      // Target pan (center the targetCenter point on canvas)
      const targetPan = {
        x: canvasCenter.x - targetCenter.x * targetZoom,
        y: canvasCenter.y - targetCenter.y * targetZoom,
      };

      // Animation function
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Easing
        const eased = easeInOutCubic(progress);

        // Interpolate zoom
        const newZoom = startZoom + (targetZoom - startZoom) * eased;
        dispatch(setZoom(newZoom));

        // Interpolate pan
        const newPan = lerpPoint(startPan, targetPan, eased);
        dispatch(setPan(newPan));

        // Continue animation
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete
          animationFrameRef.current = null;
          startTimeRef.current = null;
        }
      };

      // Start animation
      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [dispatch, cancelAnimation]
  );

  /**
   * Smooth zoom in/out (without panning)
   */
  const animateZoom = useCallback(
    (currentZoom: number, targetZoom: number, duration = 300) => {
      cancelAnimation();

      const startZoom = currentZoom;
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        const newZoom = startZoom + (targetZoom - startZoom) * eased;
        dispatch(setZoom(newZoom));

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          animationFrameRef.current = null;
          startTimeRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [dispatch, cancelAnimation]
  );

  return {
    animateZoomToPoint,
    animateZoom,
    cancelAnimation,
  };
}
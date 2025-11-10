/**
 * Canvas Drawing Utilities
 * Core drawing functions for stadium seating visualization
 * @description Event Ticketing Platform - Canvas rendering utilities
 */

import type { Point } from '@/types/seating/geometry.types';

// ============================================
// TYPES
// ============================================

export interface DrawStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  lineJoin?: CanvasLineJoin;
  lineCap?: CanvasLineCap;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
}

// ============================================
// CANVAS SETUP
// ============================================

/**
 * Canvas'ı temizle
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor: string = '#1a1a1a'
): void {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Canvas'ı high DPI için ayarla
 */
export function setupHighDPICanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  
  // Canvas internal resolution
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  
  // Canvas display size
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  // Scale context to match DPR
  ctx.scale(dpr, dpr);
  
  return ctx;
}

// ============================================
// VIEWPORT TRANSFORMATION
// ============================================

/**
 * Viewport transformation uygula
 */
export function applyViewportTransform(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport
): void {
  // Canvas'ı viewport merkeze al
  const centerX = viewport.canvasWidth / 2;
  const centerY = viewport.canvasHeight / 2;
  
  ctx.translate(centerX, centerY);
  ctx.scale(viewport.scale, viewport.scale);
  ctx.translate(-viewport.x, -viewport.y);
}

/**
 * Screen koordinatını world koordinatına çevir
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: Viewport
): Point {
  const centerX = viewport.canvasWidth / 2;
  const centerY = viewport.canvasHeight / 2;
  
  const worldX = (screenX - centerX) / viewport.scale + viewport.x;
  const worldY = (screenY - centerY) / viewport.scale + viewport.y;
  
  return { x: worldX, y: worldY };
}

/**
 * World koordinatını screen koordinatına çevir
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  viewport: Viewport
): Point {
  const centerX = viewport.canvasWidth / 2;
  const centerY = viewport.canvasHeight / 2;
  
  const screenX = (worldX - viewport.x) * viewport.scale + centerX;
  const screenY = (worldY - viewport.y) * viewport.scale + centerY;
  
  return { x: screenX, y: screenY };
}

// ============================================
// DRAWING PRIMITIVES
// ============================================

/**
 * Dikdörtgen çiz
 */
export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  style: DrawStyle
): void {
  ctx.save();
  
  if (style.opacity !== undefined) {
    ctx.globalAlpha = style.opacity;
  }
  
  if (style.fill) {
    ctx.fillStyle = style.fill;
    ctx.fillRect(x, y, width, height);
  }
  
  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth || 1;
    ctx.strokeRect(x, y, width, height);
  }
  
  ctx.restore();
}

/**
 * Daire çiz
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  style: DrawStyle
): void {
  ctx.save();
  
  if (style.opacity !== undefined) {
    ctx.globalAlpha = style.opacity;
  }
  
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  
  if (style.fill) {
    ctx.fillStyle = style.fill;
    ctx.fill();
  }
  
  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth || 1;
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Arc (yay) çiz - Stadyum tribünleri için
 */
export function drawArc(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  style: DrawStyle
): void {
  ctx.save();
  
  if (style.opacity !== undefined) {
    ctx.globalAlpha = style.opacity;
  }
  
  ctx.beginPath();
  
  // Outer arc
  ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle, false);
  
  // Inner arc (reverse)
  ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
  
  ctx.closePath();
  
  if (style.fill) {
    ctx.fillStyle = style.fill;
    ctx.fill();
  }
  
  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth || 1;
    ctx.lineJoin = style.lineJoin || 'miter';
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Polygon çiz
 */
export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  style: DrawStyle
): void {
  if (points.length < 3) return;
  
  ctx.save();
  
  if (style.opacity !== undefined) {
    ctx.globalAlpha = style.opacity;
  }
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.closePath();
  
  if (style.fill) {
    ctx.fillStyle = style.fill;
    ctx.fill();
  }
  
  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth || 1;
    ctx.lineJoin = style.lineJoin || 'miter';
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Text çiz (block numaraları için)
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: {
    font?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    opacity?: number;
  }
): void {
  ctx.save();
  
  if (style.opacity !== undefined) {
    ctx.globalAlpha = style.opacity;
  }
  
  ctx.font = style.font || '14px Inter, sans-serif';
  ctx.textAlign = style.align || 'center';
  ctx.textBaseline = style.baseline || 'middle';
  
  // Stroke first (outline)
  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth || 3;
    ctx.strokeText(text, x, y);
  }
  
  // Fill (main text)
  if (style.fill) {
    ctx.fillStyle = style.fill;
    ctx.fillText(text, x, y);
  }
  
  ctx.restore();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Nokta polygon içinde mi?
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Nokta arc içinde mi?
 */
export function isPointInArc(
  point: Point,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): boolean {
  const dx = point.x - centerX;
  const dy = point.y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Check radius
  if (distance < innerRadius || distance > outerRadius) {
    return false;
  }
  
  // Check angle
  let angle = Math.atan2(dy, dx);
  if (angle < 0) angle += Math.PI * 2;
  
  // Normalize angles
  let start = startAngle;
  let end = endAngle;
  
  if (start < 0) start += Math.PI * 2;
  if (end < 0) end += Math.PI * 2;
  
  if (start <= end) {
    return angle >= start && angle <= end;
  } else {
    return angle >= start || angle <= end;
  }
}

/**
 * Nokta daire içinde mi?
 */
export function isPointInCircle(
  point: Point,
  centerX: number,
  centerY: number,
  radius: number
): boolean {
  const dx = point.x - centerX;
  const dy = point.y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance <= radius;
}

/**
 * İki nokta arası mesafe
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Açıyı normalize et (0 - 2π)
 */
export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += Math.PI * 2;
  while (angle > Math.PI * 2) angle -= Math.PI * 2;
  return angle;
}

/**
 * Derece'yi radyan'a çevir
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Radyan'ı derece'ye çevir
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}
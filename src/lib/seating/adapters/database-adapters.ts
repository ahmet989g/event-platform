/**
 * Database Adapters
 * Convert new seating types to database format
 * @description Adapters for blocks and seats between new types and legacy database
 */

import type { Block as NewBlock } from '@/types/seating/block.types';
import type { Seat as NewSeat } from '@/types/seating/seat.types';
import type { Block as LegacyBlock, Seat as LegacySeat } from '@/types/session.types';

// ============================================
// BLOCK ADAPTERS
// ============================================

/**
 * Yeni Block type'ı database format'ına çevir
 * @param newBlock - Yeni seating block type
 * @returns Legacy database format
 */
export function adaptBlockToDatabase(newBlock: NewBlock): LegacyBlock {
  const { shape, style, viewport_data, metadata } = newBlock;

  // Shape'i ShapeData format'ına çevir
  const shapeData: LegacyBlock['shape_data'] = {
    type: shape.type,
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
    opacity: style.opacity,
  };

  // Arc-specific properties
  if (shape.type === 'arc') {
    Object.assign(shapeData, {
      startAngle: shape.startAngle,
      endAngle: shape.endAngle,
      innerRadius: shape.innerRadius,
      outerRadius: shape.outerRadius,
    });
  }

  // Polygon-specific properties
  if (shape.type === 'polygon') {
    shapeData.points = shape.points.map((p) => [p.x, p.y]);
  }

  // Rectangle-specific properties
  if (shape.type === 'rectangle') {
    Object.assign(shapeData, {
      width: shape.width,
      height: shape.height,
    });
  }

  // Circle-specific properties
  if (shape.type === 'circle') {
    shapeData.radius = shape.radius;
  }

  // ViewportData conversion
  const viewportData: LegacyBlock['viewport_data'] = {
    center: viewport_data.center,
    zoom_scale: viewport_data.zoomScale,
  };

  // SeatGrid conversion (if exists)
  if (viewport_data.seatGrid) {
    viewportData.seat_grid = {
      rows: viewport_data.seatGrid.rows,
      columns: viewport_data.seatGrid.cols,
      row_labels: generateRowLabels(viewport_data.seatGrid.rows),
      start_seat_number: 1,
    };
  }

  // Legacy format
  return {
    id: newBlock.id,
    session_id: newBlock.session_id,
    name: newBlock.block_name, // Legacy 'name' field
    block_number: newBlock.block_number,
    block_name: newBlock.block_name,
    color: style.fill || '#CCCCCC',
    total_capacity: newBlock.total_capacity,
    available_capacity: newBlock.available_capacity,
    geometry_type: shape.type,
    shape_data: shapeData,
    position_x: shape.type === 'arc' ? shape.centerX : 0,
    position_y: shape.type === 'arc' ? shape.centerY : 0,
    zoom_level: 1,
    min_zoom: 0.5,
    max_zoom: 4.0,
    parent_block_id: null,
    viewport_data: viewportData,
    sort_order: newBlock.display_order,
    display_order: newBlock.display_order,
    is_active: true,
    metadata: metadata,
    style: style,
    created_at: newBlock.created_at,
    updated_at: newBlock.updated_at,
  };
}

/**
 * Database format'ı yeni Block type'a çevir
 * @param legacyBlock - Legacy database format
 * @returns New seating block type
 */
export function adaptBlockFromDatabase(legacyBlock: LegacyBlock): NewBlock {
  const { shape_data, viewport_data, metadata, style } = legacyBlock;

  // ShapeData'yı Shape'e çevir
  let shape: NewBlock['shape'];

  switch (shape_data.type) {
    case 'arc':
      shape = {
        type: 'arc',
        centerX: legacyBlock.position_x,
        centerY: legacyBlock.position_y,
        innerRadius: shape_data.innerRadius!,
        outerRadius: shape_data.outerRadius!,
        startAngle: shape_data.startAngle!,
        endAngle: shape_data.endAngle!,
      };
      break;

    case 'polygon':
      shape = {
        type: 'polygon',
        points: shape_data.points!.map(([x, y]) => ({ x, y })),
      };
      break;

    case 'rectangle':
      shape = {
        type: 'rectangle',
        x: legacyBlock.position_x,
        y: legacyBlock.position_y,
        width: shape_data.width!,
        height: shape_data.height!,
      };
      break;

    case 'circle':
      shape = {
        type: 'circle',
        centerX: legacyBlock.position_x,
        centerY: legacyBlock.position_y,
        radius: shape_data.radius!,
      };
      break;

    default:
      // Custom path fallback
      shape = {
        type: 'custom_path',
        path: shape_data.path || '',
      };
  }

  // Style conversion
  const shapeStyle: NewBlock['style'] = {
    fill: style?.fill || shape_data.fill || legacyBlock.color,
    stroke: style?.stroke || shape_data.stroke || '#FFFFFF',
    strokeWidth: style?.strokeWidth || shape_data.strokeWidth || 2,
    opacity: style?.opacity || shape_data.opacity || 0.9,
  };

  // ViewportData conversion
  const viewportDataNew: NewBlock['viewport_data'] = {
    center: viewport_data.center,
    zoomScale: viewport_data.zoom_scale,
  };

  // SeatGrid conversion (if exists)
  if (viewport_data.seat_grid) {
    viewportDataNew.seatGrid = {
      rows: viewport_data.seat_grid.rows,
      cols: viewport_data.seat_grid.columns,
      rowSpacing: 10,
      colSpacing: 10,
      startX: viewport_data.center.x - (viewport_data.seat_grid.columns * 10) / 2,
      startY: viewport_data.center.y - (viewport_data.seat_grid.rows * 10) / 2,
      seatWidth: 8,
      seatHeight: 8,
    };
  }

  return {
    id: legacyBlock.id,
    session_id: legacyBlock.session_id,
    block_number: legacyBlock.block_number || legacyBlock.name,
    block_name: legacyBlock.block_name || legacyBlock.name,
    shape,
    style: shapeStyle,
    viewport_data: viewportDataNew,
    total_capacity: legacyBlock.total_capacity,
    available_capacity: legacyBlock.available_capacity,
    display_order: legacyBlock.display_order || legacyBlock.sort_order,
    metadata: metadata || {
      section: 'east',
      tier: 'lower',
      group: 'east_lower_center',
    },
    created_at: legacyBlock.created_at,
    updated_at: legacyBlock.updated_at,
  };
}

// ============================================
// SEAT ADAPTERS
// ============================================

/**
 * Yeni Seat type'ı database format'ına çevir
 * @param newSeat - Yeni seating seat type
 * @returns Legacy database format
 */
export function adaptSeatToDatabase(newSeat: NewSeat): LegacySeat {
  return {
    id: newSeat.id,
    session_id: newSeat.session_id,
    block_id: newSeat.block_id,
    seat_number: newSeat.seat_number,
    row_number: newSeat.row_number,
    row_index: newSeat.row_index,
    col_index: newSeat.col_index,
    column_number: newSeat.col_index + 1, // 0-indexed to 1-indexed
    position_x: newSeat.position.x,
    position_y: newSeat.position.y,
    position: newSeat.position,
    seat_type: newSeat.seat_type,
    status: newSeat.status,
    label_text: newSeat.label_text,
    rotation: newSeat.rotation,
    width: newSeat.width,
    height: newSeat.height,
    metadata: newSeat.metadata,
    created_at: newSeat.created_at,
    updated_at: newSeat.updated_at,
  };
}

/**
 * Database format'ı yeni Seat type'a çevir
 * @param legacySeat - Legacy database format
 * @returns New seating seat type
 */
export function adaptSeatFromDatabase(legacySeat: LegacySeat): NewSeat {
  // Position handling (JSONB or separate fields)
  const position = legacySeat.position || {
    x: legacySeat.position_x,
    y: legacySeat.position_y,
  };

  return {
    id: legacySeat.id,
    session_id: legacySeat.session_id,
    block_id: legacySeat.block_id,
    seat_number: legacySeat.seat_number,
    row_number: legacySeat.row_number || 'A',
    row_index: legacySeat.row_index || 0,
    col_index: legacySeat.col_index || 0,
    position,
    seat_type: legacySeat.seat_type,
    status: legacySeat.status,
    width: legacySeat.width,
    height: legacySeat.height,
    rotation: legacySeat.rotation,
    label_text: legacySeat.label_text,
    metadata: legacySeat.metadata || {},
    created_at: legacySeat.created_at,
    updated_at: legacySeat.updated_at,
  };
}

// ============================================
// BATCH ADAPTERS
// ============================================

/**
 * Birden fazla block'u database format'ına çevir
 */
export function adaptBlocksToDatabase(blocks: NewBlock[]): LegacyBlock[] {
  return blocks.map(adaptBlockToDatabase);
}

/**
 * Birden fazla seat'i database format'ına çevir
 */
export function adaptSeatsToDatabase(seats: NewSeat[]): LegacySeat[] {
  return seats.map(adaptSeatToDatabase);
}

/**
 * Database'den gelen block'ları yeni format'a çevir
 */
export function adaptBlocksFromDatabase(blocks: LegacyBlock[]): NewBlock[] {
  return blocks.map(adaptBlockFromDatabase);
}

/**
 * Database'den gelen seat'leri yeni format'a çevir
 */
export function adaptSeatsFromDatabase(seats: LegacySeat[]): NewSeat[] {
  return seats.map(adaptSeatFromDatabase);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Row labels oluştur (A, B, C, ..., AA, AB)
 */
function generateRowLabels(count: number): string[] {
  const labels: string[] = [];
  for (let i = 0; i < count; i++) {
    labels.push(getRowLetter(i));
  }
  return labels;
}

/**
 * Index'i row letter'a çevir
 */
function getRowLetter(index: number): string {
  if (index < 26) {
    return String.fromCharCode(65 + index);
  } else {
    const firstLetter = String.fromCharCode(65 + Math.floor(index / 26) - 1);
    const secondLetter = String.fromCharCode(65 + (index % 26));
    return firstLetter + secondLetter;
  }
}
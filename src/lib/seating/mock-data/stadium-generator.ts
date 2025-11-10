/**
 * Stadium Generator
 * Main entry point for generating complete stadium mock data
 * @description Generates 30K capacity football stadium with blocks and seats
 */

import { generateStadiumBlocks, getBlockCount, getTotalCapacity } from './block-generator';
import { generateCompleteSeatingLayout, printSeatingLayoutSummary } from './seat-generator';
import type { Block } from '@/types/seating/block.types';
import type { Seat } from '@/types/seating/seat.types';

// ============================================
// MAIN GENERATOR
// ============================================

/**
 * Tam stadyum mock data'sı oluştur
 * @param sessionId - Session UUID
 * @returns Complete stadium data
 */
export function generateStadiumMockData(sessionId: string): {
  blocks: Block[];
  seats: Seat[];
  summary: {
    blockCount: number;
    totalCapacity: number;
    availableSeats: number;
    soldSeats: number;
    reservedSeats: number;
    blockedSeats: number;
  };
} {
  console.log('🏟️  Generating stadium mock data...');

  // 1. Blokları oluştur
  const blocks = generateStadiumBlocks(sessionId);
  console.log(`✅ Generated ${blocks.length} blocks`);

  // 2. Koltukları oluştur
  const layout = generateCompleteSeatingLayout(sessionId, blocks);
  console.log(`✅ Generated ${layout.seats.length} seats`);

  // 3. Özet
  const summary = {
    blockCount: layout.statistics.blockCount,
    totalCapacity: layout.statistics.seatCount,
    availableSeats: layout.statistics.availableSeats,
    soldSeats: layout.statistics.soldSeats,
    reservedSeats: layout.statistics.reservedSeats,
    blockedSeats: layout.seats.filter((s) => s.status === 'blocked').length,
  };

  printSeatingLayoutSummary(layout);

  return {
    blocks: layout.blocks,
    seats: layout.seats,
    summary,
  };
}

// ============================================
// EXPORT UTILITIES
// ============================================

/**
 * JSON formatında export et
 * @param sessionId - Session UUID
 * @returns JSON string
 */
export function exportStadiumDataAsJSON(sessionId: string): string {
  const data = generateStadiumMockData(sessionId);
  return JSON.stringify(data, null, 2);
}

/**
 * SQL INSERT statements oluştur (opsiyonel)
 * @param sessionId - Session UUID
 * @returns SQL INSERT statements
 */
export function exportStadiumDataAsSQL(sessionId: string): {
  blockInserts: string[];
  seatInserts: string[];
} {
  const data = generateStadiumMockData(sessionId);

  // Block INSERT statements
  const blockInserts = data.blocks.map((block) => {
    return `
INSERT INTO blocks (
  id, session_id, block_number, block_name, 
  shape, style, viewport_data, 
  total_capacity, available_capacity, display_order, metadata,
  created_at, updated_at
) VALUES (
  '${block.id}',
  '${block.session_id}',
  '${block.block_number}',
  '${block.block_name}',
  '${JSON.stringify(block.shape).replace(/'/g, "''")}',
  '${JSON.stringify(block.style).replace(/'/g, "''")}',
  '${JSON.stringify(block.viewport_data).replace(/'/g, "''")}',
  ${block.total_capacity},
  ${block.available_capacity},
  ${block.display_order},
  '${JSON.stringify(block.metadata).replace(/'/g, "''")}',
  '${block.created_at}',
  '${block.updated_at}'
);`.trim();
  });

  // Seat INSERT statements (batch olarak grupla)
  const BATCH_SIZE = 100;
  const seatInserts: string[] = [];

  for (let i = 0; i < data.seats.length; i += BATCH_SIZE) {
    const batch = data.seats.slice(i, i + BATCH_SIZE);
    const values = batch
      .map(
        (seat) => `(
      '${seat.id}',
      '${seat.session_id}',
      '${seat.block_id}',
      '${seat.seat_number}',
      '${seat.row_number}',
      ${seat.row_index},
      ${seat.col_index},
      '${JSON.stringify(seat.position).replace(/'/g, "''")}',
      '${seat.seat_type}',
      '${seat.status}',
      ${seat.width},
      ${seat.height},
      ${seat.rotation},
      ${seat.label_text ? `'${seat.label_text}'` : 'NULL'},
      '${JSON.stringify(seat.metadata).replace(/'/g, "''")}',
      '${seat.created_at}',
      '${seat.updated_at}'
    )`
      )
      .join(',\n');

    seatInserts.push(`
INSERT INTO seats (
  id, session_id, block_id, seat_number, row_number,
  row_index, col_index, position, seat_type, status,
  width, height, rotation, label_text, metadata,
  created_at, updated_at
) VALUES
${values};
    `.trim());
  }

  return { blockInserts, seatInserts };
}

// ============================================
// VALIDATION
// ============================================

/**
 * Oluşturulan data'yı validate et
 */
export function validateStadiumData(data: ReturnType<typeof generateStadiumMockData>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Blok sayısı kontrolü
  const expectedBlockCount = getBlockCount();
  if (data.blocks.length !== expectedBlockCount) {
    errors.push(`Expected ${expectedBlockCount} blocks, got ${data.blocks.length}`);
  }

  // Kapasite kontrolü (28K-32K arası olmalı)
  if (data.summary.totalCapacity < 28000 || data.summary.totalCapacity > 32000) {
    warnings.push(
      `Total capacity ${data.summary.totalCapacity} is outside target range (28K-32K)`
    );
  }

  // Her blokta koltuk var mı?
  const seatsPerBlock = new Map<string, number>();
  data.seats.forEach((seat) => {
    if (seat.block_id) {
      seatsPerBlock.set(seat.block_id, (seatsPerBlock.get(seat.block_id) || 0) + 1);
    }
  });

  data.blocks.forEach((block) => {
    const seatCount = seatsPerBlock.get(block.id) || 0;
    if (seatCount === 0) {
      errors.push(`Block ${block.block_number} has no seats`);
    }
    if (seatCount !== block.total_capacity) {
      errors.push(
        `Block ${block.block_number}: expected ${block.total_capacity} seats, got ${seatCount}`
      );
    }
  });

  // Seat numbering unique mi?
  const seatNumbers = new Set(data.seats.map((s) => s.seat_number));
  if (seatNumbers.size !== data.seats.length) {
    errors.push('Duplicate seat numbers found');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// EXAMPLE USAGE
// ============================================

/**
 * Örnek kullanım (test için)
 */
export function exampleUsage() {
  const sessionId = 'test-session-id';

  // Mock data oluştur
  const stadiumData = generateStadiumMockData(sessionId);

  // Validate et
  const validation = validateStadiumData(stadiumData);
  console.log('Validation:', validation);

  // JSON export
  const json = exportStadiumDataAsJSON(sessionId);
  console.log('JSON exported, length:', json.length);

  return stadiumData;
}
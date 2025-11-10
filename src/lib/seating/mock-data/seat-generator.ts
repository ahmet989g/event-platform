/**
 * Seat Generator
 * Generate individual seats within blocks
 * @description Creates seat data for stadium blocks using arc-based positioning
 */

import { v4 as uuidv4 } from 'uuid';
import type { Seat, SeatStatus } from '@/types/seating/seat.types';
import type { Block } from '@/types/seating/block.types';
import { generateSeatsInArc } from './arc-calculator';

// ============================================
// SEAT GENERATION
// ============================================

/**
 * Tek bir blok için tüm koltukları oluştur
 * @param block - Blok bilgisi
 * @param sessionId - Session UUID
 * @returns Koltuk array
 */
export function generateSeatsForBlock(block: Block, sessionId: string): Seat[] {
  const { id: blockId, block_number, shape, viewport_data } = block;

  // Arc shape değilse hata
  if (shape.type !== 'arc') {
    throw new Error(`Unsupported shape type: ${shape.type}`);
  }

  const { seatGrid } = viewport_data;
  if (!seatGrid) {
    throw new Error(`Seat grid not defined for block ${block_number}`);
  }

  // Arc içinde koltuk pozisyonlarını hesapla
  const seatPositions = generateSeatsInArc(
    {
      centerX: shape.centerX,
      centerY: shape.centerY,
      innerRadius: shape.innerRadius,
      outerRadius: shape.outerRadius,
      startAngle: shape.startAngle,
      endAngle: shape.endAngle,
    },
    seatGrid.rows,
    seatGrid.cols,
    seatGrid.seatWidth,
    seatGrid.seatHeight
  );

  // Her pozisyon için seat oluştur
  return seatPositions.map(({ row, col, position }) => {
    const rowLetter = getRowLetter(row);
    const colNumber = col + 1;
    const seatNumber = `${block_number}-${rowLetter}-${colNumber}`;

    return {
      id: uuidv4(),
      session_id: sessionId,
      block_id: blockId,
      seat_number: seatNumber,
      row_number: rowLetter,
      row_index: row,
      col_index: col,
      position: position,
      seat_type: 'regular',
      status: getRandomSeatStatus(), // Mock data için random status
      width: seatGrid.seatWidth,
      height: seatGrid.seatHeight,
      rotation: 0,
      label_text: null,
      metadata: {
        isAisle: col === 0 || col === seatGrid.cols - 1,
        hasObstruction: false,
        viewRating: calculateViewRating(row, seatGrid.rows),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}

/**
 * Tüm bloklar için koltuk oluştur
 * @param blocks - Blok array
 * @param sessionId - Session UUID
 * @returns Tüm koltuklar
 */
export function generateSeatsForAllBlocks(blocks: Block[], sessionId: string): Seat[] {
  const allSeats: Seat[] = [];

  for (const block of blocks) {
    try {
      const seats = generateSeatsForBlock(block, sessionId);
      allSeats.push(...seats);
    } catch (error) {
      console.error(`Error generating seats for block ${block.block_number}:`, error);
    }
  }

  return allSeats;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sıra indexini harfe çevir (0 -> A, 1 -> B, ..., 25 -> Z, 26 -> AA)
 */
function getRowLetter(rowIndex: number): string {
  if (rowIndex < 26) {
    return String.fromCharCode(65 + rowIndex); // A-Z
  } else {
    // AA, AB, AC...
    const firstLetter = String.fromCharCode(65 + Math.floor(rowIndex / 26) - 1);
    const secondLetter = String.fromCharCode(65 + (rowIndex % 26));
    return firstLetter + secondLetter;
  }
}

/**
 * Mock data için random seat status oluştur
 */
function getRandomSeatStatus(): SeatStatus {
  return 'available';
}

/**
 * Görüş kalitesi hesapla (ön sıralar daha iyi)
 */
function calculateViewRating(rowIndex: number, totalRows: number): 1 | 2 | 3 | 4 | 5 {
  const percentage = rowIndex / totalRows;

  if (percentage < 0.2) return 5; // İlk %20 -> 5 yıldız
  if (percentage < 0.4) return 4;
  if (percentage < 0.6) return 3;
  if (percentage < 0.8) return 2;
  return 1; // Son %20 -> 1 yıldız
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Belirli bir session için tüm blok ve koltukları oluştur
 * @param sessionId - Session UUID
 * @param blocks - Blok array
 * @returns { blocks, seats, totalCapacity }
 */
export function generateCompleteSeatingLayout(
  sessionId: string,
  blocks: Block[]
): {
  blocks: Block[];
  seats: Seat[];
  totalCapacity: number;
  statistics: {
    blockCount: number;
    seatCount: number;
    availableSeats: number;
    soldSeats: number;
    reservedSeats: number;
  };
} {
  const seats = generateSeatsForAllBlocks(blocks, sessionId);

  // İstatistikler
  const statistics = {
    blockCount: blocks.length,
    seatCount: seats.length,
    availableSeats: seats.filter((s) => s.status === 'available').length,
    soldSeats: seats.filter((s) => s.status === 'sold').length,
    reservedSeats: seats.filter((s) => s.status === 'reserved').length,
  };

  return {
    blocks,
    seats,
    totalCapacity: seats.length,
    statistics,
  };
}

// ============================================
// EXPORT FOR TESTING
// ============================================

/**
 * Console'da özet yazdır
 */
export function printSeatingLayoutSummary(layout: ReturnType<typeof generateCompleteSeatingLayout>): void {
  console.log('=== STADIUM SEATING LAYOUT ===');
  console.log(`Total Blocks: ${layout.statistics.blockCount}`);
  console.log(`Total Seats: ${layout.statistics.seatCount}`);
  console.log(`Available: ${layout.statistics.availableSeats}`);
  console.log(`Sold: ${layout.statistics.soldSeats}`);
  console.log(`Reserved: ${layout.statistics.reservedSeats}`);
  console.log('==============================');
}
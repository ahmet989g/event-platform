/**
 * Block Generator
 * Generate mock block data for stadium seating
 * @description Creates realistic block structures for 30K football stadium
 */

import { v4 as uuidv4 } from 'uuid';
import type { Block, BlockGroup, BlockSection, BlockTier } from '@/types/seating/block.types';
import type { ArcShape } from '@/types/seating/geometry.types';
import {
  STADIUM_DIMENSIONS,
  BLOCK_RADII,
  PRICE_CATEGORIES,
  CAPACITY_BREAKDOWN,
  SEATS_PER_BLOCK,
} from './stadium-config';
import { calculateArcPoints, getArcCenter } from './arc-calculator';

// ============================================
// BLOCK GENERATION
// ============================================

/**
 * Tek bir blok oluştur
 */
function createBlock(config: {
  sessionId: string;
  blockNumber: string;
  blockName: string;
  group: BlockGroup;
  section: BlockSection;
  tier: BlockTier;
  arcConfig: {
    startAngle: number;
    endAngle: number;
    innerRadius: number;
    outerRadius: number;
  };
  seatConfig: {
    rows: number;
    cols: number;
  };
  displayOrder: number;
}): Block {
  const {
    sessionId,
    blockNumber,
    blockName,
    group,
    section,
    tier,
    arcConfig,
    seatConfig,
    displayOrder,
  } = config;

  const priceCategory = PRICE_CATEGORIES[group];
  const { CENTER_X: centerX, CENTER_Y: centerY } = STADIUM_DIMENSIONS;

  // Arc shape oluştur
  const arcShape: ArcShape = {
    type: 'arc',
    centerX,
    centerY,
    innerRadius: arcConfig.innerRadius,
    outerRadius: arcConfig.outerRadius,
    startAngle: arcConfig.startAngle,
    endAngle: arcConfig.endAngle,
  };

  // Blok merkezini hesapla
  const blockCenter = getArcCenter({
    centerX,
    centerY,
    innerRadius: arcConfig.innerRadius,
    outerRadius: arcConfig.outerRadius,
    startAngle: arcConfig.startAngle,
    endAngle: arcConfig.endAngle,
  });

  // Toplam kapasite
  const totalCapacity = seatConfig.rows * seatConfig.cols;

  return {
    id: uuidv4(),
    session_id: sessionId,
    block_number: blockNumber,
    block_name: blockName,
    shape: arcShape,
    style: {
      fill: priceCategory.color,
      stroke: '#FFFFFF',
      strokeWidth: 2,
      opacity: 0.9,
    },
    viewport_data: {
      center: blockCenter,
      zoomScale: 2.0, // Bu zoom'da koltuklar görünsün
      seatGrid: {
        rows: seatConfig.rows,
        cols: seatConfig.cols,
        rowSpacing: 10,
        colSpacing: 10,
        startX: blockCenter.x - (seatConfig.cols * 10) / 2,
        startY: blockCenter.y - (seatConfig.rows * 10) / 2,
        seatWidth: 8,
        seatHeight: 8,
      },
    },
    total_capacity: totalCapacity,
    available_capacity: totalCapacity,
    display_order: displayOrder,
    metadata: {
      section,
      tier,
      group,
      isCorner: group.includes('corner'),
      isGoalSide: group.includes('goal'),
      viewQuality: getViewQuality(group),
      distanceToCenter: Math.sqrt(
        Math.pow(blockCenter.x - centerX, 2) + Math.pow(blockCenter.y - centerY, 2)
      ),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * View quality hesapla (1-5)
 */
function getViewQuality(group: BlockGroup): 1 | 2 | 3 | 4 | 5 {
  if (group.includes('lower_center')) return 5;
  if (group.includes('upper_center')) return 4;
  if (group.includes('lower_corner')) return 4;
  if (group.includes('upper_corner')) return 3;
  return 2; // Goal side
}

// ============================================
// SECTION GENERATORS
// ============================================

/**
 * Doğu Alt bloklarını oluştur (101-110)
 */
function generateEastLowerBlocks(sessionId: string): Block[] {
  const blocks: Block[] = [];
  let displayOrder = 0;

  // Köşe (Güney) - 101-103
  for (let i = 0; i < 3; i++) {
    blocks.push(
      createBlock({
        sessionId,
        blockNumber: `${101 + i}`,
        blockName: `Doğu Alt Köşe - ${101 + i}`,
        group: 'east_lower_corner',
        section: 'east',
        tier: 'lower',
        arcConfig: {
          startAngle: 0 + i * 8.3,
          endAngle: 8.3 + i * 8.3,
          innerRadius: BLOCK_RADII.LOWER_INNER,
          outerRadius: BLOCK_RADII.LOWER_OUTER,
        },
        seatConfig: SEATS_PER_BLOCK.lower_corner,
        displayOrder: displayOrder++,
      })
    );
  }

  // Merkez - 104-107
  for (let i = 0; i < 4; i++) {
    blocks.push(
      createBlock({
        sessionId,
        blockNumber: `${104 + i}`,
        blockName: `Doğu Alt Orta - ${104 + i}`,
        group: 'east_lower_center',
        section: 'east',
        tier: 'lower',
        arcConfig: {
          startAngle: 25 + i * 10,
          endAngle: 35 + i * 10,
          innerRadius: BLOCK_RADII.LOWER_INNER,
          outerRadius: BLOCK_RADII.LOWER_OUTER,
        },
        seatConfig: SEATS_PER_BLOCK.lower_center,
        displayOrder: displayOrder++,
      })
    );
  }

  // Köşe (Kuzey) - 108-110
  for (let i = 0; i < 3; i++) {
    blocks.push(
      createBlock({
        sessionId,
        blockNumber: `${108 + i}`,
        blockName: `Doğu Alt Köşe - ${108 + i}`,
        group: 'east_lower_corner',
        section: 'east',
        tier: 'lower',
        arcConfig: {
          startAngle: 65 + i * 8.3,
          endAngle: 73.3 + i * 8.3,
          innerRadius: BLOCK_RADII.LOWER_INNER,
          outerRadius: BLOCK_RADII.LOWER_OUTER,
        },
        seatConfig: SEATS_PER_BLOCK.lower_corner,
        displayOrder: displayOrder++,
      })
    );
  }

  return blocks;
}

/**
 * Doğu Üst bloklarını oluştur (120-130)
 */
function generateEastUpperBlocks(sessionId: string): Block[] {
  const blocks: Block[] = [];
  let displayOrder = 100;

  // Köşe (Güney) - 120-122
  for (let i = 0; i < 3; i++) {
    blocks.push(
      createBlock({
        sessionId,
        blockNumber: `${120 + i}`,
        blockName: `Doğu Üst Köşe - ${120 + i}`,
        group: 'east_upper_corner',
        section: 'east',
        tier: 'upper',
        arcConfig: {
          startAngle: 0 + i * 8.3,
          endAngle: 8.3 + i * 8.3,
          innerRadius: BLOCK_RADII.UPPER_INNER,
          outerRadius: BLOCK_RADII.UPPER_OUTER,
        },
        seatConfig: SEATS_PER_BLOCK.upper_corner,
        displayOrder: displayOrder++,
      })
    );
  }

  // Merkez - 123-127
  for (let i = 0; i < 5; i++) {
    blocks.push(
      createBlock({
        sessionId,
        blockNumber: `${123 + i}`,
        blockName: `Doğu Üst Orta - ${123 + i}`,
        group: 'east_upper_center',
        section: 'east',
        tier: 'upper',
        arcConfig: {
          startAngle: 25 + i * 8,
          endAngle: 33 + i * 8,
          innerRadius: BLOCK_RADII.UPPER_INNER,
          outerRadius: BLOCK_RADII.UPPER_OUTER,
        },
        seatConfig: SEATS_PER_BLOCK.upper_center,
        displayOrder: displayOrder++,
      })
    );
  }

  // Köşe (Kuzey) - 128-130
  for (let i = 0; i < 3; i++) {
    blocks.push(
      createBlock({
        sessionId,
        blockNumber: `${128 + i}`,
        blockName: `Doğu Üst Köşe - ${128 + i}`,
        group: 'east_upper_corner',
        section: 'east',
        tier: 'upper',
        arcConfig: {
          startAngle: 65 + i * 8.3,
          endAngle: 73.3 + i * 8.3,
          innerRadius: BLOCK_RADII.UPPER_INNER,
          outerRadius: BLOCK_RADII.UPPER_OUTER,
        },
        seatConfig: SEATS_PER_BLOCK.upper_corner,
        displayOrder: displayOrder++,
      })
    );
  }

  return blocks;
}

/**
 * Güney (Kale Arkası) bloklarını oluştur
 */
function generateSouthGoalBlocks(sessionId: string): Block[] {
  const blocks: Block[] = [];
  const displayOrder = 200;

  // 3 büyük blok (228-230)
  for (let i = 0; i < 3; i++) {
    blocks.push(
      createBlock({
        sessionId,
        blockNumber: `${228 + i}`,
        blockName: `Güney Kale Arkası - ${228 + i}`,
        group: 'south_goal',
        section: 'south',
        tier: 'lower',
        arcConfig: {
          startAngle: 90 + i * 30,
          endAngle: 120 + i * 30,
          innerRadius: BLOCK_RADII.LOWER_INNER,
          outerRadius: BLOCK_RADII.LOWER_OUTER,
        },
        seatConfig: SEATS_PER_BLOCK.goal_side,
        displayOrder: displayOrder + i,
      })
    );
  }

  return blocks;
}

/**
 * Batı Alt bloklarını oluştur (212-220)
 */
function generateWestLowerBlocks(sessionId: string): Block[] {
  const blocks: Block[] = [];
  let displayOrder = 300;

  // Köşe (Güney) - 212-214
  for (let i = 0; i < 3; i++) {
    blocks.push(
      createBlock({
        sessionId,
        blockNumber: `${212 + i}`,
        blockName: `Batı Alt Köşe - ${212 + i}`,
        group: 'west_lower_corner',
        section: 'west',
        tier: 'lower',
        arcConfig: {
          startAngle: 180 + i * 8.3,
          endAngle: 188.3 + i * 8.3,
          innerRadius: BLOCK_RADII.LOWER_INNER,
          outerRadius: BLOCK_RADII.LOWER_OUTER,
        },
        seatConfig: SEATS_PER_BLOCK.lower_corner,
        displayOrder: displayOrder++,
      })
    );
  }

  // Merkez - 215-218
  for (let i = 0; i < 4; i++) {
    blocks.push(
      createBlock({
        sessionId,
        blockNumber: `${215 + i}`,
        blockName: `Batı Alt Orta - ${215 + i}`,
        group: 'west_lower_center',
        section: 'west',
        tier: 'lower',
        arcConfig: {
          startAngle: 205 + i * 10,
          endAngle: 215 + i * 10,
          innerRadius: BLOCK_RADII.LOWER_INNER,
          outerRadius: BLOCK_RADII.LOWER_OUTER,
        },
        seatConfig: SEATS_PER_BLOCK.lower_center,
        displayOrder: displayOrder++,
      })
    );
  }

  // Köşe (Kuzey) - 219-220
  for (let i = 0; i < 2; i++) {
    blocks.push(
      createBlock({
        sessionId,
        blockNumber: `${219 + i}`,
        blockName: `Batı Alt Köşe - ${219 + i}`,
        group: 'west_lower_corner',
        section: 'west',
        tier: 'lower',
        arcConfig: {
          startAngle: 245 + i * 12.5,
          endAngle: 257.5 + i * 12.5,
          innerRadius: BLOCK_RADII.LOWER_INNER,
          outerRadius: BLOCK_RADII.LOWER_OUTER,
        },
        seatConfig: SEATS_PER_BLOCK.lower_corner,
        displayOrder: displayOrder++,
      })
    );
  }

  return blocks;
}

/**
 * Kuzey (Kale Arkası) bloklarını oluştur
 */
function generateNorthGoalBlocks(sessionId: string): Block[] {
  const blocks: Block[] = [];
  const displayOrder = 400;

  // 3 büyük blok (113-115)
  for (let i = 0; i < 3; i++) {
    blocks.push(
      createBlock({
        sessionId,
        blockNumber: `${113 + i}`,
        blockName: `Kuzey Kale Arkası - ${113 + i}`,
        group: 'north_goal',
        section: 'north',
        tier: 'lower',
        arcConfig: {
          startAngle: 270 + i * 30,
          endAngle: 300 + i * 30,
          innerRadius: BLOCK_RADII.LOWER_INNER,
          outerRadius: BLOCK_RADII.LOWER_OUTER,
        },
        seatConfig: SEATS_PER_BLOCK.goal_side,
        displayOrder: displayOrder + i,
      })
    );
  }

  return blocks;
}

// ============================================
// MAIN GENERATOR
// ============================================

/**
 * Tüm stadyum bloklarını oluştur
 * @param sessionId - Session UUID
 * @returns Tüm bloklar
 */
export function generateStadiumBlocks(sessionId: string): Block[] {
  return [
    ...generateEastLowerBlocks(sessionId),
    ...generateEastUpperBlocks(sessionId),
    ...generateSouthGoalBlocks(sessionId),
    ...generateWestLowerBlocks(sessionId),
    ...generateNorthGoalBlocks(sessionId),
  ];
}

/**
 * Blok sayısını hesapla
 */
export function getBlockCount(): number {
  return Object.values(CAPACITY_BREAKDOWN).reduce((sum, count) => sum + count, 0);
}

/**
 * Toplam kapasiteyi hesapla
 */
export function getTotalCapacity(blocks: Block[]): number {
  return blocks.reduce((sum, block) => sum + block.total_capacity, 0);
}
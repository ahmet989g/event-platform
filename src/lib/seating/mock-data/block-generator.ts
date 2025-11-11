/**
 * Block Generator - Rectangle Football Stadium
 * Generate mock block data for stadium seating
 * @description RECTANGLE blocks matching exact stadium layout
 */

import { v4 as uuidv4 } from 'uuid';
import type { Block, BlockGroup, BlockSection, BlockTier } from '@/types/seating/block.types';
import type { RectangleShape } from '@/types/seating/geometry.types';
import {
  STADIUM_DIMENSIONS,
  PRICE_CATEGORIES,
  SEATS_PER_BLOCK,
} from './stadium-config';

// ============================================
// STADIUM LAYOUT CONSTANTS
// ============================================

/**
 * Stadyum layout (senin görsele uygun)
 * 
 *     212 213 214 215 216 217 218 219 220  (KUZEY - 9 blok)
 *   ┌─────────────────────────────────┐
 *111│                                 │120
 *110│                                 │121
 *109│           [SAHA]                │122
 *108│        (dikdörtgen)             │123
 *107│                                 │124
 *106│                                 │125
 *105│                                 │126
 *104│                                 │127
 *   └─────────────────────────────────┘128
 *     100 101 102 103 104 105 106 107  (GÜNEY - 8+ blok)
 */

const FIELD = {
  x: 400,
  y: 300,
  width: 600,
  height: 400,
};

const BLOCK_DIMS = {
  width: 80,
  height: 120,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function createBlock(config: {
  sessionId: string;
  blockNumber: string;
  blockName: string;
  group: BlockGroup;
  section: BlockSection;
  tier: BlockTier;
  x: number;
  y: number;
  width: number;
  height: number;
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
    x,
    y,
    width,
    height,
    seatConfig,
    displayOrder,
  } = config;

  const priceCategory = PRICE_CATEGORIES[group];

  const rectShape: RectangleShape = {
    type: 'rectangle',
    x,
    y,
    width,
    height,
  };

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const totalCapacity = seatConfig.rows * seatConfig.cols;

  return {
    id: uuidv4(),
    session_id: sessionId,
    block_number: blockNumber,
    block_name: blockName,
    shape: rectShape,
    style: {
      fill: priceCategory.color,
      stroke: '#FFFFFF',
      strokeWidth: 2,
      opacity: 0.9,
    },
    viewport_data: {
      center: { x: centerX, y: centerY },
      zoomScale: 2.0,
      seatGrid: {
        rows: seatConfig.rows,
        cols: seatConfig.cols,
        rowSpacing: 10,
        colSpacing: 10,
        startX: x + 10,
        startY: y + 10,
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
      isCorner: false,
      isGoalSide: group.includes('goal'),
      viewQuality: getViewQuality(group),
      distanceToCenter: Math.sqrt(
        Math.pow(centerX - 1000, 2) + Math.pow(centerY - 800, 2)
      ),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function getViewQuality(group: BlockGroup): 1 | 2 | 3 | 4 | 5 {
  if (group.includes('lower_center')) return 5;
  if (group.includes('upper_center')) return 4;
  if (group.includes('lower_corner')) return 4;
  if (group.includes('upper_corner')) return 3;
  return 2;
}

// ============================================
// SECTION GENERATORS
// ============================================

/**
 * DOĞU (Sağ) tribünleri - 120-128 (9 blok)
 * Dikey dizilim
 */
function generateEastBlocks(sessionId: string): Block[] {
  const blocks: Block[] = [];
  const startX = FIELD.x + FIELD.width + 50; // Saha sağında
  const startY = FIELD.y - 50;

  for (let i = 0; i < 9; i++) {
    const blockNumber = `${120 + i}`;
    blocks.push(
      createBlock({
        sessionId,
        blockNumber,
        blockName: `Doğu - ${blockNumber}`,
        group: 'east_upper_center',
        section: 'east',
        tier: 'upper',
        x: startX,
        y: startY + i * (BLOCK_DIMS.height + 5),
        width: BLOCK_DIMS.width,
        height: BLOCK_DIMS.height,
        seatConfig: SEATS_PER_BLOCK.upper_center,
        displayOrder: 100 + i,
      })
    );
  }

  return blocks;
}

/**
 * GÜNEY (Alt) tribünleri - 100-111 (12 blok)
 * Yatay dizilim
 */
function generateSouthBlocks(sessionId: string): Block[] {
  const blocks: Block[] = [];
  const startX = FIELD.x - 50;
  const startY = FIELD.y + FIELD.height + 50; // Saha altında

  for (let i = 0; i < 12; i++) {
    const blockNumber = `${100 + i}`;
    blocks.push(
      createBlock({
        sessionId,
        blockNumber,
        blockName: `Güney - ${blockNumber}`,
        group: 'south_goal',
        section: 'south',
        tier: 'lower',
        x: startX + i * (BLOCK_DIMS.width + 5),
        y: startY,
        width: BLOCK_DIMS.width,
        height: BLOCK_DIMS.height,
        seatConfig: SEATS_PER_BLOCK.goal_side,
        displayOrder: 200 + i,
      })
    );
  }

  return blocks;
}

/**
 * BATI (Sol) tribünleri - 104-111 (8 blok)
 * Dikey dizilim
 */
function generateWestBlocks(sessionId: string): Block[] {
  const blocks: Block[] = [];
  const startX = FIELD.x - BLOCK_DIMS.width - 100; // Saha solunda
  const startY = FIELD.y;

  for (let i = 0; i < 8; i++) {
    const blockNumber = `${104 + i}`;
    blocks.push(
      createBlock({
        sessionId,
        blockNumber,
        blockName: `Batı - ${blockNumber}`,
        group: 'west_lower_center',
        section: 'west',
        tier: 'lower',
        x: startX,
        y: startY + i * (BLOCK_DIMS.height + 5),
        width: BLOCK_DIMS.width,
        height: BLOCK_DIMS.height,
        seatConfig: SEATS_PER_BLOCK.lower_center,
        displayOrder: 300 + i,
      })
    );
  }

  return blocks;
}

/**
 * KUZEY (Üst) tribünleri - 212-220 (9 blok)
 * Yatay dizilim
 */
function generateNorthBlocks(sessionId: string): Block[] {
  const blocks: Block[] = [];
  const startX = FIELD.x;
  const startY = FIELD.y - BLOCK_DIMS.height - 100; // Saha üstünde

  for (let i = 0; i < 9; i++) {
    const blockNumber = `${212 + i}`;
    blocks.push(
      createBlock({
        sessionId,
        blockNumber,
        blockName: `Kuzey - ${blockNumber}`,
        group: 'north_goal',
        section: 'north',
        tier: 'lower',
        x: startX + i * (BLOCK_DIMS.width + 5),
        y: startY,
        width: BLOCK_DIMS.width,
        height: BLOCK_DIMS.height,
        seatConfig: SEATS_PER_BLOCK.goal_side,
        displayOrder: 400 + i,
      })
    );
  }

  return blocks;
}

/**
 * SAHA block'u oluştur (ortadaki yeşil alan)
 */
function generateFieldBlock(sessionId: string): Block {
  return createBlock({
    sessionId,
    blockNumber: 'SAHA',
    blockName: 'Saha',
    group: 'south_goal', // Dummy group
    section: 'south',
    tier: 'lower',
    x: FIELD.x,
    y: FIELD.y,
    width: FIELD.width,
    height: FIELD.height,
    seatConfig: { rows: 0, cols: 0 },
    displayOrder: 0,
  });
}

// ============================================
// MAIN GENERATOR
// ============================================

/**
 * Tüm stadyum bloklarını oluştur
 * RECTANGLE football stadium (38 blocks + 1 field)
 */
export function generateStadiumBlocks(sessionId: string): Block[] {
  return [
    ...generateEastBlocks(sessionId),    // 9 blok (120-128)
    ...generateSouthBlocks(sessionId),   // 12 blok (100-111)
    ...generateWestBlocks(sessionId),    // 8 blok (104-111)
    ...generateNorthBlocks(sessionId),   // 9 blok (212-220)
    // generateFieldBlock(sessionId),     // Saha (isteğe bağlı)
  ];
}

export function getBlockCount(): number {
  return 38; // 9 + 12 + 8 + 9
}

export function getTotalCapacity(blocks: Block[]): number {
  return blocks.reduce((sum, block) => sum + block.total_capacity, 0);
}
/**
 * Stadium Mock Data Importer
 * Import generated stadium data to Supabase
 * @description Imports blocks and seats for testing seating system
 */

import { createClient } from '@/utils/supabase/server';
import { generateStadiumMockData } from '../mock-data/stadium-generator';
import { adaptBlocksToDatabase, adaptSeatsToDatabase } from '../adapters/database-adapters';
import type { Block } from '@/types/session.types';
import type { Seat } from '@/types/session.types';

// ============================================
// IMPORT CONFIGURATION
// ============================================

interface ImportConfig {
  batchSize: number; // Kaç kayıt aynı anda insert edilecek
  delayMs: number; // Batch'ler arası bekleme (rate limiting için)
  validateBeforeInsert: boolean;
  dryRun: boolean; // true ise sadece log basar, database'e yazmaz
}

const DEFAULT_CONFIG: ImportConfig = {
  batchSize: 100,
  delayMs: 100,
  validateBeforeInsert: true,
  dryRun: false,
};

// ============================================
// MAIN IMPORT FUNCTION
// ============================================

/**
 * Stadyum mock data'sını Supabase'e import et
 * @param sessionId - Session UUID
 * @param config - Import konfigürasyonu
 * @returns Import result
 */
export async function importStadiumData(
  sessionId: string,
  config: Partial<ImportConfig> = {}
): Promise<{
  success: boolean;
  blocksImported: number;
  seatsImported: number;
  errors: string[];
  duration: number;
}> {
  const startTime = Date.now();
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const errors: string[] = [];

  try {
    console.log('🏟️  Starting stadium data import...');
    console.log(`Session ID: ${sessionId}`);
    console.log(`Config:`, cfg);

    // 1. Generate mock data
    console.log('\n📊 Generating mock data...');
    const mockData = generateStadiumMockData(sessionId);
    console.log(`✅ Generated ${mockData.blocks.length} blocks`);
    console.log(`✅ Generated ${mockData.seats.length} seats`);

    // 2. Adapt to database format
    console.log('\n🔄 Adapting data to database format...');
    const legacyBlocks = adaptBlocksToDatabase(mockData.blocks);
    const legacySeats = adaptSeatsToDatabase(mockData.seats);
    console.log('✅ Data adapted successfully');

    // 3. Validate (if enabled)
    if (cfg.validateBeforeInsert) {
      console.log('\n✅ Validating data...');
      validateBlocks(legacyBlocks);
      validateSeats(legacySeats);
      console.log('✅ Validation passed');
    }

    // 4. Dry run check
    if (cfg.dryRun) {
      console.log('\n⚠️  DRY RUN MODE - No data will be inserted');
      console.log(`Would insert ${legacyBlocks.length} blocks`);
      console.log(`Would insert ${legacySeats.length} seats`);
      return {
        success: true,
        blocksImported: 0,
        seatsImported: 0,
        errors: [],
        duration: Date.now() - startTime,
      };
    }

    // 5. Import blocks
    console.log('\n📦 Importing blocks...');
    const blocksImported = await importBlocks(legacyBlocks, cfg, errors);
    console.log(`✅ Imported ${blocksImported} blocks`);

    // 6. Import seats
    console.log('\n💺 Importing seats...');
    const seatsImported = await importSeats(legacySeats, cfg, errors);
    console.log(`✅ Imported ${seatsImported} seats`);

    // 7. Summary
    const duration = Date.now() - startTime;
    console.log('\n🎉 IMPORT COMPLETED');
    console.log(`Total Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Blocks Imported: ${blocksImported}`);
    console.log(`Seats Imported: ${seatsImported}`);

    if (errors.length > 0) {
      console.warn(`\n⚠️  Errors encountered: ${errors.length}`);
      errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
    }

    return {
      success: errors.length === 0,
      blocksImported,
      seatsImported,
      errors,
      duration,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Import failed:', errorMsg);
    errors.push(errorMsg);

    return {
      success: false,
      blocksImported: 0,
      seatsImported: 0,
      errors,
      duration: Date.now() - startTime,
    };
  }
}

// ============================================
// IMPORT HELPERS
// ============================================

/**
 * Blokları batch halinde import et
 */
async function importBlocks(
  blocks: Block[],
  config: ImportConfig,
  errors: string[]
): Promise<number> {
  const supabase = await createClient();
  let importedCount = 0;

  // Batch'lere böl
  for (let i = 0; i < blocks.length; i += config.batchSize) {
    const batch = blocks.slice(i, i + config.batchSize);

    try {
      const { error } = await supabase.from('blocks').insert(batch);

      if (error) {
        const errorMsg = `Batch ${Math.floor(i / config.batchSize) + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      } else {
        importedCount += batch.length;
        console.log(`  ✓ Batch ${Math.floor(i / config.batchSize) + 1}: ${batch.length} blocks`);
      }

      // Rate limiting delay
      if (i + config.batchSize < blocks.length) {
        await sleep(config.delayMs);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      console.error(`❌ Batch failed: ${errorMsg}`);
    }
  }

  return importedCount;
}

/**
 * Koltukları batch halinde import et
 */
async function importSeats(
  seats: Seat[],
  config: ImportConfig,
  errors: string[]
): Promise<number> {
  const supabase = await createClient();
  let importedCount = 0;

  // Batch'lere böl
  for (let i = 0; i < seats.length; i += config.batchSize) {
    const batch = seats.slice(i, i + config.batchSize);

    try {
      const { error } = await supabase.from('seats').insert(batch);

      if (error) {
        const errorMsg = `Batch ${Math.floor(i / config.batchSize) + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      } else {
        importedCount += batch.length;
        const progress = ((i + batch.length) / seats.length) * 100;
        console.log(
          `  ✓ Batch ${Math.floor(i / config.batchSize) + 1}: ${batch.length} seats (${progress.toFixed(1)}%)`
        );
      }

      // Rate limiting delay
      if (i + config.batchSize < seats.length) {
        await sleep(config.delayMs);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      console.error(`❌ Batch failed: ${errorMsg}`);
    }
  }

  return importedCount;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Block validation
 */
function validateBlocks(blocks: Block[]): void {
  blocks.forEach((block, index) => {
    if (!block.id) throw new Error(`Block ${index}: Missing id`);
    if (!block.session_id) throw new Error(`Block ${index}: Missing session_id`);
    if (!block.name) throw new Error(`Block ${index}: Missing name`);
    if (!block.shape_data) throw new Error(`Block ${index}: Missing shape_data`);
    if (block.total_capacity < 0)
      throw new Error(`Block ${index}: Invalid total_capacity`);
  });
}

/**
 * Seat validation
 */
function validateSeats(seats: Seat[]): void {
  seats.forEach((seat, index) => {
    if (!seat.id) throw new Error(`Seat ${index}: Missing id`);
    if (!seat.session_id) throw new Error(`Seat ${index}: Missing session_id`);
    if (!seat.seat_number) throw new Error(`Seat ${index}: Missing seat_number`);
    if (seat.position_x === undefined || seat.position_y === undefined) {
      throw new Error(`Seat ${index}: Missing position`);
    }
  });
}

// ============================================
// CLEANUP FUNCTIONS
// ============================================

/**
 * Session'a ait tüm blok ve koltukları sil
 * @param sessionId - Session UUID
 * @returns Silinen kayıt sayısı
 */
export async function deleteSessionSeatingData(sessionId: string): Promise<{
  blocksDeleted: number;
  seatsDeleted: number;
}> {
  const supabase = await createClient();

  console.log(`🗑️  Deleting seating data for session: ${sessionId}`);

  // 1. Delete seats
  const { error: seatsError, count: seatsCount } = await supabase
    .from('seats')
    .delete()
    .eq('session_id', sessionId)
    .select('*', { count: 'exact', head: true });

  if (seatsError) {
    console.error('❌ Error deleting seats:', seatsError.message);
  }

  // 2. Delete blocks
  const { error: blocksError, count: blocksCount } = await supabase
    .from('blocks')
    .delete()
    .eq('session_id', sessionId)
    .select('*', { count: 'exact', head: true });

  if (blocksError) {
    console.error('❌ Error deleting blocks:', blocksError.message);
  }

  console.log(`✅ Deleted ${blocksCount || 0} blocks`);
  console.log(`✅ Deleted ${seatsCount || 0} seats`);

  return {
    blocksDeleted: blocksCount || 0,
    seatsDeleted: seatsCount || 0,
  };
}

// ============================================
// UTILITY
// ============================================

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// USAGE EXAMPLE
// ============================================

/**
 * Örnek kullanım (test için)
 */
export async function exampleImport() {
  const sessionId = 'your-session-uuid';

  // Import with default config
  const result = await importStadiumData(sessionId);
  console.log('Import result:', result);

  // Or with custom config
  const customResult = await importStadiumData(sessionId, {
    batchSize: 50,
    delayMs: 200,
    dryRun: true, // Test run
  });
  console.log('Custom import result:', customResult);
}
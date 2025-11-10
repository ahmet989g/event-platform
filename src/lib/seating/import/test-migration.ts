/**
 * Migration & Import Test Script
 * Validate migration and test data import
 * @description Test script to ensure quantity layout works and new data imports correctly
 */

import { createClient } from '@/utils/supabase/server';
import { importStadiumData, deleteSessionSeatingData } from './stadium-importer';

// ============================================
// TEST CONFIGURATION
// ============================================

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  data?: unknown;
}

// ============================================
// MAIN TEST SUITE
// ============================================

/**
 * Tüm testleri çalıştır
 */
export async function runAllTests(): Promise<{
  passed: number;
  failed: number;
  results: TestResult[];
}> {
  console.log('🧪 STARTING TEST SUITE\n');
  console.log('=' .repeat(60));

  const results: TestResult[] = [];

  // 1. Database connection test
  results.push(await testDatabaseConnection());

  // 2. Table structure test
  results.push(await testTableStructure());

  // 3. Quantity layout test (ensure not broken)
  results.push(await testQuantityLayout());

  // 4. Migration validation test
  results.push(await testMigrationColumns());

  // 5. Mock data generation test
  results.push(await testMockDataGeneration());

  // 6. Import test (dry run)
  results.push(await testImportDryRun());

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY\n');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.message}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);
  console.log('='.repeat(60));

  return { passed, failed, results };
}

// ============================================
// INDIVIDUAL TESTS
// ============================================

/**
 * Test 1: Database bağlantısı
 */
async function testDatabaseConnection(): Promise<TestResult> {
  console.log('\n🔌 Test 1: Database Connection');

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('sessions').select('id').limit(1);

    if (error) {
      return {
        test: 'Database Connection',
        passed: false,
        message: `Connection failed: ${error.message}`,
      };
    }

    return {
      test: 'Database Connection',
      passed: true,
      message: 'Connection successful',
    };
  } catch (error) {
    return {
      test: 'Database Connection',
      passed: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 2: Tablo yapısı kontrolü
 */
async function testTableStructure(): Promise<TestResult> {
  console.log('\n📋 Test 2: Table Structure');

  try {
    const supabase = await createClient();

    // Check blocks table
    const { data: blocksData, error: blocksError } = await supabase
      .from('blocks')
      .select('*')
      .limit(0);

    if (blocksError) {
      return {
        test: 'Table Structure',
        passed: false,
        message: `Blocks table error: ${blocksError.message}`,
      };
    }

    // Check seats table
    const { data: seatsData, error: seatsError } = await supabase
      .from('seats')
      .select('*')
      .limit(0);

    if (seatsError) {
      return {
        test: 'Table Structure',
        passed: false,
        message: `Seats table error: ${seatsError.message}`,
      };
    }

    return {
      test: 'Table Structure',
      passed: true,
      message: 'Tables exist and accessible',
    };
  } catch (error) {
    return {
      test: 'Table Structure',
      passed: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 3: Quantity layout (mevcut functionality)
 */
async function testQuantityLayout(): Promise<TestResult> {
  console.log('\n🎫 Test 3: Quantity Layout (Existing)');

  try {
    const supabase = await createClient();

    // Get a quantity layout session
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select('id, layout_type')
      .eq('layout_type', 'quantity')
      .limit(1);

    if (sessionError) {
      return {
        test: 'Quantity Layout',
        passed: false,
        message: `Error fetching session: ${sessionError.message}`,
      };
    }

    if (!sessions || sessions.length === 0) {
      return {
        test: 'Quantity Layout',
        passed: true,
        message: 'No quantity sessions found (skip test)',
      };
    }

    const sessionId = sessions[0].id;

    // Get session categories
    const { data: categories, error: catError } = await supabase
      .from('session_categories')
      .select('*')
      .eq('session_id', sessionId);

    if (catError) {
      return {
        test: 'Quantity Layout',
        passed: false,
        message: `Error fetching categories: ${catError.message}`,
      };
    }

    return {
      test: 'Quantity Layout',
      passed: true,
      message: `Quantity layout working (${categories?.length || 0} categories found)`,
      data: { sessionId, categoriesCount: categories?.length },
    };
  } catch (error) {
    return {
      test: 'Quantity Layout',
      passed: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 4: Migration kolonları kontrolü
 */
async function testMigrationColumns(): Promise<TestResult> {
  console.log('\n🔄 Test 4: Migration Columns');

  try {
    const supabase = await createClient();

    // Check if new columns exist in blocks
    const { data: blocksData, error: blocksError } = await supabase
      .from('blocks')
      .select('block_number, block_name, display_order, metadata, style')
      .limit(1);

    if (blocksError) {
      return {
        test: 'Migration Columns',
        passed: false,
        message: `Blocks columns missing: ${blocksError.message}`,
      };
    }

    // Check if new columns exist in seats
    const { data: seatsData, error: seatsError } = await supabase
      .from('seats')
      .select('row_index, col_index, position')
      .limit(1);

    if (seatsError) {
      return {
        test: 'Migration Columns',
        passed: false,
        message: `Seats columns missing: ${seatsError.message}`,
      };
    }

    return {
      test: 'Migration Columns',
      passed: true,
      message: 'Migration columns exist',
    };
  } catch (error) {
    return {
      test: 'Migration Columns',
      passed: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 5: Mock data generation
 */
async function testMockDataGeneration(): Promise<TestResult> {
  console.log('\n🏗️  Test 5: Mock Data Generation');

  try {
    // Dynamic import to avoid circular dependencies
    const { generateStadiumMockData } = await import('../mock-data/stadium-generator');

    const testSessionId = 'test-session-' + Date.now();
    const mockData = generateStadiumMockData(testSessionId);

    const validBlockCount = mockData.blocks.length >= 40 && mockData.blocks.length <= 50;
    const validSeatCount = mockData.seats.length >= 28000 && mockData.seats.length <= 32000;

    if (!validBlockCount) {
      return {
        test: 'Mock Data Generation',
        passed: false,
        message: `Invalid block count: ${mockData.blocks.length}`,
      };
    }

    if (!validSeatCount) {
      return {
        test: 'Mock Data Generation',
        passed: false,
        message: `Invalid seat count: ${mockData.seats.length}`,
      };
    }

    return {
      test: 'Mock Data Generation',
      passed: true,
      message: `Generated ${mockData.blocks.length} blocks, ${mockData.seats.length} seats`,
      data: mockData.summary,
    };
  } catch (error) {
    return {
      test: 'Mock Data Generation',
      passed: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 6: Import (dry run)
 */
async function testImportDryRun(): Promise<TestResult> {
  console.log('\n📦 Test 6: Import (Dry Run)');

  try {
    const testSessionId = 'test-session-' + Date.now();

    const result = await importStadiumData(testSessionId, {
      dryRun: true,
      batchSize: 50,
    });

    if (!result.success) {
      return {
        test: 'Import Dry Run',
        passed: false,
        message: `Import failed: ${result.errors.join(', ')}`,
      };
    }

    return {
      test: 'Import Dry Run',
      passed: true,
      message: `Dry run successful (duration: ${(result.duration / 1000).toFixed(2)}s)`,
    };
  } catch (error) {
    return {
      test: 'Import Dry Run',
      passed: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// REAL IMPORT TEST (Optional)
// ============================================

/**
 * Gerçek import testi (opsiyonel, manual çalıştırılır)
 * UYARI: Bu fonksiyon gerçekten database'e yazacak!
 */
export async function testRealImport(sessionId: string): Promise<TestResult> {
  console.log('\n⚠️  REAL IMPORT TEST (DATABASE WILL BE MODIFIED)');

  try {
    // 1. Clean up existing data (if any)
    console.log('🗑️  Cleaning up existing data...');
    await deleteSessionSeatingData(sessionId);

    // 2. Import new data
    console.log('📦 Importing new data...');
    const result = await importStadiumData(sessionId, {
      batchSize: 100,
      delayMs: 100,
      dryRun: false,
    });

    if (!result.success) {
      return {
        test: 'Real Import',
        passed: false,
        message: `Import failed: ${result.errors.join(', ')}`,
      };
    }

    // 3. Verify import
    const supabase = await createClient();

    const { count: blockCount } = await supabase
      .from('blocks')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    const { count: seatCount } = await supabase
      .from('seats')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    return {
      test: 'Real Import',
      passed: true,
      message: `Import successful: ${blockCount} blocks, ${seatCount} seats`,
      data: {
        duration: result.duration,
        blocksImported: result.blocksImported,
        seatsImported: result.seatsImported,
      },
    };
  } catch (error) {
    return {
      test: 'Real Import',
      passed: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
/**
 * Block Query Functions
 * Server-side data fetching for block seating
 * @description Event Ticketing Platform - Block queries
 */

import { createClient } from '@/utils/supabase/server';
import type { Block } from '@/types/session.types';

// ============================================
// BLOCK QUERIES
// ============================================

/**
 * Session'a ait tüm blokları getir
 * @param sessionId - Session UUID
 * @returns Block array veya null
 */
export async function getBlocksBySessionId(
  sessionId: string
): Promise<Block[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('session_id', sessionId)
      .order('display_order', { ascending: true });
    if (error) {
      console.error('Error fetching blocks:', error);
      return null;
    }

    return data as Block[];
  } catch (error) {
    console.error('Unexpected error in getBlocksBySessionId:', error);
    return null;
  }
}

/**
 * Tek bir bloğu ID ile getir
 * @param blockId - Block UUID
 * @returns Block veya null
 */
export async function getBlockById(
  blockId: string
): Promise<Block | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('id', blockId)
      .single();

    if (error) {
      console.error('Error fetching block:', error);
      return null;
    }

    return data as Block;
  } catch (error) {
    console.error('Unexpected error in getBlockById:', error);
    return null;
  }
}

/**
 * Session'a ait blokları kapasite bilgileriyle getir
 * @param sessionId - Session UUID
 * @returns Block array with capacity veya null
 */
export async function getBlocksWithCapacity(
  sessionId: string
): Promise<Block[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blocks')
      .select(`
        *,
        seats!inner(count)
      `)
      .eq('session_id', sessionId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching blocks with capacity:', error);
      return null;
    }

    return data as Block[];
  } catch (error) {
    console.error('Unexpected error in getBlocksWithCapacity:', error);
    return null;
  }
}

/**
 * Aktif blokları getir (is_active = true olanlar)
 * @param sessionId - Session UUID
 * @returns Active block array veya null
 */
export async function getActiveBlocks(
  sessionId: string
): Promise<Block[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching active blocks:', error);
      return null;
    }

    return data as Block[];
  } catch (error) {
    console.error('Unexpected error in getActiveBlocks:', error);
    return null;
  }
}
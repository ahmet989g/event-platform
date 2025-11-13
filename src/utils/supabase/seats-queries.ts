/**
 * Seat Query Functions
 * Server-side data fetching for seats
 * @description Event Ticketing Platform - Seat queries
 */

import { createClient } from '@/utils/supabase/server';
import type { Seat, SeatStatus } from '@/types/session.types';

// ============================================
// SEAT QUERIES
// ============================================

/**
 * Block'a ait tüm koltukları getir
 * @param blockId - Block UUID
 * @returns Seat array veya null
 */
export async function getSeatsByBlockId(
  blockId: string
): Promise<Seat[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .eq('block_id', blockId)
      .order('row_index', { ascending: true })
      .order('col_index', { ascending: true });

    if (error) {
      console.error('Error fetching seats:', error);
      return null;
    }

    return data as Seat[];
  } catch (error) {
    console.error('Unexpected error in getSeatsByBlockId:', error);
    return null;
  }
}

/**
 * Session'a ait tüm koltukları getir
 * @param sessionId - Session UUID
 * @param status - Opsiyonel status filtresi
 * @returns Seat array veya null
 */
export async function getSeatsBySessionId(
  sessionId: string,
  status?: SeatStatus | SeatStatus[]
): Promise<Seat[] | null> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('seats')
      .select('*')
      .eq('session_id', sessionId);

    // Status filtresi
    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }

    query = query
      .order('block_id', { ascending: true })
      .order('row_index', { ascending: true })
      .order('col_index', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching seats:', error);
      return null;
    }

    return data as Seat[];
  } catch (error) {
    console.error('Unexpected error in getSeatsBySessionId:', error);
    return null;
  }
}

/**
 * Tek bir koltuğu ID ile getir
 * @param seatId - Seat UUID
 * @returns Seat veya null
 */
export async function getSeatById(
  seatId: string
): Promise<Seat | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .eq('id', seatId)
      .single();

    if (error) {
      console.error('Error fetching seat:', error);
      return null;
    }

    return data as Seat;
  } catch (error) {
    console.error('Unexpected error in getSeatById:', error);
    return null;
  }
}

/**
 * Müsait koltukları getir (available)
 * @param blockId - Block UUID
 * @returns Available seat array veya null
 */
export async function getAvailableSeats(
  blockId: string
): Promise<Seat[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .eq('block_id', blockId)
      .eq('status', 'available')
      .order('row_index', { ascending: true })
      .order('col_index', { ascending: true });

    if (error) {
      console.error('Error fetching available seats:', error);
      return null;
    }

    return data as Seat[];
  } catch (error) {
    console.error('Unexpected error in getAvailableSeats:', error);
    return null;
  }
}

/**
 * Block'un kapasite bilgisini getir
 * @param blockId - Block UUID
 * @returns Capacity info veya null
 */
export async function getBlockCapacity(
  blockId: string
): Promise<{
  total: number;
  available: number;
  reserved: number;
  sold: number;
  blocked: number;
} | null> {
  try {
    const supabase = await createClient();

    // Tüm koltukları al
    const { data: seats, error } = await supabase
      .from('seats')
      .select('status')
      .eq('block_id', blockId);

    if (error) {
      console.error('Error fetching block capacity:', error);
      return null;
    }

    // Durumları say
    const capacity = {
      total: seats.length,
      available: seats.filter((s) => s.status === 'available').length,
      reserved: seats.filter((s) => s.status === 'reserved').length,
      sold: seats.filter((s) => s.status === 'sold').length,
      blocked: seats.filter((s) => s.status === 'blocked').length,
    };

    return capacity;
  } catch (error) {
    console.error('Unexpected error in getBlockCapacity:', error);
    return null;
  }
}

/**
 * Birden fazla koltuğu ID'leriyle getir
 * @param seatIds - Seat UUID array
 * @returns Seat array veya null
 */
export async function getSeatsByIds(
  seatIds: string[]
): Promise<Seat[] | null> {
  try {
    if (seatIds.length === 0) return [];

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .in('id', seatIds);

    if (error) {
      console.error('Error fetching seats by IDs:', error);
      return null;
    }

    return data as Seat[];
  } catch (error) {
    console.error('Unexpected error in getSeatsByIds:', error);
    return null;
  }
}
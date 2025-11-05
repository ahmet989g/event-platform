/**
 * Session & Seat Query Functions
 * Server-side data fetching for ticketing system
 * @description Event Ticketing Platform - Session, Seat, Block queries
 */

import { createClient } from '@/utils/supabase/server';
import type {
  Session,
  SessionWithRelations,
  SessionCategoryWithTicketCategory,
  Seat,
  SeatWithCategories,
  Block,
  BlockWithSeats,
  ReservationWithDetails,
  SessionFilters,
  SeatFilters,
  SeatStatus,
} from '@/types/session.types';

// ============================================
// SESSION QUERIES
// ============================================

/**
 * Event'e ait tüm seansları getir
 * @param eventId - Event UUID
 * @param filters - Opsiyonel filtreler
 * @returns Session array veya null
 */
export async function getSessionsByEvent(
  eventId: string,
  filters?: Omit<SessionFilters, 'event_id'>
): Promise<(Session & {
  venue: {
    id: string;
    name: string;
    city: string;
    district: string | null;
  } | null;
  session_categories: {
    price: number;
  }[];
})[] | null> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('sessions')
      .select(`
        *,
        venue:venues(id, name, city, district),
        session_categories(price)
      `)
      .eq('event_id', eventId)
      .order('session_date', { ascending: true })
      .order('session_time', { ascending: true });

    // Filtreleri uygula
    if (filters?.venue_id) {
      query = query.eq('venue_id', filters.venue_id);
    }
    if (filters?.session_date) {
      query = query.eq('session_date', filters.session_date);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.layout_type) {
      query = query.eq('layout_type', filters.layout_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return null;
    }

    return data as (Session & {
      venue: {
        id: string;
        name: string;
        city: string;
        district: string | null;
      } | null;
      session_categories: {
        price: number;
      }[];
    })[];
  } catch (error) {
    console.error('Unexpected error in getSessionsByEvent:', error);
    return null;
  }
}

/**
 * Tek bir seansı detaylı olarak getir (ilişkilerle birlikte)
 * @param sessionId - Session UUID
 * @returns Session with relations veya null
 */
export async function getSessionById(
  sessionId: string
): Promise<SessionWithRelations | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        event:events(id, title, slug, poster_url),
        venue:venues(id, name, city),
        session_categories(
          *,
          ticket_category:ticket_categories(*)
        ),
        blocks(*)
      `)
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    return data as SessionWithRelations;
  } catch (error) {
    console.error('Unexpected error in getSessionById:', error);
    return null;
  }
}

/**
 * Slug ile session getir
 * @param slug - Session slug (15-ocak-2025-2030)
 * @returns Session with relations veya null
 */
export async function getSessionBySlug(
  slug: string
): Promise<SessionWithRelations | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        event:events(id, title, slug, poster_url),
        venue:venues(id, name, city, district),
        session_categories(
          *,
          ticket_category:ticket_categories(*)
        ),
        blocks(*)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching session by slug:', error);
      return null;
    }

    return data as SessionWithRelations;
  } catch (error) {
    console.error('Unexpected error in getSessionBySlug:', error);
    return null;
  }
}

// ============================================
// SESSION CATEGORY QUERIES
// ============================================

/**
 * Seansa ait kategorileri getir
 * @param sessionId - Session UUID
 * @returns Session category array veya null
 */
export async function getSessionCategories(
  sessionId: string
): Promise<SessionCategoryWithTicketCategory[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('session_categories')
      .select(`
        *,
        ticket_category:ticket_categories(*)
      `)
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .order('ticket_category(sort_order)', { ascending: true });

    if (error) {
      console.error('Error fetching session categories:', error);
      return null;
    }

    return data as SessionCategoryWithTicketCategory[];
  } catch (error) {
    console.error('Unexpected error in getSessionCategories:', error);
    return null;
  }
}

// ============================================
// SEAT QUERIES
// ============================================

/**
 * Seansa ait koltukları getir (filtrelerle)
 * @param filters - Seat filtreleme kriterleri
 * @returns Seat array veya null
 */
export async function getSeats(
  filters: SeatFilters
): Promise<Seat[] | null> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('seats')
      .select('*')
      .eq('session_id', filters.session_id);

    // Block filtresi
    if (filters.block_id !== undefined) {
      if (filters.block_id === null) {
        query = query.is('block_id', null);
      } else {
        query = query.eq('block_id', filters.block_id);
      }
    }

    // Status filtresi
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    // Seat type filtresi
    if (filters.seat_type) {
      if (Array.isArray(filters.seat_type)) {
        query = query.in('seat_type', filters.seat_type);
      } else {
        query = query.eq('seat_type', filters.seat_type);
      }
    }

    // Viewport filtresi (performans için kritik!)
    if (filters.viewport) {
      query = query
        .gte('position_x', filters.viewport.min_x)
        .lte('position_x', filters.viewport.max_x)
        .gte('position_y', filters.viewport.min_y)
        .lte('position_y', filters.viewport.max_y);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching seats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getSeats:', error);
    return null;
  }
}

/**
 * Tek bir koltuğu kategorileriyle getir
 * @param seatId - Seat UUID
 * @returns Seat with categories veya null
 */
export async function getSeatWithCategories(
  seatId: string
): Promise<SeatWithCategories | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('seats')
      .select(`
        *,
        seat_categories(
          *,
          session_category:session_categories(
            *,
            ticket_category:ticket_categories(*)
          )
        )
      `)
      .eq('id', seatId)
      .single();

    if (error) {
      console.error('Error fetching seat with categories:', error);
      return null;
    }

    return data as SeatWithCategories;
  } catch (error) {
    console.error('Unexpected error in getSeatWithCategories:', error);
    return null;
  }
}

/**
 * Koltuk durumunu güncelle
 * @param seatId - Seat UUID
 * @param status - Yeni durum
 * @returns Güncellenmiş seat veya null
 */
export async function updateSeatStatus(
  seatId: string,
  status: SeatStatus
): Promise<Seat | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('seats')
      .update({ status })
      .eq('id', seatId)
      .select()
      .single();

    if (error) {
      console.error('Error updating seat status:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in updateSeatStatus:', error);
    return null;
  }
}

/**
 * Birden fazla koltuğun durumunu güncelle
 * @param seatIds - Seat UUID array
 * @param status - Yeni durum
 * @returns Güncellenmiş seat array veya null
 */
export async function updateMultipleSeatStatus(
  seatIds: string[],
  status: SeatStatus
): Promise<Seat[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('seats')
      .update({ status })
      .in('id', seatIds)
      .select();

    if (error) {
      console.error('Error updating multiple seat status:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in updateMultipleSeatStatus:', error);
    return null;
  }
}

// ============================================
// BLOCK QUERIES
// ============================================

/**
 * Seansa ait blokları getir
 * @param sessionId - Session UUID
 * @param includeSeats - Koltukları da getir mi?
 * @returns Block array veya null
 */
export async function getBlocks(
  sessionId: string,
  includeSeats: boolean = false
): Promise<Block[] | BlockWithSeats[] | null> {
  try {
    const supabase = await createClient();

    const query = supabase
      .from('blocks')
      .select(includeSeats ? '*, seats(*)' : '*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching blocks:', error);
      return null;
    }

    // Double casting ile düzeltme
    if (includeSeats) {
      return data as unknown as BlockWithSeats[];
    }
    return data as unknown as Block[];
  } catch (error) {
    console.error('Unexpected error in getBlocks:', error);
    return null;
  }
}

/**
 * Tek bir bloğu getir
 * @param blockId - Block UUID
 * @param includeSeats - Koltukları da getir mi?
 * @returns Block veya null
 */
export async function getBlockById(
  blockId: string,
  includeSeats: boolean = false
): Promise<Block | BlockWithSeats | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blocks')
      .select(includeSeats ? '*, seats(*)' : '*')
      .eq('id', blockId)
      .single();

    if (error) {
      console.error('Error fetching block:', error);
      return null;
    }

    // Double casting ile düzeltme
    if (includeSeats) {
      return data as unknown as BlockWithSeats;
    }
    return data as unknown as Block;
  } catch (error) {
    console.error('Unexpected error in getBlockById:', error);
    return null;
  }
}

// ============================================
// RESERVATION QUERIES
// ============================================

/**
 * Kullanıcının rezervasyonlarını getir
 * @param userId - User UUID
 * @returns Reservation array veya null
 */
export async function getUserReservations(
  userId: string
): Promise<ReservationWithDetails[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        session:sessions(*),
        reservation_items(
          *,
          seat:seats(*),
          session_category:session_categories(
            *,
            ticket_category:ticket_categories(*)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user reservations:', error);
      return null;
    }

    return data as ReservationWithDetails[];
  } catch (error) {
    console.error('Unexpected error in getUserReservations:', error);
    return null;
  }
}

/**
 * Rezervasyon ID ile getir
 * @param reservationId - Reservation UUID
 * @returns Reservation with details veya null
 */
export async function getReservationById(
  reservationId: string
): Promise<ReservationWithDetails | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        session:sessions(*),
        reservation_items(
          *,
          seat:seats(*),
          session_category:session_categories(
            *,
            ticket_category:ticket_categories(*)
          )
        )
      `)
      .eq('id', reservationId)
      .single();

    if (error) {
      console.error('Error fetching reservation:', error);
      return null;
    }

    return data as ReservationWithDetails;
  } catch (error) {
    console.error('Unexpected error in getReservationById:', error);
    return null;
  }
}

// ============================================
// TICKET CATEGORY QUERIES (Bilet Kategorileri)
// ============================================

/**
 * Tüm aktif bilet kategorileri getir
 * @returns TicketCategory array veya null
 */
export async function getTicketCategories() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ticket_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching ticket categories:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getTicketCategories:', error);
    return null;
  }
}

/**
 * Slug ile bilet kategorisi getir
 * @param slug - TicketCategory slug
 * @returns TicketCategory veya null
 */
export async function getTicketCategoryBySlug(slug: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ticket_categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching ticket category:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getTicketCategoryBySlug:', error);
    return null;
  }
}
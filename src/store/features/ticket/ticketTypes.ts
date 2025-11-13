import type { Block, LayoutType, Seat, SessionStatus } from '@/types/session.types';

/**
 * Session bilgisi (Redux'ta tutulacak minimal data)
 */
export interface SessionInfo {
  id: string;
  slug: string;
  layoutType: LayoutType;
  eventTitle: string;
  eventPoster: string;
  sessionDate: string;
  sessionTime: string;
  venueName: string;
  venueCity: string;
  status: SessionStatus;
  reservationDuration: number; // dakika (10)
}

/**
 * Adet seçimli - Kategori bilgisi
 */
export interface QuantityCategory {
  sessionCategoryId: string;
  categoryName: string; // "1.Kat", "Öğrenci"
  price: number;
  quantity: number;
  maxPerOrder: number | null;
  color: string;
  reservationItemId?: string; // Backend'den dönen reservation_item_id
}

/**
 * Rezervasyon bilgisi
 */
export interface ReservationInfo {
  reservationId: string | null; // Backend'den dönen reservation ID
  startTime: number | null; // timestamp
  duration: number; // dakika
  isLoading: boolean; // Async işlem devam ediyor mu?
  error: string | null; // Hata mesajı
}

/**
 * Quantity Layout State
 */
export interface QuantityState {
  selectedCategories: QuantityCategory[];
  totalPrice: number;
  totalQuantity: number;
}

// ============================================
// BLOCK LAYOUT TYPES (YENİ)
// ============================================

/**
 * Block seçimli - Seçili koltuk bilgisi
 */
export interface SelectedBlockSeat {
  seatId: string;
  blockId: string;
  blockNumber: string;
  blockName: string;
  rowLabel: string;
  seatNumber: string;
  price: number;
  color: string;
}

/**
 * Block Layout State
 */
export interface BlockState {
  // Canvas state
  zoom: number; // 0.5 - 8
  pan: { x: number; y: number };

  // Data
  blocks: Block[];
  seats: Record<string, Seat[]>;

  // Selection
  selectedSeats: SelectedBlockSeat[];
  hoveredBlockId: string | null;
  hoveredSeatId: string | null;

  // UI State
  isLoadingBlocks: boolean;
  isLoadingSeats: Record<string, boolean>; // blockId → loading state
  error: string | null;
}

/**
 * Ana Ticket State
 */
export interface TicketState {
  // Ortak bilgiler
  layoutType: LayoutType | null;
  session: SessionInfo | null;
  reservation: ReservationInfo;
  
  // Quantity layout
  quantity: QuantityState;
  
  // TODO: Seat map layout
  // seatMap: SeatMapState;
  
  // Block layout
  block: BlockState;
}

/**
 * Initial State (başlangıç değerleri)
 */
export const initialTicketState: TicketState = {
  layoutType: null,
  session: null,
  reservation: {
    reservationId: null,
    startTime: null,
    duration: 10, // default 10 dakika
    isLoading: false,
    error: null,
  },
  quantity: {
    selectedCategories: [],
    totalPrice: 0,
    totalQuantity: 0,
  },
  block: {
    zoom: 1,
    pan: { x: 0, y: 0 },
    blocks: [],
    seats: {},
    selectedSeats: [],
    hoveredBlockId: null,
    hoveredSeatId: null,
    isLoadingBlocks: false,
    isLoadingSeats: {},
    error: null,
  },
};

// ============================================
// SELECTOR HELPERS (Opsiyonel)
// ============================================

/**
 * Rezervasyon loading durumu
 * Component'lerde kullanım için
 */
export const selectIsReservationLoading = (state: { ticket: TicketState }) => 
  state.ticket.reservation.isLoading;

/**
 * Rezervasyon error durumu
 * Component'lerde kullanım için
 */
export const selectReservationError = (state: { ticket: TicketState }) => 
  state.ticket.reservation.error;

/**
 * Rezervasyon var mı?
 * Component'lerde kullanım için
 */
export const selectHasReservation = (state: { ticket: TicketState }) => 
  state.ticket.reservation.reservationId !== null;

/**
 * Rezervasyon ID
 * Component'lerde kullanım için
 */
export const selectReservationId = (state: { ticket: TicketState }) => 
  state.ticket.reservation.reservationId;

/**
 * Kalan süre (saniye)
 * Component'lerde kullanım için
 */
export const selectRemainingTime = (state: { ticket: TicketState }) => {
  const { startTime, duration } = state.ticket.reservation;
  if (!startTime) return 0;
  
  const elapsed = Date.now() - startTime;
  const total = duration * 60 * 1000; // ms'ye çevir
  const remaining = total - elapsed;
  
  return Math.max(0, Math.floor(remaining / 1000)); // saniye
};
import type { LayoutType, SessionStatus } from '@/types/session.types';

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
}

/**
 * Rezervasyon bilgisi
 */
export interface ReservationInfo {
  startTime: number | null; // timestamp
  duration: number; // dakika
}

/**
 * Quantity Layout State
 */
export interface QuantityState {
  selectedCategories: QuantityCategory[];
  totalPrice: number;
  totalQuantity: number;
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
  
  // TODO: Block layout
  // block: BlockState;
}

/**
 * Initial State (başlangıç değerleri)
 */
export const initialTicketState: TicketState = {
  layoutType: null,
  session: null,
  reservation: {
    startTime: null,
    duration: 10, // default 10 dakika
  },
  quantity: {
    selectedCategories: [],
    totalPrice: 0,
    totalQuantity: 0,
  },
};
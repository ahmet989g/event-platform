/**
 * Session & Seat Management Types
 * Type definitions for ticketing system
 * @description Event Ticketing Platform - Sessions, Seats, Blocks, Reservations
 */

// ============================================
// ENUM TYPES
// ============================================

/**
 * Layout tipi (Düzen sistemi)
 */
export const LayoutType = {
  QUANTITY: 'quantity',    // Adet seçilebilir
  SEAT_MAP: 'seat_map',    // Koltuk seçilebilir
  BLOCK: 'block',          // Bloklu yapı
} as const;
export type LayoutType = (typeof LayoutType)[keyof typeof LayoutType];

/**
 * Seans durumu
 */
export const SessionStatus = {
  UPCOMING: 'upcoming',    // Yakında
  ON_SALE: 'on_sale',      // Satışta
  SOLD_OUT: 'sold_out',    // Tükendi
  CANCELLED: 'cancelled',  // İptal edildi
} as const;
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

/**
 * Koltuk tipi
 */
export const SeatType = {
  REGULAR: 'regular',      // Normal koltuk
  STAGE: 'stage',          // Sahne göstergesi
  WHEELCHAIR: 'wheelchair', // Engelli koltuğu
  COMPANION: 'companion',  // Refakatçi koltuğu
  LABEL: 'label',          // Etiket/Gösterge (Çıkış, WC)
} as const;
export type SeatType = (typeof SeatType)[keyof typeof SeatType];

/**
 * Koltuk durumu
 */
export const SeatStatus = {
  AVAILABLE: 'available',  // Müsait
  RESERVED: 'reserved',    // Rezerve (sepette ama ödenmemiş)
  SOLD: 'sold',            // Satıldı
  BLOCKED: 'blocked',      // Kapalı
} as const;
export type SeatStatus = (typeof SeatStatus)[keyof typeof SeatStatus];

/**
 * Rezervasyon durumu
 */
export const ReservationStatus = {
  PENDING: 'pending',      // Beklemede (sepette)
  CONFIRMED: 'confirmed',  // Onaylandı (ödeme tamamlandı)
  CANCELLED: 'cancelled',  // İptal edildi
  EXPIRED: 'expired',      // Süresi doldu
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

/**
 * Blok geometri tipi
 */
export const BlockShapeType = {
  RECTANGLE: 'rectangle',  // Dikdörtgen
  POLYGON: 'polygon',      // Çokgen
  CIRCLE: 'circle',        // Daire
  ARC: 'arc',              // Yay (stadyum tribünleri için)
  CUSTOM: 'custom',        // Özel SVG path
} as const;
export type BlockShapeType = (typeof BlockShapeType)[keyof typeof BlockShapeType];

// ============================================
// DATABASE INTERFACES
// ============================================

/**
 * Bilet kategorileri (1.Kategori, 2.Kategori, Öğrenci, Tam)
 * NOT: Event categories (Tiyatro, Konser, Spor) ile karıştırılmamalı!
 */
export interface TicketCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  default_color: string; // Hex color (#FF5733)
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Layout config (JSONB)
 */
export interface LayoutConfig {
  // Koltuk seçimli için
  stage_position?: 'center' | 'top-left' | 'top-right' | 'bottom-center' | 'bottom-left' | 'bottom-right';
  stage_width?: number;
  stage_height?: number;
  grid_rows?: number;
  grid_columns?: number;

  // Adet seçimli için
  general_capacity_enabled?: boolean;
  general_capacity_limit?: number;
}

/**
 * Minimap config (JSONB)
 */
export interface MinimapConfig {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  width?: number;
  height?: number;
  show_viewport?: boolean;
  clickable?: boolean;
}

/**
 * Zoom config (JSONB)
 */
export interface ZoomConfig {
  min_zoom?: number;
  max_zoom?: number;
  initial_zoom?: number;
  zoom_step?: number;
  enable_pinch?: boolean;
  enable_scroll?: boolean;
  transition_duration?: number;
}

/**
 * Seanslar
 */
export interface Session {
  id: string;
  event_id: string;
  venue_id: string | null;
  slug: string;
  session_date: string; // Date string (YYYY-MM-DD)
  session_time: string; // Time string (HH:MM:SS)
  layout_type: LayoutType;
  layout_config: LayoutConfig;
  total_capacity: number;
  available_capacity: number;
  status: SessionStatus;
  reservation_duration_minutes: number;
  minimap_enabled: boolean;
  minimap_config: MinimapConfig;
  zoom_config: ZoomConfig;
  created_at: string;
  updated_at: string;
}

/**
 * Seansa özel kategori fiyatları
 */
export interface SessionCategory {
  id: string;
  session_id: string;
  ticket_category_id: string;
  price: number; // Decimal
  color: string | null; // Override renk
  capacity: number | null; // Adet seçimli için
  available_capacity: number | null;
  max_per_order: number | null;
  is_active: boolean;
  created_at: string;
}

/**
 * Shape data (JSONB) - Blok şekil verisi
 */
export interface ShapeData {
  type: 'polygon' | 'rectangle' | 'circle' | 'arc' | 'path';
  
  // Polygon için
  points?: [number, number][]; // [[x1, y1], [x2, y2], ...]
  
  // Rectangle için
  width?: number;
  height?: number;
  
  // Circle için
  radius?: number;
  
  // Arc için
  startAngle?: number;
  endAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  
  // Custom path için
  path?: string; // SVG path string
  
  // Stil özellikleri
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

/**
 * Viewport data (JSONB) - Zoom yapıldığında odaklanacak alan
 */
export interface ViewportData {
  center: { x: number; y: number };
  zoom_scale: number;
  seat_grid?: {
    rows: number;
    columns: number;
    row_labels: string[];
    start_seat_number: number;
  };
}

/**
 * Bloklar (Bloklu yapı için)
 */
export interface Block {
  id: string;
  session_id: string;
  block_name: string;
  block_number: string;
  fill_color: string;
  total_capacity: number;
  coordinates: string; // Orijinal koordinat verisi (JSON string)
  available_capacity: number;
  shape_type: BlockShapeType;
  shape_data: ShapeData;
  position_x: number;
  position_y: number;
  zoom_level: number; // 0, 1, 2
  min_zoom: number;
  max_zoom: number;
  parent_block_id: string | null;
  viewport_data: ViewportData;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Seat metadata (JSONB)
 */
export interface SeatMetadata {
  accessibility?: boolean;
  view_rating?: number; // 1-5
  notes?: string;
  [key: string]: unknown; // Ekstra özellikler için
}

/**
 * Koltuklar
 */
export interface Seat {
  id: string;
  session_id: string;
  block_id: string | null;
  seat_number: string; // "A-15", "Sıra:F-23"
  row_number: string | null; // "A", "F"
  column_number: number | null; // 15, 23
  position_x: number;
  position_y: number;
  seat_type: SeatType;
  status: SeatStatus;
  label_text: string | null; // "Sahne", "Engelli", "Çıkış"
  rotation: number; // 0-360
  width: number;
  height: number;
  metadata: SeatMetadata;
  created_at: string;
  updated_at: string;
}

/**
 * Koltuk-Kategori ilişkisi (Many-to-Many)
 */
export interface SeatCategory {
  id: string;
  seat_id: string;
  session_category_id: string;
  sort_order: number; // Birinci tercih, ikinci tercih
  created_at: string;
}

/**
 * Rezervasyonlar
 */
export interface Reservation {
  id: string;
  user_id: string;
  session_id: string;
  status: ReservationStatus;
  total_amount: number;
  expires_at: string; // ISO timestamp
  created_at: string;
  updated_at: string;
}

/**
 * Rezervasyon detayları
 */
export interface ReservationItem {
  id: string;
  reservation_id: string;
  seat_id: string | null; // Koltuk seçimli için
  session_category_id: string;
  quantity: number; // Adet seçimli için
  unit_price: number;
  subtotal: number; // unit_price * quantity
  created_at: string;
}

// ============================================
// EXTENDED TYPES (WITH RELATIONS)
// ============================================

/**
 * Session category ticket category bilgileri ile
 */
export interface SessionCategoryWithTicketCategory extends SessionCategory {
  ticket_category: TicketCategory;
}

/**
 * Session tüm ilişkilerle
 */
export interface SessionWithRelations extends Session {
  event?: {
    id: string;
    title: string;
    slug: string;
    poster_url: string;
  };
  venue?: {
    id: string;
    name: string;
    city: string;
  };
  session_categories?: SessionCategoryWithTicketCategory[];
  blocks?: Block[];
}

/**
 * Seat kategorileri ile
 */
export interface SeatWithCategories extends Seat {
  seat_categories: (SeatCategory & {
    session_category: SessionCategoryWithTicketCategory;
  })[];
}

/**
 * Block koltukları ile
 */
export interface BlockWithSeats extends Block {
  seats: Seat[];
}

/**
 * Reservation tüm detaylarla
 */
export interface ReservationWithDetails extends Reservation {
  reservation_items: (ReservationItem & {
    seat?: Seat;
    session_category: SessionCategoryWithTicketCategory;
  })[];
  session: Session;
}

/**
 * Rezervasyon oluşturma input
 */
export interface CreateReservationInput {
  user_id: string;
  session_id: string;
  items: {
    seat_id?: string | null;
    session_category_id: string;
    quantity?: number;
    unit_price: number;
  }[];
  reservation_duration_minutes?: number;
}

// ============================================
// CART & SELECTION TYPES (Frontend)
// ============================================

/**
 * Sepetteki item (Frontend state)
 */
export interface CartItem {
  session_category_id: string;
  category_name: string;
  seat_id?: string | null; // Koltuk seçimli için
  seat_number?: string | null; // Koltuk numarası
  quantity: number; // Adet seçimli için
  unit_price: number;
  color: string;
}

/**
 * Sepet state (Frontend)
 */
export interface CartState {
  session_id: string;
  items: CartItem[];
  total_amount: number;
  expires_at: string | null; // Rezervasyon başladığında set edilir
}

/**
 * Seçili koltuk (Frontend state)
 */
export interface SelectedSeat {
  seat_id: string;
  seat_number: string;
  session_category_id: string;
  price: number;
  color: string;
}

// ============================================
// QUERY FILTER TYPES
// ============================================

/**
 * Session filtreleme
 */
export interface SessionFilters {
  event_id?: string;
  venue_id?: string;
  session_date?: string;
  status?: SessionStatus;
  layout_type?: LayoutType;
}

/**
 * Seat filtreleme
 */
export interface SeatFilters {
  session_id: string;
  block_id?: string | null;
  status?: SeatStatus | SeatStatus[];
  seat_type?: SeatType | SeatType[];
  // Viewport bazlı filtreleme
  viewport?: {
    min_x: number;
    max_x: number;
    min_y: number;
    max_y: number;
  };
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Pagination
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Layout type kontrolü
 */
export function isLayoutType(value: string): value is LayoutType {
  return Object.values(LayoutType).includes(value as LayoutType);
}

/**
 * Session status kontrolü
 */
export function isSessionStatus(value: string): value is SessionStatus {
  return Object.values(SessionStatus).includes(value as SessionStatus);
}

/**
 * Seat status kontrolü
 */
export function isSeatStatus(value: string): value is SeatStatus {
  return Object.values(SeatStatus).includes(value as SeatStatus);
}

/**
 * Reservation status kontrolü
 */
export function isReservationStatus(value: string): value is ReservationStatus {
  return Object.values(ReservationStatus).includes(value as ReservationStatus);
}
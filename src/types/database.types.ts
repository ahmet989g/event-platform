/**
 * Database Types
 * Type definitions for Supabase tables
 * @description Event Ticketing Platform - Database interfaces
 */

// ============================================
// Event Status
// ============================================

/**
 * Event status constant
 * Supabase ENUM values
 */
export const EventStatus = {
  PENDING: 'PENDING',
  TESTING: 'TESTING',
  ON_SALE: 'ON_SALE',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const;

/**
 * Event status type
 */
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

// ============================================
// Contact Info
// ============================================

/**
 * Venue contact information
 * Stored as JSONB in database
 */
export interface VenueContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

// ============================================
// Category
// ============================================

/**
 * Category interface
 * Hierarchical category system (parent-child)
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon: string | null;
  description: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Venue
// ============================================

/**
 * Venue (Physical location) interface
 */
export interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  poster_url: string;
  address: string;
  city: string;
  district: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_info: VenueContactInfo;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Event
// ============================================

/**
 * Event interface
 * Main event/activity table
 */
export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  poster_url: string;
  category_id: string;
  status: EventStatus;
  event_start_date: string | null;
  event_end_date: string | null;
  age_restriction: string | null;
  duration_minutes: number | null;
  metadata: Record<string, unknown>;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// Extended Types (with Relations)
// ============================================

/**
 * Category with events array
 * Used for listing categories with their events
 */
export interface CategoryWithEvents extends Category {
  events?: Event[];
}

/**
 * Event with category relation
 * Used when fetching event with category details
 */
export interface EventWithCategory extends Event {
  category?: Category;
}

/**
 * Event with all relations
 * Future-proof for when venue relation is added
 */
export interface EventWithRelations extends Event {
  category?: Category;
  venue?: Venue;
}

// ============================================
// Helper Types
// ============================================

/**
 * Type guard for EventStatus
 */
export function isEventStatus(value: string): value is EventStatus {
  return Object.values(EventStatus).includes(value as EventStatus);
}

/**
 * Category with children (for nested navigation)
 */
export interface CategoryWithChildren extends Category {
  children?: Category[];
}
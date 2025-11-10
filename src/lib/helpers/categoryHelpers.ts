/**
 * Category Helpers
 * Utility functions for category card operations
 * @description Format, validation, and color helpers
 */

import type { SessionCategoryWithTicketCategory } from '@/types/session.types';

// ============================================
// CONSTANTS
// ============================================

/**
 * Maksimum toplam bilet adedi
 */
export const MAX_TOTAL_QUANTITY = 10;

/**
 * Debounce delay (ms)
 */
export const DEBOUNCE_DELAY = 500;

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Fiyatı Türkçe formatında göster
 * @param price - Fiyat (number)
 * @returns Formatlanmış string (örn: "₺150,00")
 */
export function formatPrice(price: number): string {
  return `₺${price.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Kategori rengini getir
 * Session category color > Ticket category default color > fallback
 */
export function getCategoryColor(
  sessionCategory: SessionCategoryWithTicketCategory,
  fallback: string = '#00ADB5'
): string {
  return (
    sessionCategory.color ||
    sessionCategory.ticket_category.default_color ||
    fallback
  );
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Artırma işlemi yapılabilir mi?
 * @param currentQuantity - Mevcut kategori adedi
 * @param totalQuantity - Toplam seçili adet
 * @param maxPerOrder - Kategori başına max adet (null = sınırsız)
 * @returns boolean
 */
export function canIncreaseQuantity(
  currentQuantity: number,
  totalQuantity: number,
  maxPerOrder: number | null
): boolean {
  // Toplam limit kontrolü
  if (totalQuantity >= MAX_TOTAL_QUANTITY) {
    return false;
  }

  // Kategori limit kontrolü
  if (maxPerOrder !== null && currentQuantity >= maxPerOrder) {
    return false;
  }

  return true;
}

/**
 * Sold out durumu
 * @param availableCapacity - Mevcut kapasite (null ise 0 kabul edilir)
 * @returns boolean
 */
export function isSoldOut(availableCapacity: number | null): boolean {
  return availableCapacity === null || availableCapacity === 0;
}

/**
 * Warning mesajı oluştur
 * Maksimum limite ulaşıldığında gösterilecek mesaj
 */
export function getMaxWarningMessage(
  totalQuantity: number,
  currentQuantity: number,
  maxPerOrder: number | null
): string | null {
  // Hiç seçim yapılmadıysa warning yok
  if (currentQuantity === 0) {
    return null;
  }

  // Toplam limit
  if (totalQuantity >= MAX_TOTAL_QUANTITY) {
    return `Maksimum ${MAX_TOTAL_QUANTITY} bilet seçebilirsiniz`;
  }

  // Kategori limit
  if (maxPerOrder !== null && currentQuantity >= maxPerOrder) {
    return `Bu kategoriden maksimum ${maxPerOrder} bilet seçebilirsiniz`;
  }

  return null;
}

// ============================================
// CATEGORY DATA HELPERS
// ============================================

/**
 * QuantityCategory oluştur (Redux için)
 * İlk seçimde kullanılır
 */
export function createQuantityCategory(
  sessionCategory: SessionCategoryWithTicketCategory,
  quantity: number = 1
) {
  return {
    sessionCategoryId: sessionCategory.id,
    categoryName: sessionCategory.ticket_category.name,
    price: sessionCategory.price,
    quantity,
    maxPerOrder: sessionCategory.max_per_order,
    color: getCategoryColor(sessionCategory),
  };
}
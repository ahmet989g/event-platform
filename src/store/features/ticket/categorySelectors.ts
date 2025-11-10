/**
 * Category Selectors
 * Memoized selectors for performance optimization
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

// ============================================
// BASE SELECTORS (Input selectors)
// ============================================

/**
 * Tüm seçili kategorileri getir
 */
const selectSelectedCategories = (state: RootState) =>
  state.ticket.quantity.selectedCategories;

/**
 * Toplam quantity
 */
const selectTotalQuantity = (state: RootState) =>
  state.ticket?.quantity.totalQuantity;

/**
 * Reservation bilgileri
 */
const selectReservation = (state: RootState) => state.ticket?.reservation;

/**
 * Session ID
 */
const selectSessionId = (state: RootState) => state.ticket?.session?.id;

// ============================================
// MEMOIZED SELECTORS (Computed values)
// ============================================

/**
 * Belirli bir kategori seçili mi?
 * @param categoryId - Session category ID
 * @returns Category object veya undefined
 */
export const makeSelectCategoryById = () =>
  createSelector(
    [selectSelectedCategories, (_: RootState, categoryId: string) => categoryId],
    (categories, categoryId) =>
      categories.find((c) => c.sessionCategoryId === categoryId)
  );

/**
 * Belirli bir kategorinin quantity'si
 * @param categoryId - Session category ID
 * @returns Quantity sayısı (0 if not selected)
 */
export const makeSelectCategoryQuantity = () =>
  createSelector(
    [selectSelectedCategories, (_: RootState, categoryId: string) => categoryId],
    (categories, categoryId) => {
      const category = categories.find((c) => c.sessionCategoryId === categoryId);
      return category?.quantity || 0;
    }
  );

/**
 * Reservation durumu (ID + loading state)
 * Component gereksiz re-render olmasın diye combined selector
 */
export const selectReservationState = createSelector(
  [selectReservation],
  (reservation) => ({
    reservationId: reservation.reservationId,
    isLoading: reservation.isLoading,
    error: reservation.error,
  })
);

/**
 * Category seçim durumu
 * Sadece gerekli bilgileri döndür
 */
export const selectCategorySelectionState = createSelector(
  [selectTotalQuantity, selectSessionId],
  (totalQuantity, sessionId) => ({
    totalQuantity,
    sessionId,
  })
);

// ============================================
// COMPOSITE SELECTORS (Multiple inputs)
// ============================================

/**
 * Bir kategori için artırma yapılabilir mi?
 * @param categoryId - Session category ID
 * @param maxPerOrder - Max quantity per category
 * @param MAX_TOTAL - Max total quantity (default 10)
 */
export const makeSelectCanIncrease = (MAX_TOTAL: number = 10) =>
  createSelector(
    [
      selectTotalQuantity,
      makeSelectCategoryQuantity(),
      (_: RootState, __: string, maxPerOrder?: number) => maxPerOrder,
    ],
    (totalQuantity, currentQuantity, maxPerOrder) => {
      const totalCheck = totalQuantity < MAX_TOTAL;
      const categoryCheck = maxPerOrder ? currentQuantity < maxPerOrder : true;
      return totalCheck && categoryCheck;
    }
  );
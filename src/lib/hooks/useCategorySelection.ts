/**
 * useCategorySelection Hook
 * Business logic for category selection
 * @description Simple and stable - minimal optimization
 */

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useUser } from '@/contexts/UserContext';
import {
  addCategory,
  updateQuantity,
  createReservationThunk,
  updateReservationItemThunk,
  removeReservationItemThunk,
} from '@/store/features/ticket/ticketSlice';
import {
  canIncreaseQuantity,
  isSoldOut as checkSoldOut,
  createQuantityCategory,
  DEBOUNCE_DELAY,
} from '@/lib/helpers/categoryHelpers';
import type { SessionCategoryWithTicketCategory } from '@/types/session.types';

// ============================================
// TYPES
// ============================================

interface UseCategorySelectionParams {
  sessionCategory: SessionCategoryWithTicketCategory;
}

interface UseCategorySelectionReturn {
  // State
  currentQuantity: number;
  isUpdating: boolean;
  isSoldOut: boolean;
  canIncrease: boolean;
  
  // Handlers
  handleIncrease: () => void;
  handleDecrease: () => void;
  
  // Computed values
  itemId: string | undefined;
  categoryColor: string;
}

// ============================================
// HOOK
// ============================================

export function useCategorySelection({
  sessionCategory,
}: UseCategorySelectionParams): UseCategorySelectionReturn {
  const dispatch = useAppDispatch();
  const { user } = useUser();

  // Local state
  const [isUpdating, setIsUpdating] = useState(false);

  // ============================================
  // SIMPLE SELECTORS (No optimization)
  // ============================================

  const selectedCategories = useAppSelector(
    (state) => state.ticket.quantity.selectedCategories
  );

  const totalQuantity = useAppSelector(
    (state) => state.ticket.quantity.totalQuantity
  );

  const reservationId = useAppSelector(
    (state) => state.ticket.reservation.reservationId
  );

  const sessionId = useAppSelector(
    (state) => state.ticket.session?.id
  );

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const selectedCategory = selectedCategories.find(
    (c) => c.sessionCategoryId === sessionCategory.id
  );

  const currentQuantity = selectedCategory?.quantity || 0;
  const itemId = selectedCategory?.sessionCategoryId;

  const categoryColor =
    sessionCategory.color || sessionCategory.ticket_category.default_color || '#00ADB5';

  const canIncrease = canIncreaseQuantity(
    currentQuantity,
    totalQuantity,
    sessionCategory.max_per_order
  );

  const isSoldOut = checkSoldOut(sessionCategory.available_capacity);

  // ============================================
  // DEBOUNCED BACKEND UPDATE
  // ============================================

  const debouncedBackendUpdate = useDebouncedCallback(
    async (oldQuantity: number, newQuantity: number) => {
      if (!reservationId || !itemId) return;

      setIsUpdating(true);

      const result = await dispatch(
        updateReservationItemThunk({
          reservationId,
          itemId,
          categoryId: sessionCategory.id,
          oldQuantity,
          newQuantity,
          unitPrice: sessionCategory.price,
        })
      );

      // Başarısız durumu kontrol et
      if (updateReservationItemThunk.rejected.match(result)) {
        const error = result.payload;

        // Kapasite yetersiz - Optimistic update'i geri al
        if (error?.availableCapacity !== undefined) {
          dispatch(
            updateQuantity({
              categoryId: sessionCategory.id,
              quantity: error.availableCapacity,
            })
          );

          toast.error(`Maalesef sadece ${error.availableCapacity} bilet kaldı!`);
        } else {
          toast.error(error?.message || 'Bir hata oluştu');
        }
      }

      setIsUpdating(false);
    },
    DEBOUNCE_DELAY
  );

  // ============================================
  // HANDLERS
  // ============================================

  const handleFirstSelection = async () => {
    if (!sessionId) {
      toast.error('Session bilgisi bulunamadı');
      return;
    }

    const userId = user?.id || null;

    // Optimistic update
    const newCategory = createQuantityCategory(sessionCategory, 1);
    dispatch(addCategory(newCategory));

    // Backend'e rezervasyon oluştur
    const result = await dispatch(
      createReservationThunk({
        sessionId,
        userId,
        categoryId: sessionCategory.id,
        quantity: 1,
        unitPrice: sessionCategory.price,
      })
    );

    // Başarılı
    if (createReservationThunk.fulfilled.match(result)) {
      toast.success('Biletiniz rezerve edildi');
    }

    // Başarısız
    if (createReservationThunk.rejected.match(result)) {
      const error = result.payload;

      // Optimistic update'i geri al
      dispatch(
        updateQuantity({
          categoryId: sessionCategory.id,
          quantity: 0,
        })
      );

      toast.error(error?.message || 'Rezervasyon oluşturulamadı');
    }
  };

  const handleIncrease = () => {
    if (!canIncrease || isSoldOut) return;

    // Eğer ilk seçimse
    if (currentQuantity === 0) {
      handleFirstSelection();
      return;
    }

    const oldQuantity = currentQuantity;
    const newQuantity = currentQuantity + 1;

    // Optimistic update
    dispatch(
      updateQuantity({
        categoryId: sessionCategory.id,
        quantity: newQuantity,
      })
    );

    // Backend'e debounced request
    debouncedBackendUpdate(oldQuantity, newQuantity);
  };

  const handleDecrease = () => {
    if (currentQuantity === 0) return;

    const oldQuantity = currentQuantity;
    const newQuantity = currentQuantity - 1;

    // 0'a düşüyorsa özel işlem
    if (newQuantity === 0) {
      // Optimistic update
      dispatch(
        updateQuantity({
          categoryId: sessionCategory.id,
          quantity: 0,
        })
      );

      // Backend'de sil
      const currentItemId = itemId || selectedCategory?.reservationItemId;

      if (reservationId && currentItemId) {
        dispatch(
          removeReservationItemThunk({
            itemId: currentItemId,
            categoryId: sessionCategory.id,
            quantity: oldQuantity,
          })
        );
      }

      return;
    }

    // Normal azaltma
    dispatch(
      updateQuantity({
        categoryId: sessionCategory.id,
        quantity: newQuantity,
      })
    );

    debouncedBackendUpdate(oldQuantity, newQuantity);
  };

  // ============================================
  // CLEANUP
  // ============================================

  useEffect(() => {
    return () => {
      debouncedBackendUpdate.cancel();
    };
  }, [debouncedBackendUpdate]);

  // ============================================
  // RETURN
  // ============================================

  return {
    currentQuantity,
    isUpdating,
    isSoldOut,
    canIncrease,
    handleIncrease,
    handleDecrease,
    itemId,
    categoryColor,
  };
}
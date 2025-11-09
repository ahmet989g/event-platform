"use client";

/**
 * Category Card
 * Tek bir bilet kategorisini gösterir (1.Kat, Öğrenci, vb.)
 * Direkt +/- butonları ile quantity selector
 */

import { useState, useEffect, memo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addCategory,
  updateQuantity,
  createReservationThunk,
  updateReservationItemThunk,
} from '@/store/features/ticket/ticketSlice';
import type { SessionCategoryWithTicketCategory } from '@/types/session.types';
import type { QuantityCategory } from '@/store/features/ticket/ticketTypes';
import { FiPlus, FiMinus } from "react-icons/fi";
import { useDebouncedCallback } from 'use-debounce';
import { toast } from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';

interface CategoryCardProps {
  sessionCategory: SessionCategoryWithTicketCategory;
}

function CategoryCard({ sessionCategory }: CategoryCardProps) {
  const dispatch = useAppDispatch();
  const { user } = useUser();

  // Redux selectors
  const selectedCategories = useAppSelector(
    (state) => state.ticket.quantity.selectedCategories
  );
  const totalQuantity = useAppSelector((state) => state.ticket.quantity.totalQuantity);
  const reservationId = useAppSelector(
    (state) => state.ticket.reservation.reservationId
  );
  const sessionId = useAppSelector((state) => state.ticket.session?.id);
  const isLoading = useAppSelector(
    (state) => state.ticket.reservation.isLoading
  );

  // Local state
  const [isUpdating, setIsUpdating] = useState(false);

  // Bu kategori seçili mi?
  const selectedCategory = selectedCategories.find(
    (c) => c.sessionCategoryId === sessionCategory.id
  );

  const currentQuantity = selectedCategory?.quantity || 0;
  const itemId = selectedCategory?.sessionCategoryId;

  // Kategori rengi
  const categoryColor =
    sessionCategory.color || sessionCategory.ticket_category.default_color;

  // Max kontrolü
  const maxPerOrder = sessionCategory.max_per_order || 10;
  const MAX_TOTAL_QUANTITY = 10;
  const canIncrease = totalQuantity < MAX_TOTAL_QUANTITY && currentQuantity < maxPerOrder;
  const isSoldOut = sessionCategory.available_capacity === 0;

  // ============================================
  // DEBOUNCED BACKEND UPDATE
  // ============================================

  /**
   * Backend'e debounced update request
   * 500ms bekle, son değeri gönder
   */
  const debouncedBackendUpdate = useDebouncedCallback(
    async (newQuantity: number) => {
      if (!reservationId || !itemId) return;

      setIsUpdating(true);

      const result = await dispatch(
        updateReservationItemThunk({
          reservationId,
          itemId,
          categoryId: sessionCategory.id,
          oldQuantity: currentQuantity,
          newQuantity,
          unitPrice: sessionCategory.price,
        })
      );
      console.log('updateReservationItemThunk:', result);


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

          toast.error(
            `Maalesef sadece ${error.availableCapacity} bilet kaldı!`
          );
        } else {
          // Diğer hatalar (expired, vs.)
          toast.error(error?.message || 'Bir hata oluştu');
        }
      }

      setIsUpdating(false);
    },
    500 // 500ms debounce
  );

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * İLK SEÇİM (Rezervasyon oluştur)
   */
  const handleFirstSelection = async () => {
    if (!sessionId) {
      toast.error('Session bilgisi bulunamadı');
      return;
    }

    const userId = user?.id || null;

    // Optimistic update
    const newCategory: QuantityCategory = {
      sessionCategoryId: sessionCategory.id,
      categoryName: sessionCategory.ticket_category.name,
      price: sessionCategory.price,
      quantity: 1,
      maxPerOrder: sessionCategory.max_per_order,
      color: categoryColor,
    };
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

      // TODO: Backend'den dönen item ID'yi Redux'a kaydet
      // Şu an backend response'da item ID yok, eklemen gerekebilir
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

  /**
   * ARTIR (+)
   */
  const handleIncrease = () => {
    if (!canIncrease || isSoldOut) return;

    // Eğer ilk seçimse
    if (currentQuantity === 0) {
      handleFirstSelection();
      return;
    }

    const newQuantity = currentQuantity + 1;

    // Optimistic update (Redux'ı hemen güncelle)
    dispatch(
      updateQuantity({
        categoryId: sessionCategory.id,
        quantity: newQuantity,
      })
    );

    // Backend'e debounced request
    debouncedBackendUpdate(newQuantity);
  };

  /**
   * AZALT (-)
   */
  const handleDecrease = () => {
    if (currentQuantity === 0) return;

    const newQuantity = currentQuantity - 1;

    // Optimistic update
    dispatch(
      updateQuantity({
        categoryId: sessionCategory.id,
        quantity: newQuantity,
      })
    );

    // Backend'e debounced request
    debouncedBackendUpdate(newQuantity);
  };

  // ============================================
  // CLEANUP
  // ============================================

  useEffect(() => {
    return () => {
      // Component unmount olduğunda pending debounce'ları iptal et
      debouncedBackendUpdate.cancel();
    };
  }, [debouncedBackendUpdate]);

  // ============================================
  // RENDER
  // ============================================

  // Fiyat formatı
  const formattedPrice = `₺${sessionCategory.price.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-6 transition-all hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50">
      {/* Color Indicator */}
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ backgroundColor: categoryColor }}
      />

      <div className="flex items-center gap-6 pl-4">
        {/* Sol: Category Name & Price */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {sessionCategory.ticket_category.name}
          </h3>
          {sessionCategory.ticket_category.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {sessionCategory.ticket_category.description}
            </p>
          )}
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Sağ: Quantity Selector */}
        <div className="flex items-center gap-3">
          {/* Decrease Button */}
          {isLoading || isUpdating ? (
            <div className="ml-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
            </div>
          ) : (
            <button
              onClick={handleDecrease}
              disabled={currentQuantity === 0 || isLoading || isUpdating}
              className="flex h-11 w-11 items-center justify-center rounded-lg cursor-pointer transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              aria-label="Azalt"
            >
              <FiMinus className="h-5 w-5" />
            </button>
          )}

          {/* Quantity Display */}
          <span className="flex h-11 w-10 items-center justify-center text-lg font-bold dark:bg-gray-800">
            {currentQuantity}
          </span>

          {/* Increase Button */}
          {isLoading || isUpdating ? (
            <div className="ml-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
            </div>
          ) : (
            <button
              onClick={handleIncrease}
              disabled={isSoldOut || !canIncrease || isLoading || isUpdating}
              className="flex h-11 w-11 items-center justify-center rounded-lg cursor-pointer transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              aria-label="Arttır"
            >
              <FiPlus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Sold Out Overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-900/50 backdrop-blur-sm">
          <span className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
            Tükendi
          </span>
        </div>
      )}

      {/* Max Warning */}
      {!canIncrease && currentQuantity > 0 && !isSoldOut && (
        <div className="mt-3 pl-4 text-xs text-amber-600 dark:text-amber-400">
          {totalQuantity >= MAX_TOTAL_QUANTITY
            ? `Maksimum ${MAX_TOTAL_QUANTITY} bilet seçebilirsiniz`
            : `Bu kategoriden maksimum ${maxPerOrder} bilet seçebilirsiniz`}
        </div>
      )}
    </div>
  );
}

export default memo(CategoryCard);
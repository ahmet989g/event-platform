"use client";

/**
 * Category Card
 * Tek bir bilet kategorisini gösterir (1.Kat, Öğrenci, vb.)
 * Direkt +/- butonları ile quantity selector
 */

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addCategory, updateQuantity } from '@/store/features/ticket/ticketSlice';
import type { SessionCategoryWithTicketCategory } from '@/types/session.types';
import type { QuantityCategory } from '@/store/features/ticket/ticketTypes';
import { FiPlus, FiMinus } from "react-icons/fi";

interface CategoryCardProps {
  sessionCategory: SessionCategoryWithTicketCategory;
}

export default function CategoryCard({ sessionCategory }: CategoryCardProps) {
  const dispatch = useAppDispatch();

  // Redux'tan seçili kategorileri al
  const selectedCategories = useAppSelector(
    (state) => state.ticket.quantity.selectedCategories
  );
  const totalQuantity = useAppSelector((state) => state.ticket.quantity.totalQuantity);

  // Bu kategori seçili mi?
  const selectedCategory = selectedCategories.find(
    (c) => c.sessionCategoryId === sessionCategory.id
  );

  const currentQuantity = selectedCategory?.quantity || 0;

  // Kategori rengi (override varsa onu kullan, yoksa default)
  const categoryColor =
    sessionCategory.color || sessionCategory.ticket_category.default_color;

  // Max per order kontrolü
  const maxPerOrder = sessionCategory.max_per_order || 10; // Default 10

  // Toplam max kontrolü (tüm kategoriler toplamda max 10)
  const MAX_TOTAL_QUANTITY = 10;
  const canIncrease = totalQuantity < MAX_TOTAL_QUANTITY && currentQuantity < maxPerOrder;

  // Kategori ekle/arttır
  const handleIncrease = () => {
    if (!canIncrease) return;

    if (currentQuantity === 0) {
      // İlk kez ekleniyor
      const newCategory: QuantityCategory = {
        sessionCategoryId: sessionCategory.id,
        categoryName: sessionCategory.ticket_category.name,
        price: sessionCategory.price,
        quantity: 1,
        maxPerOrder: sessionCategory.max_per_order,
        color: categoryColor,
      };
      dispatch(addCategory(newCategory));
    } else {
      // Adet arttır
      dispatch(
        updateQuantity({
          categoryId: sessionCategory.id,
          quantity: currentQuantity + 1,
        })
      );
    }
  };

  // Adet azalt
  const handleDecrease = () => {
    if (currentQuantity > 0) {
      dispatch(
        updateQuantity({
          categoryId: sessionCategory.id,
          quantity: currentQuantity - 1,
        })
      );
    }
  };

  // Fiyat formatı: ₺750,00 veya ₺1.500,00
  const formattedPrice = `₺${sessionCategory.price.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  // Bilet tükendi mi?
  const isSoldOut = sessionCategory.available_capacity === 0;

  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-6 transition-all hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50">
      {/* Color Indicator - Sol taraf */}
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
          <button
            onClick={handleDecrease}
            disabled={currentQuantity === 0}
            className="flex h-11 w-11 items-center justify-center rounded-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Azalt"
          >
            <FiMinus className="h-5 w-5" />
          </button>

          {/* Quantity Display */}
          <span className="flex h-11 w-14 items-center justify-center text-lg font-bold dark:bg-gray-800">
            {currentQuantity}
          </span>

          {/* Increase Button */}
          <button
            onClick={handleIncrease}
            disabled={isSoldOut || !canIncrease}
            className="flex h-11 w-11 items-center justify-center rounded-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Arttır"
          >
            <FiPlus className="h-5 w-5" />
          </button>
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
            ? 'Maksimum 10 adet bilet seçebilirsiniz'
            : `Maksimum ${maxPerOrder} adet seçebilirsiniz`}
        </div>
      )}
    </div>
  );
}
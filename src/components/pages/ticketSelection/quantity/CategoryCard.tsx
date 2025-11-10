/**
 * Category Card (Simple & Stable)
 * Pure UI component with proper memo optimization
 */

"use client";

import { memo } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { useCategorySelection } from '@/lib/hooks/useCategorySelection';
import { formatPrice, getMaxWarningMessage } from '@/lib/helpers/categoryHelpers';
import type { SessionCategoryWithTicketCategory } from '@/types/session.types';

// ============================================
// TYPES
// ============================================

interface CategoryCardProps {
  sessionCategory: SessionCategoryWithTicketCategory;
  totalQuantity: number;
}

// ============================================
// COMPONENT
// ============================================

function CategoryCard({ sessionCategory, totalQuantity }: CategoryCardProps) {
  // Business logic hook
  const {
    currentQuantity,
    isUpdating,
    isSoldOut,
    canIncrease,
    handleIncrease,
    handleDecrease,
    categoryColor,
  } = useCategorySelection({ sessionCategory });

  console.log('Rendering CategoryCard:', sessionCategory.id);

  // Computed values
  const formattedPrice = formatPrice(sessionCategory.price);
  const warningMessage = getMaxWarningMessage(
    totalQuantity,
    currentQuantity,
    sessionCategory.max_per_order
  );

  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-6 transition-all hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50">
      {/* Color Indicator */}
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ backgroundColor: categoryColor }}
      />

      <div className="flex items-center gap-6 pl-4">
        {/* Category Info */}
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

        {/* Quantity Selector */}
        <div className="flex items-center gap-3">
          {/* Decrease */}
          {isUpdating ? (
            <LoadingSpinner />
          ) : (
            <button
              onClick={handleDecrease}
              disabled={currentQuantity === 0 || isUpdating}
              className="flex h-11 w-11 items-center justify-center rounded-lg cursor-pointer transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              aria-label="Azalt"
            >
              <FiMinus className="h-5 w-5" />
            </button>
          )}

          {/* Quantity */}
          <span className="flex h-11 w-10 items-center justify-center text-lg font-bold dark:bg-gray-800">
            {currentQuantity}
          </span>

          {/* Increase */}
          {isUpdating ? (
            <LoadingSpinner />
          ) : (
            <button
              onClick={handleIncrease}
              disabled={isSoldOut || !canIncrease || isUpdating}
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
      {warningMessage && !isSoldOut && (
        <div className="mt-3 pl-4 text-xs text-amber-600 dark:text-amber-400">
          {warningMessage}
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function LoadingSpinner() {
  return (
    <div className="flex h-11 w-11 items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
    </div>
  );
}

// ============================================
// MEMO COMPARISON
// ============================================

/**
 * Custom comparison - sadece ID ve totalQuantity değişirse re-render
 */
function arePropsEqual(
  prev: CategoryCardProps,
  next: CategoryCardProps
): boolean {
  // ID değiştiyse re-render
  if (prev.sessionCategory.id !== next.sessionCategory.id) {
    return false;
  }

  // totalQuantity değiştiyse re-render
  if (prev.totalQuantity !== next.totalQuantity) {
    return false;
  }

  // Diğer durumlarda re-render yapma
  return true;
}

// ============================================
// EXPORT
// ============================================

export default memo(CategoryCard, arePropsEqual);
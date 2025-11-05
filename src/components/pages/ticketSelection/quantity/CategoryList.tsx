"use client";

/**
 * Category List
 * Session kategorilerini listeler (1.Kat, Öğrenci, vb.)
 */

import type { SessionCategoryWithTicketCategory } from '@/types/session.types';
import CategoryCard from './CategoryCard';

interface CategoryListProps {
  sessionCategories: SessionCategoryWithTicketCategory[];
}

export default function CategoryList({ sessionCategories }: CategoryListProps) {
  // Aktif kategorileri filtrele
  const activeCategories = sessionCategories.filter((sc) => sc.is_active);

  // Kategori yoksa
  if (activeCategories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-900/50">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          Bilet Kategorisi Bulunamadı
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Bu seans için henüz bilet kategorisi eklenmemiş.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Bilet Kategorisi Seçin
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Lütfen istediğiniz bilet kategorisini ve adedi seçin
        </p>
      </div>

      {/* Category Cards - Tek Kolon */}
      <div className="space-y-4">
        {activeCategories.map((sessionCategory) => (
          <CategoryCard
            key={sessionCategory.id}
            sessionCategory={sessionCategory}
          />
        ))}
      </div>
    </div>
  );
}
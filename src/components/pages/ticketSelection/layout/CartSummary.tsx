"use client";

/**
 * Cart Summary (Sepet Özeti)
 * Seçilen biletler, toplam fiyat ve countdown
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeCategory, resetState } from '@/store/features/ticket/ticketSlice';
import Image from 'next/image';
import CountdownTimer from './CountdownTimer';
import TimeExpiredModal from './TimeExpiredModal';
import { MdOutlineConfirmationNumber } from 'react-icons/md';
import { HiOutlineTrash } from 'react-icons/hi2';

interface CartSummaryProps {
  eventTitle: string;
  eventPoster: string;
  sessionDate: string;
  sessionTime: string;
  venueName: string;
  reservationDuration: number;
  eventUrl: string; // Event detail sayfası URL'i
}

export default function CartSummary({
  eventTitle,
  eventPoster,
  sessionDate,
  sessionTime,
  venueName,
  reservationDuration,
  eventUrl,
}: CartSummaryProps) {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redux'tan seçili kategorileri al
  const selectedCategories = useAppSelector(
    (state) => state.ticket.quantity.selectedCategories
  );
  const totalPrice = useAppSelector((state) => state.ticket.quantity.totalPrice);
  const totalQuantity = useAppSelector((state) => state.ticket.quantity.totalQuantity);
  const reservationStartTime = useAppSelector(
    (state) => state.ticket.reservation.startTime
  );

  const hasSelection = selectedCategories.length > 0;

  // Session tarih formatı
  const formattedDate = new Date(sessionDate).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  const formattedTime = sessionTime.slice(0, 5); // "20:30:00" → "20:30"

  // Fiyat formatı: ₺8.000,00
  const formatPrice = (price: number) => {
    return `₺${price.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Kategori sil
  const handleRemove = (categoryId: string) => {
    dispatch(removeCategory(categoryId));
  };

  // Süre doldu callback
  const handleTimeExpired = () => {
    dispatch(resetState());
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Bilet Detayları
          </h2>
        </div>

        {/* Event Info */}
        <div className="mb-6 flex gap-4">
          {/* Poster */}
          <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={eventPoster}
              alt={eventTitle}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>

          {/* Event Details */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
              {eventTitle}
            </h3>
            <div className="mt-1 space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>{formattedDate}</p>
              <p>
                {formattedTime} - {venueName}
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        {reservationStartTime && (
          <div className="mb-6 flex justify-center">
            <CountdownTimer
              startTime={reservationStartTime}
              duration={reservationDuration}
              onTimeExpired={handleTimeExpired}
            />
          </div>
        )}

        {/* Divider */}
        <div className="mb-6 border-t border-gray-200 dark:border-gray-800" />

        {/* Selected Tickets */}
        {hasSelection ? (
          <div className="mb-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Seçilen Biletler ({totalQuantity})
            </h3>

            {selectedCategories.map((category) => (
              <div
                key={category.sessionCategoryId}
                className="flex items-center justify-between gap-3"
              >
                {/* Category Info */}
                <div className="flex flex-1 items-center gap-2">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {category.categoryName} x{category.quantity}
                  </span>
                </div>

                {/* Price */}
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatPrice(category.price * category.quantity)}
                </span>

                {/* Trash Icon */}
                <button
                  onClick={() => handleRemove(category.sessionCategoryId)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  aria-label="Kategoriyi kaldır"
                >
                  <HiOutlineTrash size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6 py-6 text-center">
            <MdOutlineConfirmationNumber className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-700" />
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Henüz bilet seçmediniz
            </p>
          </div>
        )}

        {/* Divider */}
        {hasSelection && (
          <div className="mb-6 border-t border-gray-200 dark:border-gray-800" />
        )}

        {/* Total */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Toplam
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(totalPrice)}
          </span>
        </div>

        {/* Checkout Button */}
        <button
          disabled={!hasSelection}
          className="w-full rounded-lg bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          Ödemeye Geç
        </button>

        {/* Info */}
        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
          <p>
            Biletleriniz {reservationDuration} dakika boyunca sizin için rezerve
            edilecektir.
          </p>
        </div>
      </div>

      {/* Time Expired Modal */}
      <TimeExpiredModal isOpen={isModalOpen} eventUrl={eventUrl} />
    </>
  );
}
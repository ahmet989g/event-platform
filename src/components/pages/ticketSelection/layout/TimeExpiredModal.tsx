"use client";

/**
 * Time Expired Modal
 * React Portal ile document.body'ye render edilir
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineAccessTime } from 'react-icons/md';

interface TimeExpiredModalProps {
  isOpen: boolean;
  eventUrl: string;
}

export default function TimeExpiredModal({ isOpen, eventUrl }: TimeExpiredModalProps) {
  useEffect(() => {
    // Modal açıkken scroll'u engelle
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    // Hard navigation (router.push yerine)
    window.location.href = eventUrl;
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <MdOutlineAccessTime className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Süreniz Doldu
        </h2>

        {/* Message */}
        <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
          Rezervasyon süreniz dolmuştur. Seçtiğiniz biletler iptal edilmiştir. Lütfen tekrar
          seçim yapın.
        </p>

        {/* Button */}
        <button
          onClick={handleClose}
          className="w-full rounded-lg bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 cursor-pointer"
        >
          Tamam
        </button>
      </div>
    </div>
  );

  // Portal ile document.body'ye render et
  return createPortal(modalContent, document.body);
}
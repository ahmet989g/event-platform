"use client";

/**
 * USE RESERVATION CLEANUP HOOK
 * Sayfa çıkışında rezervasyonu otomatik iptal et
 * 
 * - Component unmount (route değişimi)
 * - beforeunload (sayfa kapatma/yenileme)
 * - Pathname change (Next.js navigation)
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { cancelReservationThunk } from '@/store/features/ticket/ticketSlice';

export function useReservationCleanup() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  // Redux'tan rezervasyon ID'sini al
  const reservationId = useAppSelector(
    (state) => state.ticket.reservation.reservationId
  );

  // Ref ile en güncel reservationId'yi takip et
  const reservationIdRef = useRef(reservationId);

  useEffect(() => {
    reservationIdRef.current = reservationId;
  }, [reservationId]);

  // ============================================
  // CLEANUP FUNCTIONS
  // ============================================

  /**
   * Rezervasyonu iptal et (async)
   */
  const cancelReservationAsync = async () => {
    const currentReservationId = reservationIdRef.current;
    if (!currentReservationId) return;

    await dispatch(cancelReservationThunk(currentReservationId));
  };

  /**
   * Rezervasyonu iptal et (sync - sendBeacon ile)
   */
  const cancelReservationSync = () => {
    const currentReservationId = reservationIdRef.current;
    if (!currentReservationId) return;

    // sendBeacon ile backend'e request gönder
    const data = JSON.stringify({ reservationId: currentReservationId });
    const apiUrl = `${window.location.origin}/api/cancel-reservation`;

    if (navigator.sendBeacon) {
      navigator.sendBeacon(apiUrl, data);
    }
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * beforeunload - Sayfa kapatma/yenileme
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!reservationIdRef.current) return;

      // Kullanıcıya uyarı göster
      e.preventDefault();
      e.returnValue = '';

      // Sync iptal et
      cancelReservationSync();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  /**
   * Component unmount - Route değişimi
   */
  useEffect(() => {
    return () => {
      if (reservationIdRef.current) {
        cancelReservationAsync();
      }
    };
  }, []);

  /**
   * Pathname change - Route değişimi
   */
  useEffect(() => {
    const isTicketSelectionPage = pathname?.includes('/koltuk-secimi');

    // Eğer bilet seçim sayfasından çıkılıyorsa
    if (!isTicketSelectionPage && reservationIdRef.current) {
      cancelReservationAsync();
    }
  }, [pathname]);
}
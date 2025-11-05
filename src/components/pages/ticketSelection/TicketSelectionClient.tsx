"use client";

/**
 * Bilet Seçim Client Component
 * Redux'a session kaydetme ve layout'a göre component render
 */

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setSession, startReservation, resetState } from '@/store/features/ticket/ticketSlice';
import type { Event } from '@/types/database.types';
import type { SessionWithRelations } from '@/types/session.types';
import type { SessionInfo } from '@/store/features/ticket/ticketTypes';
import QuantityLayout from './quantity/QuantityLayout';

interface TicketSelectionClientProps {
  event: Event & { category: { name: string; slug: string } };
  session: SessionWithRelations;
  categorySlug: string;
}

export default function TicketSelectionClient({
  event,
  session,
  categorySlug,
}: TicketSelectionClientProps) {
  const dispatch = useAppDispatch();

  // Session bilgisini Redux'a kaydet ve rezervasyon başlat
  useEffect(() => {
    // Session bilgisini hazırla (Redux için minimal data)
    const sessionInfo: SessionInfo = {
      id: session.id,
      slug: session.slug,
      layoutType: session.layout_type,
      eventTitle: event.title,
      eventPoster: event.poster_url,
      sessionDate: session.session_date,
      sessionTime: session.session_time,
      venueName: session.venue?.name || 'Mekan Belirtilmemiş',
      venueCity: session.venue?.city || '',
      status: session.status,
      reservationDuration: session.reservation_duration_minutes,
    };

    // Redux'a kaydet
    dispatch(setSession(sessionInfo));

    // Rezervasyon başlat (countdown başlar)
    dispatch(startReservation());

    // Cleanup: Component unmount olduğunda state'i temizle
    return () => {
      dispatch(resetState());
    };
  }, [dispatch, session, event]);

  // Layout tipine göre component render et
  const renderLayout = () => {
    switch (session.layout_type) {
      case 'quantity':
        return (
          <QuantityLayout
            session={session}
            event={event}
            categorySlug={categorySlug}
          />
        );

      case 'seat_map':
        // TODO: Koltuk haritası
        return (
          <div className="container mx-auto !px-0 py-12">
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-900/50">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Koltuk haritası yakında eklenecek...
              </p>
            </div>
          </div>
        );

      case 'block':
        // TODO: Blok seçimi
        return (
          <div className="container mx-auto !px-0 py-12">
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-900/50">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Blok seçimi yakında eklenecek...
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="container mx-auto !px-0 py-12">
            <div className="rounded-xl border border-red-300 bg-red-50 p-12 text-center dark:border-red-800 dark:bg-red-900/20">
              <p className="text-lg text-red-600 dark:text-red-400">
                Bilinmeyen layout tipi: {session.layout_type}
              </p>
            </div>
          </div>
        );
    }
  };

  return <>{renderLayout()}</>;
}
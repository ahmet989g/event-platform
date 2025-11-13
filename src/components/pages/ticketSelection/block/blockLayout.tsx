"use client";

/**
 * Block Layout (Blok Seçimli)
 * 2 kolonlu layout: Sol canvas harita, Sağ sepet özeti
 * QuantityLayout ile aynı mantık
 */

import type { Event } from '@/types/database.types';
import type { Block, SessionWithRelations } from '@/types/session.types';
import BlockCanvas from './blockCanvas'
import CartSummary from '../layout/CartSummary';
import Link from 'next/link';
import { useReservationCleanup } from '@/lib/hooks/useReservationCleanup';
import {
  resetState,
  setSession,
  startReservation,
  resetBlockState
} from '@/store/features/ticket/ticketSlice';
import { SessionInfo } from '@/store/features/ticket/ticketTypes';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';

interface BlockLayoutProps {
  session: SessionWithRelations;
  event: Event & { category: { name: string; slug: string } };
  categorySlug: string;
  blocks: Block[];
}

export default function BlockLayout({
  session,
  event,
  categorySlug,
  blocks
}: BlockLayoutProps) {
  const dispatch = useAppDispatch();

  // Breadcrumb & Event URL
  const eventUrl = `/${categorySlug}/${event.slug}`;

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
      dispatch(resetBlockState());
    };
  }, [dispatch, session, event]);

  // Rezervasyon temizleme hook'u (sayfadan ayrılınca rezervasyonu iptal et)
  useReservationCleanup();

  return (
    <div className="container mx-auto !px-0 py-8">
      {/* Breadcrumb / Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-primary">
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link href={`/${categorySlug}`} className="hover:text-primary">
            {event.category.name}
          </Link>
          <span>/</span>
          <Link href={eventUrl} className="hover:text-primary">
            {event.title}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Koltuk Seçimi</span>
        </nav>
      </div>

      {/* Main Grid - 2 Kolon */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Sol: Block Canvas Harita */}
        <div>
          <BlockCanvas sessionId={session.id} blocks={blocks} />
        </div>

        {/* Sağ: Sepet Özeti (Sticky) */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <CartSummary
            eventTitle={event.title}
            eventPoster={event.poster_url}
            sessionDate={session.session_date}
            sessionTime={session.session_time}
            venueName={session.venue?.name || 'Mekan Belirtilmemiş'}
            reservationDuration={session.reservation_duration_minutes}
            eventUrl={eventUrl}
          />
        </div>
      </div>
    </div>
  );
}
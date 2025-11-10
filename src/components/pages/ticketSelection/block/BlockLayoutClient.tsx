"use client";

/**
 * Block Layout Client Component
 * Block-based seating layout - Client side interactivity
 * @description Event Ticketing Platform - Block seating UI
 */

import { useEffect, useState } from 'react';
import { BlockCanvas } from './BlockCanvas';
import type { Event } from '@/types/database.types';
import type { SessionWithRelations } from '@/types/session.types';
import type { Block } from '@/types/seating/block.types';
import type { Seat } from '@/types/seating/seat.types';
import { useReservationCleanup } from '@/lib/hooks/useReservationCleanup';
import { resetState, setSession, startReservation } from '@/store/features/ticket/ticketSlice';
import { SessionInfo } from '@/store/features/ticket/ticketTypes';
import { useAppDispatch } from '@/store/hooks';
import Link from 'next/link';
import CartSummary from '../layout/CartSummary';

// ============================================
// TYPES
// ============================================

interface BlockLayoutClientProps {
  session: SessionWithRelations;
  event: Event & { category: { name: string; slug: string } };
  categorySlug: string;
  blocks: Block[];
  seats: Seat[];
}

// ============================================
// CLIENT COMPONENT
// ============================================

export default function BlockLayoutClient({
  session,
  event,
  categorySlug,
  blocks,
  seats,
}: BlockLayoutClientProps) {
  // Breadcrumb & Event URL
  const eventUrl = `/${categorySlug}/${event.slug}`;
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
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

  // Rezervasyon temizleme hook'u (sayfadan ayrılınca rezervasyonu iptal et)
  useReservationCleanup();

  // ============================================
  // HANDLERS
  // ============================================

  const handleBlockSelect = (blockId: string | null) => {
    setSelectedBlockId(blockId);
    console.log('Block selected:', blockId);
  };

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) {
        // Deselect
        return prev.filter((id) => id !== seatId);
      } else {
        // Select
        return [...prev, seatId];
      }
    });
    console.log('Seat toggled:', seatId);
  };

  // ============================================
  // RENDER
  // ============================================

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
          <span className="text-gray-900 dark:text-white">Bilet Seçimi</span>
        </nav>
      </div>

      {/* Main Grid - 2 Kolon */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Sol: Canvas */}
        <div>
          <BlockCanvas
            blocks={blocks}
            seats={seats}
            width={1200}
            height={800}
            selectedBlockId={selectedBlockId}
            selectedSeatIds={selectedSeatIds}
            onBlockSelect={handleBlockSelect}
            onSeatSelect={handleSeatSelect}
            showLegend
            showBlockLabels
            showCapacity={false}
          />
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
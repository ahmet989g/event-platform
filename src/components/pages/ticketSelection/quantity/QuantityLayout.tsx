"use client";

/**
 * Quantity Layout (Adet Seçimli)
 * 2 kolonlu layout: Sol kategori listesi, Sağ sepet özeti
 */

import type { Event } from '@/types/database.types';
import type { SessionWithRelations } from '@/types/session.types';
import CategoryList from './CategoryList';
import CartSummary from '../layout/CartSummary';
import Link from 'next/link';

interface QuantityLayoutProps {
  session: SessionWithRelations;
  event: Event & { category: { name: string; slug: string } };
  categorySlug: string;
}

export default function QuantityLayout({
  session,
  event,
  categorySlug,
}: QuantityLayoutProps) {
  // Breadcrumb & Event URL
  const eventUrl = `/${categorySlug}/${event.slug}`;

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
        {/* Sol: Kategori Listesi */}
        <div>
          <CategoryList sessionCategories={session.session_categories || []} />
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
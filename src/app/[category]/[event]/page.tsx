/**
 * Event Detail Page
 * Ana event detay sayfası - Server Component
 * @description Event bilgileri ve seansları gösterir
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventBySlug } from '@/utils/supabase/queries';
import { getSessionsByEvent } from '@/utils/supabase/session-queries';
import EventHeader from '@/components/pages/eventDetail/EventHeader';
import SessionsList from '@/components/pages/eventDetail/SessionsList';
import StructuredData from '@/components/pages/eventDetail/StructuredData';

interface EventDetailPageProps {
  params: Promise<{
    category: string;
    event: string;
  }>;
}

/**
 * Metadata oluştur (SEO)
 */
export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { event: eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);

  if (!event) {
    return {
      title: 'Etkinlik Bulunamadı',
    };
  }

  const description =
    event.description ||
    `${event.title} etkinliği için bilet satışı. Seansları görüntüleyin ve biletinizi hemen alın.`;

  return {
    title: `${event.title} - Biletler | EventPlatform`,
    description,
    openGraph: {
      title: event.title,
      description,
      images: event.poster_url ? [event.poster_url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: event.poster_url ? [event.poster_url] : [],
    },
  };
}

/**
 * Event Detail Page Component
 */
export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { category: categorySlug, event: eventSlug } = await params;

  // Event data çek
  const event = await getEventBySlug(eventSlug);

  console.log("Event Detail Page - event:", event);

  // Event bulunamadıysa 404
  if (!event) {
    notFound();
  }

  // Sessions data çek
  const sessions = await getSessionsByEvent(event.id, {
    status: 'on_sale', // Sadece satışta olanlar
  });

  return (
    <>
      {/* SEO - Structured Data */}
      <StructuredData event={event} sessions={sessions || []} />

      <div className="container mx-auto !px-0 py-12">
        {/* Event Header */}
        <EventHeader event={event} />

        {/* Sessions List */}
        <SessionsList
          sessions={sessions || []}
          eventSlug={eventSlug}
          categorySlug={categorySlug}
        />
      </div>
    </>
  );
}
/**
 * Bilet Seçim Sayfası (Koltuk/Adet/Blok Seçimi)
 * Server Component - Session verilerini fetch eder ve Client Component'e yollar
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventBySlug } from '@/utils/supabase/queries';
import { getSessionBySlug } from '@/utils/supabase/session-queries';
import TicketSelectionClient from '@/components/pages/ticketSelection/TicketSelectionClient';

interface TicketSelectionPageProps {
  params: Promise<{
    category: string;
    event: string;
    sessionSlug: string;
  }>;
}

export async function generateMetadata({ params }: TicketSelectionPageProps): Promise<Metadata> {
  const { event: eventSlug, sessionSlug } = await params;

  const event = await getEventBySlug(eventSlug);
  const session = await getSessionBySlug(sessionSlug);

  if (!event || !session) {
    return {
      title: 'Bilet Bulunamadı',
    };
  }

  // Session tarih formatı
  const sessionDate = new Date(session.session_date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    title: `${event.title} - ${sessionDate} Bilet Seçimi | EventPlatform`,
    description: `${event.title} etkinliği için ${sessionDate} tarihli seans biletleri. Hemen biletinizi seçin ve satın alın.`,
    robots: {
      index: false, // Bilet sayfalarını index'leme (SEO)
    },
  };
}

/**
 * Bilet Seçim Sayfası
 */
export default async function TicketSelectionPage({ params }: TicketSelectionPageProps) {
  const { category: categorySlug, event: eventSlug, sessionSlug } = await params;

  //Promise.all kullanalım
  const [event, session] = await Promise.all([
    getEventBySlug(eventSlug),
    getSessionBySlug(sessionSlug),
  ]);

  // Event veya Session bulunamazsa 404
  if (!event || !session) {
    notFound();
  }

  // Session'ın event'i ile URL'deki event uyuşuyor mu? (Güvenlik)
  if (session.event_id !== event.id) {
    notFound();
  }

  // Session satın alınabilir mi kontrol et
  if (session.status !== 'on_sale' || session.available_capacity === 0) {
    return (
      <div className="container mx-auto !px-0 py-12">
        <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="max-w-md space-y-4 text-center">
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
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {session.status === 'sold_out' ? 'Biletler Tükendi' : 'Bilet Satışı Kapalı'}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {session.status === 'sold_out'
                  ? 'Bu seans için tüm biletler satılmıştır.'
                  : 'Bu seans için şu anda bilet satışı yapılmamaktadır.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client Component'e data gönder
  // Redux'a kaydetme işlemi client-side yapılacak
  return (
    <TicketSelectionClient
      event={event}
      session={session}
      categorySlug={categorySlug}
    />
  );
}
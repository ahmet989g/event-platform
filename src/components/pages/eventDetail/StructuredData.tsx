import type { Event } from '@/types/database.types';
import type { Session } from '@/types/session.types';

interface StructuredDataProps {
  event: Event & {
    category?: {
      name: string;
    };
  };
  sessions?: (Session & {
    venue?: {
      id: string;
      name: string;
      city: string;
      district: string | null;
      address?: string;
      latitude?: string | null;
      longitude?: string | null;
    } | null;
  })[];
}

/**
 * Event Structured Data
 * Schema.org Event type
 * 
 * UPDATED: Venue type artık optional fields içeriyor (address, latitude, longitude)
 * Query'de sadece minimal bilgi çekiliyorsa da çalışır.
 */
export default function StructuredData({ event, sessions = [] }: StructuredDataProps) {
  // Ana event schema
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || `${event.title} etkinliği için bilet satışı`,
    image: event.poster_url || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',

    // İlk session varsa tarih bilgisi
    ...(sessions.length > 0 && {
      startDate: `${sessions[0].session_date}T${sessions[0].session_time}`,
    }),

    // Mekan bilgisi (ilk session'dan) - optional fields kontrol edilir
    ...(sessions.length > 0 && sessions[0].venue && {
      location: {
        '@type': 'Place',
        name: sessions[0].venue.name,
        ...(sessions[0].venue.address && {
          address: {
            '@type': 'PostalAddress',
            streetAddress: sessions[0].venue.address,
            addressLocality: sessions[0].venue.district || sessions[0].venue.city,
            addressRegion: sessions[0].venue.city,
            addressCountry: 'TR',
          },
        }),
        // Latitude/longitude sadece varsa ekle
        ...(sessions[0].venue.latitude && sessions[0].venue.longitude && {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: parseFloat(sessions[0].venue.latitude),
            longitude: parseFloat(sessions[0].venue.longitude),
          },
        }),
      },
    }),

    // Organizatör
    organizer: {
      '@type': 'Organization',
      name: 'EventPlatform',
      url: process.env.NEXT_PUBLIC_BASE_URL || 'https://test.com',
    },

    // Birden fazla session varsa SubEvent olarak ekle
    ...(sessions.length > 1 && {
      subEvent: sessions.map((session) => ({
        '@type': 'Event',
        name: `${event.title} - ${session.session_date}`,
        startDate: `${session.session_date}T${session.session_time}`,
        ...(session.venue && {
          location: {
            '@type': 'Place',
            name: session.venue.name,
            ...(session.venue.address && {
              address: {
                '@type': 'PostalAddress',
                streetAddress: session.venue.address,
                addressLocality: session.venue.district || session.venue.city,
                addressRegion: session.venue.city,
                addressCountry: 'TR',
              },
            }),
          },
        }),
        offers: {
          '@type': 'AggregateOffer',
          availability: session.available_capacity > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/SoldOut',
          validFrom: new Date().toISOString(),
        },
      })),
    }),

    // Tek session için offer
    ...(sessions.length === 1 && {
      offers: {
        '@type': 'AggregateOffer',
        availability: sessions[0].available_capacity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
        priceCurrency: 'TRY',
        validFrom: new Date().toISOString(),
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/${event.category?.name?.toLowerCase() || 'etkinlik'}/${event.slug}`,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(eventSchema),
      }}
    />
  );
}
import Image from 'next/image';
import type { Event } from '@/types/database.types';
import { formatDate } from '@/utils/formatDate';

interface EventHeaderProps {
  event: Event & {
    category: {
      name: string;
      slug: string;
    };
  };
}

export default function EventHeader({ event }: EventHeaderProps) {
  return (
    <div className="mb-12">
      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Event Poster */}
        <div className="relative aspect-[9/13] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          <Image
            src={event.poster_url}
            alt={`${event.title} etkinlik afişi`}
            fill
            priority
            quality={90}
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 400px"
          />
        </div>

        {/* Event Info */}
        <div className="flex flex-col">
          {/* Kategori Badge */}
          <div className="mb-4">
            <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              {event.category.name}
            </span>
          </div>

          {/* Başlık */}
          <h1 className="mb-4 text-4xl font-bold leading-tight text-primary dark:text-white lg:text-5xl">
            {event.title}
          </h1>

          {/* Event Tarihi */}
          {event.event_start_date && (
            <div className="mb-6 flex items-center gap-2 text-lg">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(event.event_start_date)} tarihinden itibaren</span>
            </div>
          )}

          {/* Açıklama */}
          {event.description && (
            <p className="text-lg leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Yaş Sınırlaması */}
          {event.age_restriction && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Yaş Sınırı: {event.age_restriction}</span>
            </div>
          )}

          {/* Süre (varsa) */}
          {event.duration_minutes && (
            <div className="mt-4 flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Süre: {event.duration_minutes} dakika</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
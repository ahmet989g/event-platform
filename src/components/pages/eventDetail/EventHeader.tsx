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
    <section className="mb-20">
      <div className="grid gap-12 lg:grid-cols-[350px_1fr] xl:grid-cols-[400px_1fr]">
        {/* Event Poster - Simple & Clean */}
        <div className="group relative">
          <div className="relative aspect-[9/13] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
            <Image
              src={event.poster_url}
              alt={`${event.title} etkinlik afişi`}
              fill
              priority
              quality={90}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 450px"
            />
          </div>
        </div>

        {/* Event Info - Typography Focused */}
        <div className="flex flex-col justify-center space-y-8">
          {/* Category - Simple Text */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium uppercase tracking-wider">
              {event.category.name}
            </span>
            {event.is_featured && (
              <>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  Öne Çıkan
                </span>
              </>
            )}
          </div>

          {/* Title - Large & Bold */}
          <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white lg:text-4xl xl:text-5xl">
            {event.title}
          </h1>

          {/* Description - Clean Paragraph */}
          {event.description && (
            <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-400">
              {event.description}
            </p>
          )}

          {/* Info Grid - Minimal */}
          <div className="space-y-4 pt-4">
            {event.event_start_date && (
              <div className="flex items-center gap-4">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-base text-gray-700 dark:text-gray-300">
                  {formatDate(event.event_start_date)} tarihinden itibaren
                </span>
              </div>
            )}

            {event.duration_minutes && (
              <div className="flex items-center gap-4">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-base text-gray-700 dark:text-gray-300">
                  {event.duration_minutes} dakika
                </span>
              </div>
            )}

            {event.age_restriction && (
              <div className="flex items-center gap-4">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-base text-gray-700 dark:text-gray-300">
                  Yaş sınırı: {event.age_restriction}
                </span>
              </div>
            )}
          </div>

          {/* View Count - Subtle */}
          {event.view_count > 0 && (
            <div className="flex items-center gap-2 pt-4 text-sm text-gray-500 dark:text-gray-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{event.view_count.toLocaleString('tr-TR')} görüntülenme</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
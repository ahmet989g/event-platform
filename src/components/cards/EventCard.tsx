import { EventCardData } from '@/types/event.types';
import { formatDate } from '@/utils/formatDate';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface EventCardProps {
  event: EventCardData;
  categorySlug: string;
  priority?: boolean; // İlk yüklenen kartlar için
  loading?: 'lazy' | 'eager';
}

const EventCard = ({
  event,
  categorySlug,
  priority = false,
  loading = 'lazy'
}: EventCardProps) => {
  const imageUrl = event?.poster_url || `${process.env.NEXT_PUBLIC_IMAGE_URL}/default.jpg`;

  return (
    <article className="relative group">
      <Link
        href={`/${categorySlug}/${event.slug}`}
        className="block"
        aria-label={`${event.title} etkinliğine git`}
      >
        {/* Image Container */}
        <div className="aspect-[9/13] relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          <Image
            src={imageUrl}
            alt={`${event.title} poster görseli`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            priority={priority}
            loading={loading}
            quality={85}
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="mt-3 space-y-1">
          <h3
            className="text-lg font-semibold line-clamp-2 group-hover:text-primary-500 transition-colors duration-300 dark:text-gray-100"
            title={event.title}
          >
            {event.title}
          </h3>

          {event.event_start_date && (
            <time
              dateTime={event.event_start_date}
              className="text-md text-gray-600 dark:text-gray-400"
            >
              {formatDate(event.event_start_date)}
            </time>
          )}
        </div>
      </Link>
    </article>
  );
};

export default EventCard;
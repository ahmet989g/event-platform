import { EventCardData } from '@/types/event.types';
import { formatDate } from '@/utils/formatDate';
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface EventCardProps {
  event: EventCardData;
  categorySlug: string;
}

const EventCard = ({ event, categorySlug }: EventCardProps) => {
  return (
    <Link href={`/${categorySlug}/${event.slug}`} className="relative group">
      <div className="aspect-[9/13] relative">
        <Image src={event?.poster_url || `${process.env.NEXT_PUBLIC_IMAGE_URL}/default.jpg`} alt={event.title} fill className="object-cover rounded-xl" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-semibold whitespace-nowrap overflow-ellipsis overflow-hidden group-hover:text-primary-500 transition-colors duration-300" title={event.title}>{event.title}</h3>
        <p className="text-md text-gray-500">{formatDate(event.event_start_date)}</p>
      </div>
    </Link>
  )
}

export default EventCard
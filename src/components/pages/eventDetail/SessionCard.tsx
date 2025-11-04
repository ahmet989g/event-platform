'use client';

import Link from 'next/link';
import type { Session } from '@/types/session.types';
import {
  formatSessionTime,
  isSessionPurchasable,
  getSessionUrl,
} from '@/lib/helpers/sessionHelpers';

interface SessionCardProps {
  session: Session & {
    venue?: {
      name: string;
      city: string;
      district: string | null;
    } | null;
    session_categories?: {
      price: number;
    }[];
  };
  eventSlug: string;
  categorySlug: string;
}

export default function SessionCard({ session, eventSlug, categorySlug }: SessionCardProps) {
  const isPurchasable = isSessionPurchasable(session.status, session.available_capacity);
  const sessionUrl = getSessionUrl(categorySlug, eventSlug, session.id);

  // Date formatting
  const sessionDate = new Date(session.session_date);
  const dayName = sessionDate.toLocaleDateString('tr-TR', { weekday: 'long' });
  const dayNumber = sessionDate.getDate();
  const monthName = sessionDate.toLocaleDateString('tr-TR', { month: 'long' });
  const year = sessionDate.getFullYear();

  return (
    <article className="group relative">
      <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-600">

        {/* Date & Time - Horizontal Layout */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
          {/* Date */}
          <div>
            <div className="flex items-baseline justify-center text-center gap-2">
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-primary">
                  {dayNumber}
                </span>
                <span className="text-sm font-medium uppercase text-gray-900 dark:text-gray-400">
                  {monthName}
                </span>
                <span className="text-sm capitalize text-gray-700 dark:text-gray-400">
                  {dayName}
                </span>
                <span className="text-sm capitalize text-gray-700 dark:text-gray-400">
                  {year}
                </span>
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
              {formatSessionTime(session.session_time)}
            </div>
          </div>
        </div>

        {/* Venue - Clean Layout */}
        {session.venue && (
          <div className="mb-6 space-y-1">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Mekan
            </div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">
              {session.venue.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {session.venue.district ? `${session.venue.district}, ` : ''}{session.venue.city}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* CTA Button - Minimal */}
        {isPurchasable ? (
          <Link
            href={sessionUrl}
            className="group/btn flex h-12 items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            <span>Bilet Al</span>
            <svg
              className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        ) : (
          <button
            disabled
            className="flex h-12 cursor-not-allowed items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-400 dark:border-gray-800 dark:text-gray-600"
          >
            Bilet Alınamaz
          </button>
        )}
      </div>

      {/* Sold Out Badge - Minimal */}
      {session.status === 'sold_out' && (
        <div className="absolute right-4 top-4 rounded bg-gray-900 px-2 py-1 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">
          Tükendi
        </div>
      )}
    </article>
  );
}
'use client';

import Link from 'next/link';
import type { Session } from '@/types/session.types';
import {
  formatSessionDateTime,
  calculateCapacityStatus,
  getCapacityBadge,
  formatCapacityCount,
  isSessionPurchasable,
  getSessionUrl,
} from '@/lib/helpers/sessionHelpers';

interface SessionCardProps {
  session: Session & {
    venue?: {
      name: string;
      city: string;
    } | null;
  };
  eventSlug: string;
  categorySlug: string;
}

export default function SessionCard({ session, eventSlug, categorySlug }: SessionCardProps) {
  const capacityStatus = calculateCapacityStatus(
    session.available_capacity,
    session.total_capacity
  );
  const capacityBadge = getCapacityBadge(capacityStatus);
  const isPurchasable = isSessionPurchasable(session.status, session.available_capacity);
  const sessionUrl = getSessionUrl(categorySlug, eventSlug, session.id);

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="p-6">
        {/* Tarih ve Saat */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <svg
              className="h-6 w-6 text-primary"
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
          </div>
          <div>
            <p className="text-sm">Tarih ve Saat</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatSessionDateTime(session.session_date, session.session_time)}
            </p>
          </div>
        </div>

        {/* Mekan */}
        {session.venue && (
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm">Mekan</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {session.venue.name}
              </p>
              <p className="text-sm">
                {session.venue.city}
              </p>
            </div>
          </div>
        )}

        {/* Kapasite Durumu */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm">Müsait Kapasite</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCapacityCount(session.available_capacity)} /{' '}
              {formatCapacityCount(session.total_capacity)}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${capacityBadge.bgColor} ${capacityBadge.color}`}
          >
            {capacityBadge.text}
          </span>
        </div>

        {/* Bilet Al Butonu */}
        {isPurchasable ? (
          <Link
            href={sessionUrl}
            className="block w-full rounded-lg bg-primary py-3 text-center font-semibold text-white transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Bilet Al
          </Link>
        ) : (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-300 py-3 text-center font-semibold dark:bg-gray-700"
          >
            {capacityStatus === 'sold_out' ? 'Tükendi' : 'Bilet Alınamaz'}
          </button>
        )}
      </div>
    </div>
  );
}
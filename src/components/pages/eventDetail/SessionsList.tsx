import SessionCard from './SessionCard';
import type { Session } from '@/types/session.types';

interface SessionsListProps {
  sessions: (Session & {
    venue?: {
      name: string;
      city: string;
      district: string | null;
    } | null;
    session_categories?: {
      price: number;
    }[];
  })[];
  eventSlug: string;
  categorySlug: string;
}

export default function SessionsList({ sessions, eventSlug, categorySlug }: SessionsListProps) {
  // Empty state
  if (sessions.length === 0) {
    return (
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Henüz seans eklenmedi
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Bu etkinlik için yakında seanslar eklenecek.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section>
      {/* Section Header - Minimal */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Seanslar
        </h2>
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            eventSlug={eventSlug}
            categorySlug={categorySlug}
          />
        ))}
      </div>

      {/* Info Note - Minimal */}
      <div className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex gap-4">
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
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Bilet Satın Alma
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Seansınızı seçtikten sonra koltuk veya adet belirleyebilirsiniz.
              Sepetinize eklenen biletler 10 dakika boyunca sizin için rezerve edilir.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
import SessionCard from './SessionCard';
import type { Session } from '@/types/session.types';

interface SessionsListProps {
  sessions: (Session & {
    venue?: {
      name: string;
      city: string;
    } | null;
  })[];
  eventSlug: string;
  categorySlug: string;
}

export default function SessionsList({ sessions, eventSlug, categorySlug }: SessionsListProps) {
  // Boş durum kontrolü
  if (sessions.length === 0) {
    return (
      <div className="rounded-xl p-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gray-200 p-4 dark:bg-gray-800">
            <svg
              className="h-12 w-12 text-gray-400"
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
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Henüz Seans Yok
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Bu etkinlik için henüz seans eklenmemiş. Lütfen daha sonra tekrar kontrol edin.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Başlık */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Seanslar
        </h2>
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            eventSlug={eventSlug}
            categorySlug={categorySlug}
          />
        ))}
      </div>
    </div>
  );
}
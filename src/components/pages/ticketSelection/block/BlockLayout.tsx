/**
 * Block Layout Component (Server)
 * Block-based seating layout - Server side data fetching
 * @description Event Ticketing Platform - Block seating data loader
 */

import { getBlocks, getSeats } from '@/utils/supabase/session-queries';
import { adaptBlocksFromDatabase, adaptSeatsFromDatabase } from '@/lib/seating/adapters/database-adapters';
import BlockLayoutClient from './BlockLayoutClient';
import type { Event } from '@/types/database.types';
import type { SessionWithRelations } from '@/types/session.types';

// ============================================
// TYPES
// ============================================

interface BlockLayoutProps {
  session: SessionWithRelations;
  event: Event & { category: { name: string; slug: string } };
  categorySlug: string;
}

// ============================================
// SERVER COMPONENT
// ============================================

export default async function BlockLayout({ session, event, categorySlug }: BlockLayoutProps) {
  // Fetch blocks and seats (server-side)
  const dbBlocks = await getBlocks(session.id, false);
  const dbSeats = await getSeats({ session_id: session.id });

  // Error state
  if (!dbBlocks || !dbSeats) {
    return (
      <div className="container mx-auto !px-0 py-12">
        <div className="rounded-xl border border-red-700 bg-red-900/20 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">⚠️ Hata</h2>
          <p className="text-gray-300">Koltuk düzeni yüklenemedi.</p>
          <p className="mt-2 text-sm text-gray-400">
            Lütfen daha sonra tekrar deneyin veya destek ile iletişime geçin.
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (dbBlocks.length === 0) {
    return (
      <div className="container mx-auto !px-0 py-12">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">
            📍 Koltuk Düzeni Bulunamadı
          </h2>
          <p className="text-gray-300">
            Bu seans için henüz koltuk düzeni oluşturulmamış.
          </p>
        </div>
      </div>
    );
  }

  // Adapt to new format
  const blocks = adaptBlocksFromDatabase(dbBlocks);
  const seats = adaptSeatsFromDatabase(dbSeats);

  // Render client component with data
  return (
    <BlockLayoutClient
      session={session}
      event={event}
      categorySlug={categorySlug}
      blocks={blocks}
      seats={seats}
    />
  );
}
import { SessionWithRelations } from '@/types/session.types';
import React from 'react'
import QuantityLayout from './quantity/QuantityLayout';
import { Category } from '@/types/database.types';
import BlockLayout from './block/blockLayout';
import { getBlocksBySessionId } from '@/utils/supabase/block-queries';

interface TicketSelectionProps {
  session: SessionWithRelations;
  event: Event & {
    category: { name: string; slug: string };
  };
  categorySlug: string;
}

const TicketSelection = ({ session, event, categorySlug }: TicketSelectionProps) => {

  const renderLayout = async () => {
    switch (session.layout_type) {
      case 'quantity':
        return (
          <QuantityLayout
            session={session}
            event={event}
            categorySlug={categorySlug}
          />
        );
      case 'block':
        const blocks = await getBlocksBySessionId(session.id);
        console.log('Blocks for session', session.id, blocks);
        return (
          <BlockLayout
            session={session}
            event={event}
            categorySlug={categorySlug}
            blocks={blocks}
          />
        );
      case 'seat_map':
        return (
          <div>SEATMAP</div>
        )
    }
  }

  return (
    <div>
      {renderLayout()}
    </div>
  );
}

export default TicketSelection;
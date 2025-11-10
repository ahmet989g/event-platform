import { SessionWithRelations } from '@/types/session.types';
import React from 'react'
import QuantityLayout from './quantity/QuantityLayout';
import BlockLayout from './block/BlockLayout';
import { Category } from '@/types/database.types';

interface TicketSelectionProps {
  event: Event & { category: Category };
  session: SessionWithRelations;
  categorySlug: string;
}

const TicketSelection = ({ event, session, categorySlug }: TicketSelectionProps) => {

  const renderLayout = () => {
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
        return (
          <BlockLayout
            session={session}
            event={event}
            categorySlug={categorySlug}
          />
        );
    }
  }

  return (
    <div>
      {renderLayout()}
    </div>
  );
}

export default TicketSelection;
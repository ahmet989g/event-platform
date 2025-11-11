import { SessionWithRelations } from '@/types/session.types';
import React from 'react'
import QuantityLayout from './quantity/QuantityLayout';
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
          <div>BLOCK</div>
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
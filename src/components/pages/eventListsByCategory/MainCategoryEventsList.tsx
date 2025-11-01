import EventCard from '@/components/cards/EventCard';
import { MainCategory } from '@/types/category.types';
import { EventCardData } from '@/types/event.types';

interface MainCategoryEventsListProps {
  // Define any props if needed
  events: EventCardData[];
  category: MainCategory | null;

}

const MainCategoryEventsList = ({ events, category }: MainCategoryEventsListProps) => {
  if (!category) return null;
  return (
    <section>
      <h2 className="text-3xl font-bold text-primary-500 mb-4">{category.name}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} categorySlug={category.slug} />
        ))}
      </div>
    </section>
  )
}

export default MainCategoryEventsList;
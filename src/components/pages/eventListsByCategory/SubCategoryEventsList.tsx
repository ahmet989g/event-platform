import EventCard from '@/components/cards/EventCard';
import { SubCategory } from '@/types/category.types';
import { EventCardData } from '@/types/event.types';

interface SubCategoryEventsListProps {
  // Define any props if needed
  events: EventCardData[];
  subCategory: SubCategory;
  mainCategorySlug: string;

}

const SubCategoryEventsList = ({ events, subCategory, mainCategorySlug }: SubCategoryEventsListProps) => {
  return (
    <section>
      <h2 className="text-3xl font-bold text-primary-500 mb-4">{subCategory.name}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} categorySlug={mainCategorySlug} />
        ))}
      </div>
    </section>
  )
}

export default SubCategoryEventsList
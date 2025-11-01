import { getCategoriesWithEvents } from "@/utils/supabase/queries";
import EventCard from "@/components/cards/EventCard";

const EventsSection = async () => {
  const data = await getCategoriesWithEvents();

  if (!data) {
    throw new Error('Etkinlikler yüklenemedi.');
  }

  return (
    <section>
      {
        data.map((item) => (
          <div key={item.category.id} className="mb-12 first:mt-12 last:mb-0">
            <h2 className="text-3xl font-bold text-primary-500 mb-4">{item.category.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {item.events.map((event) => (
                <EventCard key={event.id} event={event} categorySlug={item.category.slug} />
              ))}
            </div>
          </div>
        ))
      }
    </section>
  )
}

export default EventsSection;
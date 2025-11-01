import { getCategoriesWithEvents } from "@/utils/supabase/queries";
import EventCard from "@/components/cards/EventCard";

const EventsSection = async () => {
  const data = await getCategoriesWithEvents();

  if (!data || data.length === 0) {
    return (
      <section className="py-12 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Şu an görüntülenecek etkinlik bulunmamaktadır.
        </p>
      </section>
    );
  }

  let eventCount = 0; // Priority için sayaç

  return (
    <section aria-label="Etkinlik kategorileri">
      {data.map((item) => (
        <div
          key={item.category.id}
          className="mb-12 first:mt-12 last:mb-0"
        >
          <header className="mb-6">
            <h2 className="text-3xl font-bold text-primary-500 dark:text-primary-400">
              {item.category.name}
            </h2>
            {item.category.description && (
              <p className="text-lg mt-1 text-gray-600 dark:text-gray-400">
                {item.category.description}
              </p>
            )}
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {item.events.map((event) => {
              eventCount++;
              const isAboveFold = eventCount <= 5; // İlk 5 event priority

              return (
                <EventCard
                  key={event.id}
                  event={event}
                  categorySlug={item.category.slug}
                  priority={isAboveFold}
                  loading={isAboveFold ? 'eager' : 'lazy'}
                />
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
};

export default EventsSection;
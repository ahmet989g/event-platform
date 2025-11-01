import ListPage from "@/components/pages/eventListsByCategory/ListPage";

interface CategoryPageProps {
  params: Promise<{
    category: string; // slug
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;

  const categoryNames: Record<string, string> = {
    'spor': 'Spor',
    'tiyatro': 'Tiyatro',
    'konser': 'Konser',
    // ...
  };

  const name = categoryNames[category] || category;

  return {
    title: `${name} Etkinlikleri | EventPlatform`,
    description: `${name} kategorisindeki etkinlikler`,
  };
}

const EventsList = async ({ params }: CategoryPageProps) => {
  const { category } = await params;

  if (!category) {
    throw new Error('Category is required');
  }

  return (
    <div className="container mx-auto !px-0 py-12">
      <ListPage categorySlug={category} />
    </div>
  );
}

export default EventsList;
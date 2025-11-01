import { getCategoryPageData } from '@/utils/supabase/queries';
import { notFound } from 'next/navigation';
import SubCategoryEventsList from './SubCategoryEventsList';
import MainCategoryEventsList from './MainCategoryEventsList';

interface ListPageProps {
  categorySlug: string; // slug
}

const ListPage = async ({ categorySlug }: ListPageProps) => {
  const categoryData = await getCategoryPageData(categorySlug);

  if (!categoryData) {
    return notFound();
  }

  const { category: mainCategory, mainCategoryEvents, subCategoriesWithEvents } = categoryData;

  if (!mainCategory) {
    return notFound();
  }

  if (mainCategoryEvents.length === 0 && subCategoriesWithEvents.length === 0) {
    return (
      <p className="text-xl font-semibold text-center text-error">{mainCategory.name} kategorisindeki etkinliklerimiz çok yakında eklenecek...</p>
    );
  }

  return (
    <>
      {mainCategoryEvents.length > 0 && (
        <div className="mb-12">
          <MainCategoryEventsList events={mainCategoryEvents} category={mainCategory} />
        </div>
      )}

      {subCategoriesWithEvents.length > 0 && (
        subCategoriesWithEvents.map((data) => (
          <div key={data.subCategory.id} className="mb-12">
            <SubCategoryEventsList events={data.events} subCategory={data.subCategory} mainCategorySlug={mainCategory.slug} />
          </div>
        ))
      )}
    </>
  )
}

export default ListPage
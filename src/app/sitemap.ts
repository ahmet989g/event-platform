// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getCategoriesWithEvents } from '@/utils/supabase/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://eventplatform.com';

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/giris-yap`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/uye-ol`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Dinamik kategori ve event sayfaları
    const categoriesData = await getCategoriesWithEvents(100);
    
    const categoryPages: MetadataRoute.Sitemap = categoriesData.flatMap((item) => {
      const categoryUrl = {
        url: `${baseUrl}/${item.category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      };

      const eventUrls = item.events.map((event) => ({
        url: `${baseUrl}/${item.category.slug}/${event.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));

      return [categoryUrl, ...eventUrls];
    });

    return [...staticPages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
/**
 * Supabase Query Functions
 * Server-side data fetching functions
 * @description Event Ticketing Platform - Database queries
 */

import { createClient } from '@/utils/supabase/server';
import { Category, Event, EventStatus } from '@/types/database.types';

// ============================================
// Alt Kategorileri Çek (Helper)
// ============================================

/**
 * Bir ana kategorinin alt kategorilerini çeker
 * @param parentCategoryId - Ana kategori UUID
 * @returns Alt kategoriler array veya null
 */
export async function getSubCategories(
  parentCategoryId: string
): Promise<Pick<Category, 'id' | 'name' | 'slug' | 'icon' | 'order' | 'description'>[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, icon, order, description')
      .eq('parent_id', parentCategoryId)
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching subcategories:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getSubCategories:', error);
    return null;
  }
}

/**
 * Bir ana kategorinin alt kategorilerini çeker
 * @param parentCategoryId - Ana kategori UUID
 * @returns Alt kategori ID'leri array veya null
 */
async function getSubCategoryIds(parentCategoryId: string): Promise<string[] | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', parentCategoryId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching subcategories:', error);
      return null;
    }

    return data.map((cat) => cat.id);
  } catch (error) {
    console.error('Unexpected error in getSubCategoryIds:', error);
    return null;
  }
}

// ============================================
// Sadece Belirli Kategorinin Kendi Event'lerini Çek (Alt Kategoriler Hariç)
// ============================================

/**
 * Sadece belirli bir kategoriye doğrudan bağlı event'leri çeker
 * Alt kategorilerin eventlerini dahil etmez
 * @param categoryId - Kategori UUID
 * @param limit - Maksimum event sayısı
 * @returns Event array veya null
 */
export async function getEventsByCategoryOnly(
  categoryId: string,
  limit: number = 100
): Promise<
  Pick<Event, 'id' | 'title' | 'slug' | 'poster_url' | 'category_id' | 'status' | 'event_start_date'>[] | null
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('events')
      .select('id, title, slug, poster_url, category_id, status, event_start_date')
      .eq('category_id', categoryId)
      .in('status', [EventStatus.ON_SALE, EventStatus.TESTING])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching events by category only:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getEventsByCategoryOnly:', error);
    return null;
  }
}

// ============================================
// Kategori Sayfası için Optimize Edilmiş Fonksiyon
// ============================================

/**
 * Kategori sayfası için tüm veriyi çeker
 * Ana kategori + alt kategoriler + her birinin eventleri
 * @param categorySlug - Kategori slug
 * @returns Kategori detayları ve yapılandırılmış event listesi
 */
export async function getCategoryPageData(categorySlug: string): Promise<{
  category: Pick<Category, 'id' | 'name' | 'slug' | 'icon' | 'description'> | null;
  mainCategoryEvents: Pick<Event, 'id' | 'title' | 'slug' | 'poster_url' | 'category_id' | 'status' | 'event_start_date'>[];
  subCategoriesWithEvents: Array<{
    subCategory: Pick<Category, 'id' | 'name' | 'slug' | 'icon' | 'order' | 'description'>;
    events: Pick<Event, 'id' | 'title' | 'slug' | 'poster_url' | 'category_id' | 'status' | 'event_start_date'>[];
  }>;
} | null> {
  try {
    // 1. Ana kategoriyi çek
    const category = await getCategoryBySlug(categorySlug);
    if (!category) {
      return null;
    }

    // 2. Ana kategorinin kendi eventlerini çek
    const mainCategoryEventsPromise = getEventsByCategoryOnly(category.id);

    // 3. Alt kategorileri çek
    const subCategoriesPromise = getSubCategories(category.id);

    // Paralel fetch
    const [mainCategoryEvents, subCategories] = await Promise.all([
      mainCategoryEventsPromise,
      subCategoriesPromise,
    ]);

    // 4. Her alt kategori için eventleri çek (paralel)
    let subCategoriesWithEvents: Array<{
      subCategory: Pick<Category, 'id' | 'name' | 'slug' | 'icon' | 'order' | 'description'>;
      events: Pick<Event, 'id' | 'title' | 'slug' | 'poster_url' | 'category_id' | 'status' | 'event_start_date'>[];
    }> = [];

    if (subCategories && subCategories.length > 0) {
      const subCategoriesWithEventsPromises = subCategories.map(async (subCategory) => {
        const events = await getEventsByCategoryOnly(subCategory.id);
        return {
          subCategory,
          events: events || [],
        };
      });

      const allSubCategoriesWithEvents = await Promise.all(subCategoriesWithEventsPromises);
      
      // Sadece event'i olanları filtrele
      subCategoriesWithEvents = allSubCategoriesWithEvents.filter((item) => item.events.length > 0);
    }

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        description: category.description,
      },
      mainCategoryEvents: mainCategoryEvents || [],
      subCategoriesWithEvents,
    };
  } catch (error) {
    console.error('Unexpected error in getCategoryPageData:', error);
    return null;
  }
}

// ============================================
// Ana Kategorileri Çek
// ============================================

/**
 * Ana kategorileri çeker (parent_id NULL olanlar)
 * @returns Ana kategoriler array veya null
 */
export async function getMainCategories(): Promise<
  Pick<Category, 'id' | 'name' | 'slug' | 'icon' | 'order' | 'description'>[] | null
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, icon, order, description')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching main categories:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getMainCategories:', error);
    return null;
  }
}

// ============================================
// Kategoriye Göre Event'leri Çek
// ============================================

/**
 * Belirli bir kategoriye ait event'leri çeker
 * Ana kategori verilirse alt kategorilerin eventlerini de içerir
 * @param categoryId - Kategori UUID (ana veya alt kategori olabilir)
 * @param limit - Maksimum event sayısı (default: 10)
 * @returns Event array veya null
 */
export async function getEventsByCategory(
  categoryId: string,
  limit: number = 10
): Promise<
  Pick<Event, 'id' | 'title' | 'slug' | 'poster_url' | 'category_id' | 'status' | 'event_start_date'>[] | null
> {
  try {
    const supabase = await createClient();

    // Alt kategorileri çek
    const subCategoryIds = await getSubCategoryIds(categoryId);
    
    // Ana kategori ID + alt kategori ID'leri
    const categoryIds = [categoryId];
    if (subCategoryIds && subCategoryIds.length > 0) {
      categoryIds.push(...subCategoryIds);
    }

    const { data, error } = await supabase
      .from('events')
      .select('id, title, slug, poster_url, category_id, status, event_start_date')
      .in('category_id', categoryIds) // Artık array ile sorgu yapıyoruz
      .in('status', [EventStatus.ON_SALE, EventStatus.TESTING])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching events by category:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getEventsByCategory:', error);
    return null;
  }
}

// ============================================
// Kategoriler + Events (Ana Sayfa için Optimize)
// ============================================

/**
 * Ana kategorileri ve her kategorinin event'lerini çeker
 * Ana sayfa için optimize edilmiş - paralel fetching
 * @param limitPerCategory - Her kategori için maksimum event sayısı (default: 10)
 * @returns Kategori ve event'lerini içeren array
 */
export async function getCategoriesWithEvents(
  limitPerCategory: number = 10
): Promise<
  Array<{
    category: Pick<Category, 'id' | 'name' | 'slug' | 'icon' | 'order' | 'description'>;
    events: Pick<Event, 'id' | 'title' | 'slug' | 'poster_url' | 'category_id' | 'status' | 'event_start_date'>[];
  }>
> {
  try {
    // 1. Ana kategorileri çek
    const categories = await getMainCategories();

    if (!categories || categories.length === 0) {
      return [];
    }

    // 2. Her kategori için event'leri paralel olarak çek
    const categoriesWithEventsPromises = categories.map(async (category) => {
      const events = await getEventsByCategory(category.id, limitPerCategory);
      return {
        category,
        events: events || [],
      };
    });

    const categoriesWithEvents = await Promise.all(categoriesWithEventsPromises);

    // 3. Sadece event'i olan kategorileri filtrele
    return categoriesWithEvents.filter((item) => item.events.length > 0);
  } catch (error) {
    console.error('Unexpected error in getCategoriesWithEvents:', error);
    return [];
  }
}

// ============================================
// Tek Kategori Bilgisi Çek
// ============================================

/**
 * Slug'a göre kategori bilgisini çeker
 * @param slug - Kategori slug
 * @returns Category veya null
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching category by slug:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getCategoryBySlug:', error);
    return null;
  }
}

// ============================================
// Tek Event Bilgisi Çek (Detay Sayfası için)
// ============================================

/**
 * Slug'a göre event detaylarını çeker (category bilgisi ile birlikte)
 * @param slug - Event slug
 * @returns Event with category veya null
 */
export async function getEventBySlug(
  slug: string
): Promise<(Event & { category: Category }) | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .in('status', [EventStatus.ON_SALE, EventStatus.TESTING])
      .single();

    if (error) {
      console.error('Error fetching event by slug:', error);
      return null;
    }

    return data as Event & { category: Category };
  } catch (error) {
    console.error('Unexpected error in getEventBySlug:', error);
    return null;
  }
}
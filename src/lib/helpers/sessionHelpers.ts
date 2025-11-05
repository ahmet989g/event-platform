// ============================================
// TARİH FORMATLAMA
// ============================================

/**
 * Session tarihini formatla (7 Temmuz 2036 Pazartesi)
 * @param dateString - ISO date string (2036-07-07)
 * @returns Formatlanmış tarih
 */
export function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });
}

/**
 * Session saatini formatla (20:30)
 * @param timeString - Time string (20:30:00)
 * @returns Formatlanmış saat
 */
export function formatSessionTime(timeString: string): string {
  // "20:30:00" → "20:30"
  return timeString.slice(0, 5);
}

/**
 * Tarih ve saati birlikte formatla (20.07.2025 20:30)
 * @param dateString - ISO date string
 * @param timeString - Time string
 * @returns Formatlanmış tarih ve saat
 */
export function formatSessionDateTime(dateString: string, timeString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const formattedTime = formatSessionTime(timeString);
  return `${day}.${month}.${year} ${formattedTime}`;
}

/**
 * Kısa tarih formatı (7 Tem 2036)
 * @param dateString - ISO date string
 * @returns Kısa tarih
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ============================================
// KAPASİTE HESAPLAMA
// ============================================

/**
 * Kapasite durumunu hesapla
 * @param available - Müsait koltuk sayısı
 * @param total - Toplam kapasite
 * @returns Durum: 'sold_out' | 'low' | 'available'
 */
export function calculateCapacityStatus(
  available: number,
  total: number
): 'sold_out' | 'low' | 'available' {
  if (available === 0) return 'sold_out';
  
  const percentage = (available / total) * 100;
  
  if (percentage <= 20) return 'low'; // %20'den az kaldı
  return 'available';
}

/**
 * Kapasite yüzdesini hesapla
 * @param available - Müsait koltuk
 * @param total - Toplam kapasite
 * @returns Yüzde (0-100)
 */
export function calculateCapacityPercentage(available: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((available / total) * 100);
}

/**
 * Kapasite durumuna göre badge bilgisi döner
 * @param status - Kapasite durumu
 * @returns Badge text ve color
 */
export function getCapacityBadge(status: 'sold_out' | 'low' | 'available'): {
  text: string;
  color: string;
  bgColor: string;
} {
  switch (status) {
    case 'sold_out':
      return {
        text: 'Tükendi',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
      };
    case 'low':
      return {
        text: 'Az Kaldı',
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      };
    case 'available':
      return {
        text: 'Müsait',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
      };
  }
}

/**
 * Kalan koltuk sayısını formatla (1.234 kişi)
 * @param count - Koltuk sayısı
 * @returns Formatlanmış sayı
 */
export function formatCapacityCount(count: number): string {
  return count.toLocaleString('tr-TR');
}

// ============================================
// SESSION STATUS
// ============================================

/**
 * Session durumuna göre badge bilgisi
 * @param status - Session status
 * @returns Badge bilgileri
 */
export function getSessionStatusBadge(
  status: 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'
): {
  text: string;
  color: string;
  bgColor: string;
} {
  switch (status) {
    case 'upcoming':
      return {
        text: 'Yakında',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      };
    case 'on_sale':
      return {
        text: 'Satışta',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
      };
    case 'sold_out':
      return {
        text: 'Tükendi',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
      };
    case 'cancelled':
      return {
        text: 'İptal',
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      };
  }
}

/**
 * Event detay sayfası URL'i
 * @param categorySlug - Kategori slug
 * @param eventSlug - Event slug
 * @returns URL path
 */
export function getEventUrl(categorySlug: string, eventSlug: string): string {
  return `/${categorySlug}/${eventSlug}`;
}

// ============================================
// FİYAT FORMATLAMA
// ============================================

/**
 * Fiyatı formatla (4.000 ₺)
 * @param price - Fiyat
 * @returns Formatlanmış fiyat
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('tr-TR')} ₺`;
}

/**
 * En düşük fiyatı bul (session categories içinden)
 * @param prices - Fiyat array
 * @returns En düşük fiyat
 */
export function getLowestPrice(prices: number[]): number {
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}

/**
 * Fiyat aralığı formatla (1.000 ₺ - 4.000 ₺)
 * @param prices - Fiyat array
 * @returns Formatlanmış aralık veya tek fiyat
 */
export function formatPriceRange(prices: number[]): string {
  if (prices.length === 0) return 'Fiyat bilgisi yok';
  if (prices.length === 1) return formatPrice(prices[0]);
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

// ============================================
// LAYOUT TYPE
// ============================================

/**
 * Layout type'a göre açıklama metni
 * @param layoutType - Layout tipi
 * @returns Açıklama metni
 */
export function getLayoutTypeDescription(
  layoutType: 'quantity' | 'seat_map' | 'block'
): string {
  switch (layoutType) {
    case 'quantity':
      return 'Adet seçimli biletleme';
    case 'seat_map':
      return 'Koltuk seçimli biletleme';
    case 'block':
      return 'Blok seçimli biletleme';
  }
}

// ============================================
// VALIDATION
// ============================================

/**
 * Session satın alınabilir mi kontrol et
 * @param status - Session status
 * @param availableCapacity - Müsait kapasite
 * @returns Satın alınabilir mi?
 */
export function isSessionPurchasable(
  status: string,
  availableCapacity: number
): boolean {
  return status === 'on_sale' && availableCapacity > 0;
}

/**
 * Session geçmiş mi kontrol et
 * @param sessionDate - Session tarihi
 * @param sessionTime - Session saati
 * @returns Geçmiş mi?
 */
export function isSessionPast(sessionDate: string, sessionTime: string): boolean {
  const now = new Date();
  const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
  return sessionDateTime < now;
}
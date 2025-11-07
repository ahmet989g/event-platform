/**
 * PHASE 1: RESERVATION ACTIONS
 * Supabase Backend Integration for Reservation System
 * 
 * @description Server-side reservation CRUD operations
 */

'use server';

import { createClient } from '@/utils/supabase/server';
import type { 
  Reservation, 
  ReservationItem,
  ReservationWithDetails 
} from '@/types/session.types';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Rezervasyon oluşturma parametreleri
 */
export interface CreateReservationParams {
  sessionId: string;
  userId: string | null;
  items: Array<{
    sessionCategoryId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

/**
 * Rezervasyon item güncelleme parametreleri
 */
export interface UpdateReservationItemParams {
  reservationId: string;
  itemId: string;
  sessionCategoryId: string;
  oldQuantity: number;
  newQuantity: number;
  unitPrice: number;
}

/**
 * API Response Type
 */
export interface ReservationActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  availableCapacity?: number;
}


// ============================================
// CREATE RESERVATION
// ============================================

/**
 * Yeni rezervasyon oluştur
 * İlk bilet seçiminde çağrılır
 * 
 * @description
 * 1. Rezervasyon kaydı oluşturur (10 dakika expire time ile)
 * 2. Reservation item'ları ekler
 * 3. Kapasiteyi düşürür (RPC ile atomik)
 * 4. Hata durumunda rollback yapar
 * 
 * @param params - Rezervasyon parametreleri
 * @returns Rezervasyon bilgisi veya hata
 */
export async function createReservation(
  params: CreateReservationParams
): Promise<ReservationActionResult<Reservation>> {
  try {
    const supabase = await createClient();

    // 1. Expire time hesapla (10 dakika)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 2. Rezervasyon oluştur
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        session_id: params.sessionId,
        user_id: params.userId,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (reservationError) {
      console.error('Error creating reservation:', reservationError);
      return {
        success: false,
        error: 'Rezervasyon oluşturulamadı',
      };
    }

    // 3. Reservation item'ları hazırla
    const itemsToInsert = params.items.map((item) => ({
      reservation_id: reservation.id,
      session_category_id: item.sessionCategoryId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
    }));

    // 4. Item'ları ekle
    const { error: itemsError } = await supabase
      .from('reservation_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error creating reservation items:', itemsError);
      
      // Rollback: Rezervasyonu sil
      await supabase.from('reservations').delete().eq('id', reservation.id);
      
      return {
        success: false,
        error: 'Rezervasyon detayları eklenemedi',
      };
    }

    // 5. Her item için kapasiteyi düşür (RPC ile atomik)
    for (const item of params.items) {
      const { data: capacityResult, error: capacityError } = await supabase
        .rpc('check_and_update_capacity', {
          p_session_category_id: item.sessionCategoryId,
          p_quantity_change: -item.quantity, // Negatif = azalt
        });

      if (capacityError || !capacityResult?.success) {
        console.error('Capacity update failed:', capacityError || capacityResult);
        
        // Rollback: Rezervasyonu ve item'ları sil
        await supabase.from('reservations').delete().eq('id', reservation.id);
        
        return {
          success: false,
          error: capacityResult?.message || 'Kapasite yetersiz',
          availableCapacity: capacityResult?.available_capacity || 0,
        };
      }
    }

    // 6. Başarılı - Rezervasyon bilgisini döndür
    return {
      success: true,
      data: reservation as Reservation,
    };

  } catch (error) {
    console.error('Unexpected error in createReservation:', error);
    return {
      success: false,
      error: 'Beklenmeyen bir hata oluştu',
    };
  }
}


// ============================================
// UPDATE RESERVATION ITEM
// ============================================

/**
 * Rezervasyon item'ını güncelle
 * Kullanıcı +/- yaptığında çağrılır
 * 
 * @description
 * 1. Mevcut quantity'yi kontrol eder
 * 2. Quantity farkını hesaplar
 * 3. Kapasite kontrolü yapar (RPC ile)
 * 4. Başarılıysa item'ı günceller
 * 5. Başarısızsa mevcut available capacity'yi döndürür
 * 
 * @param params - Güncelleme parametreleri
 * @returns Başarı/hata durumu + available capacity
 */
export async function updateReservationItem(
  params: UpdateReservationItemParams
): Promise<ReservationActionResult<ReservationItem>> {
  try {
    const supabase = await createClient();

    // 1. Rezervasyonun expired olup olmadığını kontrol et
    const { data: reservation, error: reservationCheckError } = await supabase
      .from('reservations')
      .select('id, status, expires_at')
      .eq('id', params.reservationId)
      .single();

    if (reservationCheckError || !reservation) {
      return {
        success: false,
        error: 'Rezervasyon bulunamadı',
      };
    }

    // Expired kontrolü
    if (new Date(reservation.expires_at) < new Date()) {
      return {
        success: false,
        error: 'Rezervasyon süresi doldu',
      };
    }

    // Status kontrolü
    if (reservation.status !== 'pending') {
      return {
        success: false,
        error: 'Rezervasyon durumu uygun değil',
      };
    }

    // 2. Quantity farkını hesapla
    const quantityDiff = params.newQuantity - params.oldQuantity;

    // Eğer değişiklik yoksa
    if (quantityDiff === 0) {
      return {
        success: true,
        data: {} as ReservationItem, // Değişiklik yok
      };
    }

    // 3. Kapasite kontrolü ve güncelleme (RPC ile atomik)
    const { data: capacityResult, error: capacityError } = await supabase
      .rpc('check_and_update_capacity', {
        p_session_category_id: params.sessionCategoryId,
        p_quantity_change: -quantityDiff, // Artış: negatif, Azalış: pozitif
      });

    if (capacityError || !capacityResult?.success) {
      console.error('Capacity check failed:', capacityError || capacityResult);
      
      return {
        success: false,
        error: capacityResult?.message || 'Kapasite kontrolü başarısız',
        availableCapacity: capacityResult?.available_quantity || 0,
      };
    }

    // 4. Item'ı güncelle
    const { data: updatedItem, error: updateError } = await supabase
      .from('reservation_items')
      .update({
        quantity: params.newQuantity,
        total_price: params.newQuantity * params.unitPrice,
      })
      .eq('id', params.itemId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating reservation item:', updateError);
      
      // Rollback: Kapasiteyi geri ver
      await supabase.rpc('check_and_update_capacity', {
        p_session_category_id: params.sessionCategoryId,
        p_quantity_change: quantityDiff, // Ters işlem
      });
      
      return {
        success: false,
        error: 'Rezervasyon güncellenemedi',
      };
    }

    // 5. Başarılı
    return {
      success: true,
      data: updatedItem as ReservationItem,
      availableCapacity: capacityResult.available_capacity,
    };

  } catch (error) {
    console.error('Unexpected error in updateReservationItem:', error);
    return {
      success: false,
      error: 'Beklenmeyen bir hata oluştu',
    };
  }
}


// ============================================
// REMOVE RESERVATION ITEM
// ============================================

/**
 * Rezervasyon item'ını tamamen sil
 * Kullanıcı kategoriyi tamamen kaldırdığında çağrılır
 * 
 * @param itemId - Silinecek item ID
 * @param sessionCategoryId - Session category ID (kapasite geri vermek için)
 * @param quantity - Silinen miktar
 * @returns Başarı/hata durumu
 */
export async function removeReservationItem(
  itemId: string,
  sessionCategoryId: string,
  quantity: number
): Promise<ReservationActionResult> {
  try {
    const supabase = await createClient();

    // 1. Kapasiteyi geri ver
    const { error: capacityError } = await supabase
      .rpc('check_and_update_capacity', {
        p_session_category_id: sessionCategoryId,
        p_quantity_change: quantity, // Pozitif = arttır
      });

    if (capacityError) {
      console.error('Error restoring capacity:', capacityError);
      return {
        success: false,
        error: 'Kapasite geri verilemedi',
      };
    }

    // 2. Item'ı sil
    const { error: deleteError } = await supabase
      .from('reservation_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      console.error('Error deleting reservation item:', deleteError);
      
      // Rollback: Kapasiteyi tekrar düşür
      await supabase.rpc('check_and_update_capacity', {
        p_session_category_id: sessionCategoryId,
        p_quantity_change: -quantity,
      });
      
      return {
        success: false,
        error: 'Item silinemedi',
      };
    }

    return {
      success: true,
    };

  } catch (error) {
    console.error('Unexpected error in removeReservationItem:', error);
    return {
      success: false,
      error: 'Beklenmeyen bir hata oluştu',
    };
  }
}


// ============================================
// CANCEL RESERVATION
// ============================================

/**
 * Rezervasyonu iptal et
 * Countdown dolduğunda veya user sayfadan çıktığında çağrılır
 * 
 * @description
 * 1. Rezervasyon item'larını alır
 * 2. Her item için kapasiteyi geri verir
 * 3. Rezervasyon status'ünü 'cancelled' yapar
 * 
 * @param reservationId - İptal edilecek rezervasyon ID
 * @returns Başarı/hata durumu
 */
export async function cancelReservation(
  reservationId: string
): Promise<ReservationActionResult> {
  try {
    const supabase = await createClient();

    // 1. Rezervasyon var mı kontrol et
    const { data: reservation, error: checkError } = await supabase
      .from('reservations')
      .select('id, status')
      .eq('id', reservationId)
      .single();

    if (checkError || !reservation) {
      return {
        success: false,
        error: 'Rezervasyon bulunamadı',
      };
    }

    // Zaten iptal edilmiş veya tamamlanmışsa
    if (reservation.status !== 'pending') {
      return {
        success: true, // Zaten iptal edilmiş, sorun yok
      };
    }

    // 2. Rezervasyon item'larını al
    const { data: items, error: itemsError } = await supabase
      .from('reservation_items')
      .select('id, session_category_id, quantity')
      .eq('reservation_id', reservationId);

    if (itemsError) {
      console.error('Error fetching reservation items:', itemsError);
      return {
        success: false,
        error: 'Rezervasyon detayları alınamadı',
      };
    }

    // 3. Her item için kapasiteyi geri ver
    if (items && items.length > 0) {
      for (const item of items) {
        const { error: capacityError } = await supabase
          .rpc('check_and_update_capacity', {
            p_session_category_id: item.session_category_id,
            p_quantity_change: item.quantity, // Pozitif = geri ver
          });

        if (capacityError) {
          console.error('Error restoring capacity for item:', item.id, capacityError);
          // Devam et (diğer item'ları da geri vermek için)
        }
      }
    }

    // 4. Rezervasyonu iptal et (soft delete)
    const { error: cancelError } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
      })
      .eq('id', reservationId);

    if (cancelError) {
      console.error('Error cancelling reservation:', cancelError);
      return {
        success: false,
        error: 'Rezervasyon iptal edilemedi',
      };
    }

    return {
      success: true,
    };

  } catch (error) {
    console.error('Unexpected error in cancelReservation:', error);
    return {
      success: false,
      error: 'Beklenmeyen bir hata oluştu',
    };
  }
}


// ============================================
// COMPLETE RESERVATION (Ödeme Sonrası)
// ============================================

/**
 * Rezervasyonu tamamla (ödeme sonrası)
 * Status'ü 'confirmed' yap
 * 
 * @description
 * Ödeme başarılı olduktan sonra çağrılır.
 * Kapasite zaten düşürülmüş, sadece status güncellenir.
 * 
 * @param reservationId - Tamamlanacak rezervasyon ID
 * @returns Başarı/hata durumu
 */
export async function completeReservation(
  reservationId: string
): Promise<ReservationActionResult> {
  try {
    const supabase = await createClient();

    // 1. Rezervasyonu kontrol et
    const { data: reservation, error: checkError } = await supabase
      .from('reservations')
      .select('id, status, expires_at')
      .eq('id', reservationId)
      .single();

    if (checkError || !reservation) {
      return {
        success: false,
        error: 'Rezervasyon bulunamadı',
      };
    }

    // Expired kontrolü
    if (new Date(reservation.expires_at) < new Date()) {
      return {
        success: false,
        error: 'Rezervasyon süresi doldu',
      };
    }

    // Status kontrolü
    if (reservation.status !== 'pending') {
      return {
        success: false,
        error: 'Rezervasyon durumu uygun değil',
      };
    }

    // 2. Status'ü confirmed yap
    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'confirmed',
      })
      .eq('id', reservationId);

    if (updateError) {
      console.error('Error completing reservation:', updateError);
      return {
        success: false,
        error: 'Rezervasyon tamamlanamadı',
      };
    }

    return {
      success: true,
    };

  } catch (error) {
    console.error('Unexpected error in completeReservation:', error);
    return {
      success: false,
      error: 'Beklenmeyen bir hata oluştu',
    };
  }
}


// ============================================
// GET RESERVATION BY ID
// ============================================

/**
 * Rezervasyon detaylarını getir
 * 
 * @param reservationId - Rezervasyon ID
 * @returns Rezervasyon detayları veya hata
 */
export async function getReservationDetails(
  reservationId: string
): Promise<ReservationActionResult<ReservationWithDetails>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        session:sessions(*),
        reservation_items(
          *,
          session_category:session_categories(
            *,
            ticket_category:ticket_categories(*)
          )
        )
      `)
      .eq('id', reservationId)
      .single();

    if (error) {
      console.error('Error fetching reservation details:', error);
      return {
        success: false,
        error: 'Rezervasyon bulunamadı',
      };
    }

    return {
      success: true,
      data: data as ReservationWithDetails,
    };

  } catch (error) {
    console.error('Unexpected error in getReservationDetails:', error);
    return {
      success: false,
      error: 'Beklenmeyen bir hata oluştu',
    };
  }
}


// ============================================
// CHECK CAPACITY
// ============================================

/**
 * Kapasiteyi kontrol et (güncelleme yapmadan)
 * Frontend'de kapasite kontrolü için kullanılabilir
 * 
 * @param sessionCategoryId - Session category ID
 * @returns Mevcut kapasite
 */
export async function checkCapacity(
  sessionCategoryId: string
): Promise<ReservationActionResult<number>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('session_categories')
      .select('available_capacity')
      .eq('id', sessionCategoryId)
      .single();

    if (error) {
      console.error('Error checking capacity:', error);
      return {
        success: false,
        error: 'Kapasite kontrolü başarısız',
      };
    }

    return {
      success: true,
      data: data.available_capacity,
    };

  } catch (error) {
    console.error('Unexpected error in checkCapacity:', error);
    return {
      success: false,
      error: 'Beklenmeyen bir hata oluştu',
    };
  }
}
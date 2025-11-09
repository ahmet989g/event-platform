/**
 * Async Actions for Reservation System
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createReservation,
  updateReservationItem,
  removeReservationItem,
  cancelReservation,
  completeReservation,
  type CreateReservationParams,
  type UpdateReservationItemParams,
} from '@/utils/supabase/reservation-actions';
import type { Reservation, ReservationItem } from '@/types/session.types';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Thunk error response
 */
interface ThunkError {
  message: string;
  availableCapacity?: number;
}

/**
 * Create reservation thunk params
 */
interface CreateReservationThunkParams {
  sessionId: string;
  userId: string | null;
  categoryId: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Update reservation item thunk params
 */
interface UpdateReservationItemThunkParams {
  reservationId: string;
  itemId: string;
  categoryId: string;
  oldQuantity: number;
  newQuantity: number;
  unitPrice: number;
}

/**
 * Remove reservation item thunk params
 */
interface RemoveReservationItemThunkParams {
  itemId: string;
  categoryId: string;
  quantity: number;
}


// ============================================
// CREATE RESERVATION THUNK
// ============================================

/**
 * İlk bilet seçiminde rezervasyon oluştur
 * 
 * @description
 * - Backend'e POST request
 * - Rezervasyon ID döner
 * - Redux'a kaydedilir
 * - Countdown başlar
 * 
 * @example
 * dispatch(createReservationThunk({
 *   sessionId: 'uuid',
 *   userId: 'uuid',
 *   categoryId: 'uuid',
 *   quantity: 2,
 *   unitPrice: 100.00,
 * }));
 */
export const createReservationThunk = createAsyncThunk<
  Reservation, // Return type (fulfilled)
  CreateReservationThunkParams, // Params type
  { rejectValue: ThunkError } // Reject value type
>(
  'ticket/createReservation',
  async (params, { rejectWithValue }) => {
    try {
      // Backend'e request
      const result = await createReservation({
        sessionId: params.sessionId,
        userId: params.userId ?? null,
        items: [
          {
            sessionCategoryId: params.categoryId,
            quantity: params.quantity,
            unitPrice: params.unitPrice,
          },
        ],
      });

      // Başarısız
      if (!result.success) {
        return rejectWithValue({
          message: result.error || 'Rezervasyon oluşturulamadı',
          availableCapacity: result.availableCapacity,
        });
      }

      // Başarılı - Reservation döndür
      return result.data!;
    } catch (error: any) {
      console.error('Error in createReservationThunk:', error);
      return rejectWithValue({
        message: error?.message || 'Beklenmeyen bir hata oluştu',
      });
    }
  }
);


// ============================================
// UPDATE RESERVATION ITEM THUNK
// ============================================

/**
 * Rezervasyon item'ını güncelle (debounced)
 * 
 * @description
 * - Kullanıcı +/- yaptığında çağrılır
 * - Backend'de kapasite kontrolü yapılır
 * - Başarısızsa available quantity döner
 * - Component'te optimistic update geri alınır
 * 
 * @example
 * dispatch(updateReservationItemThunk({
 *   reservationId: 'uuid',
 *   itemId: 'uuid',
 *   categoryId: 'uuid',
 *   oldQuantity: 2,
 *   newQuantity: 4,
 *   unitPrice: 100.00,
 * }));
 */
export const updateReservationItemThunk = createAsyncThunk<
  { item: ReservationItem; availableCapacity: number }, // Return type
  UpdateReservationItemThunkParams, // Params type
  { rejectValue: ThunkError } // Reject value type
>(
  'ticket/updateReservationItem',
  async (params, { rejectWithValue }) => {
      console.log('updateReservationItem:', params);
    try {
      // Backend'e request
      const result = await updateReservationItem({
        reservationId: params.reservationId,
        itemId: params.itemId,
        sessionCategoryId: params.categoryId,
        oldQuantity: params.oldQuantity,
        newQuantity: params.newQuantity,
        unitPrice: params.unitPrice,
      });
      console.log('updateReservationItemThunk Result:', result);

      // Başarısız (kapasite yetersiz veya expired)
      if (!result.success) {
        return rejectWithValue({
          message: result.error || 'Rezervasyon güncellenemedi',
          availableCapacity: result.availableCapacity,
        });
      }

      // Başarılı
      return {
        item: result.data!,
        availableCapacity: result.availableCapacity || 0,
      };
    } catch (error: any) {
      console.error('Error in updateReservationItemThunk:', error);
      return rejectWithValue({
        message: error?.message || 'Beklenmeyen bir hata oluştu',
      });
    }
  }
);


// ============================================
// REMOVE RESERVATION ITEM THUNK
// ============================================

/**
 * Rezervasyon item'ını tamamen sil
 * 
 * @description
 * - Kullanıcı kategoriyi tamamen kaldırdığında çağrılır
 * - Kapasite geri verilir
 * - Item silinir
 * 
 * @example
 * dispatch(removeReservationItemThunk({
 *   itemId: 'uuid',
 *   categoryId: 'uuid',
 *   quantity: 2,
 * }));
 */
export const removeReservationItemThunk = createAsyncThunk<
  void, // Return type (no data needed)
  RemoveReservationItemThunkParams, // Params type
  { rejectValue: ThunkError } // Reject value type
>(
  'ticket/removeReservationItem',
  async (params, { rejectWithValue }) => {
    try {
      // Backend'e request
      const result = await removeReservationItem(
        params.itemId,
        params.categoryId,
        params.quantity
      );

      // Başarısız
      if (!result.success) {
        return rejectWithValue({
          message: result.error || 'Item silinemedi',
        });
      }

      // Başarılı (return void)
    } catch (error: any) {
      console.error('Error in removeReservationItemThunk:', error);
      return rejectWithValue({
        message: error?.message || 'Beklenmeyen bir hata oluştu',
      });
    }
  }
);


// ============================================
// CANCEL RESERVATION THUNK
// ============================================

/**
 * Rezervasyonu iptal et
 * 
 * @description
 * - Countdown dolduğunda çağrılır
 * - Kullanıcı sayfadan çıktığında çağrılır
 * - Kapasite geri verilir
 * - Redux state temizlenir
 * 
 * @example
 * dispatch(cancelReservationThunk('uuid-reservation-id'));
 */
export const cancelReservationThunk = createAsyncThunk<
  void, // Return type
  string, // Params type (reservationId)
  { rejectValue: ThunkError } // Reject value type
>(
  'ticket/cancelReservation',
  async (reservationId, { rejectWithValue }) => {
    try {
      // Backend'e request
      const result = await cancelReservation(reservationId);

      // Başarısız
      if (!result.success) {
        return rejectWithValue({
          message: result.error || 'Rezervasyon iptal edilemedi',
        });
      }

      // Başarılı (return void)
    } catch (error: any) {
      console.error('Error in cancelReservationThunk:', error);
      return rejectWithValue({
        message: error?.message || 'Beklenmeyen bir hata oluştu',
      });
    }
  }
);


// ============================================
// COMPLETE RESERVATION THUNK (Ödeme Sonrası)
// ============================================

/**
 * Rezervasyonu tamamla (ödeme başarılı olduktan sonra)
 * 
 * @description
 * - Ödeme başarılı olduktan sonra çağrılır
 * - Status 'confirmed' yapılır
 * - Kapasite zaten düşürülmüş (değişiklik yok)
 * 
 * @example
 * dispatch(completeReservationThunk('uuid-reservation-id'));
 */
export const completeReservationThunk = createAsyncThunk<
  void, // Return type
  string, // Params type (reservationId)
  { rejectValue: ThunkError } // Reject value type
>(
  'ticket/completeReservation',
  async (reservationId, { rejectWithValue }) => {
    try {
      // Backend'e request
      const result = await completeReservation(reservationId);

      // Başarısız
      if (!result.success) {
        return rejectWithValue({
          message: result.error || 'Rezervasyon tamamlanamadı',
        });
      }

      // Başarılı (return void)
    } catch (error: any) {
      console.error('Error in completeReservationThunk:', error);
      return rejectWithValue({
        message: error?.message || 'Beklenmeyen bir hata oluştu',
      });
    }
  }
);


// ============================================
// HELPER TYPES (Component'ler için)
// ============================================

/**
 * Thunk status helper
 * Component'lerde loading state kontrolü için
 */
export type ThunkStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

/**
 * Redux state için thunk status helper
 */
export interface ThunkState {
  status: ThunkStatus;
  error: string | null;
}
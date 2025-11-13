import { createSlice } from '@reduxjs/toolkit';
import { initialTicketState } from './ticketTypes';
import { baseReducers } from './reducers/baseReducers';
import { quantityReducers } from './reducers/quantityReducers';
import { blockReducers } from './reducers/blockReducers';

// Thunk'ları import et
import {
  createReservationThunk,
  updateReservationItemThunk,
  removeReservationItemThunk,
  cancelReservationThunk,
  completeReservationThunk,
} from './ticketThunks';

/**
 * Ticket Slice
 * Bilet seçimi için global state yönetimi
 */
const ticketSlice = createSlice({
  name: 'ticket',
  initialState: initialTicketState,
  reducers: {
    // Ortak reducers (her layout için)
    ...baseReducers,

    // Adet seçimli layout reducers
    ...quantityReducers,

    // TODO: Koltuk seçimli layout
    // ...seatMapReducers,

    ...blockReducers,
  },

  // ============================================
  // ASYNC REDUCERS (Thunks)
  // ============================================
  extraReducers: (builder) => {
    // ========================================
    // CREATE RESERVATION THUNK
    // ========================================
    builder
      .addCase(createReservationThunk.pending, (state) => {
        state.reservation.isLoading = true;
        state.reservation.error = null;
      })
      .addCase(createReservationThunk.fulfilled, (state, action) => {
        state.reservation.isLoading = false;
        state.reservation.reservationId = action.payload.id;
        state.reservation.startTime = Date.now();
        state.reservation.error = null;
      })
      .addCase(createReservationThunk.rejected, (state, action) => {
        state.reservation.isLoading = false;
        state.reservation.error = action.payload?.message || 'Rezervasyon oluşturulamadı';
        
        // Kapasite yetersizse, available quantity'yi kaydet
        if (action.payload?.availableCapacity !== undefined) {
          // Burada istersen available quantity'yi state'e kaydedebilirsin
          // Örnek: state.quantity.availableCapacity = action.payload.availableCapacity;
        }
      });

    // ========================================
    // UPDATE RESERVATION ITEM THUNK
    // ========================================
    builder
      .addCase(updateReservationItemThunk.pending, (state) => {
        state.reservation.isLoading = true;
        state.reservation.error = null;
      })
      .addCase(updateReservationItemThunk.fulfilled, (state, action) => {
        state.reservation.isLoading = false;
        state.reservation.error = null;
        
        // Available quantity'yi kaydet (optional)
        // state.quantity.availableCapacity = action.payload.availableCapacity;
      })
      .addCase(updateReservationItemThunk.rejected, (state, action) => {
        state.reservation.isLoading = false;
        state.reservation.error = action.payload?.message || 'Rezervasyon güncellenemedi';
        
        // IMPORTANT: Component'te optimistic update geri alınmalı!
        // Bu durumda component'e error payload'ı iletilir
        // Component kendi state'ini action.payload.availableCapacity'ye göre düzeltir
      });

    // ========================================
    // REMOVE RESERVATION ITEM THUNK
    // ========================================
    builder
      .addCase(removeReservationItemThunk.pending, (state) => {
        state.reservation.isLoading = true;
        state.reservation.error = null;
      })
      .addCase(removeReservationItemThunk.fulfilled, (state) => {
        state.reservation.isLoading = false;
        state.reservation.error = null;
      })
      .addCase(removeReservationItemThunk.rejected, (state, action) => {
        state.reservation.isLoading = false;
        state.reservation.error = action.payload?.message || 'Item silinemedi';
      });

    // ========================================
    // CANCEL RESERVATION THUNK
    // ========================================
    builder
      .addCase(cancelReservationThunk.pending, (state) => {
        state.reservation.isLoading = true;
        state.reservation.error = null;
      })
      .addCase(cancelReservationThunk.fulfilled, (state) => {
        // Rezervasyon iptal edildi - State'i temizle
        state.reservation.isLoading = false;
        state.reservation.reservationId = null;
        state.reservation.startTime = null;
        state.reservation.error = null;
        
        // Seçimleri temizle
        state.quantity.selectedCategories = [];
        state.quantity.totalPrice = 0;
        state.quantity.totalQuantity = 0;
      })
      .addCase(cancelReservationThunk.rejected, (state, action) => {
        state.reservation.isLoading = false;
        state.reservation.error = action.payload?.message || 'Rezervasyon iptal edilemedi';
        
        // Not: İptal başarısız olsa bile state'i temizlemek isteyebilirsin
        // Çünkü kullanıcı zaten sayfadan çıkıyor olabilir
      });

    // ========================================
    // COMPLETE RESERVATION THUNK (Ödeme Sonrası)
    // ========================================
    builder
      .addCase(completeReservationThunk.pending, (state) => {
        state.reservation.isLoading = true;
        state.reservation.error = null;
      })
      .addCase(completeReservationThunk.fulfilled, (state) => {
        // Rezervasyon tamamlandı - State'i temizle
        state.reservation.isLoading = false;
        state.reservation.reservationId = null;
        state.reservation.startTime = null;
        state.reservation.error = null;
        
        // Seçimleri temizle
        state.quantity.selectedCategories = [];
        state.quantity.totalPrice = 0;
        state.quantity.totalQuantity = 0;
      })
      .addCase(completeReservationThunk.rejected, (state, action) => {
        state.reservation.isLoading = false;
        state.reservation.error = action.payload?.message || 'Rezervasyon tamamlanamadı';
      });
  },
});

// Actions'lar export
export const {
  // Base actions
  setSession,
  startReservation,
  clearReservation,
  resetState,

  // Quantity actions
  addCategory,
  removeCategory,
  updateQuantity,
  clearQuantitySelection,

  // Block actions
  setZoom,
  setPan,
  setBlocks,
  setBlocksLoading,
  setBlockSeats,
  setSeatsLoading,
  toggleSeat,
  updateSeatStatus,
  setHoveredBlock,
  setHoveredSeat,
  clearBlockSelection,
  resetBlockState,
  setBlockError,
} = ticketSlice.actions;


export default ticketSlice.reducer;

// Thunk'ları da export et (component'lerde kullanmak için)
export {
  createReservationThunk,
  updateReservationItemThunk,
  removeReservationItemThunk,
  cancelReservationThunk,
  completeReservationThunk,
} from './ticketThunks';
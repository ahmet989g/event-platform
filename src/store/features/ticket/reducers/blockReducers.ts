import type { PayloadAction } from '@reduxjs/toolkit';
import type { TicketState, SelectedBlockSeat } from '../ticketTypes';
import { Block, Seat } from '@/types/session.types';

/**
 * Block Seçimli Layout Reducer'ları
 * Quantity reducer'lara benzer mantık
 */
export const blockReducers = {
  /**
   * Zoom seviyesini güncelle
   * dispatch(setZoom(2.5))
   */
  setZoom: (state: TicketState, action: PayloadAction<number>) => {
    // 0.5 ile 8 arasında sınırla
    state.block.zoom = Math.max(0.5, Math.min(8, action.payload));
  },

  /**
   * Pan (kaydırma) pozisyonunu güncelle
   * dispatch(setPan({ x: 100, y: 50 }))
   */
  setPan: (state: TicketState, action: PayloadAction<{ x: number; y: number }>) => {
    state.block.pan = action.payload;
  },

  /**
   * Blokları set et (initial load)
   * dispatch(setBlocks([...blocks]))
   */
  setBlocks: (state: TicketState, action: PayloadAction<Block[]>) => {
    state.block.blocks = action.payload;
    state.block.isLoadingBlocks = false;
    state.block.error = null;
  },

  /**
   * Blok yükleme başladı
   */
  setBlocksLoading: (state: TicketState, action: PayloadAction<boolean>) => {
    state.block.isLoadingBlocks = action.payload;
  },

  /**
   * Bir bloğun koltukları yüklendi
   * dispatch(setBlockSeats({ blockId: "123", seats: [...] }))
   */
  setBlockSeats: (
    state: TicketState,
    action: PayloadAction<{ blockId: string; seats: Seat[] }>
  ) => {
    const { blockId, seats } = action.payload;
    state.block.seats[blockId] = seats;
    state.block.isLoadingSeats[blockId] = false;
  },

  /**
   * Koltuk yükleme başladı
   */
  setSeatsLoading: (
    state: TicketState,
    action: PayloadAction<{ blockId: string; loading: boolean }>
  ) => {
    const { blockId, loading } = action.payload;
    state.block.isLoadingSeats[blockId] = loading;
  },

  /**
   * Koltuk seç/kaldır (toggle)
   * dispatch(toggleSeat({ seatId: "...", blockId: "...", ... }))
   */
  toggleSeat: (state: TicketState, action: PayloadAction<SelectedBlockSeat>) => {
    const index = state.block.selectedSeats.findIndex(
      (s) => s.seatId === action.payload.seatId
    );

    if (index >= 0) {
      // Zaten seçili, kaldır
      state.block.selectedSeats.splice(index, 1);
    } else {
      // Seçili değil, ekle
      // Maksimum 10 koltuk kontrolü
      if (state.block.selectedSeats.length >= 10) {
        return; // Daha fazla ekleme
      }
      state.block.selectedSeats.push(action.payload);
    }

    // Toplam fiyat ve adet hesapla (CartSummary için)
    calculateBlockTotals(state);
  },

  /**
   * Koltuk durumu güncelle (realtime için)
   * dispatch(updateSeatStatus({ seatId: "123", status: "sold" }))
   */
  updateSeatStatus: (
    state: TicketState,
    action: PayloadAction<{ seatId: string; status: string }>
  ) => {
    const { seatId, status } = action.payload;

    // Tüm blokların koltukları içinde ara ve güncelle
    Object.keys(state.block.seats).forEach((blockId) => {
      const seat = state.block.seats[blockId]?.find((s) => s.id === seatId);
      if (seat) {
        seat.status = status;

        // Eğer kullanıcı bu koltuğu seçmişse ve başkası aldıysa, kaldır
        if (status !== 'available') {
          state.block.selectedSeats = state.block.selectedSeats.filter(
            (s) => s.seatId !== seatId
          );
          calculateBlockTotals(state);
        }
      }
    });
  },

  /**
   * Hover durumları
   */
  setHoveredBlock: (state: TicketState, action: PayloadAction<string | null>) => {
    state.block.hoveredBlockId = action.payload;
  },

  setHoveredSeat: (state: TicketState, action: PayloadAction<string | null>) => {
    state.block.hoveredSeatId = action.payload;
  },

  /**
   * Block seçimini temizle
   */
  clearBlockSelection: (state: TicketState) => {
    state.block.selectedSeats = [];
    calculateBlockTotals(state);
  },

  /**
   * Block state'i sıfırla (sayfa değiştiğinde)
   */
  resetBlockState: (state: TicketState) => {
    state.block = {
      zoom: 1,
      pan: { x: 0, y: 0 },
      blocks: [],
      seats: {},
      selectedSeats: [],
      hoveredBlockId: null,
      hoveredSeatId: null,
      isLoadingBlocks: false,
      isLoadingSeats: {},
      error: null,
    };
    // Quantity totals'ı da sıfırla
    state.quantity.totalPrice = 0;
    state.quantity.totalQuantity = 0;
  },

  /**
   * Hata durumu
   */
  setBlockError: (state: TicketState, action: PayloadAction<string | null>) => {
    state.block.error = action.payload;
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Toplam fiyat ve adet hesapla
 * Block için seçili koltuklar → quantity state'ine yansıt (CartSummary uyumluluğu için)
 */
function calculateBlockTotals(state: TicketState) {
  // Toplam adet
  state.quantity.totalQuantity = state.block.selectedSeats.length;

  // Toplam fiyat
  state.quantity.totalPrice = state.block.selectedSeats.reduce(
    (sum, seat) => sum + seat.price,
    0
  );
}
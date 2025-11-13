/**
 * Block Selectors
 * Memoized selectors for performance optimization
 * categorySelectors.ts ile aynı mantık
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

// ============================================
// BASE SELECTORS (Input selectors)
// ============================================

/**
 * Block state'ini getir
 */
const selectBlockState = (state: RootState) => state.ticket.block;

/**
 * Seçili koltukları getir
 */
const selectSelectedSeats = (state: RootState) => state.ticket.block.selectedSeats;

/**
 * Zoom seviyesi
 */
const selectZoom = (state: RootState) => state.ticket.block.zoom;

/**
 * Blokları getir
 */
const selectBlocks = (state: RootState) => state.ticket.block.blocks;

/**
 * Koltukları getir
 */
const selectSeats = (state: RootState) => state.ticket.block.seats;

/**
 * Hover durumları
 */
const selectHoveredBlockId = (state: RootState) => state.ticket.block.hoveredBlockId;
const selectHoveredSeatId = (state: RootState) => state.ticket.block.hoveredSeatId;

// ============================================
// MEMOIZED SELECTORS
// ============================================

/**
 * Bir koltuk seçili mi?
 * @param seatId - Seat ID
 * @returns Boolean
 */
export const makeSelectIsSeatSelected = () =>
  createSelector(
    [selectSelectedSeats, (_: RootState, seatId: string) => seatId],
    (selectedSeats, seatId) =>
      selectedSeats.some((s) => s.seatId === seatId)
  );

/**
 * Belirli bir bloğun koltukları yüklü mü?
 * @param blockId - Block ID
 * @returns Boolean
 */
export const makeSelectAreSeatsLoaded = () =>
  createSelector(
    [selectSeats, (_: RootState, blockId: string) => blockId],
    (seats, blockId) => !!seats[blockId]
  );

/**
 * Belirli bir bloğun koltukları yükleniyor mu?
 * @param blockId - Block ID
 * @returns Boolean
 */
export const makeSelectAreSeatsLoading = () =>
  createSelector(
    [(state: RootState) => state.ticket.block.isLoadingSeats, (_: RootState, blockId: string) => blockId],
    (loadingStates, blockId) => loadingStates[blockId] || false
  );

/**
 * Seçim durumu özeti (CartSummary için)
 */
export const selectBlockSelectionSummary = createSelector(
  [selectSelectedSeats],
  (selectedSeats) => ({
    totalSeats: selectedSeats.length,
    totalPrice: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
    isEmpty: selectedSeats.length === 0,
    canAddMore: selectedSeats.length < 10, // Maksimum 10 koltuk
  })
);

/**
 * Canvas state özeti
 */
export const selectCanvasState = createSelector(
  [selectZoom, (state: RootState) => state.ticket.block.pan],
  (zoom, pan) => ({
    zoom,
    pan,
    isZoomedIn: zoom >= 4.0, // Koltuk seçim seviyesi
    isZoomedOut: zoom < 1.5, // Sadece bloklar görünür
  })
);

/**
 * Blok seçme durumu (Zoom yeterli mi?)
 */
export const selectCanSelectSeats = createSelector(
  [selectZoom],
  (zoom) => zoom >= 4.0
);

/**
 * Bir bloğun görünür olup olmadığı (zoom threshold kontrolü)
 */
export const makeSelectIsBlockVisible = () =>
  createSelector(
    [selectZoom, (_: RootState, zoomThreshold: number) => zoomThreshold],
    (zoom, threshold) => zoom >= threshold
  );

/**
 * Hover edilen blok bilgisi
 */
export const selectHoveredBlock = createSelector(
  [selectBlocks, selectHoveredBlockId],
  (blocks, hoveredId) => {
    if (!hoveredId) return null;
    return blocks.find((b) => b.id === hoveredId) || null;
  }
);

/**
 * Seçili koltukları blok gruplarına ayır
 * { "101": [seat1, seat2], "102": [seat3] }
 */
export const selectSeatsByBlock = createSelector(
  [selectSelectedSeats],
  (selectedSeats) => {
    const grouped: Record<string, typeof selectedSeats> = {};
    
    selectedSeats.forEach((seat) => {
      if (!grouped[seat.blockNumber]) {
        grouped[seat.blockNumber] = [];
      }
      grouped[seat.blockNumber].push(seat);
    });
    
    return grouped;
  }
);

/**
 * Loading durumu özeti
 */
export const selectBlockLoadingState = createSelector(
  [
    (state: RootState) => state.ticket.block.isLoadingBlocks,
    (state: RootState) => state.ticket.block.isLoadingSeats,
    (state: RootState) => state.ticket.block.error,
  ],
  (isLoadingBlocks, isLoadingSeats, error) => ({
    isLoadingBlocks,
    isLoadingAnySeats: Object.values(isLoadingSeats).some((loading) => loading),
    hasError: !!error,
    error,
  })
);

/**
 * Belirli bir bloktaki tüm koltukları getir
 */
export const makeSelectBlockSeats = () =>
  createSelector(
    [selectSeats, (_: RootState, blockId: string) => blockId],
    (seats, blockId) => seats[blockId] || []
  );

/**
 * Belirli bir bloktaki müsait koltuk sayısı
 */
export const makeSelectAvailableSeatsCount = () =>
  createSelector(
    [selectSeats, (_: RootState, blockId: string) => blockId],
    (seats, blockId) => {
      const blockSeats = seats[blockId] || [];
      return blockSeats.filter((s) => s.status === 'available').length;
    }
  );
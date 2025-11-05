import { createSlice } from '@reduxjs/toolkit';
import { initialTicketState } from './ticketTypes';
import { baseReducers } from './reducers/baseReducers';
import { quantityReducers } from './reducers/quantityReducers';

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

    // TODO: Blok seçimli layout
    // ...blockReducers,
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
} = ticketSlice.actions;


export default ticketSlice.reducer;
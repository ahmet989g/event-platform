import type { PayloadAction } from '@reduxjs/toolkit';
import type { TicketState, SessionInfo } from '../ticketTypes';
import { initialTicketState } from '../ticketTypes';

/**
 * Ortak Reducer'lar (Her layout için geçerli)
 */
export const baseReducers = {
  /**
   * Session bilgisini Redux'a kaydet
   * @example dispatch(setSession(sessionData))
   */
  setSession: (state: TicketState, action: PayloadAction<SessionInfo>) => {
    state.session = action.payload;
    state.layoutType = action.payload.layoutType;
    state.reservation.duration = action.payload.reservationDuration;
  },

  /**
   * Rezervasyon başlat (Countdown başlar)
   * İlk bilet seçildiğinde çağrılır
   * @example dispatch(startReservation())
   */
  startReservation: (state: TicketState) => {
    // Eğer zaten rezervasyon başlamışsa tekrar başlatma
    if (!state.reservation.startTime) {
      state.reservation.startTime = Date.now();
    }
  },

  /**
   * Rezervasyon temizle (Countdown sıfırla)
   * Süre dolduğunda veya sayfa değiştiğinde çağrılır
   * @example dispatch(clearReservation())
   */
  clearReservation: (state: TicketState) => {
    state.reservation.startTime = null;
  },

  /**
   * Tüm state'i başlangıç değerine döndür
   * Kullanıcı sayfadan çıktığında veya ödeme tamamlandığında
   * @example dispatch(resetState())
   */
  resetState: () => {
    return initialTicketState;
  },
};
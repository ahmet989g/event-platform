import { configureStore } from '@reduxjs/toolkit';
import ticketReducer from './features/ticket/ticketSlice';

/**
 * Redux Store
 * Global state management
 */
export const store = configureStore({
  reducer: {
    ticket: ticketReducer,
  },
  
  // Middleware (opsiyonel - default'ları kullan)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Date.now() timestamp kullandığımız için bu kontrolü devre dışı bırak
        ignoredActions: ['ticket/startReservation'],
        ignoredPaths: ['ticket.reservation.startTime'],
      },
    }),

  // DevTools sadece development'ta aktif
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * TypeScript Types
 * useSelector ve useDispatch için tip güvenliği
 */

// RootState: Store'daki tüm state'in tipi
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch: Dispatch fonksiyonunun tipi
export type AppDispatch = typeof store.dispatch;
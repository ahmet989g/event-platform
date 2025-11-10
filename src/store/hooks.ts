import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * ?Neden Custom Hooks: TS state in yapısını bilmiyor autocomplete çalışmıyor! 
 */

/**
 * Type-safe useDispatch hook
 * Component'lerde dispatch(action) yaparken tip güvenliği sağlar
 * 
 * const dispatch = useAppDispatch();
 * dispatch(addCategory({ ... })); // ← TypeScript hata kontrolü yapar
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Type-safe useSelector hook
 * Store'dan veri okurken autocomplete ve tip güvenliği sağlar
 * 
 * const totalPrice = useAppSelector((state) => state.ticket.quantity.totalPrice);
 * //                                           ↑ Autocomplete çalışır!
 */
export const useAppSelector = useSelector.withTypes<RootState>();
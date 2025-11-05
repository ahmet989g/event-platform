import type { PayloadAction } from '@reduxjs/toolkit';
import type { TicketState, QuantityCategory } from '../ticketTypes';

/**
 * Adet Seçimli Layout Reducer'ları
 */
export const quantityReducers = {
  /**
   * Kategori ekle
   * Aynı kategori varsa ekleme (zaten var kontrolü)
   * dispatch(addCategory({ sessionCategoryId: "123", categoryName: "1.Kat", price: 150, quantity: 1, maxPerOrder: 4, color: "#FF5733" }))
   */
  addCategory: (state: TicketState, action: PayloadAction<QuantityCategory>) => {
    // Aynı kategori zaten var mı?
    const exists = state.quantity.selectedCategories.find(
      (c) => c.sessionCategoryId === action.payload.sessionCategoryId
    );

    // Maksimum adet kontrolü (örneğin 10)
    const currentTotal = state.quantity.totalQuantity;
    if (currentTotal >= 10) {
      return; // Maksimum 10 adet izin ver
    }

    // Yoksa ekle
    if (!exists) {
      state.quantity.selectedCategories.push(action.payload);
      calculateQuantityTotals(state);
    }
  },

  /**
   * Kategori sil
   * dispatch(removeCategory("session-category-id-123"))
   */
  removeCategory: (state: TicketState, action: PayloadAction<string>) => {
    state.quantity.selectedCategories = state.quantity.selectedCategories.filter(
      (c) => c.sessionCategoryId !== action.payload
    );
    calculateQuantityTotals(state);
  },

  /**
   * Adet güncelle
   * Eğer quantity 0 olursa kategoriyi sil
   * maxPerOrder kontrolü yap
   * dispatch(updateQuantity({ categoryId: "123", quantity: 3 }))
   */
  updateQuantity: (
    state: TicketState,
    action: PayloadAction<{ categoryId: string; quantity: number }>
  ) => {
    const { categoryId, quantity } = action.payload;

    const category = state.quantity.selectedCategories.find(
      (c) => c.sessionCategoryId === categoryId
    );

    if (!category) return;

    // Quantity 0 veya negatifse kategoriyi sil
    if (quantity <= 0) {
      state.quantity.selectedCategories = state.quantity.selectedCategories.filter(
        (c) => c.sessionCategoryId !== categoryId
      );
    } else {
      // Toplam adet kontrolü (max 10)
      const otherCategoriesTotal = state.quantity.selectedCategories
        .filter((c) => c.sessionCategoryId !== categoryId)
        .reduce((sum, c) => sum + c.quantity, 0);

      const maxAllowed = 10 - otherCategoriesTotal;
      
      // maxPerOrder kontrolü (eğer varsa)
      let finalQuantity = quantity;
      
      if (category.maxPerOrder && quantity > category.maxPerOrder) {
        finalQuantity = category.maxPerOrder;
      }
      
      // Toplam kontrolü
      if (finalQuantity > maxAllowed) {
        finalQuantity = maxAllowed;
      }

      category.quantity = finalQuantity;
    }

    calculateQuantityTotals(state);
  },

  /**
   * Tüm kategorileri temizle
   */
  clearQuantitySelection: (state: TicketState) => {
    state.quantity.selectedCategories = [];
    state.quantity.totalPrice = 0;
    state.quantity.totalQuantity = 0;
  },
};

/**
 * Helper: Toplam fiyat ve adet hesapla
 */
function calculateQuantityTotals(state: TicketState) {
  // Toplam adet
  state.quantity.totalQuantity = state.quantity.selectedCategories.reduce(
    (sum, category) => sum + category.quantity,
    0
  );

  // Toplam fiyat
  state.quantity.totalPrice = state.quantity.selectedCategories.reduce(
    (sum, category) => sum + category.price * category.quantity,
    0
  );
}
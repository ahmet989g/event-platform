import { useEffect, useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // localStorage'dan değeri al veya initialValue'yu kullan
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? typeof item === "object" ? JSON.parse(item) : item : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // State değişince localStorage'ı güncelle
  useEffect(() => {
    if (typeof window == 'undefined') {
      return;
    }

    try {
      // Değer obje ise JSON'a çevir
      const valueToStore = typeof storedValue === "object" ? JSON.stringify(storedValue) : storedValue;
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
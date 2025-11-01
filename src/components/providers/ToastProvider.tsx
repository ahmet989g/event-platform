"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      duration={4000}
    />
  );
}
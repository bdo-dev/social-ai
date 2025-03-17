"use client";

import { ToastProvider } from "./toast";
import { Toaster } from "./toaster";

export function ToastWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  );
}

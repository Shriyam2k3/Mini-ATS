"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme="light"
      toastOptions={{
        className: "rounded-xl border border-slate-200 text-sm shadow-lg",
      }}
    />
  );
}

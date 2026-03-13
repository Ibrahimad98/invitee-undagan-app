"use client";

import * as React from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

const variantConfig = {
  success: {
    icon: CheckCircle,
    className: "border-green-200 bg-green-50 text-green-800",
    iconClassName: "text-green-500",
  },
  error: {
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-800",
    iconClassName: "text-red-500",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-800",
    iconClassName: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    iconClassName: "text-yellow-500",
  },
} as const;

export interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: (id: string) => void;
}

function Toast({ id, message, type, onClose }: ToastProps) {
  const config = variantConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border p-4 shadow-lg transition-all",
        config.className
      )}
      role="alert"
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", config.iconClassName)} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function Toaster() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}

export { Toast, Toaster };

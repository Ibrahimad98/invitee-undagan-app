"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  description = "Apakah Anda yakin?",
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  const iconColorMap = {
    danger: "bg-red-50 text-red-500",
    warning: "bg-amber-50 text-amber-500",
    default: "bg-blue-50 text-blue-500",
  };

  const buttonVariantMap = {
    danger: "destructive" as const,
    warning: "default" as const,
    default: "default" as const,
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${iconColorMap[variant]}`}>
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>

        <div className="flex gap-3 w-full pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={buttonVariantMap[variant]}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<Element | null>(null);
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Focus trap
  React.useEffect(() => {
    if (!open) return;

    previousActiveElement.current = document.activeElement;

    const focusableSelectors =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (e.key !== "Tab" || !contentRef.current) return;

      const focusableElements =
        contentRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement) return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", trapFocus);
    document.body.style.overflow = "hidden";

    // Focus first focusable form element (input/textarea/select), falling back to any focusable
    requestAnimationFrame(() => {
      if (contentRef.current) {
        const formInputSelectors = 'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])';
        const formInput = contentRef.current.querySelector<HTMLElement>(formInputSelectors);
        if (formInput) {
          formInput.focus();
        } else {
          const focusable = contentRef.current.querySelector<HTMLElement>(focusableSelectors);
          focusable?.focus();
        }
      }
    });

    return () => {
      document.removeEventListener("keydown", trapFocus);
      document.body.style.overflow = "";
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        ref={contentRef}
        className={cn(
          "relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in-95",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {title && (
          <h2
            id="modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h2>
        )}
        {description && (
          <p id="modal-description" className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}

        <div className={cn(title || description ? "mt-4" : "")}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

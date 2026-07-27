import type { ReactNode } from 'react';

export type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

export interface ToastOptions {
  /** The message to display. */
  message: string;
  /** Severity determines icon + color. Default: 'info'. */
  severity?: ToastSeverity;
  /** Auto-dismiss duration in ms. Pass 0 to make it sticky (user must close). Default: 5000. */
  duration?: number;
  /** Optional bold title rendered above the message. */
  title?: string;
  /** Optional action node (e.g. an "Undo" button). */
  action?: ReactNode;
}

export interface Toast
  extends Required<Pick<ToastOptions, 'message' | 'severity' | 'duration'>> {
  /** Unique identifier. */
  id: string;
  title?: string | ReactNode;
  action?: ReactNode;
  /** Timestamp for ordering / dedup logic. */
  createdAt: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  /** Add a toast. Returns the toast id so callers can dismiss it programmatically. */
  addToast: (options: ToastOptions) => string;
  /** Remove a toast by id. */
  removeToast: (id: string) => void;
  /** Convenience shortcuts. */
  success: (
    message: string | ReactNode,
    options?: Omit<ToastOptions, 'message' | 'severity'>
  ) => string;
  info: (
    message: string | ReactNode,
    options?: Omit<ToastOptions, 'message' | 'severity'>
  ) => string;
  warning: (
    message: string | ReactNode,
    options?: Omit<ToastOptions, 'message' | 'severity'>
  ) => string;
  error: (
    message: string | ReactNode,
    options?: Omit<ToastOptions, 'message' | 'severity'>
  ) => string;
}

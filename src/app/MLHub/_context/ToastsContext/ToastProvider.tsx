import { useCallback, useReducer, type ReactNode } from 'react';
import type {
  Toast,
  ToastContextValue,
  ToastOptions,
  ToastSeverity,
} from '../../_components/toast/types';
import { nanoid } from 'nanoid';
import { ToastContext } from './ToastContext';

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action = { type: 'ADD'; toast: Toast } | { type: 'REMOVE'; id: string };

const MAX_TOASTS = 5;

function toastReducer(state: Toast[], action: Action): Toast[] {
  switch (action.type) {
    case 'ADD': {
      const next = [...state, action.toast];
      // Enforce max toast limit — remove oldest
      if (next.length > MAX_TOASTS) {
        const oldest = next.reduce((a, b) =>
          a.createdAt < b.createdAt ? a : b
        );
        return next.filter((t) => t.id !== oldest.id);
      }
      return next;
    }
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const DEFAULT_DURATION = 5000;

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = nanoid(8);
    const toast: Toast = {
      id,
      message: options.message,
      severity: options.severity ?? 'info',
      duration: options.duration ?? DEFAULT_DURATION,
      title: options.title,
      action: options.action,
      createdAt: Date.now(),
    };

    dispatch({ type: 'ADD', toast });

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const factory = useCallback(
    (severity: ToastSeverity) =>
      (
        message: ReactNode,
        options?: Omit<ToastOptions, 'message' | 'severity'>
      ): string =>
        addToast({ message, severity, ...options }),
    [addToast]
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    success: factory('success'),
    info: factory('info'),
    warning: factory('warning'),
    error: factory('error'),
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

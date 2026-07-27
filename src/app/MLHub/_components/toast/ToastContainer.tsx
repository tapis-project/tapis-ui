import { useCallback, type FC } from 'react';
import { ToastItem } from './ToastItem';
import { useToast } from '../../_context/ToastsContext/useToast';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Approximate height of one toast + gap so we can stack them. */
const TOAST_HEIGHT = 80;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useToast();

  const handleClose = useCallback(
    (id: string) => removeToast(id),
    [removeToast]
  );

  return (
    <>
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          offset={index * TOAST_HEIGHT}
          onClose={handleClose}
        />
      ))}
    </>
  );
};

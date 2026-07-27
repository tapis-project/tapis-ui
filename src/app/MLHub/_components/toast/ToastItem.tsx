import { useState, useEffect, useCallback, type FC } from 'react';
import { Snackbar } from '@mui/material';
import { Alert, AlertTitle } from '@mui/material';
import type { Toast } from './types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ToastItemProps {
  toast: Toast;
  /** Vertical offset from the bottom of the viewport (in px). */
  offset: number;
  onClose: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ToastItem: FC<ToastItemProps> = ({ toast, offset, onClose }) => {
  const [open, setOpen] = useState(true);

  // Auto-dismiss timer
  useEffect(() => {
    if (toast.duration === 0) return; // sticky

    const timer = setTimeout(() => {
      setOpen(false);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration]);

  // After the exit animation completes, call the parent onClose
  const handleExited = useCallback(() => {
    onClose(toast.id);
  }, [onClose, toast.id]);

  const handleClose = useCallback(
    (_event: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') return; // don't close on backdrop click
      setOpen(false);
    },
    []
  );

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      slotProps={{ transition: { onExited: handleExited } }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      // Stack each toast above the previous one
      sx={{
        bottom: `${offset + 16}px !important`,
      }}
    >
      <Alert
        onClose={handleClose}
        severity={toast.severity}
        variant="filled"
        action={toast.action}
        sx={{ minWidth: 320, maxWidth: 480, boxShadow: 8 }}
      >
        {toast.title ? <AlertTitle>{toast.title}</AlertTitle> : null}
        {toast.message}
      </Alert>
    </Snackbar>
  );
};

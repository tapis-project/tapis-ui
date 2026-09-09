/**
 * Ask before an act, in the app's own dialog voice.
 *
 * The house style for this is AppTransferOwnerModal: a plain MUI dialog,
 * a one-rem title, a sentence at 0.8rem that says what will actually
 * happen, and two small text-transform:none buttons. No coloured header
 * bar, no icon, no shouting — the SettingsZone ConfirmDialog's severity
 * chrome belongs to a settings page full of destructive rows, and on a
 * detail card it reads as an alarm going off over a reversible act.
 *
 * `danger` only reddens the confirm button, which is as loud as anything
 * on these cards needs to get.
 */
import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';

const ConfirmModal: React.FC<{
  open: boolean;
  title: string;
  /** what will happen, in sentences — b tags welcome */
  children: React.ReactNode;
  confirmText: string;
  onClose: () => void;
  onConfirm: () => void;
  danger?: boolean;
  busy?: boolean;
  error?: Error | null;
}> = ({
  open,
  title,
  children,
  confirmText,
  onClose,
  onConfirm,
  danger,
  busy,
  error,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontSize: '1rem' }}>{title}</DialogTitle>
    <DialogContent>
      <Typography component="div" sx={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
        {children}
      </Typography>
      {error && (
        <Box sx={{ mt: 1 }}>
          <ErrorDetail message={error.message} fontSize="0.7rem" />
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      <Button size="small" onClick={onClose} sx={{ textTransform: 'none' }}>
        Cancel
      </Button>
      <Button
        size="small"
        variant="outlined"
        color={danger ? 'error' : 'primary'}
        disabled={busy}
        onClick={onConfirm}
        sx={{ textTransform: 'none' }}
      >
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmModal;

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export type Severity = 'danger' | 'warning';

/** Maps severity to MUI color palette key and icon component. */
const severityMap = {
  danger: { color: 'error' as const, Icon: ErrorOutlineRoundedIcon },
  warning: { color: 'warning' as const, Icon: WarningAmberRoundedIcon },
};

/** Fallback when no severity is provided — neutral/primary styling. */
const neutralConfig = { color: 'primary' as const, Icon: InfoOutlinedIcon };

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  /**
   * Severity level — affects colors and icon.
   * - `'danger'` — red header & button
   * - `'warning'` — amber header & button
   * - omitted — primary/neutral header & button
   */
  severity?: Severity;
  /** If provided, the user must type this name to confirm */
  itemName?: string;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  severity,
  itemName,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = React.useState('');

  const isConfirmDisabled = itemName ? inputValue !== itemName : false;

  // Reset input when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setInputValue('');
    }
  }, [open]);

  const { color, Icon } = severity ? severityMap[severity] : neutralConfig;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            borderTop: '4px solid',
            borderColor: `${color}.main`,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 2,
          bgcolor: `${color}.main`,
          color: 'white',
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
        {title}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <DialogContentText sx={{ mb: itemName ? 2.5 : 0 }}>
            {message}
          </DialogContentText>

          {itemName && (
            <>
              <DialogContentText sx={{ mt: 1.5, mb: 1, fontWeight: 500 }}>
                Type{' '}
                <Box
                  component="span"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    bgcolor: 'action.hover',
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                  }}
                >
                  {itemName}
                </Box>{' '}
                to confirm.
              </DialogContentText>
              <TextField
                autoFocus
                fullWidth
                size="small"
                placeholder={itemName}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                slotProps={{
                  htmlInput: {
                    'aria-label': `Type ${itemName} to confirm`,
                    autoComplete: 'off',
                    spellCheck: false,
                  },
                }}
              />
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="text" size="small">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={color}
          size="small"
          disabled={isConfirmDisabled}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

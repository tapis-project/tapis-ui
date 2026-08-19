import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ConfirmDialog, { type Severity } from './ConfirmDialog';

export type { Severity };

/** Maps severity to MUI color palette key and icon component. */
const severityMap = {
  danger: { color: 'error' as const, Icon: ErrorOutlineRoundedIcon },
  warning: { color: 'warning' as const, Icon: WarningAmberRoundedIcon },
};

export interface SettingsActionProps {
  /** The action title displayed as a heading */
  title: string;
  /** Description text explaining what this action does */
  description: string;
  /** Label for the action button */
  buttonText: string;
  /** Callback fired when the user confirms the action */
  onAction: () => void;
  /**
   * Severity level that controls button, icon, and dialog colors.
   * - `'danger'` — red icon, button & dialog
   * - `'warning'` — amber icon, button & dialog
   * - omitted — primary/neutral styling, no severity icon
   */
  severity?: Severity;
  /** Optional confirmation prompt shown in the dialog */
  confirmMessage?: string;
  /** Optional name of the item being acted upon (shown in confirm dialog) */
  itemName?: string;
  /** Whether the action is loading / processing */
  loading?: boolean;
  /** Whether the button should be disabled */
  disabled?: boolean;
}

export default function SettingsAction({
  title,
  description,
  buttonText,
  onAction,
  severity,
  confirmMessage,
  itemName,
  loading = false,
  disabled = false,
}: SettingsActionProps) {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    onAction();
    setOpen(false);
  };

  const config = severity ? severityMap[severity] : null;
  const buttonColor = config?.color ?? 'primary';
  const defaultMessage = severity
    ? `Are you sure you want to ${title.toLowerCase()}? This action may be irreversible.`
    : `Are you sure you want to ${title.toLowerCase()}?`;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          px: 3,
          py: 2.5,
        }}
      >
        {/* Severity icon — only shown when severity is set */}
        {config && (
          <config.Icon
            sx={{
              fontSize: 22,
              color: `${config.color}.main`,
              flexShrink: 0,
              mt: { xs: 0.25, sm: 0 },
            }}
          />
        )}

        {/* Text content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {description}
          </Typography>
        </Box>

        {/* Action button */}
        <Button
          variant="outlined"
          color={buttonColor}
          size="small"
          onClick={handleOpen}
          loading={loading}
          disabled={disabled}
          sx={{
            flexShrink: 0,
            alignSelf: { xs: 'flex-end', sm: 'center' },
          }}
        >
          {buttonText}
        </Button>
      </Box>

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={title}
        message={confirmMessage ?? defaultMessage}
        severity={severity}
        itemName={itemName}
        confirmText={buttonText}
      />
    </>
  );
}

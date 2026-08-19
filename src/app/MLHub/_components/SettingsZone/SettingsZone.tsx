import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import type { Severity } from './ConfirmDialog';

export type { Severity };

/** Maps severity to the MUI palette key used for the header background. */
const headerBgMap: Record<Severity, string> = {
  danger: 'error.main',
  warning: 'warning.main',
};

export interface SettingsZoneProps {
  children: React.ReactNode;
  title?: string;
  /**
   * Severity level — controls the header background color.
   * - `'danger'` — red header
   * - `'warning'` — amber header
   * - omitted — primary/neutral header
   */
  severity?: Severity;
  /** Icon element displayed in the header. Defaults to a shield icon. */
  icon?: React.ReactElement;
}

export default function SettingsZone({
  children,
  title = 'Danger Zone',
  severity,
  icon,
}: SettingsZoneProps) {
  const headerBg = severity ? headerBgMap[severity] : 'primary.main';

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 3,
          py: 2,
          bgcolor: headerBg,
          color: 'white',
        }}
      >
        {React.cloneElement(icon ?? <ShieldOutlined />, {
          sx: { fontSize: 20 },
        })}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>

      {/* Actions list */}
      <Box
        sx={{
          '& > *:not(:last-child)': {
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

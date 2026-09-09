/**
 * guidedKit — the form atoms guided (SectionedPanel) creation dialogs
 * share: a small text field that only complains once you have typed, a
 * chips-choice where every option stays visible, and the section body
 * frame with its lead sentence. Born in the guided app creator; the
 * guided system creator made them a kit.
 */
import React from 'react';
import { Box, Chip, TextField, Typography } from '@mui/material';

export const FIELD_SX = {
  '& .MuiInputBase-root': { fontSize: '0.78rem' },
  '& .MuiInputLabel-root': { fontSize: '0.78rem' },
  '& .MuiFormHelperText-root': { fontSize: '0.66rem', mx: 0 },
} as const;

export const GField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  problem?: string;
  helper?: string;
  mono?: boolean;
  autoFocus?: boolean;
}> = ({ label, value, onChange, problem, helper, mono, autoFocus }) => (
  <TextField
    size="small"
    fullWidth
    autoFocus={autoFocus}
    label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    // a problem only speaks once the field has content — an empty required
    // field is the resting state, not an error
    error={!!problem && value !== ''}
    helperText={(value !== '' && problem) || helper}
    sx={{
      ...FIELD_SX,
      ...(mono && {
        '& .MuiInputBase-root': {
          fontSize: '0.74rem',
          fontFamily: 'monospace',
        },
      }),
    }}
  />
);

/** one choice among few — chips, every option visible */
export const ChipChoice: React.FC<{
  label: string;
  options: Array<{ value: string; label?: string; hint?: string }>;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, options, value, onChange }) => (
  <Box>
    <Typography
      sx={{
        fontSize: '0.62rem',
        fontWeight: 700,
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        mb: 0.5,
      }}
    >
      {label}
    </Typography>
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          size="small"
          label={opt.label ?? opt.value}
          title={opt.hint}
          onClick={() => onChange(opt.value)}
          variant={value === opt.value ? 'filled' : 'outlined'}
          sx={{
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.68rem',
            fontWeight: value === opt.value ? 700 : 400,
            ...(value === opt.value && {
              bgcolor: '#5f4bb5',
              color: '#fff',
              '&:hover': { bgcolor: '#4d3c96' },
            }),
          }}
        />
      ))}
    </Box>
  </Box>
);

export const SectionBody: React.FC<
  React.PropsWithChildren<{ lead: string; wide?: boolean }>
> = ({ lead, wide, children }) => (
  <Box sx={{ p: 2, display: 'grid', gap: 1.75, maxWidth: wide ? 720 : 560 }}>
    <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
      {lead}
    </Typography>
    {children}
  </Box>
);

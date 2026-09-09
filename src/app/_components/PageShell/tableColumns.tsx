/**
 * Choosable columns for every landing table, standardized.
 *
 * The apps table pioneered this (its registry + tag-derived columns);
 * this file is the shared half every service uses: a per-table
 * localStorage store made by `makeColumnsStore`, and the house-styled
 * picker (`ColumnsButton`) — sectioned check rows in a quiet popover, not
 * the stock MUI Menu-and-Checkbox look the apps picker wore first.
 */
import React, { useState, useSyncExternalStore } from 'react';
import { Box, Popover, Tooltip, Typography } from '@mui/material';
import { CheckRounded, ViewWeekRounded } from '@mui/icons-material';

// ── the per-table store ────────────────────────────────────────────────────

export type ColumnsStore = {
  use: () => string[];
  get: () => string[];
  subscribe: (listener: () => void) => () => void;
  toggle: (id: string) => void;
  reset: () => void;
  isDefault: (chosen: string[]) => boolean;
  defaults: string[];
};

export const makeColumnsStore = (
  storageKey: string,
  defaults: string[]
): ColumnsStore => {
  const read = (): string[] => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : defaults;
    } catch {
      return defaults;
    }
  };
  let chosen = read();
  const listeners = new Set<() => void>();
  const announce = () => listeners.forEach((listener) => listener());
  const write = (next: string[]) => {
    chosen = next;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // it still holds for this visit
    }
    announce();
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const get = () => chosen;
  return {
    get,
    subscribe,
    use: () => useSyncExternalStore(subscribe, get),
    toggle: (id) =>
      write(
        chosen.includes(id) ? chosen.filter((c) => c !== id) : [...chosen, id]
      ),
    reset: () => {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // fine
      }
      chosen = defaults;
      announce();
    },
    isDefault: (current) =>
      current.length === defaults.length &&
      current.every((id, at) => id === defaults[at]),
    defaults,
  };
};

// ── the picker ─────────────────────────────────────────────────────────────

export type ColumnOption = {
  id: string;
  label: string;
  /** the picker's one-line what-is */
  hint?: string;
};

export type ColumnSection = {
  label: string;
  options: ColumnOption[];
  /** what the section says when it has nothing yet (the tags teacher) */
  empty?: React.ReactNode;
};

const SECTION_SX = {
  px: 1.25,
  pt: 0.75,
  pb: 0.25,
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'text.secondary',
} as const;

const CheckRow: React.FC<{
  option: ColumnOption;
  checked: boolean;
  onToggle: () => void;
}> = ({ option, checked, onToggle }) => (
  <Box
    component="button"
    type="button"
    onClick={onToggle}
    aria-pressed={checked}
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 0.75,
      width: '100%',
      px: 1.25,
      py: 0.5,
      border: 'none',
      bgcolor: 'transparent',
      textAlign: 'left',
      cursor: 'pointer',
      fontFamily: 'inherit',
      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
    }}
  >
    <Box
      sx={{
        width: 14,
        height: 14,
        mt: '2px',
        flexShrink: 0,
        border: '1px solid',
        borderColor: checked ? '#5f4bb5' : 'divider',
        borderRadius: '3px',
        bgcolor: checked ? '#5f4bb5' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': { fontSize: 12, color: '#fff' },
      }}
    >
      {checked && <CheckRounded />}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.72rem', lineHeight: 1.4 }}>
        {option.label}
      </Typography>
      {option.hint && (
        <Typography
          sx={{ fontSize: '0.62rem', color: 'text.secondary', lineHeight: 1.4 }}
        >
          {option.hint}
        </Typography>
      )}
    </Box>
  </Box>
);

export const ColumnsButton: React.FC<{
  title?: string;
  sections: ColumnSection[];
  chosen: string[];
  onToggle: (id: string) => void;
  onReset: () => void;
  isDefault: boolean;
  resetLabel?: string;
}> = ({
  title = "Choose the table's columns",
  sections,
  chosen,
  onToggle,
  onReset,
  isDefault,
  resetLabel = 'Reset to the defaults',
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Tooltip title={title} describeChild>
        <Box
          component="button"
          type="button"
          aria-label="Choose columns"
          onClick={(event: React.MouseEvent<HTMLElement>) =>
            setAnchor(event.currentTarget)
          }
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            height: 20,
            px: 0.75,
            border: '1px solid',
            borderColor: anchor ? 'primary.main' : 'divider',
            borderRadius: '4px',
            bgcolor: 'transparent',
            color: anchor ? 'primary.main' : 'text.secondary',
            cursor: 'pointer',
            fontSize: '0.64rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' },
            '& svg': { fontSize: 13, display: 'block' },
          }}
        >
          <ViewWeekRounded />
          columns
        </Box>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 230,
              maxWidth: 330,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '6px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              py: 0.5,
            },
          },
        }}
      >
        {sections.map((section, at) => (
          <Box
            key={section.label}
            sx={
              at > 0
                ? { borderTop: '1px solid', borderColor: 'divider', mt: 0.5 }
                : undefined
            }
          >
            <Typography sx={SECTION_SX}>{section.label}</Typography>
            {section.options.map((option) => (
              <CheckRow
                key={option.id}
                option={option}
                checked={chosen.includes(option.id)}
                onToggle={() => onToggle(option.id)}
              />
            ))}
            {section.options.length === 0 && section.empty && (
              <Typography
                sx={{
                  px: 1.25,
                  py: 0.5,
                  fontSize: '0.64rem',
                  color: 'text.secondary',
                  maxWidth: 260,
                  lineHeight: 1.5,
                }}
              >
                {section.empty}
              </Typography>
            )}
          </Box>
        ))}
        {!isDefault && (
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 0.5 }}>
            <Box
              component="button"
              type="button"
              onClick={onReset}
              sx={{
                width: '100%',
                px: 1.25,
                py: 0.6,
                border: 'none',
                bgcolor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.68rem',
                color: 'text.secondary',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              {resetLabel}
            </Box>
          </Box>
        )}
      </Popover>
    </>
  );
};

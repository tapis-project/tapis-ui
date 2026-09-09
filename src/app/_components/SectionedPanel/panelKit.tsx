import React from 'react';
import { Box, Chip, Typography } from '@mui/material';

// Shared visual kit for SectionedPanel-based modals (Settings, Pods Admin).
// House accent (matches .btn-primary purple in Layout.scss) — panels can
// override per-instance via the SectionedPanel `accent` prop.
export const ACCENT = '#9d85ef';

// Three-level surface hierarchy: panel → content → inner well. Wells reuse
// the nav-pane tint so nested content reads as "a card inside the card"
// without extra chrome.
export const PAGE_BG = '#f6f7f9';
export const WELL_SX = {
  bgcolor: PAGE_BG,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
} as const;

export type SectionTone =
  | 'live'
  | 'instant'
  | 'pending'
  | 'planned'
  | 'blocking';

export interface SectionState {
  label: string;
  tone: SectionTone;
}

// "Say which settings apply how": every section carries its state chip, so
// the user never has to guess whether something saves, will save, or is
// read-only.
const TONE_SX: Record<SectionTone, object> = {
  live: { color: '#1b7f3b', bgcolor: '#e7f4ea', border: 'none' },
  instant: { color: '#1b7f3b', bgcolor: '#e7f4ea', border: 'none' },
  pending: { color: '#8a6d00', bgcolor: '#fdf6dd', border: 'none' },
  planned: { color: 'text.secondary' },
  // something in the section is wrong and stops the thing the panel is for
  blocking: { color: '#b3261e', bgcolor: '#fce8e6', border: 'none' },
};

// One section, one panel instance: nav label vs pane title can differ, the
// icon element is shared between nav item and pane header so they pair up,
// and render() produces the body (the panel owns all chrome).
export interface PanelSection {
  id: string;
  label: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  state?: SectionState;
  /**
   * Compact pill on the far right of the NAV row — a count, or an error tally
   * in the blocking tone. Kept separate from `state` on purpose: `state` says
   * how a section applies ("stopgap — SK roles later") and is wordy enough to
   * wreck a 190px nav column, while this is a glance.
   */
  badge?: SectionState;
  /**
   * Extra content under the nav label — a summary of what the section holds,
   * for hosts that want the nav to double as an overview. Omitted by every
   * panel that does not, so the compact nav is unchanged.
   */
  detail?: React.ReactNode;
  render: () => React.ReactNode;
}

export interface PanelGroup {
  label: string;
  items: PanelSection[];
}

/**
 * One-line summary under a nav label — the shared voice for `detail` when a
 * host only wants a sentence (the launcher builds richer nodes itself). Muted
 * and wrapping, so a 240px column can afford it.
 */
export const NavDetail: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Typography
    sx={{ fontSize: '0.62rem', color: 'text.secondary', lineHeight: 1.35 }}
  >
    {children}
  </Typography>
);

// Header strip for the selected section in the content pane — same grammar
// everywhere: icon pairs with the nav item, subtitle states the thesis, the
// state chip says how the section applies.
export const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  state?: SectionState;
  accent?: string;
}> = ({ icon, title, subtitle, state, accent = ACCENT }) => (
  <Box
    sx={{
      px: 2.5,
      py: 1.25,
      borderBottom: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      flexShrink: 0,
    }}
  >
    <Box sx={{ color: accent, display: 'flex', alignItems: 'center' }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', lineHeight: 1.4 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    {state && (
      <Chip
        label={state.label}
        size="small"
        sx={{
          fontSize: '0.65rem',
          height: 20,
          flexShrink: 0,
          ...(state.tone === 'planned' && {
            bgcolor: 'transparent',
            border: '1px solid',
            borderColor: 'divider',
          }),
          ...TONE_SX[state.tone],
        }}
      />
    )}
  </Box>
);

// Compact pill for the far right of a NAV row: an error tally in the blocking
// tone, or a quiet count. Same tone vocabulary as the header chip, sized to sit
// at the end of a 190px row without pushing the label out. Rectangular-rounded
// like every chip in the panel — the shell sets that radius globally.
export const SectionBadge: React.FC<{ badge: SectionState }> = ({ badge }) => (
  <Chip
    label={badge.label}
    size="small"
    sx={{
      ml: 'auto',
      height: 16,
      fontSize: '0.6rem',
      fontWeight: badge.tone === 'blocking' ? 700 : 500,
      flexShrink: 0,
      maxWidth: '5.5rem',
      '& .MuiChip-label': {
        px: 0.6,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      ...(badge.tone === 'planned' && {
        bgcolor: 'transparent',
        border: '1px solid',
        borderColor: 'divider',
      }),
      ...TONE_SX[badge.tone],
    }}
  />
);

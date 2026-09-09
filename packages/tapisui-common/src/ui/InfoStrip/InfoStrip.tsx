/**
 * InfoStrip — the thin bar.
 *
 * A hairline band with a dot, one sentence, and the small outlined
 * buttons the page controls. It is the pre-login banner, the docs
 * drawer's header, and now the top bar for pages that outgrew
 * breadcrumbs: the same shape everywhere, one colour knob per use.
 *
 * ✕ means dismiss and nothing else. A "back to …" is a labelled action,
 * so the two are never confused.
 */
import React, { useMemo } from 'react';
import { Box, ButtonBase, Tooltip } from '@mui/material';
import { Close } from '@mui/icons-material';
import {
  resolveStripBase,
  stripPalette,
  StripIntensity,
  StripTone,
} from './stripPalette';

export type InfoStripAction = {
  label: string;
  /** opens in a new tab when set; otherwise onClick runs */
  href?: string;
  onClick?: () => void;
  title?: string;
};

export type InfoStripProps = {
  text: React.ReactNode;
  /** a preset base colour; `color` wins when both are given */
  tone?: StripTone;
  /** any CSS colour — hex, rgb(), a named colour */
  color?: string;
  /** how loud the tint and borders are, for the same base colour */
  intensity?: StripIntensity;
  actions?: InfoStripAction[];
  /** renders the ✕; the strip itself does not decide what dismiss means */
  onClose?: () => void;
  closeLabel?: string;
  /** the leading dot; off for a strip that carries an icon of its own */
  dot?: boolean;
  children?: React.ReactNode;
};

const InfoStrip: React.FC<InfoStripProps> = ({
  text,
  tone,
  color,
  intensity = 'normal',
  actions = [],
  onClose,
  closeLabel = 'Dismiss',
  dot = true,
  children,
}) => {
  // Derived from three scalars, so it only recomputes when the colour does.
  const p = useMemo(
    () => stripPalette(resolveStripBase(tone, color), intensity),
    [tone, color, intensity]
  );
  const pill = useMemo(
    () =>
      ({
        flexShrink: 0,
        px: 1.25,
        py: '2px',
        borderRadius: '5px',
        border: `1px solid ${p.buttonBorder}`,
        color: p.text,
        fontSize: '0.72rem',
        fontWeight: 600,
        fontFamily: 'inherit',
        lineHeight: 1.4,
        textDecoration: 'none',
        transition: 'background 0.06s, color 0.06s',
        '&:hover': { bgcolor: p.base, color: '#ffffff' },
      } as const),
    [p]
  );
  return (
    <Box
      role="region"
      sx={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.75,
        py: '4px',
        minHeight: 30,
        bgcolor: p.bg,
        borderBottom: `1px solid ${p.border}`,
        color: p.text,
        fontSize: '0.78rem',
        lineHeight: 1.3,
      }}
    >
      {dot && (
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: p.base,
            flexShrink: 0,
          }}
        />
      )}
      <Box
        component="span"
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </Box>
      {children}
      {actions.map((a) =>
        a.href ? (
          <ButtonBase
            key={a.label}
            component="a"
            href={a.href}
            target="_blank"
            rel="noreferrer"
            title={a.title}
            sx={pill}
          >
            {a.label}
          </ButtonBase>
        ) : (
          <ButtonBase
            key={a.label}
            onClick={a.onClick}
            title={a.title}
            sx={pill}
          >
            {a.label}
          </ButtonBase>
        )
      )}
      {onClose && (
        <Tooltip title={closeLabel}>
          <ButtonBase
            aria-label={closeLabel}
            onClick={onClose}
            sx={{
              flexShrink: 0,
              width: 22,
              height: 22,
              borderRadius: '5px',
              border: `1px solid ${p.buttonBorder}`,
              color: p.text,
              transition: 'background 0.06s, color 0.06s',
              '&:hover': { bgcolor: p.base, color: '#ffffff' },
            }}
          >
            <Close sx={{ fontSize: 14 }} />
          </ButtonBase>
        </Tooltip>
      )}
    </Box>
  );
};

export default InfoStrip;

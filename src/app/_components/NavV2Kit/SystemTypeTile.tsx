/**
 * The colored system-type tile both systems navs wear in the left slot —
 * the generic storage glyph said nothing; "L"/"S3" answers the first
 * question about a system.
 */
import React from 'react';

export const SYSTEM_TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  LINUX: { bg: '#e8f5e9', fg: '#2e7d32' },
  S3: { bg: '#fff3e0', fg: '#e65100' },
  IRODS: { bg: '#e3f2fd', fg: '#1565c0' },
  GLOBUS: { bg: '#f3e5f5', fg: '#6a1b9a' },
};

const TYPE_ABBR: Record<string, string> = {
  LINUX: 'L',
  S3: 'S3',
  IRODS: 'IR',
  GLOBUS: 'GL',
};

/** The same identity as a chip, for table cells and detail head lines. */
export const SystemTypeChip: React.FC<{ type?: string }> = ({ type }) => {
  const c = SYSTEM_TYPE_COLORS[type ?? ''] ?? { bg: '#eceff1', fg: '#37474f' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 16,
        padding: '0 5px',
        borderRadius: 4,
        fontSize: '0.6rem',
        fontWeight: 600,
        background: c.bg,
        color: c.fg,
        whiteSpace: 'nowrap',
      }}
    >
      {type ?? '?'}
    </span>
  );
};

export const SystemTypeTile: React.FC<{ type?: string }> = ({ type }) => {
  const c = SYSTEM_TYPE_COLORS[type ?? ''] ?? { bg: '#eceff1', fg: '#37474f' };
  return (
    <span
      // "L" is obvious the day every system is LINUX and opaque the day you
      // ask — the hover says the word (native title: this sits in dense nav
      // rows by the dozen, and a Tooltip per row is real mount cost)
      title={`${type ?? 'unknown'} system`}
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.56rem',
        fontWeight: 700,
        background: c.bg,
        color: c.fg,
      }}
    >
      {TYPE_ABBR[type ?? ''] ?? '?'}
    </span>
  );
};
